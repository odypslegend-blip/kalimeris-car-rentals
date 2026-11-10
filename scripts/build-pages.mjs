#!/usr/bin/env node
/**
 * GitHub Pages static export (`npm run build:pages`).
 *
 * A static export cannot contain middleware, `/api/*` route handlers or a
 * catch-all page that has no `generateStaticParams`. The normal server build
 * still needs all three, so they are moved out of the tree for the duration of
 * the export and moved back in a `finally` block — including when the build
 * fails.
 *
 * Usage (PowerShell):
 *   $env:STATIC_EXPORT="1"
 *   $env:NEXT_PUBLIC_BASE_PATH="/kalimeris-car-rentals"
 *   $env:NEXT_PUBLIC_SITE_URL="https://owner.github.io/kalimeris-car-rentals"
 *   npm run build:pages
 */
import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const holdDir = path.join(repoRoot, ".static-export-hold");
const outDir = path.join(repoRoot, "out");
const custom404 = path.join(repoRoot, "public", "404.html");

/** Server-only sources that `output: "export"` rejects. */
const MOVES = [
  {label: "/api route handlers", from: "src/app/api", held: "api"},
  {
    label: "next-intl proxy (middleware)",
    from: "src/proxy.ts",
    held: "proxy.ts"
  },
  {
    label: "[locale] catch-all page",
    from: "src/app/[locale]/[...rest]",
    held: "[...rest]"
  }
];

/** Files the export must produce for the site to be usable. */
const REQUIRED_FILES = [
  "index.html",
  "el/index.html",
  "en/index.html",
  "el/cars/index.html",
  "el/request/index.html",
  "images/reference/hero-greece-delphi-road.jpg",
  ".nojekyll",
  "404.html"
];

/** Windows can refuse a directory rename while a watcher holds a handle. */
const RETRYABLE = new Set(["EPERM", "EACCES", "EBUSY", "ENOTEMPTY", "EXDEV"]);

const log = (message) => console.log(`[build:pages] ${message}`);
const warn = (message) => console.warn(`[build:pages] WARNING: ${message}`);

/**
 * `fs.renameSync`, with a copy-then-delete fallback: on Windows an open
 * directory handle (editor language server, indexer, antivirus) makes the
 * rename fail with EPERM while the copy still succeeds.
 */
function relocate(from, to) {
  try {
    fs.renameSync(from, to);
    return;
  } catch (error) {
    if (!RETRYABLE.has(error.code)) throw error;
    log(
      `rename refused (${error.code}) — falling back to copy + delete for ${path.relative(repoRoot, from)}`
    );
  }

  fs.cpSync(from, to, {recursive: true, force: false, errorOnExist: true});

  try {
    fs.rmSync(from, {recursive: true, force: true, maxRetries: 20, retryDelay: 250});
  } catch (removeError) {
    // Leave the tree exactly as it was, then surface the real problem.
    fs.rmSync(to, {recursive: true, force: true});
    throw new Error(
      `could not remove ${path.relative(repoRoot, from)} after copying it: ${removeError.message}`
    );
  }
}

/** Holds the server-only sources, recording each move so it can be undone. */
function moveOut(moved) {
  if (fs.existsSync(holdDir)) {
    throw new Error(
      `A previous hold directory exists at ${path.relative(repoRoot, holdDir)}. ` +
        "Inspect it, restore anything it contains, delete it, and re-run."
    );
  }

  for (const item of MOVES) {
    const source = path.join(repoRoot, item.from);

    if (!fs.existsSync(source)) {
      throw new Error(
        `Expected ${item.from} (${item.label}) to exist before the export. ` +
          "The repository layout changed; update scripts/build-pages.mjs."
      );
    }
  }

  fs.mkdirSync(holdDir, {recursive: true});

  for (const item of MOVES) {
    const source = path.join(repoRoot, item.from);
    const target = path.join(holdDir, item.held);

    relocate(source, target);
    moved.push({...item, source, target});
    log(`held ${item.from} -> ${path.relative(repoRoot, target)}`);
  }
}

function moveBack(moved) {
  const problems = [];

  for (const item of [...moved].reverse()) {
    try {
      if (!fs.existsSync(item.target)) {
        problems.push(`held copy of ${item.from} is missing at ${item.target}`);
        continue;
      }

      if (fs.existsSync(item.source)) {
        problems.push(
          `${item.from} reappeared during the build; refusing to overwrite it ` +
            `(its held copy is still at ${path.relative(repoRoot, item.target)})`
        );
        continue;
      }

      fs.mkdirSync(path.dirname(item.source), {recursive: true});
      relocate(item.target, item.source);
      log(`restored ${item.from}`);
    } catch (error) {
      problems.push(`${item.from}: ${error.message}`);
    }
  }

  if (problems.length === 0) {
    try {
      // Only succeeds when every held path was moved back.
      fs.rmdirSync(holdDir);
    } catch {
      problems.push(
        `.static-export-hold is not empty after restore: ${fs
          .readdirSync(holdDir)
          .join(", ")}`
      );
    }
  }

  return problems;
}

function walk(dir, base = "") {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  let files = 0;

  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files += walk(path.join(dir, entry.name), rel);
    } else {
      files += 1;
    }
  }

  return files;
}

