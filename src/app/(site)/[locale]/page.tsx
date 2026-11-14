import type {CSSProperties} from "react";
import Image from "next/image";
import {
  ArrowRight,
  Car,
  Cog,
  Fuel,
  Gauge,
  Package,
  UsersRound,
  Wrench
} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {HeroSearch} from "@/components/booking/hero-search";
import {HeroMedia} from "@/components/home/hero-media";
import {AnimatedSteps} from "@/components/motion/animated-steps";
import {HeroKineticHeading} from "@/components/motion/kinetic-heading";
import {Reveal} from "@/components/motion/reveal";
import {SpotlightCard} from "@/components/motion/spotlight-card";
import {SectionHeading} from "@/components/sections/section-heading";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {assetPath} from "@/lib/base-path";
import {getVehicleName} from "@/lib/data/fleet";
import {heroVideoSrc, heroVideoWebmSrc} from "@/lib/media";
import {siteUrl} from "@/lib/seo";
import {site} from "@/lib/site";
import {getPublishedVehicles} from "@/lib/vehicles/store";
import {toVehicleView} from "@/lib/vehicles/view";

type HomePageProps = {
  params: Promise<{locale: string}>;
};

type Step = {
  title: string;
  body: string;
};

type ServiceItem = {
  title: string;
  body: string;
};

// One icon per service card, in the same order as `Home.services.items`.
const serviceIcons = [Wrench, Gauge, Package, Car] as const;

export const revalidate = 30;

