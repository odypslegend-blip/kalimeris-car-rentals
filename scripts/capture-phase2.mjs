import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import path from "node:path";

const base = "http://localhost:3000";
const outDir = path.resolve("screenshots/phase2");
await mkdir(outDir, {recursive: true});

const browser = await chromium.launch({headless: true, channel: "chrome"});
const report = [];

function collectMetrics() {
  const root = document.documentElement;
  const overflowing = [...document.querySelectorAll("body *")]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.right > window.innerWidth + 1;
    })
    .slice(0, 12)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        className: String(element.className).slice(0, 90),
        right: Math.round(rect.right),
        width: Math.round(rect.width)
      };
    });

  const box = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  };

  return {
    viewport: {width: window.innerWidth, height: window.innerHeight},
    documentWidth: root.scrollWidth,
    documentClientWidth: root.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow:
      root.scrollWidth > root.clientWidth + 1 ||
      document.body.scrollWidth > root.clientWidth + 1,
    overflowing,
    h1: box("h1"),
    panel: box("main > section:nth-of-type(1) > div:last-child > div"),
    pickupTrigger: box('[id^="pickup-"]'),
    returnTrigger: box('[id^="return-"]'),
    dateTrigger: box('[id^="dates-"]'),
    submit: box('form button[type="submit"]'),
    header: box("header")
  };
}

async function inspect(locale, width, height, name, interactions) {
  const context = await browser.newContext({
    viewport: {width, height},
    deviceScaleFactor: 1,
    reducedMotion: "no-preference"
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) =>
    failedRequests.push(
      `${request.method()} ${request.url()} — ${request.failure()?.errorText}`
    )
  );

  await page.goto(`${base}/${locale}`, {waitUntil: "domcontentloaded", timeout: 60000});
  await page.locator("h1").waitFor({state: "visible", timeout: 30000});
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(collectMetrics);
  await page.screenshot({path: path.join(outDir, `${name}.png`), fullPage: true});

  const result = {locale, viewport: `${width}x${height}`, metrics};

  if (interactions) {
    // Empty submit: inline errors, focus moved to the first invalid field.
    await page.locator('form button[type="submit"]').click();
    await page.waitForTimeout(400);
    const errorTexts = await page.locator('[role="alert"]').allTextContents();
    const focusedId = await page.evaluate(
      () => document.activeElement?.id ?? null
    );
    await page.screenshot({
      path: path.join(outDir, `${name}-errors.png`),
      fullPage: false
    });
    result.validation = {errorTexts, focusedId};

    await page.reload({waitUntil: "domcontentloaded"});
    await page.waitForTimeout(300);

    // Keyboard-opened calendar, then a real two-click range selection.
    await page.locator('[id^="dates-"]').first().focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);
    const openedWithEnter = await page.locator(".kalimeris-calendar").isVisible();
    await page.screenshot({
      path: path.join(outDir, `${name}-calendar.png`),
      fullPage: false
    });

    const dayButtons = page.locator(
      ".kalimeris-calendar .rdp-day_button:not(:disabled)"
    );
    const enabledDays = await dayButtons.count();
    if (enabledDays > 5) {
      await dayButtons.nth(3).click();
      await page.waitForTimeout(250);
      await dayButtons.nth(8).click();
      await page.waitForTimeout(500);
    }
    const dateValue = await page.locator('[id^="dates-"]').first().innerText();
    const calendarClosed = !(await page
      .locator(".kalimeris-calendar")
      .isVisible());
    result.calendar = {openedWithEnter, enabledDays, dateValue, calendarClosed};

    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);

    // Select option list.
    await page.locator('[id^="pickup-"]').first().click();
    await page.waitForTimeout(350);
    const selectVisible = await page
      .getByRole("option", {name: /Κεντρικό σημείο παραλαβής|Main pickup point/})
      .first()
      .isVisible();
    await page.screenshot({
      path: path.join(outDir, `${name}-select.png`),
      fullPage: false
    });
    result.select = {optionVisible: selectVisible};
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    if (width < 1024) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      const menuButton = page.getByRole("button", {name: /μενού|menu/i}).first();
      await menuButton.click();
      await page.waitForTimeout(450);
      const dialogVisible = await page.getByRole("dialog").isVisible();
      await page.screenshot({
        path: path.join(outDir, `${name}-menu.png`),
        fullPage: false
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      const closedWithEscape = !(await page.getByRole("dialog").isVisible());
      result.mobileMenu = {opened: dialogVisible, closedWithEscape};
    }
  }

  result.consoleErrors = consoleErrors;
  result.pageErrors = pageErrors;
  result.failedRequests = failedRequests;
  report.push(result);

  await context.close();
}

await inspect("el", 1440, 900, "el-1440", true);
await inspect("el", 390, 844, "el-390", true);
await inspect("el", 1024, 768, "el-1024", false);
await inspect("el", 768, 1024, "el-768", false);
await inspect("el", 360, 800, "el-360", false);
await inspect("en", 390, 844, "en-390", false);

await browser.close();
console.log(JSON.stringify(report, null, 2));
