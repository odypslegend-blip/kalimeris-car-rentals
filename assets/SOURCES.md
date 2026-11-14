# Exact visual assets and usage permissions

The next four photo assets are **named download targets**, not bundled binaries. The URLs point to specific free Unsplash photo pages and their direct image resources. Refer to `ASSET_MANIFEST.json` for each filename and context.

| Filename | Exact photo page | Photographer | Usage |
| --- | --- | --- | --- |
| `hero-greece-delphi-road.jpg` | https://unsplash.com/photos/a-road-with-a-mountain-in-the-background-hlNAXkdNH3E | Rohan Gangopadhyay | Scenic road hero, location-neutral |
| `hero-greece-crete-coast.jpg` | https://unsplash.com/photos/a-car-driving-down-a-road-next-to-the-ocean-oS4WdXHNUo0 | Tadeusz Zachwieja | Coastal alternative, only if business geography supports it |
| `vehicle-interior-placeholder.jpg` | https://unsplash.com/photos/the-interior-of-a-car-with-a-steering-wheel-and-dashboard-vUvgfalQPK8 | J Z | Gallery design testing only, shows another vehicle |
| `vehicle-suv-placeholder.jpg` | https://unsplash.com/photos/white-suv-parked-on-road-Lvnu1TEnHH0 | Karl Koehler | Fleet layout testing only, not verified Kalimeris vehicle |

Unsplash license: https://unsplash.com/license (allows commercial use of Unsplash images, subject to terms; not permission to imply manufacturer endorsement or pretend the photographed vehicle is in the business fleet). Credit is appreciated. If sourcing via Unsplash API, API attribution guidelines additionally apply: https://help.unsplash.com/en/articles/2511315-guideline-attribution

Download script (agent can run in connected environment after verifying current status): `scripts/fetch_reference_photos.sh`. Store `public/images/reference/` with `DEMO / STOCK REFERENCE` labeling in prototypes. No copyrighted competitor or car.gr photos are redistributed in this bundle.

## Hero Video Asset (`public/videos/hero-loop.mp4`)

| Title | Source page | Direct MP4 URL | Author | License | Local file | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| Electric car driving in the dark woods (`5Ic0LgEUgE`) | https://coverr.co/videos/electric-car-driving-in-the-dark-woods-5ic0lgeuge | https://cdn.coverr.co/videos/coverr-electric-car-driving-in-the-dark-woods-668/1080p.mp4 | Coverr Stock Library contributor (`isAiGenerated: false`, `isPremium: false`) | [Coverr License](https://coverr.co/license) | `public/videos/hero-loop.mp4` | DEMO — decorative car-driving hero background only; not client inventory. |

- Delivered specs: 1280×720 H.264 High L4.1 (`yuv420p`, `avc1`), 24 fps, 10.83 s loop, muted (no audio track), `-movflags +faststart`, 1,664,976 bytes (~1.23 Mbps).
- License scope: Coverr Stock Library free license permits commercial and personal projects including websites and client work without watermarks or required attribution (prohibits standalone file resale/redistribution and AI training). Replace with client-owned/authorised footage before final launch if real fleet motion is desired.

## Fonts
- **Inter**, licensed SIL Open Font License; Greek + Latin support: https://fonts.google.com/specimen/Inter and https://github.com/google/fonts/tree/main/ofl/inter
- Preferred implementation is `next/font/google` with appropriate subsets; do not bundle font files in this ZIP.
- Manrope also lists Greek support if desired as a secondary exploration: https://github.com/google/fonts/blob/main/ofl/manrope/METADATA.pb

## Icons
- **Lucide React**: https://lucide.dev/guide/packages/lucide-react
- Official source/license: https://github.com/lucide-icons/lucide and https://github.com/lucide-icons/lucide/blob/main/LICENSE
- Named icons listed in `docs/COMPONENT_LIBRARY_MAP.md`. Install via npm/pnpm; no icon web scraping required.

## Real car photo production checklist
Request from owner: 3/4 exterior shots (front, back, interior), correct vehicle/year/trim, authorizations to use, accurate alt text and actual location if photos show premises. Use consistent 4:3 framing at >1200px, convert to WebP/AVIF, keep master originals privately. Never substitute generic photos on actual vehicle listings without a clearly visible disclaimer.