export default async function HomePage({params}: HomePageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [t, meta, bookingT, fleetT, vehicleT, categories, transmissions, fuels] =
    await Promise.all([
      getTranslations("Home"),
      getTranslations("Meta"),
      getTranslations("Booking"),
      getTranslations("Fleet"),
      getTranslations("Vehicle"),
      getTranslations("Categories"),
      getTranslations("Transmission"),
      getTranslations("Fuel")
    ]);
  const steps = t.raw("steps.items") as Step[];
  const services = t.raw("services.items") as ServiceItem[];

  // Featured first, then the remaining published vehicles fill the row so a
  // small fleet never leaves an empty third slot. No record is repeated.
  const publishedVehicles = await getPublishedVehicles();
  const featuredFleet = [
    ...publishedVehicles.filter((vehicle) => vehicle.featured),
    ...publishedVehicles.filter((vehicle) => !vehicle.featured)
  ]
    .slice(0, 3)
    .map((vehicle) => toVehicleView(vehicle, locale));
  const [flagship, ...secondaryFleet] = featuredFleet;

  // Sitewide identity only: the WebSite node plus the single verified business
  // entity behind the rental, workshop and parts pages. No pricing,
  // availability, review or warranty claim is published here.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: meta("brand"),
        url: siteUrl,
        inLanguage: ["el", "en"]
      },
      {
        "@type": ["AutoRental", "AutoRepair"],
        "@id": `${siteUrl}/#business`,
        name: locale === "el" ? site.tradingNameEl : site.tradingNameEn,
        legalName: locale === "el" ? site.legalNameEl : site.legalNameEn,
        url: siteUrl,
        telephone: "+302461028779",
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress:
            locale === "el" ? site.address.streetEl : site.address.streetEn,
          addressLocality: locale === "el" ? site.address.cityEl : site.address.cityEn,
          postalCode: site.address.postalCode,
          addressCountry: "GR"
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "19:30"
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "09:00",
            closes: "13:00"
          }
        ],
        sameAs: [site.social.facebook, site.social.tiktok],
        areaServed: locale === "el" ? "Κοζάνη" : "Kozani",
        description: meta("description")
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}}
      />

      {/* 1. Scenic hero + the booking panel is the only primary action. */}
      <section className="relative">
        <div className="relative isolate overflow-hidden bg-media">
          <HeroMedia
            posterSrc={assetPath("/images/reference/hero-greece-delphi-road.jpg")}
            videoSrc={heroVideoSrc}
            webmSrc={heroVideoWebmSrc}
            className="object-cover object-[60%_78%] lg:object-[54%_76%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--token-scrim)/0.97)_0%,rgb(var(--token-scrim)/0.88)_30%,rgb(var(--token-scrim)/0.52)_52%,rgb(var(--token-scrim)/0.10)_72%,rgb(var(--token-scrim)/0)_90%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgb(var(--token-scrim)/0.90)] to-transparent lg:hidden dark:lg:block dark:lg:h-20 dark:lg:from-[rgb(var(--token-scrim)/0.92)]"
          />

          <div className="page-shell relative flex min-h-[470px] items-center pb-12 pt-10 sm:min-h-[540px] lg:min-h-[620px] lg:pb-36 lg:pt-16">
            {/* Below lg the copy sits directly on the photograph, where the
                subtitle lost its 4.5:1 contrast. A near-opaque panel keeps the
                text legible; from lg up the panel disappears and the hero is
                photo-forward again. */}
            <div className="max-w-[34rem] rounded-card bg-background/[0.96] p-4 sm:p-5 lg:rounded-none lg:bg-transparent lg:p-0">
              <HeroKineticHeading>{t("title")}</HeroKineticHeading>

              <svg
                aria-hidden="true"
                viewBox="0 0 140 12"
                className="mt-4 h-3 w-[132px] text-brand"
                fill="none"
              >
                <path
                  d="M2 8.5C36 2.5 101 1.5 138 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                  className="hero-underline-path"
                />
              </svg>

              <p
                className="hero-load-rise mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-ink"
                style={{"--hero-delay": "180ms"} as CSSProperties}
              >
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div
          className="hero-load-rise page-shell relative z-10 mt-4 lg:-mt-20"
          style={{"--hero-delay": "280ms"} as CSSProperties}
        >
          <HeroSearch helperText={bookingT("helper")} />
        </div>
      </section>

      {/* 2. Fleet preview — illustrative, DEMO-badged, no prices. */}
      <section className="py-16 md:py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <SectionHeading
                eyebrow={t("fleet.eyebrow")}
                title={t("fleet.title")}
                description={t("fleet.description")}
              />
            </Reveal>
            <Link
              href="/cars"
              prefetch={false}
              className="group hidden min-h-11 shrink-0 items-center gap-2 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] hover:text-brand-hover md:inline-flex"
            >
              {t("fleet.viewAll")}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          {flagship ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
              <div
                className={
                  secondaryFleet.length > 0
                    ? "min-w-0 lg:col-span-7"
                    : "min-w-0 lg:col-span-12"
                }
              >
                <Reveal delay={0} variant="scale" className="h-full">
                  <SpotlightCard className="h-full border border-line bg-surface shadow-card transition-shadow duration-[var(--token-duration-normal)] ease-brand hover:shadow-panel">
                    <Link
                      href={`/cars/${flagship.slug}`}
                      prefetch={false}
                      className="group flex h-full flex-col overflow-hidden rounded-card focus-visible:outline-offset-[-2px]"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background sm:aspect-[16/9]">
                        <Image
                          src={assetPath(flagship.image)}
                          alt={
                            locale === "el"
                              ? flagship.gallery[0].altEl
                              : flagship.gallery[0].altEn
                          }
                          fill
                          quality={90}
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          className="object-cover transition-transform duration-[var(--token-duration-slow)] ease-brand group-hover:scale-[1.02]"
                        />
                        <Badge
                          variant="demo"
                          className="absolute left-4 top-4 shadow-sm"
                        >
                          {t("fleet.demo")}
                        </Badge>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                          <div className="min-w-0">
                            <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] tabular-nums text-brand">
                              01 · {categories(flagship.category)}
                            </p>
                            <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-ink sm:text-3xl">
                              {getVehicleName(flagship)}
                            </h3>
                            {flagship.modelNote ? (
                              <p className="mt-1.5 text-[0.875rem] leading-snug text-muted">
                                {flagship.modelNote}
                              </p>
                            ) : null}
                            <span className="sr-only">
                              {" "}
                              — {fleetT("cardCta")}
                            </span>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {typeof flagship.pricePerDay === "number" ? (
                              <p className="font-mono text-sm font-semibold tabular-nums text-ink">
                                {flagship.pricePerDay} €{" "}
                                <span className="font-normal text-muted">
                                  / {locale === "el" ? "ημέρα" : "day"}
                                </span>
                              </p>
                            ) : null}
                            <span
                              aria-hidden="true"
                              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand group-hover:border-brand group-hover:bg-brand-subtle"
                            >
                              <ArrowRight className="size-4" />
                            </span>
                          </div>
                        </div>

                        <dl className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
                          <div className="min-w-0 px-3 py-3 sm:px-6 sm:py-3.5">
                            <dt className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted sm:tracking-[0.12em]">
                              <UsersRound
                                aria-hidden="true"
                                className="hidden size-3.5 shrink-0 text-muted sm:inline-block"
                              />
                              <span>{vehicleT("labels.seats")}</span>
                            </dt>
                            <dd className="mt-1 truncate font-mono text-[0.75rem] font-medium tabular-nums text-ink sm:text-[0.8125rem]">
                              {flagship.seats} {fleetT("seatsShort")}
                            </dd>
                          </div>
                          <div className="min-w-0 px-3 py-3 sm:px-6 sm:py-3.5">
                            <dt className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted sm:tracking-[0.12em]">
                              <Cog
                                aria-hidden="true"
                                className="hidden size-3.5 shrink-0 text-muted sm:inline-block"
                              />
                              <span>{vehicleT("labels.transmission")}</span>
                            </dt>
                            <dd className="mt-1 truncate font-mono text-[0.75rem] font-medium tabular-nums text-ink sm:text-[0.8125rem]">
                              {transmissions(flagship.transmission)}
                            </dd>
                          </div>
                          <div className="min-w-0 px-3 py-3 sm:px-6 sm:py-3.5">
                            <dt className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted sm:tracking-[0.12em]">
                              <Fuel
                                aria-hidden="true"
                                className="hidden size-3.5 shrink-0 text-muted sm:inline-block"
                              />
                              <span>{vehicleT("labels.fuel")}</span>
                            </dt>
                            <dd className="mt-1 truncate font-mono text-[0.75rem] font-medium tabular-nums text-ink sm:text-[0.8125rem]">
                              {fuels(flagship.fuel)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </Link>
                  </SpotlightCard>
                </Reveal>
              </div>

              {secondaryFleet.length > 0 ? (
                <ul className="flex min-w-0 flex-col gap-6 lg:col-span-5">
                  {secondaryFleet.map((vehicle, index) => {
                    const name = getVehicleName(vehicle);
                    const alt =
                      locale === "el"
                        ? vehicle.gallery[0].altEl
                        : vehicle.gallery[0].altEn;
                    const cardIndex = String(index + 2).padStart(2, "0");

                    return (
                      <li key={vehicle.slug} className="flex min-w-0 flex-1">
                        <Reveal
                          delay={(index + 1) * 70}
                          variant="scale"
                          className="h-full w-full"
                        >
                          <SpotlightCard className="h-full border border-line bg-surface shadow-card transition-shadow duration-[var(--token-duration-normal)] ease-brand hover:shadow-panel">
                            <Link
                              href={`/cars/${vehicle.slug}`}
                              prefetch={false}
                              className="group grid h-full items-stretch overflow-hidden rounded-card focus-visible:outline-offset-[-2px] sm:grid-cols-[11rem_1fr] lg:grid-cols-[9.5rem_1fr] xl:grid-cols-[11.5rem_1fr]"
                            >
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-background sm:aspect-auto sm:h-full sm:min-h-[11rem]">
                                <Image
                                  src={assetPath(vehicle.image)}
                                  alt={alt}
                                  fill
                                  quality={90}
                                  sizes="(min-width: 1280px) 184px, (min-width: 1024px) 152px, (min-width: 640px) 176px, 100vw"
                                  className="object-cover transition-transform duration-[var(--token-duration-slow)] ease-brand group-hover:scale-[1.02]"
                                />
                                <Badge
                                  variant="demo"
                                  className="absolute left-3 top-3 shadow-sm"
                                >
                                  {t("fleet.demo")}
                                </Badge>
                              </div>

                              <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] tabular-nums text-brand">
                                      {cardIndex} · {categories(vehicle.category)}
                                    </p>
                                    <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-ink sm:text-xl">
                                      {name}
                                    </h3>
                                    {vehicle.modelNote ? (
                                      <p className="mt-1 text-[0.8125rem] leading-snug text-muted">
                                        {vehicle.modelNote}
                                      </p>
                                    ) : null}
                                    <span className="sr-only">
                                      {" "}
                                      — {fleetT("cardCta")}
                                    </span>
                                  </div>

                                  <span
                                    aria-hidden="true"
                                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand group-hover:border-brand group-hover:bg-brand-subtle"
                                  >
                                    <ArrowRight className="size-4" />
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-hairline pt-3">
                                  <p className="font-mono text-[0.75rem] leading-relaxed tabular-nums text-muted">
                                    {vehicle.seats} {fleetT("seatsShort")} ·{" "}
                                    {transmissions(vehicle.transmission)} ·{" "}
                                    {fuels(vehicle.fuel)}
                                  </p>
                                  {typeof vehicle.pricePerDay === "number" ? (
                                    <p className="font-mono text-[0.8125rem] font-semibold tabular-nums text-ink">
                                      {vehicle.pricePerDay} €{" "}
                                      <span className="font-normal text-muted">
                                        / {locale === "el" ? "ημέρα" : "day"}
                                      </span>
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </Link>
                          </SpotlightCard>
                        </Reveal>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}

          <p className="mt-5 max-w-[76ch] text-[0.75rem] leading-relaxed text-muted">
            {t("fleet.note")}
          </p>

          <Link
            href="/cars"
            prefetch={false}
            className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] hover:text-brand-hover md:hidden"
          >
            {t("fleet.viewAll")}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* 3. How it works. */}
      <section className="border-y border-line bg-surface py-16 md:py-20">
        <div className="page-shell">
          <SectionHeading eyebrow={t("steps.eyebrow")} title={t("steps.title")} />

          <AnimatedSteps steps={steps} variant="home" headingLevel="h3" className="mt-10" />
        </div>
      </section>

      {/* 4. Services — workshop, tuning, parts and rental at the same site. */}
      <section className="py-16 md:py-24">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-4">
              <Reveal>
                <SectionHeading
                  eyebrow={t("services.eyebrow")}
                  title={t("services.title")}
                  description={t("services.description")}
                />
                <Link
                  href="/services"
                  prefetch={false}
                  className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] hover:text-brand-hover"
                >
                  {t("services.cta")}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-0.5"
                  />
                </Link>
              </Reveal>
            </div>

            <ul className="min-w-0 divide-y divide-hairline border-y border-hairline lg:col-span-8">
              {services.map((item, index) => {
                const Icon = serviceIcons[index] ?? Wrench;
                const rowIndex = String(index + 1).padStart(2, "0");

                return (
                  <li key={item.title} className="py-1">
                    <Reveal delay={index * 60}>
                      <SpotlightCard
                        tilt={false}
                        className="group grid gap-4 rounded-xl bg-transparent px-3 py-5 transition-colors duration-[var(--token-duration-fast)] ease-brand hover:bg-surface-elevated/70 sm:grid-cols-[4.25rem_1fr] sm:items-start sm:px-5 sm:py-6"
                      >
                        <div className="flex items-center gap-2.5 sm:pt-0.5">
                          <span className="font-mono text-xs font-semibold tracking-[0.12em] tabular-nums text-brand">
                            {rowIndex}
                          </span>
                          <span
                            aria-hidden="true"
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand group-hover:bg-brand group-hover:text-brand-ink"
                          >
                            <Icon className="size-4" />
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold leading-snug text-ink">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted">
                            {item.body}
                          </p>
                        </div>
                      </SpotlightCard>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Trust and contact. */}
      <section className="py-16 md:py-24">
        <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow={t("trust.eyebrow")}
              title={t("trust.title")}
              description={t("trust.body")}
            />
          </Reveal>

          <Reveal delay={90}>
            <div className="rounded-card border border-line bg-brand-subtle p-6 md:p-8">
              <p className="text-[0.875rem] leading-relaxed text-ink/80">
                {t("trust.note")}
              </p>
              <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
                <Link href="/contact" prefetch={false}>
                  {t("trust.cta")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
