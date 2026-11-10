import {isAfter, isBefore} from "date-fns";
import {z} from "zod";
import {locations} from "@/lib/data/locations";
import {noonToday, parseIsoDate} from "@/lib/dates";

/**
 * Shared inquiry schema.
 *
 * The browser form and the `/api/inquiries` route validate with the *same*
 * schema, so nothing can reach the transport that the client already rejects
 * (and the server never trusts the client's verdict).
 *
 * Messages are stable codes rather than prose: the UI renders them through the
 * `Request.errors.*` dictionary, which keeps the schema locale-independent and
 * lets the server return codes that the client can translate.
 *
 * Two deliberate notes:
 * - `vehicleId` is only shape-checked here. Whether the slug exists is a
 *   server-only concern (`getVehicleBySlug`), so the fleet adapter stays out of
 *   the client validation bundle.
 * - `consent` is a boolean refined to `true` instead of `z.literal(true)`.
 *   Runtime behaviour is identical (only `true` passes), but the boolean input
 *   type lets the form hold the unchecked state without a type escape hatch.
 */

export const inquiryLocales = ["el", "en"] as const;

export type InquiryLocale = (typeof inquiryLocales)[number];

/** Field-level error codes; rendered from `Request.errors.*`. */
export const inquiryFieldErrorCodes = [
  "required",
  "name",
  "email",
  "phone",
  "consent",
  "dates",
  "pastDate",
  "invalidRange",
  "message",
  "vehicle",
  "location"
] as const;

/** Form-level (non-field) error codes; rendered from `Request.errors.*`. */
export const inquiryFormErrorCodes = [
  "rateLimited",
  "deliveryFailed",
  "network",
  "notConfigured"
] as const;

export const inquiryErrorCodes = [
  ...inquiryFieldErrorCodes,
  ...inquiryFormErrorCodes
] as const;

export type InquiryFieldErrorCode = (typeof inquiryFieldErrorCodes)[number];
export type InquiryFormErrorCode = (typeof inquiryFormErrorCodes)[number];
export type InquiryErrorCode =
  | InquiryFieldErrorCode
  | InquiryFormErrorCode;

const errorCodeSet = new Set<string>(inquiryErrorCodes);

export function isInquiryErrorCode(value: string): value is InquiryErrorCode {
  return errorCodeSet.has(value);
}

const emailFormat = z.email({error: "email"});

const phonePattern = /^[0-9 ()\-+]+$/;

const knownLocationIds = new Set(locations.map((location) => location.id));

function isKnownLocation(value: string): boolean {
  return knownLocationIds.has(value);
}

const isoDate = z
  .iso.date({error: "dates"})
  .refine((value) => Boolean(parseIsoDate(value)), {error: "dates"});

export const inquirySchema = z
  .object({
    locale: z.enum(inquiryLocales, {error: "required"}),
    // Shape only — the route resolves the slug against the fleet.
    vehicleId: z.string().trim().max(80, {error: "vehicle"}).optional(),
    pickupLocation: z
      .string()
      .trim()
      .min(1, {error: "location"})
      .refine(isKnownLocation, {error: "location"}),
    returnLocation: z
      .string()
      .trim()
      .min(1, {error: "location"})
      .refine(isKnownLocation, {error: "location"}),
    from: isoDate,
    to: isoDate,
    name: z
      .string()
      .trim()
      .min(1, {error: "required"})
      .min(2, {error: "name"})
      .max(80, {error: "name"}),
    email: z
      .string()
      .trim()
      .min(1, {error: "required"})
      .refine((value) => value.length <= 160, {error: "email"})
      .refine((value) => emailFormat.safeParse(value).success, {error: "email"}),
    phone: z
      .string()
      .trim()
      .min(1, {error: "required"})
      .min(7, {error: "phone"})
      .max(24, {error: "phone"})
      .regex(phonePattern, {error: "phone"}),
    message: z.string().trim().max(1000, {error: "message"}).optional(),
    consent: z
      .boolean({error: "consent"})
      .refine((value) => value === true, {error: "consent"}),
    // Honeypot: real users never fill this; anything else is a bot.
    website: z.string().max(0, {error: "required"}).optional(),
    // Client mount timestamp (ms). The route rejects writes that arrive too fast.
    startedAt: z.number().int().nonnegative({error: "required"})
  })
  .superRefine((data, ctx) => {
    const fromDate = parseIsoDate(data.from);
    const toDate = parseIsoDate(data.to);

    if (!fromDate || !toDate) {
      // Field-level format errors already cover this.
      return;
    }

    // Evaluated per parse, never at module load: a build-time `today` would be
    // frozen and would reject legitimate future dates after the first deploy.
    if (isBefore(fromDate, noonToday())) {
      ctx.addIssue({code: "custom", path: ["from"], message: "pastDate"});
    }

    if (!isAfter(toDate, fromDate)) {
      ctx.addIssue({code: "custom", path: ["to"], message: "invalidRange"});
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryFieldName = keyof InquiryInput;

export const inquiryFieldNames = [
  "locale",
  "vehicleId",
  "pickupLocation",
  "returnLocation",
  "from",
  "to",
  "name",
  "email",
  "phone",
  "message",
  "consent",
  "website",
  "startedAt"
] as const satisfies readonly InquiryFieldName[];

const fieldNameSet = new Set<string>(inquiryFieldNames);

export type InquiryFieldErrors = Partial<
  Record<InquiryFieldName, InquiryFieldErrorCode>
>;

function asFieldErrorCode(message: string): InquiryFieldErrorCode {
  return isInquiryErrorCode(message) &&
    (inquiryFieldErrorCodes as readonly string[]).includes(message)
    ? (message as InquiryFieldErrorCode)
    : "required";
}

/**
 * Collapses a Zod error into the first code per known field. Unknown paths and
 * nested paths are dropped so the response body cannot be used to probe the
 * schema shape.
 */
export function flattenInquiryIssues(error: z.ZodError): InquiryFieldErrors {
  const fieldErrors: InquiryFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];

    if (typeof key !== "string" || !fieldNameSet.has(key)) continue;

    const field = key as InquiryFieldName;
    if (fieldErrors[field]) continue;

    fieldErrors[field] = asFieldErrorCode(issue.message);
  }

  return fieldErrors;
}

/**
 * Maps error codes to display strings with a caller-supplied translator
 * (`t` from next-intl). Used by the form for server-returned field errors.
 */
export function localizedFieldErrors(
  errors: InquiryFieldErrors,
  translate: (code: InquiryErrorCode) => string
): Partial<Record<InquiryFieldName, string>> {
  const localized: Partial<Record<InquiryFieldName, string>> = {};

  for (const [field, code] of Object.entries(errors)) {
    if (!code) continue;
    localized[field as InquiryFieldName] = translate(code);
  }

  return localized;
}
