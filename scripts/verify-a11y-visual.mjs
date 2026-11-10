import {chromium} from "@playwright/test";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

/**
 * Post-gate remediation verification.
 *
 *   npx next start -p 3330
 *   node scripts/verify-a11y-visual.mjs http://127.0.0.1:3330
 */
const base = process.argv[2] ?? "http://127.0.0.1:3330";
const outDir = path.resolve("screenshots/final");
await mkdir(outDir, {recursive: true});

function isoPlus(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const from = isoPlus(7);
const to = isoPlus(10);
const requestPath = `/el/request?vehicle=peugeot-2008&pickup=main&return=main&from=${from}&to=${to}`;

const browser = await chromium.launch({headless: true, channel: "chrome"});
const results = [];

function record(name, ok, detail) {
  results.push({name, ok: Boolean(ok), detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function open(width, height = 900) {
  const context = await browser.newContext({viewport: {width, height}});
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  return {context, page, consoleErrors};
}

async function overflow(page) {
  return page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    ok: document.documentElement.scrollWidth <= window.innerWidth
  }));
}

// ---------------------------------------------------------------- 1. request
for (const width of [320, 375, 390]) {
  const {context, page, consoleErrors} = await open(width, 844);
  await page.goto(`${base}${requestPath}`, {waitUntil: "networkidle"});

  const flow = await overflow(page);
  record(
    `request ${width}px no horizontal overflow`,
    flow.ok,
    `scrollWidth=${flow.scrollWidth} innerWidth=${flow.innerWidth}`
  );

  const note = await page
    .getByText("Όλα τα πεδία είναι υποχρεωτικά εκτός από το μήνυμα.", {
      exact: true
    })
    .count();
  record(`request ${width}px required note`, note > 0, `matches=${note}`);

  const ariaRequired = await page.evaluate(() => {
    const has = (prefix) =>
      Boolean(
        document.querySelector(`[id^="${prefix}"][aria-required="true"]`)
      );
    return {
      pickup: has("request-pickup-"),
      return: has("request-return-"),
      dates: has("request-dates-")
    };
  });
  record(
    `request ${width}px aria-required pickup/return/dates`,
    ariaRequired.pickup && ariaRequired.return && ariaRequired.dates,
    JSON.stringify(ariaRequired)
  );

  const nativeRequired = await page.evaluate(() => {
    const has = (prefix) =>
      Boolean(document.querySelector(`[id^="${prefix}"][required]`));
    return {
      name: has("request-name-"),
      email: has("request-email-"),
      phone: has("request-phone-")
    };
  });
  record(
    `request ${width}px required name/email/phone`,
    nativeRequired.name && nativeRequired.email && nativeRequired.phone,
    JSON.stringify(nativeRequired)
  );

  if (width === 390) {
    const consent = page.locator('input[id^="request-consent-"]');
    await page.locator('label:has(input[id^="request-consent-"]) span').click();
    const checked = await consent.isChecked();
    record("request 390px consent toggles from label text", checked, "");

    const formBox = await page.locator("form").first().boundingBox();
    const asideBox = await page
      .locator('aside[aria-labelledby="request-summary-heading"]')
      .boundingBox();
    const ordered = Boolean(
      formBox && asideBox && formBox.y < asideBox.y
    );
    record(
      "request 390px form above summary",
      ordered,
      `form.y=${Math.round(formBox?.y ?? -1)} aside.y=${Math.round(asideBox?.y ?? -1)}`
    );
  }

  record(
    `request ${width}px no console errors`,
    consoleErrors.length === 0,
    consoleErrors.join(" | ")
  );
  await context.close();
}

// -------------------------------------------------------------------- 2. FAQ
{
  const {context, page, consoleErrors} = await open(1440, 900);
  await page.goto(`${base}/el/faq`, {waitUntil: "networkidle"});

  const headings = await page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((element) =>
      element.tagName
    )
  );
  const firstH1 = headings.indexOf("H1");
  const firstH2 = headings.indexOf("H2");
  const firstH3 = headings.indexOf("H3");
  record(
    "faq heading order H1 → H2 → H3",
    firstH1 === 0 && firstH2 > firstH1 && firstH3 > firstH2,
    headings.slice(0, 8).join(",")
  );

  const greekLabels = await page.evaluate(() =>
    [...document.querySelectorAll("a[lang]")].map((link) => ({
      lang: link.getAttribute("lang"),
      label: link.getAttribute("aria-label")
    }))
  );
  const englishTarget = greekLabels.find((link) => link.lang === "en");
  record(
    "faq Greek page EN link aria-label contains English",
    Boolean(englishTarget?.label?.includes("English")),
    JSON.stringify(greekLabels)
  );

  record("faq no console errors", consoleErrors.length === 0, consoleErrors.join(" | "));
  await context.close();
}
{
  const {context, page} = await open(1440, 900);
  await page.goto(`${base}/en/faq`, {waitUntil: "networkidle"});
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll("a[lang]")].map((link) => ({
      lang: link.getAttribute("lang"),
      label: link.getAttribute("aria-label")
    }))
  );
  const greekTarget = labels.find((link) => link.lang === "el");
  record(
    "faq English page EL link aria-label contains Αγγλικά",
    Boolean(greekTarget?.label?.includes("Αγγλικά")),
    JSON.stringify(labels)
  );
  await context.close();
}

