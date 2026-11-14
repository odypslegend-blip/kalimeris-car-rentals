# Kalimeris Car Rentals - Agent Implementation Kit

**Brand brief:** KALIMERIS CAR RENTALS. Original, Virtuo-inspired simplicity for a Greek car-rental website. No Virtuo branding, assets, or source code may be copied.

## START HERE

1. Read `AGENTS.md` and `PROMPT_FOR_AGENT.md` before making repo changes.
2. Open `design/concepts/kalimeris-concept-board.png`, then individual crops in `design/concepts/`.
3. Read `design/DESIGN_SPEC.md` and `design/tokens.json`.
4. Review `assets/ASSET_MANIFEST.json` and `assets/SOURCES.md` for **exact filenames, source URLs, intended placements and usage rights**.
5. See `references/FLEET_CANDIDATES.json` for publicly listed possible rental cars. **Do not publish until client validates**.
6. Execute the prompt in an existing project or new repo; do not blindly overwrite existing configuration.

## What is included

- Root-level `AGENTS.md` for coding agent behavior.
- Complete copy/paste task specification in `PROMPT_FOR_AGENT.md`.
- Generated original concept board and four cropped concept screens.
- Original proposed SVG wordmark and favicon; require client approval before production.
- Concrete asset and vehicle research links, download script, and licensing notes.
- Component-to-library mapping, design tokens, architecture and acceptance criteria.

## Live site and deployment

| What | Where |
| --- | --- |
| Live Vercel site (Node runtime) | https://kalimeris-car-rentals.vercel.app |
| Static preview (GitHub Pages) | https://odypslegend-blip.github.io/kalimeris-car-rentals/ |
| Primary GitHub repository | https://github.com/odysseaspsemmatakis-dotcom/kalimeriswebsite |
| GitHub Pages mirror repository | https://github.com/odypslegend-blip/kalimeris-car-rentals |
| `main` | The Next.js source branch. Never contains build output. |
| `gh-pages` | The published static export only. Generated — do not edit by hand. |

Vercel deploys the full Next.js App Router runtime directly from Git/CLI (`https://kalimeris-car-rentals.vercel.app`).
GitHub Pages serves a **static export** under the base path `/kalimeris-car-rentals`, so all content is prerendered HTML with no server runtime.

### Rebuild and republish

```powershell
$env:STATIC_EXPORT="1"
$env:NEXT_PUBLIC_BASE_PATH="/kalimeris-car-rentals"
$env:NEXT_PUBLIC_SITE_URL="https://odypslegend-blip.github.io/kalimeris-car-rentals"
npm run build:pages
```

`npm run build:pages` (`scripts/build-pages.mjs`) temporarily holds `src/app/api`,
`src/proxy.ts` and `src/app/[locale]/[...rest]` out of the tree — an export cannot contain
middleware, route handlers or a catch-all without `generateStaticParams` — runs `next build`,
restores them in a `finally` block, writes `out/.nojekyll`, restores the custom
`public/404.html`, and fails if any required file is missing or `out/api` appears.

Then publish `out/` to `gh-pages`:

```powershell
git checkout --orphan gh-pages   # only the first time; afterwards: git checkout gh-pages
git rm -rf .
Copy-Item out\* . -Recurse -Force
Copy-Item out\.nojekyll . -Force
Remove-Item out -Recurse -Force
git add -A
git commit -m "Deploy static site to GitHub Pages"
git push origin gh-pages
git checkout main
```

> **Do not edit `gh-pages` by hand.** It is a build artifact. Any manual change there is lost on
> the next publish and makes the branch disagree with `main`.

### Editing content

| What you want to change | File |
| --- | --- |
| Any copy, label or heading (Greek) | `messages/el.json` |
| Any copy, label or heading (English) | `messages/en.json` |
| Vehicle list, specs, categories, image mapping | `src/lib/data/fleet.ts` |
| Pickup/return locations | `src/lib/data/locations.ts` |
| Vehicle and hero photographs | `public/images/reference/` |
| Design tokens (colour, spacing, type, radii, motion) | `design/tokens.json` → `src/app/globals.css` |
| Automotive brand accents (`HeritageBadge`, `RouteIndicator`, `TechnicalDivider`, `ChassisIllustration`) | `src/components/brand/automotive-accents.tsx` |
| Interactive rental process stepper & smooth scroll / parallax | `src/components/motion/animated-steps.tsx`, `src/components/motion/smooth-scroll.tsx` |

After any change, rebuild with the command above and republish `out/` to `gh-pages`.

### Static preview vs. server deployment

The static export has **no `/api/*` route**, so on GitHub Pages the inquiry form is
**deliberately disabled**: the submit button carries `aria-disabled="true"`, a visible Greek/English
notice explains that online submission is unavailable, and nothing is sent. This is not a broken
form — it is the honest state.

The full server build (`npm run build` + `npm start`) keeps the real delivery adapter
(`/api/inquiries`, Resend or webhook, see `docs/IMPLEMENTATION_STATUS.md` §7). To take real
inquiries, deploy that build to a Node host and configure `RESEND_API_KEY` +
`INQUIRY_FROM_EMAIL` + `INQUIRY_TO_EMAIL`, or `INQUIRY_WEBHOOK_URL`.

## Business identity verification

A similarly named business appears at https://kalimeriscars.gr/ and has rental listings at https://kalimeris.car.gr/classifieds/ in Kozani. The user gave the brand name **Kalimeris Car Rentals**, but has not explicitly verified that the found sources belong to this exact client. Treat these as **possible sources**, not confirmed facts. Do not copy company logo, reviews, address, contact information, or photos without client confirmation and permissions.

## Business logic

A valid customer inquiry can be implemented without an availability API, but do not simulate confirmed booking/payment. No final prices, vehicle availability, insurance, pickup locations, terms or misleading testimonials until approved.

## Rights note

Original generated concept images are visual references, **not photographs of real company vehicles**. Unsplash photos are referenced through source/download URLs rather than redistributed in this ZIP. Their source licenses are documented in `assets/SOURCES.md`; confirm rights and relevant trademark implications before production.

## Intended website stack

Next.js (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui (Radix primitives) / React Hook Form + Zod / `next-intl` (`el` + `en`) / `Syne` + `Manrope` + `JetBrains Mono` typography (Pairing A) / Dual-theme CSS token system (Vibrant Warm Editorial Light Mode + Preserved Monochrome Dark Mode) / Lucide / Playwright (`17/17` E2E tests covering SSR/SSG routes, fleet filters, inquiry validation, and theme/responsive checks).