function printTree() {
  const entries = fs.readdirSync(outDir, {withFileTypes: true});
  const rows = entries
    .map((entry) => {
      if (entry.isDirectory()) {
        const count = walk(path.join(outDir, entry.name), entry.name);
        return `${entry.name}/  (${count} files)`;
      }

      const size = fs.statSync(path.join(outDir, entry.name)).size;
      return `${entry.name}  (${size} B)`;
    })
    .sort((a, b) => a.localeCompare(b));

  log(`out/ tree (${walk(outDir)} files total):`);
  for (const row of rows) console.log(`  ${row}`);
}

/**
 * The export writes its own `out/404.html` from the not-found tree; GitHub
 * Pages must serve the branded `public/404.html` instead. Compare, restore if
 * they differ, and say so — never quietly replace the custom page.
 */
function ensureCustom404() {
  if (!fs.existsSync(custom404)) {
    throw new Error("public/404.html is missing; the export has no 404 page.");
  }

  const custom = fs.readFileSync(custom404, "utf8");
  const exported = path.join(outDir, "404.html");

  if (!fs.existsSync(exported)) {
    fs.copyFileSync(custom404, exported);
    log("no out/404.html from the export — copied public/404.html.");
    return;
  }

  if (fs.readFileSync(exported, "utf8") !== custom) {
    fs.copyFileSync(custom404, exported);
    log(
      "next build emitted its own out/404.html; restored the custom " +
        "public/404.html over it (checked byte-for-byte)."
    );
    return;
  }

  log("out/404.html matches public/404.html.");
}

function runChecks(siteUrl) {
  const failures = [];

  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(outDir, file))) {
      failures.push(`missing ${file}`);
    }
  }

  if (fs.existsSync(path.join(outDir, "api"))) {
    failures.push("out/api exists — route handlers leaked into the export");
  }

  const sitemap = path.join(outDir, "sitemap.xml");
  const robots = path.join(outDir, "robots.txt");

  if (!fs.existsSync(sitemap)) failures.push("missing sitemap.xml");
  if (!fs.existsSync(robots)) failures.push("missing robots.txt");

  if (siteUrl) {
    if (
      fs.existsSync(sitemap) &&
      !fs.readFileSync(sitemap, "utf8").includes(siteUrl)
    ) {
      failures.push(`sitemap.xml does not use NEXT_PUBLIC_SITE_URL (${siteUrl})`);
    }

    if (
      fs.existsSync(robots) &&
      !fs.readFileSync(robots, "utf8").includes(`${siteUrl}/sitemap.xml`)
    ) {
      failures.push(`robots.txt does not point at ${siteUrl}/sitemap.xml`);
    }
  }

  if (fs.existsSync(custom404) && fs.existsSync(path.join(outDir, "404.html"))) {
    if (
      fs.readFileSync(path.join(outDir, "404.html"), "utf8") !==
      fs.readFileSync(custom404, "utf8")
    ) {
      failures.push("out/404.html does not match public/404.html");
    }
  }

  return failures;
}

function main() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  log(`exporting to out/ (basePath: ${basePath || "<none>"})`);

  if (!basePath) {
    warn(
      "NEXT_PUBLIC_BASE_PATH is empty — the export will assume it is served " +
        "from the domain root and local /images/... URLs will not be prefixed."
    );
  }

  if (!siteUrl) {
    warn(
      "NEXT_PUBLIC_SITE_URL is empty — canonical/sitemap URLs will fall back " +
        "to http://localhost:3000."
    );
  }

  fs.rmSync(outDir, {recursive: true, force: true});

  // `next dev` leaves a type validator under `.next/dev/types` that imports
  // every route it saw — including `/api/*`, which is held out of the tree for
  // this build. Both caches are generated, so clearing them is safe.
  for (const stale of [".next/dev", ".next/types"]) {
    const target = path.join(repoRoot, stale);
    if (fs.existsSync(target)) {
      fs.rmSync(target, {recursive: true, force: true});
      log(`cleared stale type cache ${stale}`);
    }
  }

  const moved = [];
  let exitCode = 1;

  try {
    moveOut(moved);

    log("running npx next build with STATIC_EXPORT=1 ...");

    const result = spawnSync("npx", ["next", "build"], {
      cwd: repoRoot,
      env: {...process.env, STATIC_EXPORT: "1"},
      stdio: "inherit",
      shell: true
    });

    if (result.error) throw result.error;

    if (result.status !== 0) {
      throw new Error(`next build exited with code ${result.status}`);
    }

    fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
    log("wrote out/.nojekyll");

    ensureCustom404();

    const failures = runChecks(siteUrl);

    if (failures.length > 0) {
      throw new Error(`export checks failed:\n  - ${failures.join("\n  - ")}`);
    }

    printTree();
    log(`pages URL: ${siteUrl || "<NEXT_PUBLIC_SITE_URL not set>"}/`);
    log("static export OK");
    exitCode = 0;
  } catch (error) {
    console.error(`\n[build:pages] FAILED: ${error.message}`);
    exitCode = 1;
  } finally {
    const problems = moveBack(moved);

    if (problems.length > 0) {
      console.error(
        "\n[build:pages] RESTORE FAILED — the working tree is incomplete:\n  - " +
          problems.join("\n  - ") +
          "\n  The held copies live in .static-export-hold/. Move them back by hand " +
          "before running any other build."
      );
      exitCode = 1;
    } else {
      log("server sources restored");
    }
  }

  process.exit(exitCode);
}

main();
