import {isAfter, isBefore} from "date-fns";
import {z} from "zod";
import {locations} from "@/lib/data/locations";
import {
  vehicleCategories,
  vehicleTransmissions,
  type VehicleCategory,
  type VehicleTransmission
} from "@/lib/data/fleet";
import {noonToday, parseIsoDate} from "@/lib/dates";

/**
 * One parser for every fleet/booking query string. Values arrive from the URL,
 * so a malformed date, unknown location or unknown filter never throws: the
 * offending field degrades to `undefined` and the page keeps rendering.
 */
export type SeatFilter = "5" | "7";

export type FleetSearchParams = {
  pickup?: string;
  return?: string;
  from?: string;
  to?: string;
  category?: VehicleCategory;
  transmission?: VehicleTransmission;
  seats?: SeatFilter;
};

export const seatFilters = ["5", "7"] as const;

const isoDateSchema = z.iso.date().refine((value) => Boolean(parseIsoDate(value)));

const locationSchema = z
  .string()
  .refine((value) => locations.some((location) => location.id === value));

const categorySchema = z.enum(vehicleCategories);
const transmissionSchema = z.enum(vehicleTransmissions);
const seatsSchema = z.enum(seatFilters);

type RawSearchValue = string | string[] | undefined;
type RawSearchParams =
  | Record<string, RawSearchValue>
  | URLSearchParams
  | undefined;

function firstValue(value: RawSearchValue): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== "string") return undefined;

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readRaw(input: RawSearchParams, key: string): RawSearchValue {
  if (!input) return undefined;

  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }

  return input[key];
}

function parseField<T>(schema: z.ZodType<T>, value: RawSearchValue): T | undefined {
  const raw = firstValue(value);
  if (!raw) return undefined;

  const result = schema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export function parseFleetSearchParams(
  input: RawSearchParams
): FleetSearchParams {
  const from = parseField(isoDateSchema, readRaw(input, "from"));
  let to = parseField(isoDateSchema, readRaw(input, "to"));

  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);

  // A backwards range is not a usable rental window; keep neither endpoint
  // rather than silently reversing the user's intent.
  if (fromDate && toDate && !isAfter(toDate, fromDate)) {
    to = undefined;
  }

  return {
    pickup: parseField(locationSchema, readRaw(input, "pickup")),
    return: parseField(locationSchema, readRaw(input, "return")),
    from,
    to,
    category: parseField(categorySchema, readRaw(input, "category")),
    transmission: parseField(
      transmissionSchema,
      readRaw(input, "transmission")
    ),
    seats: parseField(seatsSchema, readRaw(input, "seats"))
  };
}

/** Only defined values are serialised, so links stay short and canonical. */
export function buildQueryParams(
  params: FleetSearchParams
): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.pickup) query.pickup = params.pickup;
  if (params.return) query.return = params.return;
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.category) query.category = params.category;
  if (params.transmission) query.transmission = params.transmission;
  if (params.seats) query.seats = params.seats;

  return query;
}

export function buildQueryString(params: FleetSearchParams): string {
  const search = new URLSearchParams(buildQueryParams(params)).toString();
  return search ? `?${search}` : "";
}

export function withFleetParams(
  pathname: string,
  params: FleetSearchParams
): string {
  return `${pathname}${buildQueryString(params)}`;
}

export function hasFleetFilters(params: FleetSearchParams): boolean {
  return Boolean(params.category || params.transmission || params.seats);
}

export function withoutFleetFilters(
  params: FleetSearchParams
): FleetSearchParams {
  const next = {...params};
  delete next.category;
  delete next.transmission;
  delete next.seats;
  return next;
}

/* -------------------------------------------------------------------------
 * Booking validation
 * Shared by HeroSearch and the vehicle RequestPanel so both apply the same
 * rules: pickup required, return required unless same-as-pickup, valid ISO
 * dates, pickup not in the past, return strictly after pickup.
 * ---------------------------------------------------------------------- */

export type BookingErrorCode =
  | "pickupRequired"
  | "returnRequired"
  | "datesRequired"
  | "pastDate"
  | "invalidRange";

export type BookingFieldErrors = {
  pickup?: BookingErrorCode;
  return?: BookingErrorCode;
  dates?: BookingErrorCode;
};

export type BookingValidationInput = {
  pickup?: string;
  returnLocation?: string;
  sameAsPickup?: boolean;
  from?: string;
  to?: string;
};

export function validateBookingInput(
  input: BookingValidationInput,
  today: Date = noonToday()
): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  if (!input.pickup) {
    errors.pickup = "pickupRequired";
  }

  if (!input.sameAsPickup && !input.returnLocation) {
    errors.return = "returnRequired";
  }

  const fromDate = parseIsoDate(input.from);
  const toDate = parseIsoDate(input.to);

  if (!fromDate || !toDate) {
    errors.dates = "datesRequired";
  } else if (isBefore(fromDate, today)) {
    errors.dates = "pastDate";
  } else if (!isAfter(toDate, fromDate)) {
    errors.dates = "invalidRange";
  }

  return errors;
}

export function hasBookingErrors(errors: BookingFieldErrors): boolean {
  return Boolean(errors.pickup || errors.return || errors.dates);
}
