/**
 * Pickup / return locations.
 *
 * Address verified against https://kalimeriscars.gr/. There is a single site:
 * 3ο χλμ. Κοζάνης – Θεσσαλονίκης, 50100 Κοζάνη. Do not add branches.
 */
export type PickupLocation = {
  id: string;
  nameEl: string;
  nameEn: string;
  noteEl: string;
  noteEn: string;
};

export const locations: readonly PickupLocation[] = [
  {
    id: "main",
    nameEl: "Κοζάνη — 3ο χλμ. Κοζάνης – Θεσσαλονίκης",
    nameEn: "Kozani — 3rd km Kozani – Thessaloniki",
    noteEl: "Παραλαβή από την έδρα μας. Δευτέρα–Παρασκευή 9:00–19:30, Σάββατο 9:00–13:00.",
    noteEn: "Pickup at our premises. Monday–Friday 9:00–19:30, Saturday 9:00–13:00."
  }
];

export function getLocationName(
  location: PickupLocation,
  locale: string
): string {
  return locale === "el" ? location.nameEl : location.nameEn;
}

export function getLocationNote(
  location: PickupLocation,
  locale: string
): string {
  return locale === "el" ? location.noteEl : location.noteEn;
}

export function findLocation(id: string | undefined): PickupLocation | undefined {
  if (!id) return undefined;
  return locations.find((location) => location.id === id);
}
