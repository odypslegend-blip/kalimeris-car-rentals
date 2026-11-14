# Implementation status — Kalimeris Car Rentals

Last updated: 2026-11-14 · Status: Light-Mode Editorial Redesign & unified Syne (400–700) typography implemented (`17/17` Playwright E2E passing); **published on Vercel (`https://kalimeris-car-rentals.vercel.app`) and as a static preview on GitHub Pages**; launch still blocked on client facts/approvals.

---

## 1. Phase status

| Area | State |
| --- | --- |
| Next.js App Router + TypeScript + Tailwind v4 scaffold | Done |
| Dual-theme design tokens from `design/tokens.json` (`#F5F2EA` editorial light mode + preserved `.dark` monochrome) wired into `@theme inline` | Done |
| Unified typography: `Syne` (400/500/600/700, Greek + Latin subsets) across `--font-display`, `--font-sans`, and `--font-mono` | Done |
| next-intl routing (`el` default, `en`), `src/proxy.ts`, dictionaries | Done |
| Header (`1980` badge, orange active indicator), language switcher, `.road-divider` footer, editorial hero | Done |
| Automotive accents (`HeritageBadge`, `RouteIndicator`, `TechnicalDivider`, `ChassisIllustration`) | Done |
| Homepage layouts: `1+2` Flagship Fleet Bento, Style 2 interactive `AnimatedSteps`, Asymmetric Split Services Ledger, Heritage Spread | Done |
| `/api/health`, `robots.txt`, `sitemap.xml` | Done |
| Licensed demo photographs + credits | Done |
| Fleet list + filters + vehicle detail page | Done (phase 3) + light-mode editorial refresh |
| Inquiry request page `/request` + shared Zod schema | Done (phase 4) |
| Inquiry delivery (Resend / webhook / dev file sink) | Done (phase 4) — **needs a real destination in production** |
| Rate limit, origin check, honeypot, timing gate | Done (phase 4) |
| Information pages: how it works, services, FAQ, about, contact | Done (phase 5) + light-mode editorial refresh |
| Draft legal placeholders: privacy policy, rental terms | Done (phase 5) — **`noindex`, pending legal review** |
| Localized 404 + locale error boundary | Done (phase 5) |
| SEO: canonical/hreflang helper, full sitemap, robots, WebSite JSON-LD | Done (phase 5) |
| E2E tests / responsive screenshot suite | Playwright suite in `tests/e2e` (`npm run test:e2e` — **17/17 passing** across `smoke.spec.ts` & `inquiry.spec.ts`); screenshot scripts remain in `scripts/` |

Nothing in this phase is a production booking flow, and no page claims otherwise.

---

## 2. Assumptions (carry forward — do not publish without client sign-off)

1. **Identity is unverified.** A business found publicly at `https://kalimeriscars.gr/` and
   `https://kalimeris.car.gr/classifieds/` is treated as an **unconfirmed identity match**. No
   contact detail, address, opening hours, logo or photograph from those sources is used here.
2. **Kozani link is research-only.** If the operating area is Kozani, that is not yet confirmed;
   all copy stays region-neutral and no location claim is published.
3. **No prices.** No daily rate, offer, deposit, insurance term, mileage rule, minimum age or
   availability is shown anywhere. The candidate listings in `references/FLEET_CANDIDATES.json`
   are research-only.
4. **Sample fleet.** `public/images/reference/demo-*.jpg` are generic licensed stock photos for
   layout work. They are **not** client inventory and must carry a visible `DEMO` badge whenever
   they are mapped to a vehicle card.
5. **Brand mark is a proposal.** `assets/brand/kalimeris-logo-proposal.svg` is an original
   proposal pending approval; the header/footer mark and `src/app/icon.svg` derive from it.
6. **A request is not a booking.** When the inquiry form ships it must report failure honestly
   when no delivery mechanism is configured.

---

## 3. Decisions taken in this phase

- **One primitive system: Radix.** Radix packages are installed and `src/components/ui/button.tsx`
  follows shadcn/ui conventions (`cva` + `@radix-ui/react-slot`). No Base UI. `components.json`
  was deliberately not generated: the CLI's current style presets were not verified against
  shadcn 4.23, so primitives are hand-written rather than guessed. Running `shadcn init --base radix`
  later will coexist with this file.
- **Tailwind v4 CSS-first.** No `tailwind.config.*`. Tokens live in `src/app/globals.css` as
  `--token-*` raw values mapped through `@theme inline`. The `--token-` prefix exists because
  `@theme inline { --x: var(--x) }` is a circular reference.
