import {chromium} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import path from "node:path";

/**
 * Phase 4 visual capture. Starts nothing: run it while a server is already
 * listening.
 *
 *   npx next start -p 3300
 *   node scripts/capture-phase4.mjs http://127.0.0.1:3300
 */
const base = process.argv[2] ?? "http://127.0.0.1:3300";
const outDir = path.resolve("screenshots/phase4");
await mkdir(outDir, {recursive: true});

const viewports = [
  {width: 1440, height: 900},
  {width: 390, height: 844}
];

const pageDef = {
  name: "request",
  path: "/el/request?vehicle=dacia-sandero-stepway&pickup=main&return=main"
};

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
  const controls = [...document.querySelectorAll("main a, main button, main input")]
    .filter((element) => element.getBoundingClientRect().width > 0)
    // Honeypot fields sit inside aria-hidden, zero-size containers.
    .filter((element) => !element.closest('[aria-hidden="true"]'))
    .map((element) => {
      // A checkbox's own box is 20px; the clickable target is its label.
      const label = element.closest("label");
      const isCheckbox =
        element.matches('input[type="checkbox"]') ||
        element.getAttribute("role") === "checkbox";
      const target = isCheckbox && label ? label : element;
      const rect = target.getBoundingClientRect();

      return {
        tag: element.tagName.toLowerCase(),
        type: element.getAttribute("type") ?? null,
        measured: isCheckbox && label ? "label" : "control",
        height: Math.round(rect.height)
      };
    })
    .filter((control) => control.height > 0 && control.height < 44);

  return {
    viewportWidth: window.innerWidth,
    documentWidth: root.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow:
      root.scrollWidth > window.innerWidth + 1 ||
      document.body.scrollWidth > window.innerWidth + 1 ||
      offenders.length > 0,
    offenders,
    undersizedControls: controls
  };
}

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
  const successVisible = await page
    .getByRole("heading", {name: "Το αίτημα στάλθηκε."})
    .isVisible()
    .catch(() => false);
  const submit = page.getByRole("button", {name: /Στείλτε αίτημα/});
  const submitVisible = await submit.isVisible().catch(() => false);
  const submitDisabled = submitVisible
    ? await submit.isDisabled().catch(() => null)
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
    successVisible,
    submitVisible,
    submitDisabled,
    screenshot: fileName,
    metrics,
    consoleErrors,
    pageErrors,
    failedRequests
  });

  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
