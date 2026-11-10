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
- Page `#F7F8F7`, cards `#FFFFFF`.
- Ink `#0E1720`, secondary `#58646B`.
- CTA `#087F78`, CTA hover `#076861`, subtle teal `#E7F5F2`.
- Stroke `#E2E8E7`, hairline `#EDF0F0`.
- Teal is for focused controls and CTAs, not arbitrary ornament.

### Typography
- Inter variable with Latin + Greek subset, 400/500/600/700/800.
- H1 desktop 52-64 px / line 1.06; mobile 34-40 px / 1.12.
- H2 desktop 32-40 px; section descriptions 16-18 px.
- Body 15-16 px with line-height 1.5. Label 12-13 px.
- Max text line width about 56-64 characters.

### Layout
- Container 1180-1240 px, side margin clamp 20-60 px.
- Desktop header 68-76 px, mobile 60-64 px.
- Homepage hero 540-660 px desktop; mobile must preserve first CTA without massive empty image.
- Booking search: white on-photo panel desktop; mobile stacked below hero or overlay only with sufficient contrast.
- Border radii: cards 14px, fields 9px, buttons 9px, main hero 18px.
- Use predictable 8/12/16/24/32/48/64 spacing, not arbitrary values.
- Desktop fleet grid 3 columns, tablet 2, mobile 1.
- Use consistent landscape image ratios: fleet cards 4:3; vehicle detail primary 16:10; thumbnails 3:2.

### Screen requirements
1. Home desktop: brand header, short punchy headline, optional lifestyle hero photo, centered booking widget, fleet intro below fold.
2. Fleet desktop: title and 4-6 logical category chips with small image-led vehicle cards, clear CTAs.
3. Vehicle desktop: car gallery, specs, inquiry panel, conditions tab or accordion.
4. Mobile home: compact header, clear headline, visible form controls; one primary CTA. Do not duplicate page navigation.

### Interaction requirements
- Focus rings 2px teal, visible against white/gray surfaces.
- Hover transitions 140-220ms; reduce motion when requested.
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
