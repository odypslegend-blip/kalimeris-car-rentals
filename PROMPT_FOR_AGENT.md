# Copy/Paste Agent Prompt - Kalimeris Car Rentals

You are a senior product designer, frontend engineer, accessibility reviewer, and production web developer operating autonomously inside the provided repository.

## The product
Brand name: **KALIMERIS CAR RENTALS**. Build a clean, contemporary Greek car-rental website influenced by the **clarity, restraint and booking-first experience** of Virtuo (https://www.govirtuo.com/), NOT a clone. Use the ORIGINAL bundled board in `design/concepts/kalimeris-concept-board.png` and crops as visual specification. The brand mark is a **proposal** pending approval.

CRITICAL CONTEXT: Another Kalimeris business was found publicly at https://kalimeriscars.gr/ and publicly advertises rentals at https://kalimeris.car.gr/classifieds/. Verify with the user/client whether that is the correct business before using its contact details, addresses, identity, or imagery. Candidate vehicle links in `references/FLEET_CANDIDATES.json` are **research-only**. Do NOT treat indicative €10/day listings as actual bookable rates.

## A. Audit first
- Inspect repo structure, package manager, existing framework, routes, assets, and integrations.
- Preserve functioning parts rather than overwriting them.
- Read all documents specified by `AGENTS.md`.
- Inspect asset manifest: use exact named assets and source links. Fetch only approved licensed references, keep attribution/provenance, avoid car.gr copyrighted downloads without permission.
- Record unresolved business assumptions in `docs/IMPLEMENTATION_STATUS.md`.

## B. Design
- Original editorial simplicity, light/off-white surfaces, charcoal headings, restrained teal CTA, authentic modern car-rental practicality.
- Do not recreate Virtuo's exact layout, assets, code, brand, typography or prose.
- Use proposal tokens from `design/tokens.json` instead of random arbitrary styles.
- Mobile-first layouts, compact hero, obvious booking date/location fields, vehicle cards with useful facts, vehicle details, and an accessible inquiry form.
- No glassmorphism, giant gradients, noisy animation, generic SaaS feature blocks, heavy 3D, fake awards, or nonsensical city selectors.
- If business location is unconfirmed, use neutral location text/placeholders; do not pretend the service operates in every Greek city or island.

## C. Recommended stack (adapt to existing repository)
- Next.js App Router, TypeScript, Tailwind CSS.
- shadcn/ui with ONE chosen primitive system (Radix OR Base UI).
- React Hook Form + Zod for real validated forms.
- next-intl for English and Greek.
- Lucide icons with named icon contracts in `docs/COMPONENT_LIBRARY_MAP.md`.
- Next font Inter with Greek and Latin subsets; check installed Next.js support.
- shadcn Carousel (Embla) for vehicle gallery; no extra swiper package.
- Playwright for browser QA and regression tests.
- Prefer server actions or API routes with Zod validation, CSRF/rate protection as appropriate.
- Only add a database, payment system, or availability service when the current scope actually requires it and the backend exists.

## D. Required pages and components
HOME (`/[locale]`): slim header, original wordmark, compact hero, location/date booking search, featured vehicle categories, a concise how-it-works strip, trust/contact section, footer.
FLEET (`/[locale]/cars`): data-driven vehicle cards, filtering by category/transmission/passengers, clear empty state, real data or explicit SAMPLE labels.
CAR DETAILS (`/[locale]/cars/[slug]`): responsive image carousel, clearly sourced specs, separate booking inquiry CTA, policy links, no fake availability.
INQUIRY (`/[locale]/request`): pickup + return locations, date range, vehicle ID, contact name/email/phone, optional message, consent checkbox, validation, safe server submission, confirmation only after success.
INFORMATION: how-it-works/FAQ, about, contact, legal privacy/rental terms placeholders until client-provided copy approved.

Reusable components explicitly required:
`SiteHeader`, `MobileNav`, `HeroSearch`, `LocationSelect`, `DateRangePicker`, `VehicleCard`, `FleetFilters`, `VehicleGallery`, `VehicleSpecRow`, `RequestPanel`, `RequestForm`, `SectionHeading`, `SiteFooter`, `LanguageSwitcher`, `EmptyFleetState`.

## E. Data and imagery contract
- Use `assets/ASSET_MANIFEST.json` and `assets/SOURCES.md` for filenames, individual photo URLs, credits and allowed uses.
- If downloading demo stock photos, store them in `public/images/reference/`; never map placeholder SUV photo to a branded car without a visible DEMO badge in development.
- For production fleet cards, require client-owned/authorized photos per vehicle, e.g. `public/images/fleet/peugeot-2008/front.webp`.
- `references/FLEET_CANDIDATES.json` links to six candidate public listings. Verify every field before release; prices/availability are not approved.
- Do not use logos from the found existing website or car.gr. Original SVG proposal is under `assets/brand/`; request approval before deployment.

## F. Workflow and implementation sequence
1. Repo audit and business assumptions; decide existing-stack integration vs new Next.js starter.
2. Implement tokens and component library; set up i18n and global shell.
3. Build Home, Fleet and Car Details matching the design direction.
4. Implement query-state persistence and a real inquiry backend; no dummy success notifications.
5. Build information pages; add SEO metadata, OG tags, JSON-LD only with verified data, accessible forms, cookie handling if needed.
6. Responsive audit at 375, 390, 768, 1024 and 1440px with Playwright screenshots.
7. Run `lint`, `typecheck`, production build, automated UI tests; fix regressions.
8. Summarize screenshots, completed components, verified assets, actual inquiry integration, blockers and open business questions.

## G. Success conditions
- The site looks considered and professionally art-directed, WITHOUT excessive luxury visuals.
- Every interactive element has real behavior, including valid dates and form errors.
- Mobile is at least as polished as desktop.
- Inventory and prices are truthful or marked as pending, not invented.
- Clear, documented hand-off with no hidden fake integrations.

Proceed through implementation and testing. Ask only for genuinely required client-specific facts (actual booking destination, approved fleet, address, legal terms) and continue completing unaffected work in parallel. Do not stop at the planning phase.
