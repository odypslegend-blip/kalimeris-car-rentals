# Project architecture

```text
src/
  app/
    (site)/
      [locale]/
        layout.tsx                  # root locale layout (ThemeProvider, NextIntlClientProvider, SmoothScroll)
        page.tsx                    # editorial home (Hero, 1+2 Fleet Bento, Style 2 Steps, Split Services Ledger, Heritage Spread)
        cars/
          page.tsx                  # fleet catalog with filters
          [slug]/page.tsx           # vehicle detail + gallery + specs + request panel
        services/page.tsx           # automotive services ledger
        request/page.tsx            # quote request form
        how-it-works/page.tsx       # rental process steps
        faq/page.tsx                # accordion Q&A
        about/page.tsx              # company heritage & principles
        contact/page.tsx            # pending contact disclosure + request link
        privacy/page.tsx            # draft privacy policy (noindex)
        rental-terms/page.tsx       # draft rental terms (noindex)
        error.tsx
        not-found.tsx
        [...rest]/page.tsx
    api/
      health/route.ts
      inquiries/route.ts            # server inquiry validation + rate limit + delivery
    globals.css                     # light-mode editorial tokens (:root), preserved .dark tokens, .road-divider, .automotive-frame
    icon.svg
    robots.ts
    sitemap.ts
  components/
    brand/{wordmark,automotive-accents}.tsx
    booking/{hero-search,location-select,date-range-picker,request-form,request-page-client}.tsx
    fleet/{empty-fleet-state,fleet-browser,fleet-filters,request-panel,vehicle-card,vehicle-gallery,vehicle-spec-row}.tsx
    home/hero-media.tsx
    layout/{disclosure-strip,language-switcher,mobile-nav,nav-links,site-footer,site-header,theme-toggle}.tsx
    motion/{animated-steps,book-call-button,kinetic-heading,reveal,smooth-scroll,spotlight-card}.tsx
    providers/{site-toaster,theme-provider}.tsx
    sections/{legal-document,legal-notice,page-header,prose,section-heading}.tsx
    ui/                             # Radix-backed shadcn/ui primitives (badge, button, card, dialog, etc.)
  lib/
    data/{fleet,locations}.ts
    inquiry/{rate-limit,reference,transport}.ts
    theme/{theme-init,theme-script}.ts
    validation/inquiry.ts
    vehicles/{store,types,view}.ts
    base-path.ts
    dates.ts
    media.ts
    search-params.ts
    seo.ts
    site.ts
    utils.ts
  i18n/
    navigation.ts
    request.ts
    routing.ts
  proxy.ts
messages/
  en.json
  el.json
public/
  images/
    reference/                      # licensed demo stock, never fake fleet
tests/
  e2e/{helpers,inquiry.spec,smoke.spec}.ts
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
