import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import path from "node:path";

/**
 * Phase 5 visual capture. Starts nothing: run it while a server is listening.
 *
 *   npx next start -p 3320
 *   node scripts/capture-phase5.mjs http://127.0.0.1:3320
 */
const base = process.argv[2] ?? "http://127.0.0.1:3320";
const outDir = path.resolve("screenshots/phase5");
await mkdir(outDir, {recursive: true});

const viewports = [
  {width: 1440, height: 900},
  {width: 390, height: 844}
];

const pages = [
  {name: "faq", path: "/el/faq"},
  {name: "how-it-works", path: "/el/how-it-works"},
  {name: "about", path: "/el/about"},
  {name: "contact", path: "/el/contact"},
  {name: "privacy", path: "/el/privacy"}
];

const browser = await chromium.launch({headless: true, channel: "chrome"});
const report = [];

function measure() {
  function clippedByAncestor(element) {
    let parent = element.parentElement;

    while (parent && parent !== document.body) {
      const style = getComputedStyle(parent);
      if (["auto", "scroll", "hidden", "clip"].includes(style.overflowX)) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  const offenders = [...document.querySelectorAll("body *")]
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= window.innerWidth + 1) return false;
      return !clippedByAncestor(element);
    })
    .slice(0, 12)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        className: String(element.className).slice(0, 90),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width)
      };
    });

  const root = document.documentElement;
  const undersized = [...document.querySelectorAll("main a, main button")]
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        label: (element.textContent ?? "").trim().slice(0, 40),
        height: Math.round(rect.height)
      };
    })
    .filter((control) => control.height > 0 && control.height < 44);

  return {
    viewportWidth: window.innerWidth,
    documentWidth: root.scrollWidth,
    horizontalOverflow:
      root.scrollWidth > window.innerWidth + 1 ||
      document.body.scrollWidth > window.innerWidth + 1 ||
      offenders.length > 0,
    offenders,
    undersizedControls: undersized
  };
}

for (const pageDef of pages) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
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
        `${request.method()} ${request.url()} - ${request.failure()?.errorText}`
      )
    );

    const response = await page.goto(`${base}${pageDef.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.locator("main h1").first().waitFor({
      state: "visible",
      timeout: 30000
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const metrics = await page.evaluate(measure);
    const h1 = await page.locator("main h1").first().innerText();

    // Exercise the first accordion item with the keyboard, then collapse it
    // again so the screenshot shows the default state.
    let accordion = null;
    if (pageDef.name === "faq") {
      const trigger = page.locator('button[data-slot="accordion-trigger"]').first();
      await trigger.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(300);
      accordion = {
        expandedAfterEnter: await trigger.getAttribute("aria-expanded"),
        contentVisible: await page
          .locator('[data-slot="accordion-content"]')
          .first()
          .isVisible()
      };
      await page.keyboard.press("Enter");
      await page.waitForTimeout(250);
      // Leave no focus ring in the screenshot: the capture shows the page's
      // default state, not the keyboard walk that just proved it works.
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      await page.waitForTimeout(150);
    }

    const fileName = `${pageDef.name}-${viewport.width}.png`;
    await page.screenshot({
      path: path.join(outDir, fileName),
      fullPage: true
    });

    report.push({
      page: pageDef.name,
      path: pageDef.path,
      viewport: `${viewport.width}x${viewport.height}`,
      status: response?.status() ?? null,
      h1,
      screenshot: fileName,
      accordion,
      metrics,
      consoleErrors,
      pageErrors,
      failedRequests
    });

    await context.close();
  }
}

// Localized 404: Next renders the not-found boundary on the client for dynamic
// routes, so this asserts the rendered result rather than the raw HTML payload.
const notFoundChecks = [];
for (const [routePath, expected] of [
  ["/el/does-not-exist", "Η σελίδα δεν βρέθηκε."],
  ["/en/does-not-exist", "Page not found."]
]) {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 900},
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const response = await page.goto(`${base}${routePath}`, {
    waitUntil: "networkidle",
    timeout: 60000
  });
  const h1 = (await page.locator("main h1").first().innerText()).trim();
  const links = await page
    .locator("main a")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));

  if (routePath.startsWith("/el")) {
    await page.screenshot({
      path: path.join(outDir, "not-found-1440.png"),
      fullPage: true
    });
  }

  notFoundChecks.push({
    path: routePath,
    status: response?.status() ?? null,
    h1,
    matches: h1 === expected,
    links
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify({pages: report, notFound: notFoundChecks}, null, 2));
