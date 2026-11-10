/**
 * Calendar dates are handled at noon local time. That keeps a `YYYY-MM-DD`
 * value stable across DST changes and avoids the classic "yesterday" bug when
 * a UTC timestamp is formatted in a positive-offset timezone.
 */
export function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return undefined;

  const [year, month, day] = parts;
  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function noonToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

export function startOfMonthNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

/**
 * One shared date label for the picker and the request summary. Always formats
 * with the active locale's Intl locale (`el-GR` / `en-GB`), so a Greek page
 * shows Greek month abbreviations instead of the English ones.
 */
export function formatDateLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

/** Same label, from a stored `YYYY-MM-DD` value. */
export function formatIsoDateLabel(
  value: string | undefined,
  locale: string
): string | undefined {
  const date = parseIsoDate(value);
  return date ? formatDateLabel(date, locale) : undefined;
}
