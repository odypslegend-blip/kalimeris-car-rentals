import {chromium} from "@playwright/test";

const browser = await chromium.launch({headless: true, channel: "chrome"});
const context = await browser.newContext({viewport: {width: 390, height: 844}});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto("http://localhost:3000/el", {waitUntil: "domcontentloaded"});
await page.locator("h1").waitFor();

// Pickup select via the real Radix listbox.
await page.locator('[id^="pickup-"]').first().click();
await page
  .getByRole("option", {name: /Κεντρικό σημείο παραλαβής/})
  .first()
  .click();
await page.waitForTimeout(300);

const returnState = await page.evaluate(() => {
  const trigger = document.querySelector('[id^="return-"]');
  return {
    text: trigger?.textContent?.trim(),
    disabled: trigger?.hasAttribute("data-disabled") ?? null
  };
});

// Turn the mirror off and choose the return location explicitly.
await page.getByLabel("Ίδια με την παραλαβή").uncheck();
await page.locator('[id^="return-"]').first().click();
await page
  .getByRole("option", {name: /Κεντρικό σημείο παραλαβής/})
  .first()
  .click();
await page.waitForTimeout(300);

// Keyboard-open the calendar and pick a valid range.
await page.locator('[id^="dates-"]').first().focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(350);
const days = page.locator(".kalimeris-calendar .rdp-day_button:not(:disabled)");
const enabledDays = await days.count();

// Past days disabled: the first enabled day must not be before today.
const firstEnabledLabel = await days.first().getAttribute("aria-label");
await days.nth(2).click();
await page.waitForTimeout(200);
await days.nth(6).click();
await page.waitForTimeout(500);
const dateText = await page.locator('[id^="dates-"]').first().innerText();

await page.locator('form button[type="submit"]').click();
await page.waitForTimeout(1500);

console.log(
  JSON.stringify(
    {
      returnState,
      enabledDays,
      firstEnabledLabel,
      dateText,
      urlAfterSubmit: page.url(),
      consoleErrors
    },
    null,
    2
  )
);

await browser.close();
