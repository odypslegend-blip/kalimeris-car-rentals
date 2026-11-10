import type {Page} from "@playwright/test";
import {expect} from "@playwright/test";

/** Local-date ISO string (`YYYY-MM-DD`) offset by whole days from today. */
export function isoInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Pre-filled Greek inquiry URL used by both suites (+7 → +10 days). */
export function requestPath(): string {
  const params = new URLSearchParams({
    vehicle: "peugeot-2008",
    pickup: "main",
    return: "main",
    from: isoInDays(7),
    to: isoInDays(10)
  });

  return `/el/request?${params.toString()}`;
}

/**
 * No horizontal scrollbar at the current viewport. The document element is the
 * scrolling container; a 1px tolerance absorbs sub-pixel rounding.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;

    return {
      scrollWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
      clientWidth: root.clientWidth
    };
  });

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}
