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

## Business identity verification

A similarly named business appears at https://kalimeriscars.gr/ and has rental listings at https://kalimeris.car.gr/classifieds/ in Kozani. The user gave the brand name **Kalimeris Car Rentals**, but has not explicitly verified that the found sources belong to this exact client. Treat these as **possible sources**, not confirmed facts. Do not copy company logo, reviews, address, contact information, or photos without client confirmation and permissions.

## Business logic

A valid customer inquiry can be implemented without an availability API, but do not simulate confirmed booking/payment. No final prices, vehicle availability, insurance, pickup locations, terms or misleading testimonials until approved.

## Rights note

Original generated concept images are visual references, **not photographs of real company vehicles**. Unsplash photos are referenced through source/download URLs rather than redistributed in this ZIP. Their source licenses are documented in `assets/SOURCES.md`; confirm rights and relevant trademark implications before production.

## Intended website stack

Next.js / TypeScript / Tailwind CSS / shadcn/ui / React Hook Form + Zod / next-intl / Lucide / Playwright. Reuse existing stack if already suitable.
