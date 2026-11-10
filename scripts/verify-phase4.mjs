import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import path from "node:path";

/**
 * Phase 4 endpoint verification. Starts nothing — run it against a server that
 * is already listening.
 *
 *   npx next start -p 3300   (with INQUIRY_WEBHOOK_URL or Resend configured)
 *   node scripts/verify-phase4.mjs http://127.0.0.1:3300
 *
 * or against `next dev` to exercise the development file sink:
 *
 *   INQUIRY_DEV_SINK=1 npx next dev -p 3301
 *   node scripts/verify-phase4.mjs http://127.0.0.1:3301
 */

const base = process.argv[2] ?? "http://127.0.0.1:3300";
const sinkPath = path.resolve(".data/inquiries.jsonl");
const webhookLogPath = path.resolve(".data/webhook-received.jsonl");
const expectSink = process.env.PHASE4_EXPECT_SINK === "1";

const checks = [];

/**
 * Every functional request uses its own `X-Forwarded-For` value so the
 * per-IP rate limiter (default 5/hour) cannot leak state between checks and
 * turn a validation assertion into a spurious 429. The rate-limit loop below
 * deliberately reuses a single dedicated IP (203.0.113.99) instead.
 */
function clientIp(suffix) {
  return `203.0.113.${suffix}`;
}

