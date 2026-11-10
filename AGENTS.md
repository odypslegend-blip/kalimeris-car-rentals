# AGENTS.md - Kalimeris Car Rentals

Applies to all coding agents and subagents operating within this repository.

## Mission
Create a clean, original, responsive bilingual Greek car-rental website branded **KALIMERIS CAR RENTALS**, using the supplied concept images and design tokens as an execution target. Do not build an exotic-supercar theme or a generic SaaS landing page.

## Read order
1. `README.md`
2. `PROMPT_FOR_AGENT.md`
3. `design/DESIGN_SPEC.md` and `design/tokens.json`
4. `assets/ASSET_MANIFEST.json` and `assets/SOURCES.md`
5. `references/FLEET_CANDIDATES.json`, `references/COMPETITOR_RESEARCH.md`
6. `docs/ARCHITECTURE.md` and `docs/ACCEPTANCE_CRITERIA.md`
7. `design/concepts/` images

## Safety, accuracy and intellectual property
- Do not reuse competitor source code, logos, photographs or exact copy; borrow high-level UX principles only.
- Do not copy photos from car.gr / the discovered Kalimeris site for production without owner approval. Links are research-only.
- Use Unsplash stock photos ONLY for decorative/test imagery and record credits and source. Never present a stock car as an actual available rental.
- Treat found Kalimeris company pages as an **unverified identity match** pending client confirmation.
- No fabricated prices, availability, rental terms, insurance coverage, deposits, reviews or awards.
- A quote request is **not** a confirmed booking. Do not claim a submission succeeded until persisted/sent successfully.
- Never commit tokens or credentials. Use `.env.example` and deployment secrets.

## Engineering principles
- Read and preserve the current repository, dependencies and business functionality before changing architecture.
- Prefer lean Next.js App Router + TS + Tailwind + shadcn/ui where the repository is new.
- Components must be reusable and data-driven, not pasted page-specific hardcoded blocks.
- Choose one shadcn implementation style (Radix or Base UI); do not mix their APIs blindly.
- Centralize spacing, colors, typography, radii, motion and icon sizes in design tokens.
- Use `next-intl` dictionaries for `el` and `en`; ensure Greek-capable font subsets.
- Create accessible semantic controls, visible keyboard focus, error and loading states, and reduced-motion support.
- Be responsive at 375/390/768/1024/1440 px; avoid horizontal overflow.
- Use next/image and appropriate remotePatterns; optimize licensed images and layouts.
- Prefer an operational quote-request form, without relying on false booking confirmation. Use client's backend or a real email provider once configured.

## Execution contract
1. Inspect repo, state assumptions and inventory required business data in a short `docs/IMPLEMENTATION_STATUS.md`.
2. Build a reference-informed component system following design tokens and named components in docs.
3. Implement homepage, fleet, vehicle details, inquiry, FAQ, about/contact, privacy/terms placeholders pending review.
4. Wire typed inquiry form with server-side validation, spam protection and a real configured delivery mechanism; fail transparently if not configured.
5. Add smoke/E2E tests; run type checks, lint, build and Playwright flows.
6. Capture responsive screenshots; compare with concept screens as *directional* references.
7. Document completed features, external dependencies, screenshots, blockers and next actions; do not claim untested completion.

## Minimum definition of done
- All major pages render and are navigable in Greek and English.
- Vehicle catalogue is filterable and has consistent card/vehicle-detail states.
- Inquiries are delivered to a real configured destination or clearly disabled with explanation.
- Errors, empty states, mobile menu, date range and form validation work.
- No unapproved pricing, photos or operational claims; company identity confirmed before launch.
- No console errors; accessible focus and relevant tests pass.
- No placeholder implementation disguised as production-ready behavior.