// --------------------------------------------------------------- 3. dates EL
{
  const {context, page} = await open(1440, 900);
  await page.goto(`${base}${requestPath}`, {waitUntil: "networkidle"});
  const dateText = await page.locator('[id^="request-dates-"]').innerText();
  record(
    "el request shows Greek month abbreviation (Νοε, not Nov)",
    dateText.includes("Νοε") && !dateText.includes("Nov"),
    dateText.replace(/\s+/g, " ").trim()
  );
  await context.close();
}

// ------------------------------------------------------------- 4. contrast
{
  const {context, page} = await open(1440, 900);
  await page.goto(`${base}/el/request`, {waitUntil: "networkidle"});
  const triggerColor = await page
    .locator('[id^="request-dates-"]')
    .evaluate((element) => getComputedStyle(element).color);
  record(
    "date trigger placeholder color rgb(88, 100, 107)",
    triggerColor === "rgb(88, 100, 107)",
    triggerColor
  );
  await context.close();
}
{
  const {context, page} = await open(1440, 900);
  await page.goto(`${base}/el/cars/dacia-sandero-stepway`, {
    waitUntil: "networkidle"
  });
  const badgeColor = await page.evaluate(() => {
    const badge = [...document.querySelectorAll('[data-slot="badge"]')].find(
      (element) => element.className.includes("bg-brand-subtle")
    );
    return badge ? getComputedStyle(badge).color : null;
  });
  record(
    "brand badge text color rgb(7, 104, 97)",
    badgeColor === "rgb(7, 104, 97)",
    String(badgeColor)
  );
  await context.close();
}

// ------------------------------------------------------------------- 5. hero
for (const width of [1440, 390]) {
  const height = width === 1440 ? 900 : 844;
  const {context, page, consoleErrors} = await open(width, height);
  await page.goto(`${base}/el`, {waitUntil: "networkidle"});

  const heroClasses = await page.evaluate(() => {
    const html = document.body.innerHTML;
    return {
      mx: html.includes("lg:mx-10"),
      rounded: html.includes("lg:rounded-hero")
    };
  });
  record(
    `hero ${width}px full-bleed (no lg:mx-10 / lg:rounded-hero)`,
    !heroClasses.mx && !heroClasses.rounded,
    JSON.stringify(heroClasses)
  );

  const flow = await overflow(page);
  record(
    `home ${width}px no horizontal overflow`,
    flow.ok,
    `scrollWidth=${flow.scrollWidth} innerWidth=${flow.innerWidth}`
  );

  await page.screenshot({
    path: path.join(outDir, `home-${width}.png`),
    fullPage: true
  });
  record(
    `home ${width}px no console errors`,
    consoleErrors.length === 0,
    consoleErrors.join(" | ")
  );
  await context.close();
}

// ------------------------------------------------------- 6. final captures
const pages = [
  {name: "cars", path: "/el/cars"},
  {name: "vehicle", path: "/el/cars/dacia-sandero-stepway"},
  {name: "request", path: requestPath}
];

for (const target of pages) {
  for (const width of [1440, 390]) {
    const height = width === 1440 ? 900 : 844;
    const {context, page, consoleErrors} = await open(width, height);
    await page.goto(`${base}${target.path}`, {waitUntil: "networkidle"});

    const flow = await overflow(page);
    record(
      `${target.name} ${width}px no horizontal overflow`,
      flow.ok,
      `scrollWidth=${flow.scrollWidth} innerWidth=${flow.innerWidth}`
    );

    await page.screenshot({
      path: path.join(outDir, `${target.name}-${width}.png`),
      fullPage: true
    });
    record(
      `${target.name} ${width}px no console errors`,
      consoleErrors.length === 0,
      consoleErrors.join(" | ")
    );
    await context.close();
  }
}

await browser.close();

const failed = results.filter((result) => !result.ok);
await writeFile(
  path.join(outDir, "report.json"),
  JSON.stringify({from, to, results, failed: failed.length}, null, 2)
);

console.log(`\n${results.length - failed.length}/${results.length} checks pass`);
if (failed.length > 0) {
  console.log("FAILED:");
  for (const failure of failed) console.log(` - ${failure.name}: ${failure.detail}`);
  process.exitCode = 1;
}
