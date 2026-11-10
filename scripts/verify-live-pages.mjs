import {chromium} from "@playwright/test";
import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

/**
 * Live GitHub Pages verification.
 *
 *   node scripts/verify-live-pages.mjs [baseUrl]
 *
 * Defaults to the deployed Pages URL. Starts nothing: it only reads the live
 * site, captures the four acceptance screenshots into `screenshots/live/`, and
 * prints one JSON report. Every assertion below maps to the deployment's
 * acceptance list, so a regression is a failed check rather than a silent pass.
 */
const base = (
  process.argv[2] ?? "https://odypslegend-blip.github.io/kalimeris-car-rentals"
).replace(/\/+$/, "");
const outDir = path.resolve("screenshots/live");
await mkdir(outDir, {recursive: true});

const checks = [];
const screenshots = [];

function check(name, pass, detail) {
  checks.push({name, pass: Boolean(pass), detail});
}

/** Greek summary label, formatted exactly like src/lib/dates.ts does. */
function greekDateLabel(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(year, month - 1, day, 12, 0, 0, 0));
}

/** Local-date ISO string offset by whole days from today. */
function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HAS_GREEK = /[\u0370-\u03FF]/;

/** Attaches network/console collectors to one page and returns their arrays. */
function instrument(page) {
  const state = {
    responses404: [],
    requestFailures: [],
    consoleErrors: [],
    pageErrors: [],
    apiRequests: []
  };

  page.on("response", (response) => {
    if (response.status() === 404) state.responses404.push(response.url());
  });
  page.on("request", (request) => {
    if (request.url().includes("/api/")) state.apiRequests.push(request.url());
  });
  page.on("requestfailed", (request) =>
    state.requestFailures.push(
      `${request.method()} ${request.url()} - ${request.failure()?.errorText}`
    )
  );
  page.on("console", (message) => {
    if (message.type() === "error") state.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => state.pageErrors.push(error.message));

  return state;
}

/**
 * Scrolls the whole document once so lazily-loaded images are requested, then
 * reports every visible <img> with its decoded width.
 */
async function allImagesDecoded(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  return page.evaluate(() =>
    [...document.images]
      .filter((img) => img.getBoundingClientRect().width > 0)
      .map((img) => ({
        src: img.currentSrc || img.src,
        naturalWidth: img.naturalWidth,
        complete: img.complete
      }))
  );
}

/**
 * Splits 404s into real asset failures vs. App Router RSC prefetch payloads.
 *
 * A static export has no server to answer `__next.<...>.txt` RSC requests, so
 * the router's speculative prefetch always 404s. Those are reported by count
 * but are not treated as a deployment failure.
 */
function classify404s(urls) {
  const prefetch = urls.filter((url) => /__next[^/]*\.txt(\?|$)/.test(url));
  const other = urls.filter((url) => !prefetch.includes(url));
  return {prefetch, other};
}

/**
 * Console errors that are only the browser narrating a prefetch 404.
 * Acceptable only when every 404 on the page was a prefetch payload.
 */
function classifyConsoleErrors(consoleErrors, other404s) {
  const resource404 = consoleErrors.filter((text) =>
    /Failed to load resource: the server responded with a status of 404/.test(text)
  );
  const other = consoleErrors.filter((text) => !resource404.includes(text));
  return {resource404, other, benign: other404s.length === 0 && other.length === 0};
}

const browser = await chromium.launch({headless: true, channel: "chrome"});

try {
  /* ---------------------------------------------------------------------
   * 1. Root redirects to /el/ and renders the Greek H1
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    await page.goto(`${base}/`, {waitUntil: "domcontentloaded", timeout: 60000});
    await page.waitForURL(/\/el\/$/, {timeout: 5000});
    check("root redirects to /el/", /\/el\/$/.test(page.url()), page.url());

    const h1 = (await page.locator("main h1").first().innerText()).trim();
    check("Greek home H1 is Greek", HAS_GREEK.test(h1), h1);
    check(
      "Greek home html[lang]=el",
      (await page.locator("html").getAttribute("lang")) === "el",
      await page.locator("html").getAttribute("lang")
    );

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const images = await allImagesDecoded(page);
    const undecoded = images.filter((img) => img.naturalWidth === 0);
    check(
      `home images decoded (${images.length} visible)`,
      images.length > 0 && undecoded.length === 0,
      undecoded.map((img) => img.src).slice(0, 5)
    );

    await page.screenshot({
      path: path.join(outDir, "home-1440.png"),
      fullPage: true
    });
    screenshots.push("screenshots/live/home-1440.png");

    const {prefetch, other} = classify404s(net.responses404);
    check("home: no non-prefetch 404s", other.length === 0, other);
    check("home: no page errors", net.pageErrors.length === 0, net.pageErrors);
    // A HEAD probe aborted by the client's own redirect is not a failure.
    const realFailures = net.requestFailures.filter(
      (entry) => !entry.includes("net::ERR_ABORTED")
    );
    check("home: no failed requests", realFailures.length === 0, {
      realFailures,
      aborted: net.requestFailures.length - realFailures.length
    });

    const consoleErrors = classifyConsoleErrors(net.consoleErrors, other);
    check(
      "home: no console errors beyond prefetch 404s",
      consoleErrors.benign,
      {
        other: consoleErrors.other,
        resource404: consoleErrors.resource404.length
      }
    );
    check("home: prefetch 404 count recorded", true, {
      count: prefetch.length,
      urls: prefetch
    });

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 2. Fleet: six vehicles, then exactly the two SUVs after filtering
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    const response = await page.goto(`${base}/el/cars/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    check("GET /el/cars/ is 200", response?.status() === 200, response?.status());

    // Cards are `<li>` items in the results grid; scoping to `main li` keeps
    // header/footer navigation (which also points at /cars/ under basePath +
    // trailingSlash) out of the count.
    const vehicleLinks = page.locator('main a[href*="/cars/"]:has(h3)');
    await vehicleLinks.first().waitFor({state: "visible", timeout: 30000});
    await page.waitForTimeout(1200);
    const total = await vehicleLinks.count();
    check("fleet lists 6 vehicle cards", total === 6, total);

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, "fleet-1440.png"),
      fullPage: true
    });
    screenshots.push("screenshots/live/fleet-1440.png");

    const fleetH1 = (await page.locator("main h1").first().innerText()).trim();
    check("fleet H1 is Greek", HAS_GREEK.test(fleetH1), fleetH1);

    // Hydration-dependent filter: a plain link carrying the query string.
    await page.getByRole("link", {name: "SUV", exact: true}).first().click();
    await page.waitForURL(/\/el\/cars\/?\?category=suv$/, {timeout: 15000});
    await page.waitForTimeout(1200);

    const suvCount = await vehicleLinks.count();
    check("SUV filter yields exactly 2 cards", suvCount === 2, suvCount);

    const suvNames = await vehicleLinks.allInnerTexts();
    const joined = suvNames.join(" | ").replace(/\s+/g, " ");
    check("SUV filter shows Peugeot 2008", /Peugeot 2008/.test(joined), joined.slice(0, 160));
    check("SUV filter shows Kia XCeed", /Kia XCeed/.test(joined), joined.slice(0, 160));

    // Diagnostic only: after an in-page (query-only) filter navigation the
    // header switcher's href is captured so the behaviour is recorded rather
    // than assumed. See the "in-page filter" gap in docs/IMPLEMENTATION_STATUS.md.
    const inPageSwitchHref = await page
      .locator('header a[lang="en"]')
      .first()
      .getAttribute("href");
    check(
      "in-page filter: language href recorded (diagnostic)",
      true,
      {url: page.url(), href: inPageSwitchHref}
    );

    const {prefetch, other} = classify404s(net.responses404);
    check("fleet: no non-prefetch 404s", other.length === 0, other);
    check("fleet: no page errors", net.pageErrors.length === 0, net.pageErrors);
    const fleetConsole = classifyConsoleErrors(net.consoleErrors, other);
    check("fleet: no console errors beyond prefetch 404s", fleetConsole.benign, {
      other: fleetConsole.other,
      resource404: fleetConsole.resource404.length
    });
    check("fleet: prefetch 404 count recorded", true, {
      count: prefetch.length,
      urls: prefetch
    });

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 2b. Language switch preserves the query string on a direct load
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    const response = await page.goto(`${base}/el/cars/?category=suv`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    check(
      "GET /el/cars/?category=suv is 200",
      response?.status() === 200,
      response?.status()
    );

    const suvLinks = page.locator('main a[href*="/cars/"]:has(h3)');
    await suvLinks.first().waitFor({state: "visible", timeout: 30000});
    await page.waitForTimeout(1500);
    const directCount = await suvLinks.count();
    check("direct ?category=suv load shows 2 cards", directCount === 2, directCount);

    const switchLink = page.locator('header a[lang="en"]').first();
    const switchHref = await switchLink.getAttribute("href");
    await switchLink.click();
    await page.waitForURL(/\/en\/cars\/?\?category=suv$/, {timeout: 15000});
    await page.waitForTimeout(800);

    const englishH1 = (await page.locator("main h1").first().innerText()).trim();
    check(
      "language switch preserves ?category=suv",
      /\/en\/cars\/?\?category=suv$/.test(page.url()) &&
        /category=suv/.test(switchHref ?? ""),
      {url: page.url(), href: switchHref}
    );
    check("English fleet H1 is not Greek", !HAS_GREEK.test(englishH1), englishH1);

    const {prefetch, other} = classify404s(net.responses404);
    check("language switch: no non-prefetch 404s", other.length === 0, other);
    check("language switch: no page errors", net.pageErrors.length === 0, net.pageErrors);
    const switchConsole = classifyConsoleErrors(net.consoleErrors, other);
    check(
      "language switch: no console errors beyond prefetch 404s",
      switchConsole.benign,
      {other: switchConsole.other, resource404: switchConsole.resource404.length}
    );
    check("language switch: prefetch 404 count recorded", true, {
      count: prefetch.length,
      urls: prefetch
    });

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 3. Vehicle detail: H1 + two gallery thumbnails
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    const response = await page.goto(
      `${base}/el/cars/dacia-sandero-stepway/`,
      {waitUntil: "domcontentloaded", timeout: 60000}
    );
    check(
      "GET /el/cars/dacia-sandero-stepway/ is 200",
      response?.status() === 200,
      response?.status()
    );

    const h1 = (await page.locator("main h1").first().innerText()).trim();
    check("vehicle detail H1", h1 === "Dacia Sandero Stepway", h1);

    const thumbs = page.locator("button[aria-pressed]");
    await thumbs.first().waitFor({state: "visible", timeout: 30000});
    const thumbCount = await thumbs.count();
    check("vehicle detail has 2 gallery thumbnails", thumbCount === 2, thumbCount);

    const images = await allImagesDecoded(page);
    const undecoded = images.filter((img) => img.naturalWidth === 0);
    check(
      `vehicle detail images decoded (${images.length} visible)`,
      undecoded.length === 0,
      undecoded.map((img) => img.src).slice(0, 5)
    );

    const {prefetch, other} = classify404s(net.responses404);
    check("vehicle detail: no non-prefetch 404s", other.length === 0, other);
    check("vehicle detail: no page errors", net.pageErrors.length === 0, net.pageErrors);
    check("vehicle detail: prefetch 404 count recorded", true, prefetch.length);

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 4. Request page: summary + form, honest disabled submit, no /api/ call
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    const query = new URLSearchParams({
      vehicle: "peugeot-2008",
      pickup: "main",
      return: "main",
      from: isoInDays(7),
      to: isoInDays(10)
    });

    const response = await page.goto(`${base}/el/request/?${query.toString()}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    check("GET /el/request/ is 200", response?.status() === 200, response?.status());

    // The summary and the form are client-rendered from the query string, so
    // wait for hydration to produce them.
    const form = page.locator("form").first();
    await form.waitFor({state: "visible", timeout: 30000});
    await page.waitForTimeout(1500);

    const summaryText = await page
      .locator("main")
      .first()
      .innerText();
    check(
      "request summary names the vehicle",
      /Peugeot 2008/.test(summaryText),
      summaryText.slice(0, 200)
    );
    // The summary formats dates with Intl (el-GR, short month), not ISO.
    const fromLabel = greekDateLabel(isoInDays(7));
    const toLabel = greekDateLabel(isoInDays(10));
    check(
      "request summary shows the date range",
      summaryText.includes(fromLabel) && summaryText.includes(toLabel),
      {from: fromLabel, to: toLabel}
    );

    const submit = form.locator('button[type="submit"]').first();
    check(
      "submit is aria-disabled (static preview)",
      (await submit.getAttribute("aria-disabled")) === "true",
      await submit.getAttribute("aria-disabled")
    );

    const alertBefore = (await form.locator('[role="alert"]').first().innerText()).trim();
    check(
      "form shows the not-configured alert in Greek",
      HAS_GREEK.test(alertBefore),
      alertBefore
    );

    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outDir, "request-1440.png"),
      fullPage: true
    });
    screenshots.push("screenshots/live/request-1440.png");

    // Clicking a disabled submit must not fire any network submission.
    const apiBefore = net.apiRequests.length;
    await submit.click({force: true});
    await page.waitForTimeout(1500);
    check(
      "submitting sends no /api/ request",
      net.apiRequests.length === apiBefore,
      net.apiRequests
    );
    check(
      "no success state is rendered",
      (await page.locator("[data-request-success]").count()) === 0,
      "absent"
    );

    const {prefetch, other} = classify404s(net.responses404);
    check("request: no non-prefetch 404s", other.length === 0, other);
    check("request: no page errors", net.pageErrors.length === 0, net.pageErrors);
    check("request: prefetch 404 count recorded", true, prefetch.length);

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 5. English home
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const net = instrument(page);

    const response = await page.goto(`${base}/en/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    check("GET /en/ is 200", response?.status() === 200, response?.status());

    const h1 = (await page.locator("main h1").first().innerText()).trim();
    check("English home H1", h1 === "Rent with confidence.", h1);
    check(
      "English home html[lang]=en",
      (await page.locator("html").getAttribute("lang")) === "en",
      await page.locator("html").getAttribute("lang")
    );

    const {prefetch, other} = classify404s(net.responses404);
    check("en home: no non-prefetch 404s", other.length === 0, other);
    check("en home: no page errors", net.pageErrors.length === 0, net.pageErrors);
    check("en home: prefetch 404 count recorded", true, prefetch.length);

    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 6. Mobile home screenshot
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 390, height: 844}});
    const page = await context.newPage();
    const net = instrument(page);

    await page.goto(`${base}/el/`, {waitUntil: "domcontentloaded", timeout: 60000});
    await page.locator("main h1").first().waitFor({state: "visible", timeout: 30000});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const width = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    check(
      "no horizontal overflow at 390",
      width.scrollWidth <= width.clientWidth + 1,
      width
    );

    await page.screenshot({
      path: path.join(outDir, "home-390.png"),
      fullPage: true
    });
    screenshots.push("screenshots/live/home-390.png");

    check("mobile home: no page errors", net.pageErrors.length === 0, net.pageErrors);
    await context.close();
  }

  /* ---------------------------------------------------------------------
   * 7. Unknown path serves the custom 404 with status 404
   * ------------------------------------------------------------------ */
  {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}});
    const page = await context.newPage();

    const response = await page.goto(`${base}/el/nope`, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    const status = response?.status() ?? null;
    check("unknown path returns 404", status === 404, status);

    const html = await page.content();
    check("404 body is the custom HTML", /KALIMERIS/.test(html), html.length);

    const h1 = (await page.locator("h1").first().innerText()).trim();
    check("404 H1 is bilingual", HAS_GREEK.test(h1) && /Page not found/.test(h1), h1);

    // Relative links on a nested 404 resolve against the requested path; record
    // the resolved targets so a wrong depth is visible rather than assumed.
    const resolved = await page.evaluate(() =>
      [...document.querySelectorAll("a")].map((a) => ({
        text: (a.textContent ?? "").trim(),
        href: a.getAttribute("href"),
        resolved: a.href
      }))
    );
    check("404 links recorded", true, resolved);

    await context.close();
  }
} finally {
  await browser.close();
}

const failed = checks.filter((entry) => !entry.pass);
const report = {
  baseUrl: base,
  checkedAt: new Date().toISOString(),
  totals: {checks: checks.length, passed: checks.length - failed.length, failed: failed.length},
  screenshots,
  checks,
  failed
};

await writeFile(
  path.join(outDir, "report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
