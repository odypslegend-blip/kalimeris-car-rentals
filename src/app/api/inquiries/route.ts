import {NextResponse} from "next/server";
import {getVehicleBySlug, getVehicleName} from "@/lib/data/fleet";
import {findLocation, getLocationName} from "@/lib/data/locations";
import {checkRateLimit} from "@/lib/inquiry/rate-limit";
import {createReference} from "@/lib/inquiry/reference";
import {resolveTransport} from "@/lib/inquiry/transport";
import {
  flattenInquiryIssues,
  inquirySchema,
  type InquiryFieldErrors
} from "@/lib/validation/inquiry";

/**
 * `POST /api/inquiries`
 *
 * Trust boundary between a public form and the owner's inbox. Everything below
 * is deliberate:
 *
 * - JSON only, 20KB cap, same-origin only.
 * - Two sliding-window rate limits (per IP, 5/hour by default, plus a global
 *   120/hour backstop) as an abuse speed bump.
 * - Honeypot + a 2.5s minimum fill time before the body is even parsed.
 * - Server-side Zod re-validation of the same schema the form uses.
 * - Vehicle slug resolved against the fleet; unknown slugs are rejected.
 * - 200 **only** after a transport confirms delivery or storage.
 *
 * Responses are intentionally terse: no environment names, no upstream bodies,
 * no stack traces. Nothing here logs PII.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 20 * 1024;
const MIN_FILL_TIME_MS = 2_500;

const NO_STORE = {"Cache-Control": "no-store"} as const;

function respond(body: unknown, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: {...NO_STORE, ...headers}
  });
}

function invalidResponse(
  status = 422,
  fieldErrors: InquiryFieldErrors = {}
) {
  return respond({status: "invalid", fieldErrors}, status);
}

/**
 * Same-origin enforcement. A missing `Origin` is allowed (server-to-server and
 * non-browser clients), but a *present and foreign* origin is not, and neither
 * is `Sec-Fetch-Site: cross-site` from a browser.
 */
function isAllowedOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const requestHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");

    return Boolean(requestHost) && originHost === requestHost;
  } catch {
    return false;
  }
}

/**
 * Best-effort caller identity for the per-IP rate limit.
 *
 * ⚠️ `x-forwarded-for` is fully client-controlled unless a trusted reverse
 * proxy overwrites it. Without that guarantee an attacker can rotate a fake
 * value on every request and evade the per-IP bucket — which is exactly why
 * `checkRateLimit` also enforces a global bucket, so a spoofed-IP flood is
 * still bounded per instance.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();

  if (firstForwarded) return firstForwarded;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Reads at most `maxBytes` from the request stream. A `Content-Length` header
 * is advisory (chunked bodies can omit it), so the cap is enforced while
 * reading rather than after buffering the whole payload.
 */
async function readLimitedBody(
  request: Request,
  maxBytes: number
): Promise<string | null> {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;

      total += value.byteLength;

      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }

      chunks.push(value);
    }
  } catch {
    return null;
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return invalidResponse(403);
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return invalidResponse(415);
  }

  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "",
    10
  );

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return invalidResponse(413);
  }

  const rate = checkRateLimit(clientIp(request));

  if (!rate.allowed) {
    return respond(
      {status: "rate_limited", retryAfterSeconds: rate.retryAfterSeconds},
      429,
      {"Retry-After": String(rate.retryAfterSeconds)}
    );
  }

  const raw = await readLimitedBody(request, MAX_BODY_BYTES);

  if (raw === null) {
    return invalidResponse(413);
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return invalidResponse(422);
  }

  if (typeof parsedJson !== "object" || parsedJson === null) {
    return invalidResponse(422);
  }

  const record = parsedJson as Record<string, unknown>;

  // ---- Abuse gates, before any Zod work --------------------------------

  const honeypot = record.website;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return invalidResponse(422);
  }

  const startedAt =
    typeof record.startedAt === "number" ? record.startedAt : Number.NaN;
  const elapsed = Date.now() - startedAt;

  // Timing is a soft spam signal, not a security boundary: a client whose
  // clock runs ahead of the server produces a negative elapsed value and must
  // not be blocked. Missing/NaN `startedAt` is still rejected, and a
  // non-negative elapsed below the fill floor still is. The honeypot and the
  // per-IP + global rate limits remain the real backstops.
  if (!Number.isFinite(elapsed) || (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS)) {
    return invalidResponse(422);
  }

  // ---- Validation ------------------------------------------------------

  const parsed = inquirySchema.safeParse(record);

  if (!parsed.success) {
    return invalidResponse(422, flattenInquiryIssues(parsed.error));
  }

  const data = parsed.data;

  // ---- Server-only referential checks ---------------------------------

  let vehicleName: string | undefined;

  if (data.vehicleId) {
    const vehicle = getVehicleBySlug(data.vehicleId);

    if (!vehicle) {
      return invalidResponse(422, {vehicleId: "vehicle"});
    }

    vehicleName = getVehicleName(vehicle);
  }

  const pickup = findLocation(data.pickupLocation);
  const returnLocation = findLocation(data.returnLocation);

  if (!pickup || !returnLocation) {
    return invalidResponse(422, {pickupLocation: "location"});
  }

  // ---- Delivery --------------------------------------------------------

  const transport = resolveTransport();

  if (!transport) {
    // Honest failure: the form is live but nothing can receive it.
    return respond({status: "not_configured"}, 503);
  }

  const reference = createReference();

  try {
    const result = await transport.deliver({
      reference,
      locale: data.locale,
      vehicleId: data.vehicleId || undefined,
      vehicleName,
      pickupLocationId: pickup.id,
      pickupLocationName: getLocationName(pickup, data.locale),
      returnLocationId: returnLocation.id,
      returnLocationName: getLocationName(returnLocation, data.locale),
      from: data.from,
      to: data.to,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || undefined
    });

    if (!result.ok) {
      // Transport id + status code only; never the payload or upstream body.
      console.error("[inquiries] delivery failed", {
        transport: transport.id,
        reason: result.reason
      });

      return respond({status: "delivery_failed"}, 502);
    }
  } catch {
    console.error("[inquiries] delivery failed", {transport: transport.id});

    return respond({status: "delivery_failed"}, 502);
  }

  return respond({status: "received", reference}, 200);
}