- **`@tailwindcss/postcss`** is the Tailwind pipeline (not the template's `@tailwindcss/turbopack`),
  because it is the documented v4 integration and works under both Turbopack and webpack builds.
  The scaffold's unused `@tailwindcss/turbopack` dependency was removed.
- **`src/proxy.ts`, not `middleware.ts`.** Verified: Next.js 16 renamed the file convention.
  The build output confirms `ƒ Proxy (Middleware)`.
- **`next/root-params` in `src/i18n/request.ts`.** Verified against the installed package: next-intl
  4.14.9 marks the `requestLocale` parameter `@deprecated` in favour of `next/root-params`, so the
  non-deprecated API is used.
- **`localePrefix: "always"` + `localeDetection: false`.** `/` always resolves to `/el`; Greek is the
  business default and English stays one click away. No `Accept-Language` surprise redirects.
- **Single root layout.** `src/app/[locale]/layout.tsx` owns `<html lang>`/`<body>`; there is no
  `src/app/layout.tsx`, which is the supported next-intl App Router shape (a passthrough root
  layout without `<html>` would fail Next's root-layout requirement).
- **Typed routes / `cacheComponents` removed** from the scaffolded config: `next.config.ts` is kept
  minimal (images only) so later phases are not constrained by cache-component rules.
- **Home page is honest about phase 1.** It shows the hero and a three-item "what's ready" strip
  rather than a fake booking widget, fake prices or links to routes that do not exist yet.

---

## 4. Installed versions (exact, `--save-exact`)

Runtime:

| Package | Version |
| --- | --- |
| `next` | 16.4.6 |
| `react` / `react-dom` | 19.3.1 |
| `next-intl` | 4.14.9 |
| `@daypicker/react` | 10.0.2 (**verified**: v10 is published as `@daypicker/react`; `react-day-picker` remains as a compatibility alias and is **not** installed) |
| `lucide-react` | 1.70.0 |
| `react-hook-form` | 7.91.0 |
| `@hookform/resolvers` | 7.0.5 |
| `zod` | 4.6.7 |
| `class-variance-authority` | 0.7.1 |
| `clsx` | 2.1.1 |
| `tailwind-merge` | 3.7.0 |
| `sonner` | 2.0.8 |
| `embla-carousel-react` | 8.6.0 |
| `date-fns` | 4.4.0 |
| `@radix-ui/react-slot` | 1.5.0 |
| `@radix-ui/react-select` | 2.4.1 |
| `@radix-ui/react-popover` | 1.3.1 |
| `@radix-ui/react-dialog` | 1.3.1 |
| `@radix-ui/react-checkbox` | 1.4.1 |
| `@radix-ui/react-accordion` | 1.3.1 |
| `@radix-ui/react-tabs` | 1.2.1 |
| `@radix-ui/react-label` | 2.1.17 |

Development:

| Package | Version |
| --- | --- |
| `typescript` | 5.9.3 (deliberately **not** 7.x) |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.5 |
| `eslint` | 9.39.5 |
| `eslint-config-next` | 16.4.6 |
| `@playwright/test` | 1.65.0 |
| `@types/node` | 24.19.2 |
| `@types/react` / `@types/react-dom` | 19.3.0 |
| `tw-animate-css` | 1.4.0 |

Environment used for verification: Node `v24.18.0`, npm `11.16.0`, git `2.55.0` (git not initialised).

---

## 5. Research inputs

- **Reference products** (visual/UX direction only, no code, copy or assets reused):
  - Virtuo — https://www.govirtuo.com/
  - Turo — https://turo.com/us/en/car-rental/united-states
  - Research was performed by the parent session; nothing was re-scraped in this phase.
- **Binding visual authority:** `design/DESIGN_SPEC.md`, `design/tokens.json`,
  `design/concepts/*.png`. `ui-ux-pro-max`'s generic *car rental* design-system match proposed a
  dark slate + red palette with Syncopate/Space Mono; that conflict was rejected in favour of the
  supplied tokens.

---

## 6. Routes that exist now

| Route | Behaviour |
| --- | --- |
| `/` | `307` redirect to `/el` (proxy) |
| `/el`, `/en` | Static, prerendered home |
| `/el/cars`, `/en/cars` | Fleet list with query-string filters |
| `/el/cars/[slug]`, `/en/cars/[slug]` | Vehicle detail (SSG per vehicle) |
| `/el/request`, `/en/request` | Request form (dynamic, `robots: noindex, follow`) |
| `/el/how-it-works`, `/en/how-it-works` | Three-step process, what we need / what a request is not (SSG) |
| `/el/faq`, `/en/faq` | Ten Q&As in a Radix accordion (SSG) |
| `/el/about`, `/en/about` | Preparation note, three principles, brand/identity disclosure (SSG) |
| `/el/contact`, `/en/contact` | Honest "details pending" page; only live channel is `/request` (SSG) |
| `/el/privacy`, `/en/privacy` | Draft privacy policy, `index:false` (SSG) |
| `/el/rental-terms`, `/en/rental-terms` | Draft rental terms, `index:false` (SSG) |
| `/[locale]/[...rest]` | Catch-all that calls `notFound()` so unknown locale paths render the styled 404 |
| `/api/health` | `{"status":"ok"}` |
| `/api/inquiries` | `POST` only — inquiry delivery (see §7) |
| `/robots.txt`, `/sitemap.xml`, `/icon.svg` | Generated |

## 7. Phase 4 — inquiry delivery and security model

### Delivery (resolved per request, priority order)

| Priority | Transport | Activated when | Failure |
| --- | --- | --- | --- |
| 1 | `resend` | `RESEND_API_KEY` + `INQUIRY_FROM_EMAIL` + `INQUIRY_TO_EMAIL` | non-2xx → `502 delivery_failed` |
| 2 | `webhook` | `INQUIRY_WEBHOOK_URL` | non-2xx → `502 delivery_failed` |
| 3 | `dev-file` | `INQUIRY_DEV_SINK=1` **and** `NODE_ENV !== "production"` | write error → `502 delivery_failed` |
| — | none | nothing configured | `503 not_configured`; the form disables submit and says so |

A `200 {status:"received", reference}` is returned **only** after a transport reports success.
The reference (`KR-YYYYMMDD-XXXX`, server-generated, `node:crypto`) is returned to the
browser only in that response.

**Dev sink caveat:** `.data/inquiries.jsonl` exists for local work and is deliberately
disabled in a production build. A production-mode smoke test (including the Playwright run)
must set `INQUIRY_WEBHOOK_URL` to a receiver; otherwise the endpoint correctly answers
`503 not_configured`. Stored lines contain the full request payload, so `.data/` is
gitignored and must not be shipped.

### Request contract

`POST /api/inquiries` — `application/json`, ≤ 20KB.

| Status | Body | When |
| --- | --- | --- |
| `200` | `{status:"received", reference}` | transport confirmed delivery/storage |
| `422` | `{status:"invalid", fieldErrors}` | schema/honeypot/timing/referential failure |
| `429` | `{status:"rate_limited", retryAfterSeconds}` | over the per-IP window |
| `503` | `{status:"not_configured"}` | no transport |
| `502` | `{status:"delivery_failed"}` | transport rejected or threw |
| `403` / `413` / `415` | `{status:"invalid", fieldErrors:{}}` | foreign origin / oversize body / non-JSON |

Every response carries `Cache-Control: no-store`.

### Security notes and residual risk

- Server-side Zod re-validation with the same schema the form uses; unknown vehicle
  slugs and unknown location ids are rejected before delivery.
- Origin is compared to `Host` (`x-forwarded-host` honoured) and `Sec-Fetch-Site` must be
  `same-origin`/`same-site`/`none`. A missing `Origin` is allowed (non-browser clients).
- Body size is capped while streaming, not after buffering.
- Honeypot (`website`) plus a 2.5s minimum fill time. Both are speed bumps, not
  authentication: `startedAt` is client-supplied.
- **Rate limit is per instance** (in-memory sliding window, 5/hour/IP by default,
  `INQUIRY_RATE_LIMIT_PER_HOUR`). A multi-instance deployment needs Redis/Upstash.
  `x-forwarded-for` is trusted, so the app must run behind a proxy that overwrites it.
- No PII in logs: failures log only the transport id and an upstream status code.
- Resend receives plain text only (no HTML is built), so customer input cannot be
  injected into markup. The customer's address is set as `reply_to`, never `from`.
- No secret, recipient address or webhook URL is sent to the browser; the page receives
  the two booleans `configured` and `devSink` only.

## 8. Phase 5 — information pages, SEO and legal placeholders

### Shared components

| File | Purpose |
| --- | --- |
| `src/components/sections/page-header.tsx` | Eyebrow, page `h1` (32–40px desktop), ≤62ch intro, optional actions |
| `src/components/sections/legal-notice.tsx` | Amber `role="note"` draft notice (notice tokens) |
| `src/components/sections/prose.tsx` + `.prose-legal` in `globals.css` | Legal prose typography with no plugin dependency (h2 20–22px, body 15–16px) |
| `src/components/sections/legal-document.tsx` | In-page anchor index + prose sections |
| `src/components/ui/accordion.tsx` | Radix accordion in shadcn conventions (button semantics, `aria-expanded`, keyboard, focus ring) |

### SEO decisions

- **`src/lib/seo.ts`** owns `buildAlternates(locale, path)` (`canonical`, `el`, `en`,
  `x-default`), `absoluteUrl()` and `absoluteAlternates()`. The locale layout, cars list,
  vehicle detail and request pages now use it, so every page emits the same hreflang shape.
- **`sitemap.xml`** lists every public route for both locales with absolute URLs from
  `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`): home, cars, six vehicles,
  how-it-works, FAQ, about, contact, privacy, rental-terms. `/request` is excluded.
- **`robots.txt`** allows `/`, disallows `/api/`, `/el/request` and `/en/request`, and
  references the sitemap.
- **Index rules:** FAQ / about / how-it-works / contact are `index: true`; `/request`,
  `/privacy` and `/rental-terms` are `noindex, follow`. Legal pages stay `noindex` until
  the owner and a lawyer approve the copy.
- **Structured data:** the home page emits one `WebSite` node (`name`, `url`,
  `inLanguage: ["el","en"]`). No `LocalBusiness`, `Organization`, `Product` or `Offer`
  schema is emitted: identity, address, phone and pricing are unverified.
- **Localized 404:** `app/[locale]/not-found.tsx` handles `notFound()` calls;
  `app/[locale]/[...rest]/page.tsx` catches unknown locale paths, which Next would otherwise
  answer with its unstyled root 404. `app/[locale]/error.tsx` is a client boundary inside the
  locale layout, so `NextIntlClientProvider` is above it and `useTranslations` has messages.
- **Legal copy is a draft, not an agreement.** Neither page contains a price, age, deposit,
  mileage, insurance or cancellation figure; each topic says it will be confirmed in writing
  before the rental.

### Verification for this phase

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Production build | `npm run build` | exit 0; all information routes SSG for `el` + `en` |
| HTTP + SEO assertions | `node scripts/verify-phase5.mjs http://127.0.0.1:3320` | 47/47 checks pass |
| Visual capture | `node scripts/capture-phase5.mjs http://127.0.0.1:3320` | `screenshots/phase5/*.png`, no overflow, no console errors |

## 9. Blockers and open client questions

Blockers for launch (unchanged in substance, now with the delivery slot open):

1. **Inquiry destination.** Configure Resend (`RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`,
   `INQUIRY_TO_EMAIL`) or `INQUIRY_WEBHOOK_URL` + `INQUIRY_WEBHOOK_SECRET`. Until then the
   form is public but honestly disabled and the API answers `503 not_configured`.
2. **Confirmed fleet list** with authorised photographs per vehicle — otherwise fleet cards can
   only ship with a visible `DEMO` badge.
3. **Approved brand identity** — is the proposed K monogram approved, or is there an official logo?
4. **Confirmed operating area** and pickup/return locations (the Kozani link is unverified).
5. **Legal copy approval.** Privacy policy and rental terms exist only as clearly marked
   drafts (`noindex`). A lawyer/owner must approve retention periods, legal wording, and the
   driver/deposit/insurance/mileage/cancellation/damage topics before they can be indexed.
6. **Verified contact details** and opening hours — the contact page currently states they
   are pending rather than inventing a phone, email, address or hours.
7. **Real pricing policy** — none may be published until approved.

Technical follow-ups (not blocking):

- Add `components.json` once the shadcn CLI's current style presets are confirmed for the project.
- `tests/e2e` now exists (`npm run test:e2e`, 13 tests). The scripts (`scripts/verify-phase5.mjs`,
  `scripts/verify-fixes.mjs`, `scripts/final-gate.mjs`) remain intentionally for the extended
  gate, SEO, axe and visual checks that the E2E suite does not cover.
- Decide whether `/` should stay a `307` (default) or become a permanent `308`.
- Decide whether approved legal copy should stay `noindex` until launch or be indexed once
  signed off.

## 10. Post-gate fixes

Remediation pass after the accessibility and visual gates. No API, transport adapter, rate
limit or delivery-verification behaviour changed.

### Accessibility

- Required semantics: visible `Request.requiredNote` at the top of the form; `required` on the
  name/email/phone and consent inputs; `aria-required` on the pickup/return/date triggers via a
  new optional `required` prop on `LocationSelect` and `DateRangePicker`.
- Contrast: `placeholder:text-muted` in `Input`/`Textarea` and the date trigger; brand-on-subtle
  text now uses `text-brand-hover` (badge brand variant, mobile-nav active item, request summary
  step numbers). Legal index numbers use `text-muted`.
- 320px reflow: the location label row wraps (`flex-wrap` + `gap-x/gap-y`); the same-as-pickup
  toggle drops `whitespace-nowrap` and can shrink, so it wraps below the label.
- FAQ: a visually hidden `h2` (`Faq.sectionTitle`) precedes the accordion, restoring H1 → H2 → H3.
- Language switcher: per-link `aria-label` from `A11y.currentLanguage` / `A11y.switchToLanguage`
  with localized `A11y.languageName` names; `lang` and `aria-current` kept.
- 404: `generateMetadata` now returns `NotFound.metaTitle`.
- Submit: the button is no longer `disabled` when delivery is unconfigured; it keeps
  `aria-disabled`, points `aria-describedby` at the not-configured notice, stays focusable, and
  `onSubmit` guards on `transport.configured`.
- Consent: native `<input type="checkbox" required>` inside the label, so clicking the text
  toggles it; the Radix `Checkbox` import was removed from the form.
- Definition lists: `VehicleSpecRow` flattens `dt`/`dd` into the single wrapper div; the request
  summary uses a plain `div` with `p` label/value pairs.
- Header nav links are `inline-flex min-h-11 items-center`; `<main id="main">` is `tabIndex={-1}`;
  the honeypot uses the `hidden` attribute with `aria-hidden`.

### Visual

- Hero is full-bleed (no `lg:mx-10`/`lg:rounded-hero`), with one smooth left-to-right gradient
  that keeps the photograph visible on the right; subtitle is `text-ink/80`.
- Request page: form first on mobile, summary second; form left / summary right on desktop.
- Fleet grids are 2-up at 1024 (`xl:grid-cols-3`); the home preview hides its third card between
  `sm` and `xl` so no half-row hole appears.
- Vehicle page: badges/title/description/specs sit above the gallery + request grid; the demo
  gallery drops the third lifestyle photo (exterior + interior only); gallery thumbnails size
  their grid to the image count.
- Dates format through `formatDateLabel` / `formatIsoDateLabel` in `src/lib/dates.ts`, always with
  the active locale.
- Not-configured copy is customer-facing in both dictionaries; the honest disabled state and the
  `503` API response are unchanged.
- Badge label size is `text-xs` (12px).

### Verification for this pass

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | exit 0 — no type errors |
| Lint | `npm run lint` | exit 0 — 0 errors, 0 warnings (after removing the unused `screenshotPath` line in `scripts/verify-fixes.mjs`) |
| Production build | `npm run build` | exit 0 — 36 static pages/routes generated |
| Gate checks + screenshots | `node scripts/verify-fixes.mjs` | 49/49 checks pass, incl. axe 0 serious/critical on `/el/request` and `/el/faq`; screenshots refreshed in `screenshots/final` at 1440/390 |
| Visual gate capture | `screenshots/visual-gate/` | 1440, 1024, 768, 390, 375 (plus 1440/390 viewport crops) |
| E2E suite | `npm run test:e2e` | 13/13 tests (passed earlier in the pass; referenced, not rerun here) |
| Final launch gate | `node scripts/final-gate.mjs` | 31/31 checks pass; `next start -p 3350` served and port released |

---

## E2E suite

A Playwright suite now lives in `tests/e2e` and runs against the production build.

| Command | What it does |
| --- | --- |
| `npm run test:e2e` | `next build && playwright test` |
| `npx playwright test tests/e2e/smoke.spec.ts` | Content, navigation, filters, 404, mobile sheet (requires a running server or the configured `webServer`) |
| `npx playwright test tests/e2e/inquiry.spec.ts` | Real inquiry delivery to a local receiver on `127.0.0.1:9299` |

Configuration (`playwright.config.ts`): one worker, no retries, `channel: "chrome"`, `baseURL`
`http://127.0.0.1:4400`, and a `webServer` that starts `npx next start -p 4400` with
`INQUIRY_WEBHOOK_URL=http://127.0.0.1:9299/inquiry`, `INQUIRY_WEBHOOK_SECRET=e2e-test`,
`INQUIRY_RATE_LIMIT_PER_HOUR=100` and empty Resend variables.

Covered:

- Greek home at 1440 and 390: status, hero H1, header navigation, booking controls, no horizontal
  overflow.
- Language switch to `/en`: English H1 and `<html lang="en">`.
- Fleet: six vehicle links, SUV chip narrows to Peugeot 2008 + Kia XCeed, empty-state URL shows the
  localized heading and a clear-filters link.
- Dacia Sandero Stepway: H1, request panel, two gallery thumbnails, specifications tab content.
- Request form: empty contact fields raise field alerts and never show success.
- FAQ accordion: first item expands (`aria-expanded="true"`) with its answer.
- Localized 404: HTTP 404 and the Greek heading.
- Mobile menu at 390: opens, Escape closes, focus returns to the trigger.
- Inquiry delivery: the form's success reference matches the single webhook payload (`reference`,
  `name`, `vehicleId`); no success is rendered before the server responds; validation errors do not
  deliver anything.

