import type {Vehicle} from "@/lib/data/fleet";
import type {ManagedVehicle} from "./types";

const FALLBACK_IMAGE = "/images/reference/hero-greece-delphi-road.jpg";
const FALLBACK_ALT_EL =
  "Ενδεικτική φωτογραφία ελληνικού δρόμου (demo), όχι όχημα του στόλου.";
const FALLBACK_ALT_EN =
  "Illustrative photograph of a Greek road (demo), not a fleet vehicle.";

/**
 * Maps a persisted record onto the public `Vehicle` shape.
 *
 * The honesty flags stay hard-coded: stored records are still sample data
 * until the owner confirms photography, pricing and availability, so the UI
 * keeps its DEMO badge and "pricing not approved" state.
 */
export function toVehicleView(
  record: ManagedVehicle,
  locale: string
): Vehicle {
  const gallery =
    record.images.length > 0
      ? record.images.map((image) => ({
          src: image.url,
          altEl: image.alt,
          altEn: image.alt
        }))
      : [
          {
            src: FALLBACK_IMAGE,
            altEl: FALLBACK_ALT_EL,
            altEn: FALLBACK_ALT_EN
          }
        ];

  // `locale` is part of the public signature so callers can pass the page's
  // locale through unchanged; every translatable field is already stored in
  // both languages, so the mapping itself is locale-independent.
  void locale;

  return {
    id: record.id,
    slug: record.slug,
    make: record.brand,
    model: record.model,
    modelNote: record.modelNote,
    year: record.year,
    category: record.category,
    transmission: record.transmission,
    seats: record.seats,
    luggage: record.luggage,
    fuel: record.fuel,
    descriptionEl: record.descriptionEl,
    descriptionEn: record.descriptionEn,
    image: record.images[0]?.url ?? FALLBACK_IMAGE,
    gallery,
    powerHp: undefined,
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock",
    pricePerDay: record.pricePerDay
  };
}
