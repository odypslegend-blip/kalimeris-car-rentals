import {appendFile, mkdir} from "node:fs/promises";
import path from "node:path";
import type {InquiryLocale} from "@/lib/validation/inquiry";

/**
 * Inquiry delivery adapters.
 *
 * The whole point of this module is requirement 6 from the brief: **never
 * report success without a stored or delivered payload.** There are exactly
 * three sinks, resolved per request:
 *
 *   1. `resend`   — Resend REST API (production email).
 *   2. `webhook`  — POST JSON to an owner-controlled endpoint (production).
 *   3. `dev-file` — append to `.data/inquiries.jsonl`; **development only**.
 *
 * If none is configured, `resolveTransport()` returns `null` and the API
 * answers 503 `not_configured`. Nothing is ever "swallowed" for the sake of a
 * green form.
 *
 * Environment is read inside the functions, never captured at module scope, so
 * the same build can run with different configuration and a build machine's
 * empty env can never be baked in.
 *
 * No PII is logged here. Failure reasons are transport status codes only.
 */

export type InquiryTransportId = "resend" | "webhook" | "dev-file";

export type InquiryDeliveryPayload = {
  reference: string;
  locale: InquiryLocale;
  vehicleId?: string;
  vehicleName?: string;
  pickupLocationId: string;
  pickupLocationName: string;
  returnLocationId: string;
  returnLocationName: string;
  from: string;
  to: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
};

export type DeliverySuccess = {
  ok: true;
  /** Only set by the development sink; never shown in production copy. */
  devFilePath?: string;
};

export type DeliveryFailure = {ok: false; reason: string};

export type DeliveryResult = DeliverySuccess | DeliveryFailure;

export type InquiryTransport = {
  id: InquiryTransportId;
  deliver: (payload: InquiryDeliveryPayload) => Promise<DeliveryResult>;
};

export type TransportStatus = {
  id: InquiryTransportId | null;
  configured: boolean;
  /** True only for the `.data/inquiries.jsonl` sink. */
  devSink: boolean;
};

const REQUEST_TIMEOUT_MS = 10_000;
const DEV_SINK_PATH = path.join(".data", "inquiries.jsonl");

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/* -------------------------------------------------------------------------
 * 1. Resend (plain text only — no HTML is built anywhere, so nothing can be
 *    injected into the email body)
 * ---------------------------------------------------------------------- */

function formatEmailText(payload: InquiryDeliveryPayload): string {
  const vehicle = payload.vehicleName
    ? `${payload.vehicleName} (${payload.vehicleId})`
    : "No specific vehicle";

  const lines = [
    `New quote request — ${payload.reference}`,
    "",
    `Reference: ${payload.reference}`,
    `Vehicle: ${vehicle}`,
    `Pickup: ${payload.pickupLocationName} (${payload.pickupLocationId})`,
    `Return: ${payload.returnLocationName} (${payload.returnLocationId})`,
    `Dates: ${payload.from} to ${payload.to}`,
    `Locale: ${payload.locale}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    "",
    "Message:",
    payload.message ? payload.message : "(no message)"
  ];

  return lines.join("\n");
}

const resendTransport: InquiryTransport = {
  id: "resend",
  async deliver(payload) {
    const apiKey = readEnv("RESEND_API_KEY");
    const fromEmail = readEnv("INQUIRY_FROM_EMAIL");
    const toEmail = readEnv("INQUIRY_TO_EMAIL");

    if (!apiKey || !fromEmail || !toEmail) {
      return {ok: false, reason: "resend_not_configured"};
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: `Quote request ${payload.reference}`,
          text: formatEmailText(payload),
          reply_to: payload.email
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });

      if (!response.ok) {
        // Status only: the API body can echo recipient details.
        return {ok: false, reason: `resend_status_${response.status}`};
      }

      return {ok: true};
    } catch {
      return {ok: false, reason: "resend_request_failed"};
    }
  }
};

/* -------------------------------------------------------------------------
 * 2. Owner webhook
 * ---------------------------------------------------------------------- */

const webhookTransport: InquiryTransport = {
  id: "webhook",
  async deliver(payload) {
    const webhookUrl = readEnv("INQUIRY_WEBHOOK_URL");

    if (!webhookUrl) {
      return {ok: false, reason: "webhook_not_configured"};
    }

    // The brief specifies a single `x-kalimeris-inquiry` header carrying the
    // shared secret. Without a secret the header is a fixed marker so the
    // receiver can still verify the request shape.
    const secret = readEnv("INQUIRY_WEBHOOK_SECRET");

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-kalimeris-inquiry": secret ?? "1"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });

      if (!response.ok) {
        return {ok: false, reason: `webhook_status_${response.status}`};
      }

      return {ok: true};
    } catch {
      return {ok: false, reason: "webhook_request_failed"};
    }
  }
};

/* -------------------------------------------------------------------------
 * 3. Development file sink — NEVER available in production
 * ---------------------------------------------------------------------- */

const devFileTransport: InquiryTransport = {
  id: "dev-file",
  async deliver(payload) {
    const filePath = path.join(process.cwd(), DEV_SINK_PATH);

    try {
      await mkdir(path.dirname(filePath), {recursive: true});
      await appendFile(
        filePath,
        `${JSON.stringify({...payload, createdAt: new Date().toISOString()})}\n`,
        "utf8"
      );
    } catch {
      return {ok: false, reason: "dev_sink_write_failed"};
    }

    return {ok: true, devFilePath: filePath};
  }
};

/* -------------------------------------------------------------------------
 * Resolution
 * ---------------------------------------------------------------------- */

function devSinkEnabled(): boolean {
  return readEnv("INQUIRY_DEV_SINK") === "1" && process.env.NODE_ENV !== "production";
}

/**
 * Priority: Resend → webhook → dev file. Resolved on every call so a
 * misconfigured production deployment fails loudly (503) instead of quietly
 * writing to disk.
 */
export function resolveTransport(): InquiryTransport | null {
  if (
    readEnv("RESEND_API_KEY") &&
    readEnv("INQUIRY_FROM_EMAIL") &&
    readEnv("INQUIRY_TO_EMAIL")
  ) {
    return resendTransport;
  }

  if (readEnv("INQUIRY_WEBHOOK_URL")) {
    return webhookTransport;
  }

  if (devSinkEnabled()) {
    return devFileTransport;
  }

  return null;
}

export function getTransportStatus(): TransportStatus {
  const transport = resolveTransport();

  return {
    id: transport?.id ?? null,
    configured: transport !== null,
    devSink: transport?.id === "dev-file"
  };
}