### Final review fixes (2026-11-10 - hardening pass)

A final review returned **SHIP-WITH-FIXES**. Every accepted finding was applied without changing the
visual direction:

| ID | Severity | Fix |
| --- | --- | --- |
| A | High | **Inquiry clock skew.** Removed `MAX_CLOCK_SKEW_MS` and the rejection of negative elapsed time. Missing/NaN `startedAt` is still rejected, and a non-negative elapsed below the 2.5 s fill floor still is. Timing is a soft spam signal, so a client clock ahead of the server is no longer blocked; the honeypot and both rate limits stay in place. |
| B | High | **Global abuse backstop.** `checkRateLimit(ip)` now counts a per-IP bucket (`INQUIRY_RATE_LIMIT_PER_HOUR`, default 5) *and* a global bucket (`INQUIRY_GLOBAL_RATE_LIMIT_PER_HOUR`, default 120); exceeding either returns `{allowed:false, retryAfterSeconds}` (the longer of the two waits) and nothing is recorded on rejection. Allowed requests append to both, and expired timestamps are still pruned. `clientIp` and the limiter document that `x-forwarded-for` is spoofable unless a trusted proxy overwrites it and that the limiter is per instance - the global cap bounds a spoofed-IP flood. `INQUIRY_GLOBAL_RATE_LIMIT_PER_HOUR` is also documented in `.env.example`. |
| C | High | **Security headers.** `next.config.ts` sets `poweredByHeader: false` and a `/(.*)` header rule with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`, and a CSP (`default-src 'self'`; `script-src`/`style-src` allow `'unsafe-inline'` for Next's inline bootstrap). HSTS (`max-age=63072000; includeSubDomains; preload`) is emitted only when `NODE_ENV === "production"`. No CSP relaxation was needed beyond the shipped `'unsafe-inline'`: the build, E2E suite and a hydrated browser check all pass with it. |
| D | Medium | **Language switch keeps query/hash.** `language-switcher.tsx` reads `window.location.search + window.location.hash` into a `suffix` state in a `useEffect` keyed by `pathname`, and links to `${pathname}${suffix}`. `useSearchParams` is deliberately avoided (no Suspense boundary, no forced dynamic rendering). Verified on `/el/cars?category=suv` -> `/en/cars?category=suv`. |
| E | Medium | **Site URL warning.** `src/lib/seo.ts` warns at module load when `NODE_ENV === "production"` and `NEXT_PUBLIC_SITE_URL` is unset ("canonical/sitemap URLs will fall back to localhost"). The localhost fallback is kept for local work; production must set the variable. |
| F | Medium | **Sitemap/noindex consistency.** `/privacy` and `/rental-terms` were removed from `sitemap.ts` because both pages are `noindex` drafts; they stay footer-linked and return 200. |
| G | Medium | **Form-control contrast.** Added `--token-control-border: #7f8b87` (`:root`) and `--color-control` (`@theme inline`), and switched the `Input`, `Textarea`, `SelectTrigger` and date-range trigger borders from `border-line` to `border-control` (≈3.5:1 on white, meeting WCAG 1.4.11). Hover, focus and invalid states are unchanged. |
| H | Medium | **Privacy wording.** The server-log paragraph now attributes technical logs to the hosting platform, names URL and response status, and states the application does not log request content. The security bullet now reads "per IP address and a global limit" in both dictionaries. |
| I | Low | **Artifact hygiene.** Deleted `screenshots/visual-gate/{server.log,server.pid,server2.log,build.pid,build.log,metrics.json}` and gitignored `screenshots/**/server*.log`, `screenshots/**/*.pid`, `screenshots/**/build.log`, `screenshots/**/metrics.json`. `screenshots/final/final-gate.log` is kept as evidence. |

