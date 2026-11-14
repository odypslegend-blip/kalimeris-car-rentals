import type {
  VehicleCategory,
  VehicleFuel,
  VehicleTransmission
} from "@/lib/data/fleet";

/** One stored photograph: its storage key plus the public URL it resolves to. */
export type ManagedVehicleImage = {key: string; url: string; alt: string};

/**
 * The persisted vehicle record.
 *
 * This is the storage shape, not the public view shape. The public pages
 * consume `Vehicle` (see `./view.ts`), which carries the honesty flags the UI
 * relies on.
 */
export type ManagedVehicle = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  modelNote: string;
  year: number;
  pricePerDay: number | null;
  descriptionEl: string;
  descriptionEn: string;
  images: ManagedVehicleImage[];
  transmission: VehicleTransmission;
  fuel: VehicleFuel;
  seats: number;
  luggage: number;
  category: VehicleCategory;
  available: boolean;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Everything a caller may set; identity and timestamps are store-owned. */
export type VehicleInput = Omit<
  ManagedVehicle,
  "id" | "createdAt" | "updatedAt"
>;
