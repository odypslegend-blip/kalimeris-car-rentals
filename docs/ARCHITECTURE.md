# Suggested project architecture (adapt to existing repo)

```text
src/
  app/
    [locale]/
      layout.tsx
      page.tsx                    # home
      cars/
        page.tsx                  # fleet
        [slug]/page.tsx           # vehicle
      request/page.tsx           # quote request
      how-it-works/page.tsx
      faq/page.tsx
      about/page.tsx
      contact/page.tsx
      privacy/page.tsx
      rental-terms/page.tsx
    api/
      inquiries/route.ts          # optional server route
  components/
    layout/{site-header,mobile-nav,site-footer,language-switcher}.tsx
    booking/{hero-search,location-select,date-range-picker,request-form}.tsx
    fleet/{vehicle-card,fleet-filters,vehicle-gallery,vehicle-spec-row}.tsx
    ui/                           # shadcn generated UI primitives
  lib/
    data/fleet.ts                 # verified data adapter
    validation/inquiry.ts
    inquiry/submit.ts             # real backend adapter
    media.ts
  i18n/
    routing.ts
    request.ts
messages/
  en.json
  el.json
public/
  brand/                           # approved brand assets only
  images/
    reference/                     # licensed demo stock, never fake fleet
    fleet/{vehicle-slug}/          # approved client-supplied photographs

Tests:
tests/e2e/{home,fleet,vehicle,inquiry,i18n}.spec.ts
```

## Data contract
- Vehicle: id, slug, make, model, year?, group/category, transmission?, passengerCount?, luggageCount?, fuel?, imageAssets[], description, publicStatus, approvedAt?; optional price ONLY if approved and accurate.
- ImageAsset: path, altEn, altEl, source, license, rightsApproved, photoType (client/stock/generated), status.
- Inquiry: vehicleId?, pickupLocation, returnLocation, pickupDateTime, returnDateTime, customerName, email, phone?, message?, privacyConsent, createdAt; explicit status `received`/`failed`.
- Sensitive inquiry PII: minimum necessary, private data access only, retention policy, no analytics payload with personal details.

## Booking v1
A functioning inquiry funnel (not guaranteed reservation) is appropriate until owner supplies inventory API, price logic and booking contract. Confirm delivery mechanism and email first. Do not return a success state when email delivery fails. Server validates request and rate limiting. Show a meaningful reference code only if actually generated/persisted.

## Content policy
Client must confirm public address, contact methods, pickup/return locations, opening hours, insurance, deposits, minimum age/driver requirements, mileage rules, cancellations, rental availability, policies, GDPR/privacy text and vehicle images. Do not infer these from another business with a similar name.