Accepted residual risks (unchanged by this pass):

- `x-forwarded-for` is spoofable unless a trusted proxy overwrites it; the new global bucket caps the
  blast radius but does not identify the attacker.
- The limiter is in-memory and per instance, so N instances allow roughly N × each limit.
- The CSP uses `'unsafe-inline'` for Next's inline bootstrap; a nonce/hash pipeline is future work.
- `NEXT_PUBLIC_SITE_URL` must be set in production or canonical/sitemap URLs fall back to localhost.
- There is no bot challenge (CAPTCHA/Turnstile) yet; the honeypot, timing gate and rate limits are the
  only abuse controls.
- The development file sink remains disabled in production, and `.data/` must never ship.

## 11. Final QA record (2026-11-10)

Final gate for the implementation, re-run after the **final review hardening pass** (fixes A-I in the
section above). The application source changed in that pass; the two gate scripts were not modified
and still pass unchanged. The earlier note that "no application source changed" applied to the
pre-hardening gate only.

### Commands and results

| Command | Result |
| --- | --- |
| `npm run lint` | exit 0 — 0 errors, 0 warnings |
| `npx tsc --noEmit` | exit 0 — no type errors |
| `npm run build` | exit 0 — 36 static pages generated, all routes present |
| `node scripts/verify-fixes.mjs` | 49/49 checks; axe 0 serious/critical on `/el/request` and `/el/faq`; `screenshots/final` refreshed at 1440/390 |
| `npm run test:e2e` | 13/13 tests (re-run in the hardening pass) |
| `node scripts/final-gate.mjs` | 31/31 checks; server on `:3350` answered, port released after shutdown |

