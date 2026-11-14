# Design specification: Kalimeris Car Rentals

## Core direction
Inspired by Virtuo's **clarity**, not its proprietary code or layout. Original, restrained rental-first website with clean car photography and an extremely legible reservation flow. The visual board is a directional concept, not a pixel-perfect implementation blueprint.

### Brand
- Brand display: `KALIMERIS` (primary) with `CAR RENTALS` tracked below.
- Original proposed K symbol: geometric teal monogram. SVG in `assets/brand/`, approval required.
- Tone: reassuring, practical, premium by execution instead of ostentatious luxury.
- English sample hero: `Drive with confidence.` / `Find the right car for your next trip.`
- Greek copy should be naturally localized, not literal word-for-word translation.
- Do not use `Drive Greece your way` if client only operates in Kozani; use region-agnostic copy by default.

### Palette

**Light mode (`:root` — Vibrant Editorial Identity):**
- Main background `#F5F2EA`, surface `#FFFFFF`, elevated surface `#ECE7DC`, warm surface `#EAE3D5`.
- Primary text `#0E1720`, muted text `#525E66`.
- Brand teal `#087F78`, hover `#066660`, subtle teal `#E4F2EF`.
- Vibrant orange `#FF693B` (energetic editorial accents, eyebrows, active route indicators) and warm yellow `#F4C95D` (selective heritage badges and small visual highlights).
- Borders `#DDE2DF`, hairline `#E5E2D9`, control border `#7F8B87`.
- Contrast is deliberate: do not apply every accent color to every section; preserve teal as the primary brand color.

**Dark mode (`.dark` — Preserved Monochrome Identity):**
- Background `#1C1C1C`, surface `#242424`, elevated `#2C2C2C`.
- Primary text `#F5F5F5`, muted `#A3A3A3`, brand `#FFFFFF`.
- Border `#333333`, hairline `#282828`.
- `--token-surface-warm`, `--token-accent-orange*`, and `--token-accent-yellow*` map to monochrome dark tokens in `.dark` so light-mode warmth never leaks into dark mode.

### Typography (Pairing A)
- Display headings: `Syne` (`--font-syne`, weights 600/700/800, Greek + Latin subsets, tight editorial tracking).
- Body & UI copy: `Manrope` (`--font-manrope`, weights 400/500/600/700, Greek + Latin subsets).
- Technical labels & section indices: `JetBrains Mono` (`--font-jetbrains-mono`, weights 500/600, tracked uppercase telemetry).
- H1 desktop 52-64 px / line 1.06; mobile 34-40 px / 1.12.
- H2 desktop 32-40 px; section descriptions 16-18 px.
- Body 15-16 px with line-height 1.5. Label 12-13 px.
- Max text line width about 56-64 characters.

### Layout
- Container 1180-1240 px, side margin clamp 20-60 px.
- Desktop header 68-76 px with `1980` heritage pill and orange active nav indicator (`dark:bg-brand`); mobile 60-64 px.
- Homepage editorial hero (540-660 px desktop) with route telemetry strip, warm scrim gradient, and spotlight search dock; mobile preserves first CTA cleanly.
- Homepage showcase (`1+2` Flagship Fleet Bento): large featured vehicle lead card paired with asymmetric secondary fleet cards.
- Homepage rental process (Style 2): `AnimatedSteps` interactive route telemetry stepper with automotive timeline indicators.
- Homepage services (Asymmetric Split Services Ledger): sticky `5/12` header column (`ChassisIllustration` accent on `bg-surface-warm/60`) + `7/12` numbered service cards.
- Homepage heritage spread: editorial typography featuring `1980`, `600 m²`, and `24/7` automotive identity markers (`HeritageBadge`).
- Footer topped with `.road-divider` dashed road marking motif.
- Reusable automotive framing primitives: `HeritageBadge`, `RouteIndicator`, `TechnicalDivider`, `ChassisIllustration` (`src/components/brand/automotive-accents.tsx`) and `.automotive-frame` / `.road-divider` (`src/app/globals.css`).
- Border radii: cards 14px, fields 9px, buttons 9px, main hero 18px.
- Use predictable 8/12/16/24/32/48/64 spacing, not arbitrary values.
- Desktop fleet grid 3 columns, tablet 2, mobile 1.
- Use consistent landscape image ratios: fleet cards 4:3; vehicle detail primary 16:10; thumbnails 3:2.

### Screen requirements
1. Home desktop: brand header, editorial punchy headline + telemetry strip, spotlight booking widget, `1+2` flagship fleet bento, interactive Style 2 rental process stepper, asymmetric split services ledger, and company heritage spread.
2. Fleet desktop: warm elevated `PageHeader`, 4-6 logical category chips, automotive-framed image-led vehicle cards with `DEMO` / category badges and `4px` arrow CTAs.
3. Vehicle desktop: car gallery, specs table, inquiry panel, conditions tab or accordion.
4. Mobile home: compact header, clear headline, visible form controls; one primary CTA. Do not duplicate page navigation.

### Interaction requirements
- Focus rings 2px teal (`--token-brand`), visible against warm sand/white surfaces (monochrome white in `.dark`).
- Motion & micro-interactions: `--token-duration-fast` `180ms`, `--token-duration-normal` `220ms`, `--token-duration-slow` `300ms`; button arrow shift `4px` (`translate-x-1`); card image hover scale `1.03`; reduce motion when requested (`prefers-reduced-motion`).
- Accessible popover-based date range picker and explicit labels.
- Date logic: return > pickup; prohibit past dates; use locale-aware formatting. Validate server-side too.
- Booking search should use state/search params into fleet results, not silent button action.
- Vehicle cards open details; inquiry links preserve selected vehicle, pickup/return and dates.
- Mobile Nav uses accessible sheet with focus control.
- No invented promotions, fake reviews, countdowns, or fake scarcity.

### Business-context caveat
A possible Kalimeris business operates in Kozani. Until client confirms, do not publish location-specific claims or use Mediterranean islands as an implied operating area. Lifestyle coast imagery is only a visual reference. Prefer regional/neutral photo for production hero.

### Accessibility and SEO
- WCAG 2.2 AA target; alt text, focus, labels, keyboard and screen-reader announcements.
- Greek and English HTML lang, translated metadata, sitemap/hreflang/canonical where appropriate.
- Optimize LCP, CLS, caching and image responsiveness. Do not hide critical copy inside images.
