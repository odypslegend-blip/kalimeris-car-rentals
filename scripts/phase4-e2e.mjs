import {spawn, spawnSync} from "node:child_process";
import {existsSync} from "node:fs";
import {mkdir, readFile, stat, writeFile} from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import {chromium} from "@playwright/test";

/**
 * Phase 4 end-to-end orchestration.
 *
 * One self-contained script that owns every child process it needs:
 *
 *   1. webhook receiver           127.0.0.1:9199   (.data/webhook-received.jsonl)
 *   2. production app + webhook   127.0.0.1:3310
 *   3. production app, no sink    127.0.0.1:3311
 *
 * It never leaves a server running: every child is killed by PID tree and the
 * three ports are verified closed before the process exits.
 *
 *   node scripts/phase4-e2e.mjs
 *
 * Exit 0 only when every check passes.
 */

const ROOT = process.cwd();
const WEBHOOK_LOG = path.join(ROOT, ".data", "webhook-received.jsonl");
const SHOTS = path.join(ROOT, "screenshots", "phase4");
const RECEIVER_PORT = 9199;
const APP_PORT = 3310;
const OFF_PORT = 3311;
const BASE = `http://127.0.0.1:${APP_PORT}`;
const OFF_BASE = `http://127.0.0.1:${OFF_PORT}`;
const SUCCESS_TITLE = "Το αίτημα στάλθηκε.";
const NOT_CONFIGURED_TITLE = "Η online αποστολή δεν είναι ακόμη ενεργή.";
const UI_NAME = "Μαρία Παπαδοπούλου";
const UI_EMAIL = "maria@example.com";
const UI_PHONE = "+30 210 1234567";

const checks = [];
const children = [];

/* ------------------------------------------------------------------ helpers */

function record(name, ok, detail) {
  checks.push({name, ok: Boolean(ok), detail: detail ?? ""});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validPayload(overrides = {}) {
  return {
    locale: "el",
    vehicleId: "peugeot-2008",
    pickupLocation: "main",
    returnLocation: "main",
    from: isoInDays(7),
    to: isoInDays(10),
    name: "Δοκιμαστικός Χρήστης",
    email: "test@example.com",
    phone: "+30 210 0000000",
    message: "Δοκιμαστικό αίτημα από το phase4-e2e orchestration.",
    consent: true,
    website: "",
    startedAt: Date.now() - 5_000,
    ...overrides
  };
}

function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

/** Start a child and stream its output with a stable prefix (no deadlocks). */
function startChild(name, command, args, envOverrides = {}) {
  const child = spawn(command, args, {
    shell: true,
    cwd: ROOT,
    env: {...process.env, ...envOverrides},
    stdio: ["ignore", "pipe", "pipe"]
  });

  const entry = {name, child, pid: child.pid, lines: []};
  children.push(entry);

  const collect = (stream, tag) => {
    stream.setEncoding("utf8");
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        entry.lines.push(line);
        console.log(`[${tag}] ${line}`);
      }
    });
    stream.on("end", () => {
      if (buffer.trim().length > 0) {
        entry.lines.push(buffer);
        console.log(`[${tag}] ${buffer}`);
      }
    });
  };

  collect(child.stdout, `${name}:out`);
  collect(child.stderr, `${name}:err`);

  child.on("exit", (code, signal) => {
    console.log(`[${name}] exited code=${code} signal=${signal}`);
  });
  child.on("error", (error) => {
    console.log(`[${name}] spawn error: ${error.message}`);
  });

  return entry;
}

function canConnect(port, timeoutMs = 700) {
  return new Promise((resolve) => {
    const socket = net.createConnection({host: "127.0.0.1", port});
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function waitForHealth(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last = "no response";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${base}/api/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3_000)
      });
      if (response.status === 200) {
        const body = await response.json().catch(() => null);
        return {ok: true, detail: `200 ${JSON.stringify(body)}`};
      }
      last = `status ${response.status}`;
    } catch (error) {
      last = error?.message ?? String(error);
    }
    await sleep(500);
  }

  return {ok: false, detail: `timed out after ${timeoutMs}ms (last: ${last})`};
}

async function probeReceiver(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last = "no response";

  while (Date.now() < deadline) {
    try {
      // Any HTTP status proves the listener accepted the connection.
      const response = await fetch(`http://127.0.0.1:${RECEIVER_PORT}/`, {
        signal: AbortSignal.timeout(2_000)
      });
      return {ok: true, detail: `HTTP ${response.status} from receiver`};
    } catch (error) {
      last = error?.message ?? String(error);
    }
    await sleep(250);
  }

  return {ok: false, detail: `timed out after ${timeoutMs}ms (last: ${last})`};
}

