import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import path from "node:path";

/**
 * Phase 3 visual capture. This script starts nothing: run it while a
 * production server is already listening on http://127.0.0.1:3200.
 *
 *   npx next start -p 3200
 *   node scripts/capture-phase3.mjs
 */
const base = "http://127.0.0.1:3200";
const outDir = path.resolve("screenshots/phase3");
await mkdir(outDir, {recursive: true});

const viewports = [
  {width: 1440, height: 900},
  {width: 1024, height: 768},
  {width: 768, height: 1024},
  {width: 390, height: 844}
];

const pages = [
  {name: "cars", path: "/el/cars", empty: false},
  {
    name: "cars-empty",
    path: "/el/cars?category=van&transmission=automatic",
    empty: true
  },
  {
    name: "vehicle",
    path: "/el/cars/dacia-sandero-stepway",
    empty: false
  }
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

  return {
    viewportWidth: window.innerWidth,
    documentWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow:
      root.scrollWidth > window.innerWidth + 1 ||
      document.body.scrollWidth > window.innerWidth + 1 ||
      offenders.length > 0,
    offenders
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
    const url = `${base}${pageDef.path}`;

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) =>
      failedRequests.push(
        `${request.method()} ${request.url()} — ${request.failure()?.errorText}`
      )
    );

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.locator("main h1").first().waitFor({
      state: "visible",
      timeout: 30000
    });
    await page
      .waitForFunction(
        () => [...document.images].every((image) => image.complete),
        undefined,
        {timeout: 15000}
      )
      .catch(() => undefined);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);

    const metrics = await page.evaluate(measure);
    const h1 = await page.locator("main h1").first().innerText();
    const emptyHeading = page.getByRole("heading", {
      name: "Δεν βρέθηκαν οχήματα με αυτά τα φίλτρα."
    });
    const emptyHeadingVisible = pageDef.empty
      ? await emptyHeading.isVisible().catch(() => false)
      : null;

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
      emptyHeadingVisible,
      screenshot: fileName,
      metrics,
      consoleErrors,
      pageErrors,
      failedRequests
    });

    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
