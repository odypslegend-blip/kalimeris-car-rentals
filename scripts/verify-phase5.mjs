/**
 * Phase 5 verification. Starts nothing: run it against a server that is
 * already listening.
 *
 *   npx next start -p 3320
 *   node scripts/verify-phase5.mjs http://127.0.0.1:3320
 */

const base = (process.argv[2] ?? "http://127.0.0.1:3320").replace(/\/$/, "");

const checks = [];

function record(name, ok, detail) {
  checks.push({name, ok, detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail === undefined ? "" : ` - ${detail}`}`);
}

async function get(path) {
  const response = await fetch(`${base}${path}`, {redirect: "manual"});
  const body = await response.text();
  return {status: response.status, body, headers: response.headers};
}

const infoRoutes = [
  "/how-it-works",
  "/faq",
  "/about",
  "/contact",
  "/privacy",
  "/rental-terms"
];

const pages = new Map();

for (const locale of ["el", "en"]) {
  for (const route of infoRoutes) {
    const path = `/${locale}${route}`;
    const page = await get(path);
    pages.set(path, page);
    record(`${path} returns 200`, page.status === 200, `status ${page.status}`);
  }
}

// 404 ------------------------------------------------------------------------
const missing = await get("/el/does-not-exist");
record(
  "/el/does-not-exist returns 404",
  missing.status === 404,
  `status ${missing.status}`
);
record(
  "Greek 404 copy is rendered",
  missing.body.includes("Η σελίδα δεν βρέθηκε."),
  missing.body.includes("Η σελίδα δεν βρέθηκε.") ? "found" : "missing"
);
record(
  "English 404 copy is rendered",
  (await get("/en/does-not-exist")).body.includes("Page not found.")
);

// Draft notice ---------------------------------------------------------------
const privacyEl = pages.get("/el/privacy").body;
record(
  "Privacy page carries the draft notice",
  privacyEl.includes(
    "Προσχέδιο — εκκρεμεί νομικός έλεγχος και επιβεβαίωση από τον ιδιοκτήτη."
  )
);
record(
  "Privacy notice uses role=note",
  privacyEl.includes('role="note"')
);
const termsEn = pages.get("/en/rental-terms").body;
record(
  "Rental terms carry the English draft notice",
  termsEn.includes("Draft — pending legal review and owner confirmation.")
);

// Indexing rules -------------------------------------------------------------
record(
  "Privacy is noindex",
  /<meta name="robots" content="noindex/.test(privacyEl),
  privacyEl.match(/<meta name="robots"[^>]*>/)?.[0]
);
record(
  "Rental terms are noindex",
  /<meta name="robots" content="noindex/.test(termsEn),
  termsEn.match(/<meta name="robots"[^>]*>/)?.[0]
);
record(
  "FAQ is indexable",
  !/noindex/.test(pages.get("/el/faq").body.match(/<meta name="robots"[^>]*>/)?.[0] ?? "")
);

// Metadata ------------------------------------------------------------------
for (const path of ["/el/faq", "/el/privacy", "/en/how-it-works"]) {
  const html = pages.get(path).body;
  record(
    `${path} has canonical + hreflang`,
    html.includes(`rel="canonical" href="http://localhost:3000${path}"`) &&
      /hrefLang="x-default"|hreflang="x-default"/i.test(html),
    html.match(/<link rel="canonical"[^>]*>/)?.[0]
  );
}

// Sitemap / robots -----------------------------------------------------------
const sitemap = await get("/sitemap.xml");
record("sitemap.xml returns 200", sitemap.status === 200);
record(
  "sitemap lists /el/cars/peugeot-2008",
  sitemap.body.includes(`${base}/el/cars/peugeot-2008`) ||
    sitemap.body.includes("http://localhost:3000/el/cars/peugeot-2008")
);
record("sitemap lists /el/faq", sitemap.body.includes("/el/faq"));
record("sitemap lists /en/rental-terms", sitemap.body.includes("/en/rental-terms"));
record("sitemap omits /request", !sitemap.body.includes("/request"));
record(
  "sitemap has hreflang alternates",
  /hrefLang="x-default"|hreflang="x-default"/i.test(sitemap.body)
);

const robots = await get("/robots.txt");
record("robots.txt returns 200", robots.status === 200);
record(
  "robots disallows /el/request",
  robots.body.includes("Disallow: /el/request"),
  robots.body.replace(/\n/g, " | ")
);
record(
  "robots disallows /en/request",
  robots.body.includes("Disallow: /en/request")
);
record("robots references the sitemap", robots.body.includes("/sitemap.xml"));

// No currency anywhere in the public HTML ------------------------------------
const currencyTargets = [
  "/el",
  "/en",
  "/el/cars",
  "/en/cars",
  ...infoRoutes.flatMap((route) => [`/el${route}`, `/en${route}`])
];
const currencyHits = [];
for (const path of currencyTargets) {
  const html = pages.get(path)?.body ?? (await get(path)).body;
  if (html.includes("€") || /\bEUR\b/.test(html)) currencyHits.push(path);
}
record(
  "no page contains € or EUR",
  currencyHits.length === 0,
  currencyHits.join(", ") || "clean"
);

// JSON-LD --------------------------------------------------------------------
const home = (await get("/el")).body;
record(
  "home has WebSite JSON-LD",
  home.includes('"@type":"WebSite"') && home.includes('"inLanguage":["el","en"]')
);
record(
  "home JSON-LD has no LocalBusiness/Organization/Product",
  !/LocalBusiness|"Organization"|"Product"|"Offer"/.test(home)
);
const faqHtml = pages.get("/el/faq").body;
record(
  "FAQ page has no LocalBusiness/Product JSON-LD",
  !/LocalBusiness|"Product"|"Offer"/.test(faqHtml)
);

// Accordion semantics --------------------------------------------------------
const triggerCount = (faqHtml.match(/aria-expanded="(true|false)"/g) ?? []).length;
record(
  "FAQ accordion triggers expose aria-expanded",
  triggerCount >= 10,
  `${triggerCount} triggers`
);
record(
  "FAQ accordion triggers are real buttons",
  (faqHtml.match(/data-slot="accordion-trigger"/g) ?? []).length === 10
);

// Header / footer links ------------------------------------------------------
for (const path of ["/el/how-it-works", "/en/contact"]) {
  const html = pages.get(path).body;
  const required = [
    `href="/el/cars"`,
    `href="/el/how-it-works"`,
    `href="/el/faq"`,
    `href="/el/contact"`,
    `href="/el/about"`,
    `href="/el/privacy"`,
    `href="/el/rental-terms"`
  ];
  const localeRequired = required.map((link) =>
    link.replace("/el/", path.startsWith("/en") ? "/en/" : "/el/")
  );
  const missingLinks = localeRequired.filter((link) => !html.includes(link));
  record(
    `${path} links every information route`,
    missingLinks.length === 0,
    missingLinks.join(", ") || "all present"
  );
  record(`${path} has no dead href="#"`, !html.includes('href="#"'));
}

// Request flow untouched -----------------------------------------------------
const request = await get("/el/request");
record("/el/request still returns 200", request.status === 200);
record(
  "/el/request stays noindex",
  /<meta name="robots" content="noindex/.test(request.body)
);
record(
  "request form is still present",
  request.body.includes('aria-label="Φόρμα αιτήματος"') ||
    request.body.includes("Φόρμα αιτήματος")
);

const failed = checks.filter((check) => !check.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
if (failed.length > 0) {
  console.log("FAILED:");
  for (const check of failed) console.log(`- ${check.name}: ${check.detail ?? ""}`);
  process.exitCode = 1;
}
