/**
 * Fleet data adapter.
 *
 * Every vehicle below is a SAMPLE entry. Nothing here is owner-confirmed
 * inventory: photographs are licensed stand-ins, specifications are
 * illustrative, and no price, availability or rental term is represented.
 * Keep `publicStatus`, `pricingStatus` and `imageStatus` on every record so
 * the UI can stay honest until the client supplies verified data.
 */
export const vehicleCategories = [
  "economy",
  "compact",
  "suv",
  "family",
  "van"
] as const;

export type VehicleCategory = (typeof vehicleCategories)[number];

export const vehicleTransmissions = ["automatic", "manual"] as const;

export type VehicleTransmission = (typeof vehicleTransmissions)[number];

export const vehicleFuels = ["petrol", "hybrid", "lpg", "diesel"] as const;

export type VehicleFuel = (typeof vehicleFuels)[number];

export type VehicleGalleryImage = {
  src: string;
  altEl: string;
  altEn: string;
};

export type Vehicle = {
  id: string;
  slug: string;
  make: string;
  model: string;
  modelNote: string;
  year: number;
  category: VehicleCategory;
  transmission: VehicleTransmission;
  seats: number;
  luggage: number;
  fuel: VehicleFuel;
  powerHp?: number;
  descriptionEl: string;
  descriptionEn: string;
  image: string;
  gallery: VehicleGalleryImage[];
  publicStatus: "sample";
  pricingStatus: "not-approved";
  imageStatus: "demo-stock";
};

const demoGallery = (
  image: string,
  altEl: string,
  altEn: string,
  labelEl: string,
  labelEn: string
): VehicleGalleryImage[] => [
  {src: image, altEl, altEn},
  {
    src: "/images/reference/vehicle-interior-placeholder.jpg",
    altEl: `${labelEl} — ενδεικτική φωτογραφία εσωτερικού (demo), όχι όχημα του στόλου.`,
    altEn: `${labelEn} — illustrative interior photograph (demo), not a fleet vehicle.`
  }
];

