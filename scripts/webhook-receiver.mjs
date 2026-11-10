import {appendFile, mkdir, readFile} from "node:fs/promises";
import http from "node:http";
import path from "node:path";

/**
 * Minimal inquiry webhook receiver used as the real delivery destination
 * during Phase 4 production-mode verification.
 *
 *   node scripts/webhook-receiver.mjs           # 127.0.0.1:9099 /inquiry
 *   node scripts/webhook-receiver.mjs 9099
 *
 * Contract (what Phase 4 verification asserts):
 *   - Accepts `POST /inquiry`.
 *   - Appends the *raw* JSON body as one line to `.data/webhook-received.jsonl`.
 *   - Responds 200 `{ok:true}`.
 *   - Logs the running received-count to stdout.
 *
 * The application's webhook transport also sends an `x-kalimeris-inquiry`
 * marker header; we record it alongside nothing — the raw body is the contract,
 * so a later check can parse each line as plain JSON.
 */

const port = Number.parseInt(process.argv[2] ?? "9099", 10);
const endpointPath = "/inquiry";
const outPath = path.resolve(".data/webhook-received.jsonl");

let receivedCount = 0;

async function countExistingLines() {
  try {
    const text = await readFile(outPath, "utf8");
    return text.split("\n").filter((line) => line.trim().length > 0).length;
  } catch {
    return 0;
  }
}

// Seed the counter from any lines a previous run left behind so the logged
// count is the true number of stored payloads, not just this process's.
receivedCount = await countExistingLines();

const server = http.createServer((request, response) => {
  const requestPath = (request.url ?? "").split("?")[0];

  if (request.method !== "POST" || requestPath !== endpointPath) {
    response.writeHead(404, {"content-type": "application/json"});
    response.end(JSON.stringify({ok: false, error: "not_found"}));
    return;
  }

  const chunks = [];
  let size = 0;
  let tooLarge = false;

  request.on("data", (chunk) => {
    if (tooLarge) return;

    size += chunk.length;
    if (size > 256 * 1024) {
      tooLarge = true;
      return;
    }

    chunks.push(chunk);
  });

  request.on("end", async () => {
    if (tooLarge) {
      response.writeHead(413, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: false, error: "too_large"}));
      return;
    }

    const body = Buffer.concat(chunks).toString("utf8");
    const marker = request.headers["x-kalimeris-inquiry"];

    // Validate the body is JSON so an accidental non-JSON POST cannot corrupt
    // the log the verifier later parses line-by-line.
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      response.writeHead(400, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: false, error: "invalid_json"}));
      return;
    }

    try {
      await mkdir(path.dirname(outPath), {recursive: true});
      // One raw JSON line per delivery — exactly what the verifier parses.
      await appendFile(outPath, `${JSON.stringify(parsed)}\n`, "utf8");
      receivedCount += 1;

      console.log(
        `webhook received #${receivedCount} marker=${marker ?? "none"} ` +
          `reference=${parsed?.reference ?? "none"}`
      );

      response.writeHead(200, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: true}));
    } catch (error) {
      console.error("webhook write failed", error?.message ?? error);
      response.writeHead(500, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: false}));
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(
    `inquiry webhook receiver listening on http://127.0.0.1:${port}${endpointPath} ` +
      `(existing lines: ${receivedCount})`
  );
});
