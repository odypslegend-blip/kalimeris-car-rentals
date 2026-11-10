/**
 * Self-contained verification of the accessibility / layout fixes.
 *
 *   node scripts/verify-fixes.mjs
 *
 * Spawns `npx next start -p 3340` itself, polls /api/health, drives a real
 * Chrome through the checks below, kills the server tree and prints a JSON
 * summary. Exits 1 if any check fails. Does not touch application source.
 */

import {spawn, execSync} from "node:child_process";
import {readFileSync, mkdirSync} from "node:fs";
import net from "node:net";
import path from "node:path";
import {chromium} from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = "http://127.0.0.1:3340";
const PORT = 3340;
const SHOTS = path.join(ROOT, "screenshots", "final");

const checks = [];

function record(name, ok, detail) {
  checks.push({name, ok: Boolean(ok), detail: detail === undefined ? "" : detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : ` — ${detail}`}`);
}

function iso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = new Date();
const from = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));
const to = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10));
const requestUrl = `${BASE}/el/request?vehicle=peugeot-2008&pickup=main&return=main&from=${from}&to=${to}`;

console.log(`workspace: ${ROOT}`);
console.log(`dates: from=${from} to=${to}`);
console.log(`request: ${requestUrl}\n`);

const serverLog = [];

function log(line) {
  serverLog.push(line);
  if (serverLog.length > 200) serverLog.shift();
}

const comspec = process.env.ComSpec || "cmd.exe";
const command = `npx next start -p ${PORT}`;

const server = spawn(comspec, ["/d", "/s", "/c", command], {
  cwd: ROOT,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"]
});

server.stdout.setEncoding("utf8");
server.stderr.setEncoding("utf8");
server.stdout.on("data", (chunk) => {
  const text = String(chunk).trimEnd();
  log(text);
  console.log(`[next] ${text}`);
});
server.stderr.on("data", (chunk) => {
  const text = String(chunk).trimEnd();
  log(text);
  console.log(`[next:err] ${text}`);
});
server.on("exit", (code, signal) => {
  log(`server exited code=${code} signal=${signal}`);
});

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({host: "127.0.0.1", port});
    const done = (inUse) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(inUse);
    };
    socket.setTimeout(1500);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(true));
    socket.once("error", () => done(false));
  });
}

async function healthOk() {
  try {
    const response = await fetch(`${BASE}/api/health`, {
      signal: AbortSignal.timeout(2500)
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

function killTree() {
  try {
    execSync(`taskkill /PID ${server.pid} /T /F`, {stdio: "ignore"});
  } catch {
    /* already gone */
  }
}

const IGNORE_ABORTED = /net::ERR_ABORTED/;

function watch(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const ignored = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (IGNORE_ABORTED.test(text)) {
      ignored.push(`console: ${text}`);
      return;
    }
    consoleErrors.push(text);
  });

  page.on("pageerror", (error) => {
    pageErrors.push(String((error && error.stack) || error));
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    const errorText = failure ? failure.errorText : "";
    const url = request.url();
    let headers = {};
    try {
      headers = request.headers();
    } catch {
      headers = {};
    }
    const isPrefetch =
      url.includes("_rsc") ||
      headers["rsc"] === "1" ||
      headers["next-router-prefetch"] === "1";
    if (errorText.includes("ERR_ABORTED") && isPrefetch) {
      ignored.push(`requestfailed: ${url} ${errorText}`);
      return;
    }
    failedRequests.push({url, errorText});
  });

  return {consoleErrors, pageErrors, failedRequests, ignored};
}

const MEASURE = () => {
  const vw = window.innerWidth;
  const offenders = [];

  const clippedHorizontally = (element) => {
    let parent = element.parentElement;
    while (parent && parent !== document.documentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX !== "visible") return true;
      parent = parent.parentElement;
    }
    return false;
  };

  for (const element of document.body.querySelectorAll("*")) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > vw + 1) {
      if (!clippedHorizontally(element)) {
        offenders.push({
          tag: element.tagName.toLowerCase(),
          cls: String(element.className || "").slice(0, 120),
          right: Math.round(rect.right)
        });
      }
    }
    if (offenders.length >= 8) break;
  }

  return {
    innerWidth: vw,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders
  };
};

async function settle(page, url) {
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 45000
  });
  await page.waitForLoadState("networkidle", {timeout: 20000}).catch(() => {});
  await page.waitForTimeout(500);
  return response;
}

async function shot(page, name) {
  const file = path.join(SHOTS, name);
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.screenshot({path: file, fullPage: true});
  return file;
}

let browser;

try {
  mkdirSync(SHOTS, {recursive: true});

  // 1. Server ---------------------------------------------------------------
  const startedAt = Date.now();
  let healthy = false;
  while (Date.now() - startedAt < 90000) {
    if (await healthOk()) {
      healthy = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  record(
    "server: next start -p 3340 answers /api/health 200",
    healthy,
    `${Math.round((Date.now() - startedAt) / 1000)}s`
  );

  if (!healthy) throw new Error(`server did not become healthy\n${serverLog.join("\n")}`);

  browser = await chromium.launch({channel: "chrome", headless: true});

  // 2. Layout at four viewports --------------------------------------------
  const viewports = [
    {name: "320x800", width: 320, height: 800},
    {name: "375x812", width: 375, height: 812},
    {name: "390x844", width: 390, height: 844},
    {name: "1440x900", width: 1440, height: 900}
  ];

  const pages = new Map();
  const watchers = new Map();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: {width: viewport.width, height: viewport.height}
    });
    const page = await context.newPage();
    const watcher = watch(page);
    pages.set(viewport.name, page);
    watchers.set(viewport.name, watcher);

    const response = await settle(page, requestUrl);
    const status = response ? response.status() : 0;
    record(
      `request @${viewport.name}: status 200`,
      status === 200,
      `status ${status}`
    );

    const metrics = await page.evaluate(MEASURE);
    const overflow = metrics.scrollWidth > metrics.innerWidth + 1;
    record(
      `request @${viewport.name}: no horizontal overflow`,
      !overflow && metrics.offenders.length === 0,
      `scrollWidth ${metrics.scrollWidth} vs innerWidth ${metrics.innerWidth}` +
        (metrics.offenders.length
          ? `; offenders ${JSON.stringify(metrics.offenders)}`
          : "; offenders none")
    );
  }

  // Mobile order: form before summary -------------------------------------
  const mobile = pages.get("390x844");
  const order = await mobile.evaluate(() => {
    const form = document.querySelector("form");
    const aside = document.querySelector(
      'aside[aria-labelledby="request-summary-heading"]'
    );
    return {
      hasForm: Boolean(form),
      hasAside: Boolean(aside),
      formTop: form ? Math.round(form.getBoundingClientRect().top) : null,
      asideTop: aside ? Math.round(aside.getBoundingClientRect().top) : null,
      asideParentOrder: aside
        ? getComputedStyle(aside).order
        : null,
      formWrapperOrder: form
        ? getComputedStyle(form.parentElement.parentElement).order
        : null
    };
  });
  record(
    "request @390x844: form renders before the summary aside",
    order.hasForm &&
      order.hasAside &&
      typeof order.formTop === "number" &&
      typeof order.asideTop === "number" &&
      order.formTop < order.asideTop,
    `formTop ${order.formTop} < asideTop ${order.asideTop}`
  );

  // Date trigger label (Greek month) --------------------------------------
  const dateTrigger = mobile.locator('button[id^="request-dates-"]').first();
  const dateText = (await dateTrigger.textContent()) ?? "";
  record(
    "request @390x844: date trigger uses a Greek month label",
    dateText.includes("Νοε") && !dateText.includes("Nov"),
    JSON.stringify(dateText.replace(/\s+/g, " ").trim())
  );

  // Required note ---------------------------------------------------------
  const bodyText = await mobile.evaluate(() => document.body.innerText);
  const requiredNote = "Όλα τα πεδία είναι υποχρεωτικά";
  record(
    "request @390x844: required-field note is rendered",
    bodyText.includes(requiredNote),
    bodyText.includes(requiredNote) ? "found" : "missing"
  );

  // aria-required on the pickup + date triggers ---------------------------
  const pickupTrigger = mobile.locator('button[id^="request-pickup-"]').first();
  const pickupRequired = await pickupTrigger.getAttribute("aria-required");
  record(
    "request @390x844: pickup trigger has aria-required=true",
    pickupRequired === "true",
    `aria-required=${JSON.stringify(pickupRequired)}`
  );

  const datesRequired = await dateTrigger.getAttribute("aria-required");
  record(
    "request @390x844: dates trigger has aria-required=true",
    datesRequired === "true",
    `aria-required=${JSON.stringify(datesRequired)}`
  );

  // Native required on name / email / phone -------------------------------
  const requiredFields = {};
  for (const field of ["name", "email", "phone"]) {
    const input = mobile.locator(`input[id^="request-${field}-"]`).first();
    requiredFields[field] = await input.evaluate((element) =>
      element.hasAttribute("required") ? element.getAttribute("required") : null
    );
  }
  record(
    "request @390x844: name/email/phone inputs are required",
    Object.values(requiredFields).every((value) => value !== null),
    JSON.stringify(requiredFields)
  );

  // Consent toggle --------------------------------------------------------
  const consent = mobile.getByRole("checkbox", {name: /Συμφωνώ/});
  const consentBefore = await consent.isChecked();
  record(
    "request @390x844: consent starts unchecked",
    consentBefore === false,
    `checked=${consentBefore}`
  );

  const consentText = mobile.locator(
    'label:has(> input[id^="request-consent-"]) > span'
  ).first();
  await consentText.click();
  await mobile.waitForTimeout(150);
  const consentAfter = await consent.isChecked();
  record(
    "request @390x844: clicking the consent text toggles the checkbox",
    consentBefore === false && consentAfter === true,
    `checked=${consentAfter}`
  );

  // Colours --------------------------------------------------------------
  const colorContext = await browser.newContext({viewport: {width: 390, height: 844}});
  const colorPage = await colorContext.newPage();
  const colorWatcher = watch(colorPage);

  await settle(colorPage, `${BASE}/el/request`);
  const emptyDateColor = await colorPage
    .locator('button[id^="request-dates-"]')
    .first()
    .evaluate((element) => getComputedStyle(element).color);
  record(
    "request: empty date trigger is muted (#58646b)",
    emptyDateColor.replace(/\s/g, "") === "rgb(88,100,107)",
    `color ${emptyDateColor}`
  );

  await settle(colorPage, `${BASE}/el/cars/dacia-sandero-stepway`);
  const badgeColor = await colorPage
    .locator('[data-slot="badge"]')
    .first()
    .evaluate((element) => getComputedStyle(element).color);
  record(
    "vehicle detail: brand badge is brand-hover (#076861)",
    badgeColor.replace(/\s/g, "") === "rgb(7,104,97)",
    `color ${badgeColor}`
  );

  await colorContext.close();

  // 4. FAQ heading order --------------------------------------------------
  const faqContext = await browser.newContext({viewport: {width: 1440, height: 900}});
  const faqPage = await faqContext.newPage();
  const faqWatcher = watch(faqPage);
  const faqResponse = await settle(faqPage, `${BASE}/el/faq`);
  record(
    "faq: status 200",
    (faqResponse ? faqResponse.status() : 0) === 200,
    `status ${faqResponse ? faqResponse.status() : 0}`
  );

  const headings = await faqPage.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => ({
      level: Number(heading.tagName.slice(1)),
      text: (heading.textContent || "").trim().slice(0, 60)
    }))
  );
  const firstHeading = headings[0];
  const firstH2 = headings.findIndex((heading) => heading.level === 2);
  const firstH3 = headings.findIndex((heading) => heading.level === 3);
  record(
    "faq: H1 is the first heading",
    Boolean(firstHeading) && firstHeading.level === 1,
    firstHeading ? `h${firstHeading.level} "${firstHeading.text}"` : "no headings"
  );
  record(
    "faq: at least one H2 precedes the first H3",
    firstH2 >= 0 && (firstH3 === -1 || firstH2 < firstH3),
    `h2 index ${firstH2}, first h3 index ${firstH3}, order ${headings
      .map((heading) => `h${heading.level}`)
      .join(">")}`
  );

  // 5. Language switcher --------------------------------------------------
  const langContext = await browser.newContext({viewport: {width: 1440, height: 900}});
  const langPage = await langContext.newPage();
  const langWatcher = watch(langPage);

  await settle(langPage, `${BASE}/el`);
  const enLink = langPage.locator('a[lang="en"]').first();
  const enLabel = (await enLink.getAttribute("aria-label")) ?? "";
  record(
    "language switcher /el: a[lang=en] aria-label contains English",
    enLabel.trim().length > 0 && enLabel.includes("English"),
    JSON.stringify(enLabel)
  );

  await settle(langPage, `${BASE}/en`);
  const elLink = langPage.locator('a[lang="el"]').first();
  const elLabel = (await elLink.getAttribute("aria-label")) ?? "";
  record(
    "language switcher /en: a[lang=el] aria-label contains Ελληνικά",
    elLabel.trim().length > 0 && elLabel.includes("Ελληνικά"),
    JSON.stringify(elLabel)
  );

  await langContext.close();

  // 6. Hero + home screenshots --------------------------------------------
  const heroContext = await browser.newContext({viewport: {width: 1440, height: 900}});
  const heroPage = await heroContext.newPage();
  const heroWatcher = watch(heroPage);
  await settle(heroPage, `${BASE}/el`);

  const hero = await heroPage.evaluate(() => {
    const image = [...document.querySelectorAll("img")].find((element) =>
      (element.getAttribute("src") || "").includes("hero-greece")
    );
    if (!image) return {found: false, ancestors: []};
    const ancestors = [];
    let parent = image.parentElement;
    while (parent) {
      ancestors.push({
        tag: parent.tagName.toLowerCase(),
        classes: String(parent.className || "")
      });
      parent = parent.parentElement;
    }
    return {found: true, ancestors};
  });

  const banned = ["lg:mx-10", "lg:rounded-hero"];
  const offending = hero.ancestors.filter((ancestor) =>
    banned.some((token) => ancestor.classes.split(/\s+/).includes(token))
  );
  record(
    "home hero: no ancestor carries lg:mx-10 / lg:rounded-hero",
    hero.found && offending.length === 0,
    hero.found
      ? offending.length === 0
        ? `${hero.ancestors.length} ancestors clean`
        : JSON.stringify(offending)
      : "hero image not found"
  );

  const home1440 = await shot(heroPage, "home-1440.png");
  await heroPage.setViewportSize({width: 390, height: 844});
  await heroPage.waitForTimeout(300);
  const home390 = await shot(heroPage, "home-390.png");
  await heroContext.close();

  // 7. axe on /el/request and /el/faq -------------------------------------
  const axeSource = readFileSync(
    path.resolve(ROOT, "node_modules", "axe-core", "axe.min.js"),
    "utf8"
  );
  const AXE_OPTIONS = {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
    }
  };

  async function runAxe(page, label) {
    await page.addScriptTag({content: axeSource});
    const result = await page.evaluate(async (options) => {
      const output = await window.axe.run(document, options);
      return {
        violationCount: output.violations.length,
        violations: output.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.slice(0, 6).map((node) => ({
            target: node.target,
            html: String(node.html || "").slice(0, 180)
          }))
        }))
      };
    }, AXE_OPTIONS);

    const blocking = result.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical"
    );
    record(
      `axe ${label}: zero serious/critical violations`,
      blocking.length === 0,
      blocking.length === 0
        ? `${result.violationCount} total violations (none serious/critical)`
        : blocking
            .map(
              (violation) =>
                `${violation.id}(${violation.impact}) ${JSON.stringify(
                  violation.nodes.map((node) => node.target)
                )}`
            )
            .join(" | ")
    );

    if (blocking.length > 0) {
      for (const violation of blocking) {
        console.log(
          `  AXE ${violation.id} [${violation.impact}] ${violation.help}`
        );
        for (const node of violation.nodes) {
          console.log(`    target ${JSON.stringify(node.target)} -> ${node.html}`);
        }
      }
    }

    return result;
  }

  const axeRequestContext = await browser.newContext({viewport: {width: 1440, height: 900}});
  const axeRequestPage = await axeRequestContext.newPage();
  const axeRequestWatcher = watch(axeRequestPage);
  await settle(axeRequestPage, requestUrl);
  await runAxe(axeRequestPage, "/el/request");
  await axeRequestContext.close();

  await faqPage.setViewportSize({width: 1440, height: 900});
  await faqPage.waitForTimeout(200);
  await runAxe(faqPage, "/el/faq");
  await faqContext.close();

  // 8. Final screenshots --------------------------------------------------
  const finalTargets = [
    {slug: "cars", url: `${BASE}/el/cars`},
    {slug: "vehicle", url: `${BASE}/el/cars/dacia-sandero-stepway`},
    {slug: "request", url: requestUrl}
  ];

  const finalScreenshots = [];
  const pageErrorsTotal = [];
  const failedRequestsTotal = [];

  for (const target of finalTargets) {
    for (const viewport of [
      {key: "1440", width: 1440, height: 900},
      {key: "390", width: 390, height: 844}
    ]) {
      const context = await browser.newContext({
        viewport: {width: viewport.width, height: viewport.height}
      });
      const page = await context.newPage();
      const watcher = watch(page);
      const response = await settle(page, target.url);
      const status = response ? response.status() : 0;
      const file = await shot(page, `${target.slug}-${viewport.key}.png`);
      finalScreenshots.push(file);

      record(
        `final ${target.slug} @${viewport.width}x${viewport.height}: status 200`,
        status === 200,
        `status ${status}`
      );

      const label = `${target.slug}@${viewport.width}`;
      record(
        `final ${label}: zero console errors`,
        watcher.consoleErrors.length === 0,
        watcher.consoleErrors.length === 0
          ? "none"
          : watcher.consoleErrors.slice(0, 3).join(" | ")
      );
      record(
        `final ${label}: zero page errors`,
        watcher.pageErrors.length === 0,
        watcher.pageErrors.length === 0
          ? "none"
          : watcher.pageErrors.slice(0, 2).join(" | ")
      );

      pageErrorsTotal.push(...watcher.pageErrors);
      failedRequestsTotal.push(...watcher.failedRequests);

      await context.close();
    }
  }

  // Aggregate console/page errors from every page used above.
  const allWatchers = [
    ...watchers.values(),
    colorWatcher,
    faqWatcher,
    langWatcher,
    heroWatcher,
    axeRequestWatcher
  ];

  const strayConsole = allWatchers.flatMap((watcher) => watcher.consoleErrors);
  const strayPageErrors = allWatchers.flatMap((watcher) => watcher.pageErrors);
  const strayFailed = allWatchers.flatMap((watcher) => watcher.failedRequests);
  const ignoredTotal = allWatchers.flatMap((watcher) => watcher.ignored);

  record(
    "all pages: zero console errors",
    strayConsole.length === 0,
    strayConsole.length === 0 ? "none" : strayConsole.slice(0, 5).join(" | ")
  );
  record(
    "all pages: zero page errors",
    strayPageErrors.length === 0,
    strayPageErrors.length === 0 ? "none" : strayPageErrors.slice(0, 3).join(" | ")
  );
  record(
    "all pages: zero failed requests (aborted RSC prefetches ignored)",
    strayFailed.length === 0 && failedRequestsTotal.length === 0,
    strayFailed.length === 0 && failedRequestsTotal.length === 0
      ? `none (${ignoredTotal.length} aborted prefetches ignored)`
      : [...strayFailed, ...failedRequestsTotal]
          .slice(0, 5)
          .map((item) => `${item.errorText} ${item.url}`)
          .join(" | ")
  );

  console.log(`\nscreenshots: ${finalScreenshots.length} written to ${SHOTS}`);
  for (const file of [...finalScreenshots, home1440, home390]) {
    console.log(`  ${file}`);
  }
} catch (error) {
  record("script completed without throwing", false, String((error && error.stack) || error));
  console.error(error);
} finally {
  // 9. Kill the server tree and confirm the port is free -------------------
  if (browser) await browser.close().catch(() => {});
  killTree();

  let free = false;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    free = !(await portInUse(PORT));
    if (free) break;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  record(
    `server: port ${PORT} released after taskkill`,
    free,
    free ? "connection refused" : "port still listening"
  );

  const passed = checks.filter((check) => check.ok).length;
  const failed = checks.length - passed;

  console.log("\n===== SUMMARY =====");
  console.log(JSON.stringify({checks, passed, failed}, null, 2));
  console.log(`\n${passed}/${checks.length} checks passed`);

  if (failed > 0) {
    console.log("FAILED CHECKS:");
    for (const check of checks.filter((item) => !item.ok)) {
      console.log(`- ${check.name}: ${check.detail}`);
    }
    process.exit(1);
  }
  process.exit(0);
}
