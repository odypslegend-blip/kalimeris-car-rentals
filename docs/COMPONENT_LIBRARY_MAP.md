# Exact components, packages and links for the coding agent

## Core framework
| Required function | Package or component | Official docs / repo | Notes |
| --- | --- | --- | --- |
| Routing/SSR | `next` App Router | https://nextjs.org/docs/app | Only if creating a new project or existing stack compatible |
| Styles | `tailwindcss` | https://tailwindcss.com/docs | Token-based CSS variables |
| Typed UI | `typescript` | https://www.typescriptlang.org/docs/ | Strict mode |
| Greek + English | `next-intl` | https://next-intl.dev/docs | Locale routing and dictionary keys |
| Font | `next/font/google` `Syne`, `Manrope`, `JetBrains Mono` (Pairing A) | https://nextjs.org/docs/app/getting-started/fonts | Explicit Greek+Latin subsets (`--font-syne`, `--font-manrope`, `--font-jetbrains-mono`) |
| Icons | `lucide-react` | https://lucide.dev/guide/packages/lucide-react | See exact icon list below |
| Form | `react-hook-form` | https://react-hook-form.com/docs | Controlled inputs, form state |
| Schema | `zod` | https://zod.dev/ | Shared server and client validation |
| End-to-end QA | `@playwright/test` | https://playwright.dev/docs/intro | Responsive screenshots and flows |

## shadcn/ui - choose one primitive implementation consistently
Official components: https://ui.shadcn.com/docs/components

| Actual component name | UI purpose | Official component URL |
| --- | --- | --- |
| `Button` | Search and inquiry CTA | https://ui.shadcn.com/docs/components/radix/button |
| `Input` | Name, email, phone, filter input | https://ui.shadcn.com/docs/components/radix/input |
| `Textarea` | Inquiry notes | https://ui.shadcn.com/docs/components/radix/textarea |
| `Select` | Pickup location and car classes | https://ui.shadcn.com/docs/components/radix/select |
| `Combobox` | Searchable locations if long list | https://ui.shadcn.com/docs/components/radix/combobox |
| `Calendar` | Pickup / return ranges | https://ui.shadcn.com/docs/components/radix/calendar |
| `Popover` | Calendar trigger | https://ui.shadcn.com/docs/components/radix/popover |
| `Card` | Fleet vehicles | https://ui.shadcn.com/docs/components/radix/card |
| `Badge` | Vehicle category / DEMO | https://ui.shadcn.com/docs/components/radix/badge |
| `Carousel` | Vehicle detail gallery (built on Embla) | https://ui.shadcn.com/docs/components/radix/carousel |
| `Sheet` | Mobile navigation / mobile filters | https://ui.shadcn.com/docs/components/radix/sheet |
| `Accordion` | Rental conditions / FAQs | https://ui.shadcn.com/docs/components/radix/accordion |
| `Tabs` | Overview / specifications / conditions | https://ui.shadcn.com/docs/components/radix/tabs |
| `Checkbox` | Privacy consent | https://ui.shadcn.com/docs/components/radix/checkbox |
| `Skeleton` | Loading cards | https://ui.shadcn.com/docs/components/radix/skeleton |
| `Sonner` | Success/error feedback after real backend response | https://ui.shadcn.com/docs/components/radix/sonner |

Suggested install in a NEW project (verify CLI and repo state first):

```bash
pnpm add next react react-dom react-hook-form zod @hookform/resolvers next-intl lucide-react
pnpm add -D typescript tailwindcss @playwright/test
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input textarea select combobox calendar popover card badge carousel sheet accordion tabs checkbox skeleton sonner
```

Use up-to-date framework scaffolding instructions for Tailwind and Next.js rather than copying bare dependency commands if initialization is needed. Check selected shadcn component implementation for compatibility. Do NOT add separate carousel dependency when shadcn's Embla carousel suffices.

## Custom automotive & editorial motion components

| Component / Module | File | Purpose |
| --- | --- | --- |
| `HeritageBadge`, `RouteIndicator`, `TechnicalDivider`, `ChassisIllustration` | `src/components/brand/automotive-accents.tsx` | Reusable editorial automotive badges (`ΑΠΟ ΤΟ 1980`), route telemetry indicators, technical numbered dividers, and wireframe chassis art |
| `AnimatedSteps` | `src/components/motion/animated-steps.tsx` | Style 2 interactive rental process stepper with route progression state and active step highlight |
| `SmoothScroll` | `src/components/motion/smooth-scroll.tsx` | Lenis smooth scroll wrapper + `--hero-parallax-y` CSS custom property updater (clamped `0..36px`) |
| `KineticHeading`, `BookCallButton`, `Reveal`, `SpotlightCard` | `src/components/motion/` | Editorial headline reveal, CTA micro-interaction, viewport reveals, and dual-mode card spotlight |
| `SectionHeading`, `PageHeader` | `src/components/sections/` | Optional monospaced `index` label, orange/brand eyebrow tick, and warm elevated light-mode page headers |

## Icons: exact named exports from lucide-react
- `MapPin`: pickup / return location
- `CalendarDays`: date selection
- `UsersRound`: seats
- `BriefcaseBusiness`: luggage (better choose clear suitcase symbol, or `Luggage`)
- `Gauge`: mileage
- `Fuel`: fuel type
- `CarFront`: vehicle navigation
- `ArrowRight`: CTA and card details
- `ChevronDown`: select affordance
- `Menu`: mobile navbar
- `Check`: verified inclusion
- `Clock3`: opening hours (only with verified hours)
- `Search`: fleet/search
- `SlidersHorizontal`: filters
- `Phone`, `Mail`: verified contact routes

Avoid icons as a substitute for text labels in booking forms.
