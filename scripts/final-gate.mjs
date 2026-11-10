// Final launch-gate checks against a production build.
//
// Usage:
//   node scripts/final-gate.mjs
//
// Starts `npx next start -p 3350`, asserts HTTP/SEO/content invariants, then
// stops the server and confirms the port is free again.
//
// No delivery transport is configured on purpose: /el/request must render the
// honest "not configured" alert and keep the submit button aria-disabled.

import {spawn} from "node:child_process";
import {connect} from "node:net";
import {writeFileSync, mkdirSync} from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = 3350;
const BASE = `http://127.0.0.1:${PORT}`;
const LOG_DIR = path.join(ROOT, "screenshots", "final");
const LOG_FILE = path.join(LOG_DIR, "final-gate.log");

mkdirSync(LOG_DIR, {recursive: true});

const results = [];
let failures = 0;

function record(name, ok, detail = "") {
  results.push({name, ok, detail});
  const line = `${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`;
  console.log(line);
}

function stripHtml(html) {
  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  const text = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x20ac;|&#8364;|&euro;/gi, "\u20ac")
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

async function get(pathname) {
  const response = await fetch(`${BASE}${pathname}`, {redirect: "manual"});
  const body = await response.text();
  return {status: response.status, body};
}

function waitForHealth(timeoutMs = 90000) {
  const startedAt = Date.now();
  return (async () => {
    while (Date.now() - startedAt < timeoutMs) {
      try {
        const response = await fetch(`${BASE}/api/health`);
        if (response.ok) return true;
      } catch {
        // not up yet
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return false;
  })();
}

function portIsFree(port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const socket = connect({host: "127.0.0.1", port});
    const done = (free) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(free);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(false));
    socket.once("timeout", () => done(true));
    socket.once("error", (error) => done(error.code === "ECONNREFUSED" || error.code === "EHOSTUNREACH"));
  });
}

const serverLog = [];
let server;

try {
  const comspec = process.env.ComSpec || "cmd.exe";
  server = spawn(comspec, ["/d", "/s", "/c", `npx next start -p ${PORT}`], {
    cwd: ROOT,
    windowsHide: true,
    env: {...process.env, NODE_ENV: "production"},
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => serverLog.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverLog.push(chunk.toString()));

  const healthy = await waitForHealth();
  record("server: next start -p 3350 answers /api/health 200", healthy);

  if (!healthy) {
    throw new Error(`server did not become healthy\n${serverLog.join("")}`);
  }

  // 1. Public routes answer 200 ------------------------------------------------
  const okRoutes = [
    "/el",
    "/en",
    "/el/cars",
    "/el/cars/peugeot-2008",
    "/el/request",
    "/el/faq",
    "/el/how-it-works",
    "/el/about",
    "/el/contact",
    "/el/privacy",
    "/el/rental-terms",
    "/en/faq",
    "/en/rental-terms"
  ];

  for (const route of okRoutes) {
    const {status} = await get(route);
    record(`200 ${route}`, status === 200, `got ${status}`);
  }

  // 2. Localized 404 -----------------------------------------------------------
  const notFound = await get("/el/does-not-exist");
  record("404 /el/does-not-exist", notFound.status === 404, `got ${notFound.status}`);
  const notFoundTitle = (notFound.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  record(
    "404 page <title> contains \"404\"",
    notFoundTitle.includes("404"),
    notFoundTitle.trim() || "no <title>"
  );

  // 3. sitemap.xml -------------------------------------------------------------
  const sitemap = await get("/sitemap.xml");
  record("sitemap.xml answers 200", sitemap.status === 200, `got ${sitemap.status}`);
  record(
    "sitemap.xml contains /el/cars/peugeot-2008",
    sitemap.body.includes("/el/cars/peugeot-2008")
  );
  record("sitemap.xml contains /el/faq", sitemap.body.includes("/el/faq"));

  // 4. robots.txt --------------------------------------------------------------
  const robots = await get("/robots.txt");
  record("robots.txt answers 200", robots.status === 200, `got ${robots.status}`);
  record("robots.txt contains \"Sitemap:\"", robots.body.includes("Sitemap:"));
  record(
    "robots.txt contains \"Disallow: /el/request\"",
    robots.body.includes("Disallow: /el/request")
  );

  // 5. Structured data ---------------------------------------------------------
  const home = await get("/el");
  record("home HTML contains \"@type\":\"WebSite\"", home.body.includes('"@type":"WebSite"'));
  record("home HTML does not contain LocalBusiness", !home.body.includes("LocalBusiness"));

  // 6. No pricing figures in rendered body text -------------------------------
  for (const route of ["/el", "/el/cars", "/el/cars/peugeot-2008", "/el/request"]) {
    const {body} = await get(route);
    const text = stripHtml(body);
    const hasEuro = text.includes("\u20ac");
    const hasEur = /\bEUR\b/.test(text);
    record(
      `no €/EUR in body text of ${route}`,
      !hasEuro && !hasEur,
      hasEuro ? "found €" : hasEur ? "found EUR" : "clean"
    );
  }

  // 7. Request page honesty ---------------------------------------------------
  const request = await get("/el/request");
  const greekAlert = "Η online αποστολή δεν είναι ακόμη ενεργή.";
  record("request HTML contains Greek not-configured alert", request.body.includes(greekAlert));
  record(
    "request submit button has aria-disabled=\"true\"",
    /<button[^>]*aria-disabled="true"[^>]*>/i.test(request.body)
  );
} catch (error) {
  record("gate script completed without a thrown error", false, error.message);
} finally {
  if (server) {
    try {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {stdio: "ignore"});
      } else {
        server.kill("SIGTERM");
      }
    } catch {
      // ignore
    }
  }

  // Give the OS a moment to release the listener.
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const free = await portIsFree(PORT);
  record(`port ${PORT} is free after shutdown`, free);

  const passed = results.filter((entry) => entry.ok).length;
  const summary = `${passed}/${results.length} checks passed`;
  console.log(`\n${summary}`);

  mkdirSync(LOG_DIR, {recursive: true});
  writeFileSync(
    LOG_FILE,
    [
      `final-gate ${new Date().toISOString()}`,
      ...results.map((entry) => `${entry.ok ? "PASS" : "FAIL"}  ${entry.name}${entry.detail ? `  (${entry.detail})` : ""}`),
      "",
      summary,
      "",
      "--- server log ---",
      serverLog.join("")
    ].join("\n"),
    "utf8"
  );

  console.log(`log: ${path.relative(ROOT, LOG_FILE)}`);

  failures = results.filter((entry) => !entry.ok).length;
  process.exitCode = failures === 0 ? 0 : 1;
}