async function webhookEntries() {
  if (!existsSync(webhookLogPath)) return [];
  const text = await readFile(webhookLogPath, "utf8");
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function record(name, ok, detail) {
  checks.push({name, ok, detail});
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail === undefined ? "" : ` — ${detail}`}`);
}

function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validPayload(overrides = {}) {
  return {
    locale: "el",
    vehicleId: "peugeot-2008",
    pickupLocation: "main",
    returnLocation: "main",
    from: isoInDays(7),
    to: isoInDays(11),
    name: "Δοκιμαστικός Χρήστης",
    email: "test@example.com",
    phone: "+30 210 0000000",
    message: "Δοκιμαστικό αίτημα από το verify script.",
    consent: true,
    website: "",
    startedAt: Date.now() - 5_000,
    ...overrides
  };
}

async function postJson(body, {headers = {}, raw} = {}) {
  const response = await fetch(`${base}/api/inquiries`, {
    method: "POST",
    headers: {"Content-Type": "application/json", ...headers},
    body: raw ?? JSON.stringify(body)
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return {status: response.status, json, headers: response.headers};
}

async function sinkLineCount() {
  if (!existsSync(sinkPath)) return 0;
  const text = await readFile(sinkPath, "utf8");
  return text.split("\n").filter((line) => line.trim().length > 0).length;
}

/* ---------------------------------------------------------------- GET page */

const page = await fetch(`${base}/el/request`, {
  headers: {Accept: "text/html"}
});
const html = await page.text();

record("GET /el/request", page.status === 200, `status ${page.status}`);
record(
  "no success panel served before submit",
  !html.includes("data-request-success"),
  "success-panel marker absent from HTML (its copy exists only as message data)"
);
record(
  "request page does not advertise a price",
  !/€|EUR/.test(html),
  "no currency symbol in HTML"
);
record(
  "request page is noindex",
  /noindex/.test(html),
  "robots meta present"
);

/* ------------------------------------------------------------- happy path */

const sinkBefore = await sinkLineCount();
const happyPayload = validPayload();
const valid = await postJson(happyPayload, {
  headers: {"X-Forwarded-For": clientIp(10)}
});
const sinkAfter = await sinkLineCount();

const reference =
  valid.json && typeof valid.json.reference === "string"
    ? valid.json.reference
    : null;

record(
  "POST valid inquiry → 200 received",
  valid.status === 200 && valid.json?.status === "received",
  `status ${valid.status}, body ${JSON.stringify(valid.json)}`
);
record(
  "reference format KR-YYYYMMDD-XXXX",
  typeof reference === "string" && /^KR-\d{8}-[A-Z0-9]{4}$/.test(reference),
  reference ?? "missing"
);
record(
  "response is not cacheable",
  (valid.headers.get("cache-control") ?? "").includes("no-store"),
  valid.headers.get("cache-control") ?? "missing"
);

// The webhook transport must have actually delivered the payload the API
// acknowledged. Match on the freshly generated reference (random, so a hit can
// only come from this run) plus name and vehicle slug.
const webhookMatch =
  valid.json?.status === "received"
    ? (await webhookEntries()).find(
        (entry) =>
          entry.reference === reference &&
          entry.name === happyPayload.name &&
          entry.vehicleId === "peugeot-2008"
      )
    : undefined;

record(
  "webhook received the delivered inquiry",
  Boolean(webhookMatch),
  webhookMatch
    ? `${webhookLogPath} matched ${reference} (name/vehicleId ok)`
    : `no line in ${webhookLogPath} matched ${reference}`
);

if (expectSink) {
  record(
    "development sink appended one JSON line",
    valid.json?.status === "received" && sinkAfter > sinkBefore,
    `${sinkPath} ${sinkBefore} → ${sinkAfter}`
  );
} else {
  console.log(
    `SKIP  development sink check — transport was not the dev file sink (${sinkBefore} → ${sinkAfter})`
  );
}

/* --------------------------------------------------------- validation gates */

const noConsent = validPayload({consent: false});
const noConsentResult = await postJson(noConsent, {headers: {"X-Forwarded-For": clientIp(11)}});
record(
  "missing consent → 422 fieldErrors.consent",
  noConsentResult.status === 422 &&
    noConsentResult.json?.fieldErrors?.consent !== undefined,
  `status ${noConsentResult.status}, ${JSON.stringify(noConsentResult.json?.fieldErrors ?? {})}`
);

const honeypot = validPayload({website: "http://spam.example"});
const honeypotResult = await postJson(honeypot, {headers: {"X-Forwarded-For": clientIp(12)}});
record(
  "filled honeypot → 422",
  honeypotResult.status === 422,
  `status ${honeypotResult.status}`
);

const unknownVehicle = validPayload({vehicleId: "not-a-real-car"});
const unknownVehicleResult = await postJson(unknownVehicle, {headers: {"X-Forwarded-For": clientIp(13)}});
record(
  "unknown vehicle slug → 422 fieldErrors.vehicleId",
  unknownVehicleResult.status === 422 &&
    unknownVehicleResult.json?.fieldErrors?.vehicleId === "vehicle",
  `status ${unknownVehicleResult.status}, ${JSON.stringify(unknownVehicleResult.json?.fieldErrors ?? {})}`
);

const badEmail = validPayload({email: "not-an-email"});
const badEmailResult = await postJson(badEmail, {headers: {"X-Forwarded-For": clientIp(14)}});
record(
  "invalid email → 422 fieldErrors.email",
  badEmailResult.status === 422 &&
    badEmailResult.json?.fieldErrors?.email === "email",
  `status ${badEmailResult.status}, ${JSON.stringify(badEmailResult.json?.fieldErrors ?? {})}`
);

const backwards = validPayload({from: isoInDays(12), to: isoInDays(9)});
const backwardsResult = await postJson(backwards, {headers: {"X-Forwarded-For": clientIp(15)}});
record(
  "return before pickup → 422 invalidRange",
  backwardsResult.status === 422 &&
    backwardsResult.json?.fieldErrors?.to === "invalidRange",
  `status ${backwardsResult.status}, ${JSON.stringify(backwardsResult.json?.fieldErrors ?? {})}`
);

const tooFast = await postJson(validPayload({startedAt: Date.now()}), {headers: {"X-Forwarded-For": clientIp(16)}});
record(
  "submission faster than 2.5s → 422",
  tooFast.status === 422,
  `status ${tooFast.status}`
);

/* ----------------------------------------------------------- transport gates */

const crossOrigin = await postJson(validPayload(), {
  headers: {Origin: "https://evil.example", "X-Forwarded-For": clientIp(17)}
});
record(
  "foreign Origin → 403",
  crossOrigin.status === 403,
  `status ${crossOrigin.status}`
);

const wrongType = await fetch(`${base}/api/inquiries`, {
  method: "POST",
  headers: {"Content-Type": "text/plain", "X-Forwarded-For": clientIp(18)},
  body: JSON.stringify(validPayload())
});
record(
  "non-JSON content type → 415",
  wrongType.status === 415,
  `status ${wrongType.status}`
);

const oversized = await postJson(null, {
  headers: {"X-Forwarded-For": clientIp(19)},
  raw: JSON.stringify(validPayload({message: "x".repeat(25 * 1024)}))
});
record(
  "body over 20KB → 413",
  oversized.status === 413,
  `status ${oversized.status}`
);

/* ---------------------------------------------------------------- rate limit */

let rateLimited = null;
for (let attempt = 0; attempt < 12 && !rateLimited; attempt += 1) {
  const result = await postJson(validPayload(), {headers: {"X-Forwarded-For": clientIp(99)}});
  if (result.status === 429) rateLimited = result;
}

record(
  "rate limit returns 429 with Retry-After",
  Boolean(rateLimited) &&
    typeof rateLimited.json?.retryAfterSeconds === "number" &&
    Boolean(rateLimited.headers.get("retry-after")),
  rateLimited
    ? `retryAfterSeconds=${rateLimited.json.retryAfterSeconds}, header=${rateLimited.headers.get("retry-after")}`
    : "no 429 observed"
);

/* -------------------------------------------------------------------- report */

const failed = checks.filter((check) => !check.ok);
const summary = {
  base,
  passed: checks.length - failed.length,
  failed: failed.length,
  checks
};

console.log(JSON.stringify(summary, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