export const vehicles: readonly Vehicle[] = [
  {
    id: "peugeot-2008",
    slug: "peugeot-2008",
    make: "Peugeot",
    model: "2008",
    modelNote: "2026 Hybrid Style 110hp",
    year: 2026,
    category: "suv",
    transmission: "automatic",
    seats: 5,
    luggage: 3,
    fuel: "hybrid",
    powerHp: 110,
    descriptionEl:
      "Ένα συμπαγές SUV με ψηλή θέση οδήγησης, πρακτικό για την πόλη και για μεγαλύτερα ταξίδια.",
    descriptionEn:
      "A compact SUV with a high driving position, practical for city errands and longer trips.",
    image: "/images/reference/demo-peugeot-2008.jpg",
    gallery: demoGallery(
      "/images/reference/demo-peugeot-2008.jpg",
      "Peugeot 2008 — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Peugeot 2008 — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Peugeot 2008",
      "Peugeot 2008"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  },
  {
    id: "dacia-sandero-stepway",
    slug: "dacia-sandero-stepway",
    make: "Dacia",
    model: "Sandero Stepway",
    modelNote: "2026 Eco-G 120 Expression",
    year: 2026,
    category: "compact",
    transmission: "manual",
    seats: 5,
    luggage: 3,
    fuel: "lpg",
    powerHp: 120,
    descriptionEl:
      "Ένα πρακτικό compact με αυξημένη απόσταση από το έδαφος και χαμηλό κόστος χρήσης.",
    descriptionEn:
      "A practical compact with raised ground clearance and low running costs.",
    image: "/images/reference/demo-dacia-sandero-stepway.jpg",
    gallery: demoGallery(
      "/images/reference/demo-dacia-sandero-stepway.jpg",
      "Dacia Sandero Stepway — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Dacia Sandero Stepway — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Dacia Sandero Stepway",
      "Dacia Sandero Stepway"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  },
  {
    id: "dacia-jogger",
    slug: "dacia-jogger",
    make: "Dacia",
    model: "Jogger",
    modelNote: "2023 LPG 7 seats",
    year: 2023,
    category: "family",
    transmission: "manual",
    seats: 7,
    luggage: 4,
    fuel: "lpg",
    descriptionEl:
      "Οικογενειακό αυτοκίνητο επτά θέσεων με άνετο χώρο αποσκευών.",
    descriptionEn:
      "A seven-seat family car with a generous boot for luggage and equipment.",
    image: "/images/reference/demo-dacia-jogger.jpg",
    gallery: demoGallery(
      "/images/reference/demo-dacia-jogger.jpg",
      "Dacia Jogger — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Dacia Jogger — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Dacia Jogger",
      "Dacia Jogger"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  },
  {
    id: "opel-vivaro",
    slug: "opel-vivaro",
    make: "Opel",
    model: "Vivaro",
    modelNote: "2021 2.0D 144hp",
    year: 2021,
    category: "van",
    transmission: "manual",
    seats: 9,
    luggage: 4,
    fuel: "diesel",
    powerHp: 144,
    descriptionEl:
      "Ευρύχωρο van για παρέες ή εξοπλισμό, με συρόμενη πλαϊνή πρόσβαση.",
    descriptionEn:
      "A spacious van for groups or equipment, with sliding side access.",
    image: "/images/reference/demo-opel-vivaro.jpg",
    gallery: demoGallery(
      "/images/reference/demo-opel-vivaro.jpg",
      "Opel Vivaro — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Opel Vivaro — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Opel Vivaro",
      "Opel Vivaro"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  },
  {
    id: "kia-xceed",
    slug: "kia-xceed",
    make: "Kia",
    model: "XCeed",
    modelNote: "2022 Mild-Hybrid 160hp",
    year: 2022,
    category: "suv",
    transmission: "automatic",
    seats: 5,
    luggage: 3,
    fuel: "hybrid",
    powerHp: 160,
    descriptionEl:
      "Crossover με άνετη οδική συμπεριφορά και πρακτικό χώρο αποσκευών.",
    descriptionEn: "A crossover with a comfortable ride and a practical boot.",
    image: "/images/reference/demo-kia-xceed.jpg",
    gallery: demoGallery(
      "/images/reference/demo-kia-xceed.jpg",
      "Kia XCeed — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Kia XCeed — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Kia XCeed",
      "Kia XCeed"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  },
  {
    id: "kia-rio",
    slug: "kia-rio",
    make: "Kia",
    model: "Rio",
    modelNote: "2021 101HP",
    year: 2021,
    category: "economy",
    transmission: "manual",
    seats: 5,
    luggage: 2,
    fuel: "petrol",
    powerHp: 101,
    descriptionEl:
      "Συμπαγές hatchback, εύκολο στο παρκάρισμα και οικονομικό σε καύσιμο.",
    descriptionEn:
      "A compact hatchback that is easy to park and economical on fuel.",
    image: "/images/reference/demo-kia-rio.jpg",
    gallery: demoGallery(
      "/images/reference/demo-kia-rio.jpg",
      "Kia Rio — ενδεικτική εξωτερική φωτογραφία (demo), όχι όχημα του στόλου.",
      "Kia Rio — illustrative exterior photograph (demo), not a fleet vehicle.",
      "Kia Rio",
      "Kia Rio"
    ),
    publicStatus: "sample",
    pricingStatus: "not-approved",
    imageStatus: "demo-stock"
  }
];

export const categories = vehicleCategories;
export const transmissions = vehicleTransmissions;
export const fuels = vehicleFuels;

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export function getFeaturedVehicles(count = 3): Vehicle[] {
  return vehicles.slice(0, Math.max(0, count));
}

export function getVehicleName(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model}`;
}
