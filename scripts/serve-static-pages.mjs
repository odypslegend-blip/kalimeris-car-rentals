#!/usr/bin/env node
/**
 * Minimal static server that mimics GitHub Pages for the exported site.
 *
 * It serves `out/` under the `/kalimeris-car-rentals/` prefix, resolves
 * directory requests to `index.html` (the export runs with `trailingSlash`),
 * answers unknown paths with `out/404.html` and status 404, and sets
 * `text/plain` for the `.txt` Flight payloads the App Router fetches during
 * client-side navigation. Verification only: not a production server.
 *
 *   node scripts/serve-static-pages.mjs [port]
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, "out");
const prefix = "/kalimeris-car-rentals/";
const port = Number(process.argv[2] ?? 3390);

const MIME = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

if (!fs.existsSync(outDir)) {
  console.error(`[serve-static] ${path.relative(repoRoot, outDir)}/ does not exist. Run "npm run build:pages" first.`);
  process.exit(1);
}

function notFound(res) {
  const file = path.join(outDir, "404.html");

  if (!fs.existsSync(file)) {
    res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
    res.end("404");
    return;
  }

  res.writeHead(404, {"Content-Type": MIME[".html"]});
  res.end(fs.readFileSync(file));
}

function sendFile(res, file, status = 200) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, {
    "Content-Type": MIME[ext] ?? "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(fs.readFileSync(file));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  // The prefix is the deployment base; a bare `/` is not part of the site.
  if (pathname === "/" || pathname === prefix.slice(0, -1)) {
    res.writeHead(302, {Location: prefix});
    res.end();
    return;
  }

  if (!pathname.startsWith(prefix)) {
    notFound(res);
    return;
  }

  const rel = pathname.slice(prefix.length);
  const target = path.resolve(outDir, rel);

  // Refuse anything that escapes out/.
  if (target !== outDir && !target.startsWith(outDir + path.sep)) {
    notFound(res);
    return;
  }

  let file = target;

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  } else if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) {
    file = `${file}.html`;
  } else if (!fs.existsSync(file) && fs.existsSync(path.join(file, "index.html"))) {
    file = path.join(file, "index.html");
  }

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    notFound(res);
    return;
  }

  sendFile(res, file);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[serve-static] serving out/ at http://127.0.0.1:${port}${prefix}`);
});