async function readWebhookEntries() {
  if (!existsSync(WEBHOOK_LOG)) return [];

  const text = await readFile(WEBHOOK_LOG, "utf8");
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function fileNonEmpty(filePath) {
  try {
    const info = await stat(filePath);
    return info.size > 0;
  } catch {
    return false;
  }
}

async function killChildren() {
  for (const entry of children) {
    if (!entry.pid) continue;

    const result = spawnSync(
      "taskkill",
      ["/PID", String(entry.pid), "/T", "/F"],
      {encoding: "utf8", windowsHide: true}
    );

    console.log(
      `[cleanup] taskkill ${entry.pid} (${entry.name}) status=${result.status} ` +
        `out=${(result.stdout ?? "").trim()}`
    );
  }

  await sleep(1_500);
}

async function waitForPortsClosed(ports, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let open = ports;

  while (Date.now() < deadline) {
    open = [];
    for (const port of ports) {
      if (await canConnect(port, 400)) open.push(port);
    }
    if (open.length === 0) return {ok: true, open: []};
    await sleep(400);
  }

  return {ok: false, open};
}

/* --------------------------------------------------------------- UI flow */

async function runSuccessFlow(browser, viewport, screenshotPath) {
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`);
  });

  const from = isoInDays(7);
  const to = isoInDays(10);
  const url =
    `${BASE}/el/request?vehicle=peugeot-2008&pickup=main&return=main` +
    `&from=${from}&to=${to}`;

  await page.goto(url, {waitUntil: "domcontentloaded", timeout: 60_000});
  // The API rejects submissions under 2.5s; give the form real elapsed time.
  await page.waitForTimeout(3_200);

  await page.getByLabel("Ονοματεπώνυμο", {exact: true}).fill(UI_NAME);
  await page.getByLabel("Email", {exact: true}).fill(UI_EMAIL);
  await page.getByLabel("Τηλέφωνο", {exact: true}).fill(UI_PHONE);
  await page.getByRole("checkbox", {name: /Συμφωνώ/}).check();
  // The shipped el copy is "Στείλτε αίτημα"; accept the spec spelling too.
  await page
    .getByRole("button", {name: /(Στείλετε|Στείλτε) αίτημα/})
    .click();

  const panel = page.locator("[data-request-success]");
  await panel.waitFor({state: "visible", timeout: 30_000});
  const text = (await panel.innerText()).replace(/\s+/g, " ").trim();

  await page.screenshot({path: screenshotPath, fullPage: true});
  await context.close();

  return {text, consoleErrors};
}

/* ------------------------------------------------------------------- main */

async function main() {
  await mkdir(path.dirname(WEBHOOK_LOG), {recursive: true});
  await mkdir(SHOTS, {recursive: true});

  /* 1. clear webhook log */
  await writeFile(WEBHOOK_LOG, "", "utf8");
  const clearedText = await readFile(WEBHOOK_LOG, "utf8");
  record("webhook log cleared before run", clearedText.length === 0, WEBHOOK_LOG);

  /* pre-flight: refuse to fight an unknown listener */
  const preOpen = [];
  for (const port of [RECEIVER_PORT, APP_PORT, OFF_PORT]) {
    if (await canConnect(port)) preOpen.push(port);
  }
  record(
    "target ports 9199/3310/3311 free before start",
    preOpen.length === 0,
    preOpen.length > 0 ? `already listening: ${preOpen.join(", ")}` : "all free"
  );
  if (preOpen.length > 0) {
    throw new Error(`Ports already in use: ${preOpen.join(", ")}`);
  }

  /* 2. webhook receiver */
  startChild("receiver", "node", [
    "scripts/webhook-receiver.mjs",
    String(RECEIVER_PORT)
  ]);
  const receiverProbe = await probeReceiver(15_000);
  record(
    "webhook receiver accepts connections on 127.0.0.1:9199",
    receiverProbe.ok,
    receiverProbe.detail
  );

  /* 3. production app wired to the webhook */
  startChild("app", "npx", ["next", "start", "-p", String(APP_PORT)], {
    INQUIRY_WEBHOOK_URL: `http://127.0.0.1:${RECEIVER_PORT}/inquiry`,
    INQUIRY_WEBHOOK_SECRET: "phase4-test",
    RESEND_API_KEY: "",
    INQUIRY_FROM_EMAIL: "",
    INQUIRY_TO_EMAIL: "",
    INQUIRY_DEV_SINK: ""
  });
  const appHealth = await waitForHealth(BASE, 90_000);
  record(`next start :${APP_PORT} /api/health returns 200`, appHealth.ok, appHealth.detail);

  /* 4. endpoint verifier */
  console.log("\n===== scripts/verify-phase4.mjs stdout/stderr =====");
  const verifier = spawnSync(
    "node",
    ["scripts/verify-phase4.mjs", BASE],
    {
      shell: true,
      encoding: "utf8",
      cwd: ROOT,
      env: {...process.env, PHASE4_EXPECT_SINK: "0"},
      timeout: 240_000
    }
  );
  if (verifier.stdout) process.stdout.write(verifier.stdout);
  if (verifier.stderr) process.stderr.write(verifier.stderr);
  console.log(`===== verifier exit status: ${verifier.status} =====\n`);

  record(
    "scripts/verify-phase4.mjs exits 0",
    verifier.status === 0,
    `status ${verifier.status}` +
      (verifier.error ? `, error ${verifier.error.message}` : "")
  );

  /* 5. API happy-path payload landed in the webhook log */
  const apiEntries = await readWebhookEntries();
  const apiMatch = apiEntries.find(
    (entry) =>
      typeof entry.reference === "string" &&
      entry.reference.startsWith("KR-") &&
      entry.name === "Δοκιμαστικός Χρήστης" &&
      entry.vehicleId === "peugeot-2008" &&
      entry.email === "test@example.com"
  );
  console.log(
    `webhook log entries after verifier: ${apiEntries.length}` +
      (apiEntries[0]?.reference ? ` (first reference: ${apiEntries[0].reference})` : "")
  );
  record(
    "webhook log contains API happy-path payload (KR- ref, name, vehicleId, email)",
    Boolean(apiMatch),
    apiMatch
      ? `${apiEntries.length} entries; matched ${apiMatch.reference}`
      : `${apiEntries.length} entries; no matching payload`
  );

  /* 6. UI success proof at 1440 and 390 */
  const browser = await chromium.launch({channel: "chrome", headless: true});

  try {
    const shot1440 = path.join(SHOTS, "request-success-1440.png");
    const ui1440 = await runSuccessFlow(
      browser,
      {width: 1440, height: 900},
      shot1440
    );
    record(
      "UI 1440 success panel shows confirmation + KR- reference",
      ui1440.text.includes(SUCCESS_TITLE) && /KR-\d{8}-[A-Z0-9]{4}/.test(ui1440.text),
      truncate(ui1440.text, 220)
    );
    record(
      "UI 1440 no console errors",
      ui1440.consoleErrors.length === 0,
      ui1440.consoleErrors.length > 0
        ? ui1440.consoleErrors.join(" | ")
        : "0 console errors"
    );
    record(
      "screenshot request-success-1440.png saved",
      await fileNonEmpty(shot1440),
      shot1440
    );

    const shot390 = path.join(SHOTS, "request-success-390.png");
    // Fresh mobile context: reload + refill the whole flow at 390px.
    const ui390 = await runSuccessFlow(
      browser,
      {width: 390, height: 844},
      shot390
    );
    record(
      "UI 390 success panel shows confirmation + KR- reference",
      ui390.text.includes(SUCCESS_TITLE) && /KR-\d{8}-[A-Z0-9]{4}/.test(ui390.text),
      truncate(ui390.text, 220)
    );
    record(
      "UI 390 no console errors",
      ui390.consoleErrors.length === 0,
      ui390.consoleErrors.length > 0
        ? ui390.consoleErrors.join(" | ")
        : "0 console errors"
    );
    record(
      "screenshot request-success-390.png saved",
      await fileNonEmpty(shot390),
      shot390
    );

    /* 7. the browser submission reached the webhook */
    await sleep(500);
    const uiEntries = await readWebhookEntries();
    const uiMatch = uiEntries.find(
      (entry) =>
        entry.name === UI_NAME &&
        typeof entry.reference === "string" &&
        entry.reference.startsWith("KR-")
    );
    record(
      "UI submission delivered to webhook log (Μαρία + KR- reference)",
      Boolean(uiMatch),
      uiMatch
        ? `${uiEntries.length} entries; matched ${uiMatch.reference}`
        : `${uiEntries.length} entries; no UI payload`
    );

    /* 8. honest not-configured app on 3311 */
    startChild("app-off", "npx", ["next", "start", "-p", String(OFF_PORT)], {
      INQUIRY_WEBHOOK_URL: "",
      INQUIRY_WEBHOOK_SECRET: "",
      RESEND_API_KEY: "",
      INQUIRY_FROM_EMAIL: "",
      INQUIRY_TO_EMAIL: "",
      INQUIRY_DEV_SINK: ""
    });
    const offHealth = await waitForHealth(OFF_BASE, 90_000);
    record(
      `next start :${OFF_PORT} /api/health returns 200 (no delivery configured)`,
      offHealth.ok,
      offHealth.detail
    );

    const offPageResponse = await fetch(`${OFF_BASE}/el/request`, {
      headers: {Accept: "text/html"},
      cache: "no-store",
      signal: AbortSignal.timeout(20_000)
    });
    const offHtml = await offPageResponse.text();
    const submitTag =
      (offHtml.match(/<button[^>]*type="submit"[^>]*>/i) ?? [])[0] ?? "";

    record(
      "not-configured page GET /el/request returns 200",
      offPageResponse.status === 200,
      `status ${offPageResponse.status}`
    );
    record(
      "not-configured page shows honest copy",
      offHtml.includes(NOT_CONFIGURED_TITLE),
      NOT_CONFIGURED_TITLE
    );
    record(
      "not-configured submit button rendered disabled",
      /(\s)disabled(=|\s|>)/i.test(submitTag),
      submitTag ? truncate(submitTag, 220) : "submit <button> tag not found"
    );

    const entriesBeforeOff = (await readWebhookEntries()).length;
    const offPayload = validPayload({
      email: "test@example.com",
      startedAt: Date.now() - 5_000
    });
    const offPost = await fetch(`${OFF_BASE}/api/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.77"
      },
      body: JSON.stringify(offPayload),
      signal: AbortSignal.timeout(20_000)
    });
    let offJson = null;
    try {
      offJson = await offPost.json();
    } catch {
      offJson = null;
    }
    record(
      "not-configured POST /api/inquiries returns 503 not_configured",
      offPost.status === 503 && offJson?.status === "not_configured",
      `status ${offPost.status}, body ${JSON.stringify(offJson)}`
    );

    const entriesAfterOff = (await readWebhookEntries()).length;
    record(
      "webhook log did not grow on not-configured POST",
      entriesAfterOff === entriesBeforeOff,
      `${entriesBeforeOff} → ${entriesAfterOff}`
    );

    const shotOff = path.join(SHOTS, "request-not-configured-1440.png");
    const offContext = await browser.newContext({
      viewport: {width: 1440, height: 900}
    });
    const offScreenshotPage = await offContext.newPage();
    await offScreenshotPage.goto(`${OFF_BASE}/el/request`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000
    });
    await offScreenshotPage.waitForTimeout(800);
    await offScreenshotPage.screenshot({path: shotOff, fullPage: true});
    await offContext.close();

    record(
      "screenshot request-not-configured-1440.png saved",
      await fileNonEmpty(shotOff),
      shotOff
    );
  } finally {
    await browser.close().catch(() => {});
  }
}

/* --------------------------------------------------------------- execution */

let fatal = null;

try {
  await main();
} catch (error) {
  fatal = error;
}

if (fatal) {
  record(
    "script completed without throwing",
    false,
    fatal?.stack ?? String(fatal)
  );
}

await killChildren();

const closed = await waitForPortsClosed([RECEIVER_PORT, APP_PORT, OFF_PORT], 20_000);
record(
  "ports 9199/3310/3311 no longer listening",
  closed.ok,
  closed.ok ? "all closed" : `still open: ${closed.open.join(", ")}`
);

const passed = checks.filter((check) => check.ok).length;
const failed = checks.length - passed;
const failedChecks = checks.filter((check) => !check.ok);

console.log("\n===== child process exit logs (tail) =====");
for (const entry of children) {
  const tail = entry.lines.slice(-8);
  console.log(`[${entry.name}] pid=${entry.pid} lines=${entry.lines.length}`);
  for (const line of tail) console.log(`  ${line}`);
}

console.log("\n===== phase 4 e2e summary =====");
console.log(JSON.stringify({checks, passed, failed}, null, 2));

if (failed > 0) {
  console.log("\nFailed checks:");
  for (const check of failedChecks) {
    console.log(`- ${check.name}: ${check.detail}`);
  }
}

process.exitCode = failed === 0 ? 0 : 1;
await sleep(200);
process.exit(failed === 0 ? 0 : 1);
