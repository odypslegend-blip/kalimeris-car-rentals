/**
 * Pickup / return locations.
 *
 * Only one neutral option is published until the client confirms the operating
 * area and the exact address. Do not add invented branches, towns or addresses.
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
    nameEl: "Κεντρικό σημείο παραλαβής",
    nameEn: "Main pickup point",
    noteEl: "Η διεύθυνση αναμένεται επιβεβαίωση",
    noteEn: "Address to be confirmed"
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
