# Delivery QA checklist

## Visual
- [ ] Header, hero and booking widget follow the original supplied concept direction.
- [ ] Desktop 1440, 1024, 768 and mobile 390/375 visually reviewed.
- [ ] Vehicle cards align; no overflow, clipped text or stretched images.
- [ ] Original brand SVG proposal approved or replaced with official identity.
- [ ] Greek glyphs and language switching render correctly.

## Functionality
- [ ] Date picker forbids past dates and invalid return-before-pickup.
- [ ] Search transfers location/date selections to fleet filtering and onward.
- [ ] Vehicle cards navigate to correct detail route.
- [ ] Gallery works with touch, keyboard, and loading fallbacks.
- [ ] Inquiry submits to a real configured destination and reports verified success/failure.
- [ ] Server-side Zod schema rejects invalid input. Anti-spam/rate controls addressed.
- [ ] Mobile menu and all CTAs have working behavior.
- [ ] Empty fleet, image errors and malformed query strings handled.
- [ ] No fake reviews, fabricated rates, unverified availability or customer claims.

## Testing and hand-off
- [ ] Typecheck, lint, build, E2E smoke tests passing.
- [ ] Playwright screenshots saved for all 4 target screens.
- [ ] Images optimized with alt text and provenance.
- [ ] Accessibility tested with keyboard, focus and meaningful labels.
- [ ] Legal copy and operational facts confirmed or clearly flagged pending.
- [ ] `docs/IMPLEMENTATION_STATUS.md` lists deployed features, blockers, and missing approvals.