Re-verification after the hardening pass:

| Command / check | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 - no type errors |
| `npm run lint` | exit 0 - 0 errors, 0 warnings |
| `npm run build` | exit 0 - 36 static pages generated |
| `npm run test:e2e` | 13/13 tests pass with the new CSP, headers and global rate limit (`INQUIRY_RATE_LIMIT_PER_HOUR=100`, global default 120) |
| `node scripts/verify-fixes.mjs` | 49/49 checks; axe 0 serious/critical |
| `node scripts/final-gate.mjs` | 31/31 checks; port 3350 released |
| `next start -p 3360` header probe | `Content-Security-Policy` (incl. `default-src 'self'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin` and production `Strict-Transport-Security` all present; `x-powered-by` absent |
| Sitemap probe | `/el/privacy`, `/el/rental-terms`, `/en/privacy`, `/en/rental-terms` absent from `sitemap.xml`; both pages still answer 200 and keep `noindex` |
| Language-switcher probe (Playwright, after hydration) | `/el/cars?category=suv` exposes `/en/cars?category=suv`; a later navigation to `/el/faq` exposes `/en/faq`, proving the effect is keyed by `pathname` |

The final gate asserts, against `next start -p 3350`:

- 200 for `/el`, `/en`, `/el/cars`, `/el/cars/peugeot-2008`, `/el/request`, `/el/faq`,
  `/el/how-it-works`, `/el/about`, `/el/contact`, `/el/privacy`, `/el/rental-terms`, `/en/faq`
  and `/en/rental-terms`.
- 404 for `/el/does-not-exist`, with `404` in the `<title>`.
- `sitemap.xml` contains `/el/cars/peugeot-2008` and `/el/faq`, and no longer lists the `noindex`
  draft pages `/el/privacy` or `/el/rental-terms` (both still answer 200 and remain footer-linked).
- `robots.txt` contains `Sitemap:` and `Disallow: /el/request`.
- Home HTML contains `"@type":"WebSite"` and no `LocalBusiness`.
- No `€`/`EUR` in the rendered body text of `/el`, `/el/cars`,
  `/el/cars/peugeot-2008` or `/el/request`.
- `/el/request` renders the Greek not-configured alert and a submit button carrying
  `aria-disabled="true"`.
- Port 3350 is free after shutdown.

### Specialist gates

| Gate | Verdict | Outcome |
| --- | --- | --- |
| `nextjs-developer` | GO-WITH-CHANGES | Changes adopted |
| `accessibility-expert` | FAIL (initial) — 4 High / 6 Medium / 4 Low | All High and Medium remediated; axe reports 0 serious/critical |
| `ui-visual-validator` | FAIL (initial) — hero scrim, request mobile order | Both fixed and re-verified by the visual gate |
| `interface-reviewer` | dispatch failed upstream (Cadra JSON-schema error) | Substituted by the accessibility + visual gates |

### Screenshot index

| Set | Location | Widths |
| --- | --- | --- |
| Final component/page set | `screenshots/final/` | 1440, 390 |
| Visual gate | `screenshots/visual-gate/` | 1440, 1024, 768, 390, 375 |

## 12. Known limitations and launch blockers

- **Identity, address, phone and opening hours are unverified.** Nothing is published; the contact
  page states the details are still pending.
- **No approved fleet photographs or prices.** Cards use licensed stock photos with a visible
  `DEMO` badge; no rate, deposit, insurance, mileage or availability figure appears anywhere.
- **Inquiry delivery must be configured** (Resend or `INQUIRY_WEBHOOK_URL`) before the form can
  submit; until then it stays honestly disabled and the API answers `503 not_configured`.
- **Legal drafts need review.** Privacy policy and rental terms are marked drafts and `noindex`
  until the owner and a lawyer approve the copy.
- **Brand mark is a proposal** (`assets/brand/kalimeris-logo-proposal.svg`) pending approval.
- **Rate limits are in-memory and per instance.** A multi-instance deployment needs Redis/Upstash,
  and the proxy must overwrite `x-forwarded-for`. The per-IP bucket (default 5/hour) is spoofable
  without a trusted proxy; the global bucket (default 120/hour) bounds that flood but is also
  per instance.
- **The CSP uses `'unsafe-inline'` for Next's inline bootstrap scripts/styles.** It still blocks
  third-party script origins; a nonce/hash pipeline is future work.
- **`NEXT_PUBLIC_SITE_URL` must be set in production** or canonical/sitemap URLs fall back to
  localhost (the app warns at module load).
- **No bot challenge yet.** Turnstile/CAPTCHA is not integrated; the honeypot, timing gate and rate
  limits are the only abuse controls.
- **The dev file sink is disabled in production**; `.data/` must never ship.
- **No analytics and no cookies**, so there is no consent banner and no measurement yet.
- **Stock photos are illustrative** and stay badged `DEMO`; they are not client inventory.
- **Email transport is untested without credentials** — only the webhook receiver used by the E2E
  suite has been exercised, not a real Resend account.
- **`/` is a 307** redirect to `/el` unless a permanent `308` is chosen.

## 13. GitHub Pages deployment (2026-11-10)

The site is published as a **static preview** on GitHub Pages. This section is the runbook and the
record of what was verified.

### Locations and branch layout

| What | Value |
| --- | --- |
| Live URL | https://odypslegend-blip.github.io/kalimeris-car-rentals/ |
| Repository | https://github.com/odypslegend-blip/kalimeris-car-rentals (public) |
| Base path | `/kalimeris-car-rentals` |
| `main` | Next.js source. `f8ff0a0d28762987f3ad4474e8dd778e1560ce9c` |
| `gh-pages` | Built static export only. `f3203f464792dcb6a0e143841cc0a7b8f557cc3e` |
| Pages source | branch `gh-pages`, path `/`, `build_type: legacy`, HTTPS enforced, custom 404 |

`main` never contains build output: `/node_modules`, `/.next/`, `/out/`, `/.data/`,
`/test-results/` and `.env*` are gitignored, and the export's hidden `.nojekyll` is written by the
build script (without it Jekyll would strip `_next/`).

### Build command

```powershell
$env:STATIC_EXPORT="1"
$env:NEXT_PUBLIC_BASE_PATH="/kalimeris-car-rentals"
$env:NEXT_PUBLIC_SITE_URL="https://odypslegend-blip.github.io/kalimeris-car-rentals"
npm run build:pages
```

`scripts/build-pages.mjs` holds `src/app/api`, `src/proxy.ts` and `src/app/[locale]/[...rest]` out of
the tree for the duration of the export (an export rejects middleware, route handlers and a
catch-all without `generateStaticParams`), restores them in a `finally` block, writes
`out/.nojekyll`, restores `public/404.html` byte-for-byte, and validates the required output files
plus the absence of `out/api`.

Result for this deployment: exit 0, `out/` = 234 files (`_next/` 33, `el/` 90, `en/` 90, `images/` 9,
`404.html`, `index.html`, `icon.svg`, `robots.txt`, `sitemap.xml`, `.nojekyll`), no `out/api`.

### Publishing `out/` to `gh-pages`

```powershell
git checkout --orphan gh-pages      # first time only
git rm -rf .
Copy-Item out\* . -Recurse -Force
Copy-Item out\.nojekyll . -Force
Remove-Item out -Recurse -Force
git add -A
git commit -m "Deploy static site to GitHub Pages"
git push origin gh-pages
git checkout main
```

**Do not edit `gh-pages` by hand.** It is a build artifact: a manual change there is overwritten by
the next publish and leaves the branch disagreeing with `main`. Change `main`, rebuild, republish.

### Editing content

| What to change | File |
| --- | --- |
| Copy, labels, headings (Greek) | `messages/el.json` |
| Copy, labels, headings (English) | `messages/en.json` |
| Vehicles, specs, categories, image mapping | `src/lib/data/fleet.ts` |
| Pickup/return locations | `src/lib/data/locations.ts` |
| Vehicle and hero photographs | `public/images/reference/` |
| Colour/type/spacing/motion tokens | `design/tokens.json` → `src/app/globals.css` |

After editing: run `npm run build:pages` with the three environment variables and republish `out/`
to `gh-pages` as above.

### Inquiry form on the static preview

The export contains **no `/api/inquiries` route**, so `/el/request` and `/en/request` render with
`transport = {configured: false, devSink: false}`. The submit button carries
`aria-disabled="true"`, is described by a persistent bilingual "online submission is not active yet"
notice, and `onSubmit` returns before any `fetch` — no `/api/` request is made and no success state
can appear.

The **server build is unchanged and keeps the real delivery adapter** (`Resend` → `webhook` →
`dev-file`, see §7). Taking real inquiries means deploying the Node build and configuring the
transport variables; the static preview is a public face, not a lead-capture channel.

### Verification (executed, live)

Source health before publishing:

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 — no errors, no warnings |
| `npm run build` | exit 0 — 36 routes generated |
| `npm run test:e2e` | exit 0 — **13/13 tests pass** |

Live acceptance (`node scripts/verify-live-pages.mjs`, against the built Pages site):
**57/57 checks pass**, report at `screenshots/live/report.json`.

| Check | Result |
| --- | --- |
| `/` → `/kalimeris-car-rentals/el/` within 5 s, Greek H1 "Νοικιάστε με σιγουριά.", `html[lang=el]` | pass |
| `/el/cars/` → 6 vehicle cards; `?category=suv` → exactly 2 (Peugeot 2008, Kia XCeed) | pass |
| `/el/cars/dacia-sandero-stepway/` → H1 + 2 gallery thumbnails | pass |
| `/el/request/?vehicle=peugeot-2008&pickup=main&return=main&from=…&to=…` → summary (vehicle + Greek date range) + form | pass |
| Submit: `aria-disabled="true"`, Greek not-configured alert, **0** `/api/` requests, no success state | pass |
| `/en/` → "Rent with confidence.", `html[lang=en]` | pass |
| Language switch from a loaded `/el/cars/?category=suv` → `/en/cars/?category=suv` | pass |
| Every visible image decoded (`naturalWidth > 0`); no page errors; no failed requests | pass |
| No 404s for `_next`/images; only App Router RSC **prefetch** payload 404s (1–4 per page) | pass (reported) |
| `/el/nope` → custom 404 HTML with HTTP **404**, bilingual H1 | pass |
| No horizontal overflow at 390 | pass |

Screenshots: `screenshots/live/home-1440.png`, `fleet-1440.png`, `request-1440.png`,
`home-390.png` (full page).

Pages API after the final build: `status: built`, latest build `duration 109653 ms`,
`error.message` empty, `html_url: https://odypslegend-blip.github.io/kalimeris-car-rentals/`.
Live `/el/` was confirmed **byte-identical** to `origin/gh-pages:el/index.html`
(git blob `7e996b569dadb1829d7aa168a043e0617a05f4a6`).

### Operational notes and known gaps

- **Do not trigger a second Pages build while one is in flight.** Requesting
  `POST /repos/{owner}/{repo}/pages/builds` supersedes a running deployment ("Canceling since a
  higher priority waiting request … exists") and leaves the legacy build record at
  `status: errored` even though the artifact still deploys. One build, then wait.
- **RSC prefetch 404s are expected.** With no server, the App Router's speculative
  `__next.<…>.txt` requests 404; navigation and content are unaffected. Do not treat them as a
  deployment failure.
- **Language switch after an in-page filter click.** The switcher reads
  `window.location.search` in an effect keyed by `pathname`. A filter click changes only the query,
  so the header's `/en/` link keeps the previous (empty) query until a path change or reload. A
  direct load of `/el/cars/?category=suv` is correct. Fixing it needs `useSearchParams` plus a
  Suspense boundary (or a click-time read); not changed in this deployment pass.
- **Static hosting cannot serve security headers.** The CSP, HSTS, `X-Frame-Options`, etc. in
  `next.config.ts` apply to the server build only; GitHub Pages sends its own headers.
- The form remains honestly disabled on Pages (§13 above, §7 for the server contract).

---

## 14. Light-Mode Editorial Redesign & Swarm Implementation (2026-11-14)

Following the typography and layout upgrade (Pairing A `Syne` + `Manrope` + `JetBrains Mono`, `1+2` Flagship Fleet Bento, Asymmetric Split Services Ledger, and Style 2 `AnimatedSteps`), a multi-worker visual redesign refined light mode into an editorial automotive identity while strictly preserving `.dark` mode.

### Token & Theme System
- **`design/tokens.json` & `src/app/globals.css` (`:root`)**: Warm sand background (`#F5F2EA`), pure white card surface (`#FFFFFF`), elevated warm surface (`#ECE7DC`), warm ledger surface (`#EAE3D5`), deep slate-ink (`#0E1720`), muted (`#525E66`), primary brand teal (`#087F78` / hover `#066660` / subtle `#E4F2EF`), vibrant orange (`#FF693B`), warm yellow (`#F4C95D`), subtle border (`#DDE2DF`), hairline (`#E5E2D9`), and scrim `245 242 234`. Motion tokens set to `180ms` fast, `220ms` normal, `300ms` slow.
- **Preserved `.dark` Mode**: Existing monochrome dark surfaces (`#1C1C1C`, `#242424`, `#2C2C2C`, `#F5F5F5`, `#A3A3A3`, `#FFFFFF`, `#333333`, `#282828`, scrim `28 28 28`) remain unchanged; `--token-surface-warm`, `--token-accent-orange*`, and `--token-accent-yellow*` alias to neutral dark tokens so light-mode warmth does not leak into dark mode.
- **Automotive CSS Utilities**: Added `.road-divider` and `.automotive-frame` in `src/app/globals.css`.

### New Primitives & Upgraded Components
- **`src/components/brand/automotive-accents.tsx`**: Exports `HeritageBadge`, `RouteIndicator`, `TechnicalDivider`, and `ChassisIllustration`.
- **`src/components/ui/badge.tsx` & `button.tsx`**: Added `"heritage"` and `"orange"` badge variants; updated button transitions to `220ms` (`duration-[var(--token-duration-normal)]`), `4px` (`translate-x-1`) arrow shift, and primary hover shadow.
- **`src/components/sections/section-heading.tsx` & `page-header.tsx`**: Text-only eyebrows with `14px` orange/brand tick (`bg-accent-orange dark:bg-brand`), unnumbered section headings, and warm elevated light-mode `PageHeader` framing.
- **`src/components/layout/` & Home (`src/app/(site)/[locale]/page.tsx`)**: Header features `1980` heritage pill and orange active nav indicator (`dark:bg-brand`); footer uses `.road-divider`; homepage pairs the editorial Hero telemetry strip and spotlight search dock with the `1+2` Flagship Fleet Bento, Style 2 `AnimatedSteps`, Asymmetric Split Services Ledger (`bg-surface-warm/60`, `ChassisIllustration`), and Company Heritage Spread (`1980`, `600 m²`, `24/7`).
- **Inner Pages & Fleet (`cars`, `cars/[slug]`, `services`, `how-it-works`, `about`, `contact`, `faq`)**: Updated with `TechnicalDivider`, text-only route indicators, automotive-framed cards, and `1.03` image hover scaling; decorative/index numbers (`01`, `02`, `01–03`, `STAGE 01`, `GR-50100`, FAQ/ledger pills) removed across sections while retaining essential factual figures (`1980`, `600 m²`, `24/7`, contact details, and vehicle specs).
- **Parallax Fix (`src/components/motion/smooth-scroll.tsx`)**: Removed the `if (scrollY < 900)` gate on `--hero-parallax-y` so direct jumps past `900px` still clamp smoothly up to `36.0px`.
- **Unified `Syne` Typography (`layout.tsx`, `globals.css`, `kinetic-heading.tsx`, `wordmark.tsx`, `mobile-nav.tsx`, `design/tokens.json`)**: Restricted `Syne` weights to proportional `400`/`500`/`600`/`700` (eliminating the expanded `800` master on hero/wordmark), mapped `--font-sans`, `--font-display`, and `--font-mono` to `var(--font-syne)` across all elements, applied `font-weight: 700` / `-0.025em` tracking / `1.12` line-height across `h1`–`h6`, and set `-0.015em` body tracking.

### Verification (Playwright E2E & Static Checks)
- `npm run typecheck` (`tsc --noEmit`): **exit 0**
- `npm run lint` (`eslint`): **exit 0**
- `npm run test:e2e` (`next build && playwright test`): **17/17 passed** (`3/3` in `tests/e2e/inquiry.spec.ts` and `14/14` in `tests/e2e/smoke.spec.ts`, including two new `Visual theme & responsive integrity` tests checking light/dark CSS variables, zero theme leakage, and zero horizontal overflow/console errors at `1440px`, `768px`, and `375px`).
