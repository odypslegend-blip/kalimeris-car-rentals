import Image from "next/image";
import {
  ArrowRight,
  Car,
  Fuel,
  Gauge,
  Package,
  UsersRound,
  Wrench
} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {HeroSearch} from "@/components/booking/hero-search";
import {HeroMedia} from "@/components/home/hero-media";
import {Reveal} from "@/components/motion/reveal";
import {SectionHeading} from "@/components/sections/section-heading";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {assetPath} from "@/lib/base-path";
import {getVehicleName} from "@/lib/data/fleet";
import {heroVideoSrc} from "@/lib/media";
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

  const t = await getTranslations("Home");
  const meta = await getTranslations("Meta");
  const bookingT = await getTranslations("Booking");
  const fleetT = await getTranslations("Fleet");
  const categories = await getTranslations("Categories");
  const fuels = await getTranslations("Fuel");
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
              <h1 className="text-[2.375rem] font-extrabold leading-[1.07] tracking-[-0.03em] text-ink sm:text-[3rem] lg:text-[3.875rem] lg:leading-[1.04]">
                {t("title")}
              </h1>

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
                />
              </svg>

              <p className="mt-5 max-w-[44ch] text-[1.0625rem] leading-relaxed text-ink">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="page-shell relative z-10 mt-4 lg:-mt-20">
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

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:[&>li:nth-child(3)]:hidden xl:[&>li:nth-child(3)]:block">
            {featuredFleet.map((vehicle, index) => {
              const name = getVehicleName(vehicle);
              const alt =
                locale === "el"
                  ? vehicle.gallery[0].altEl
                  : vehicle.gallery[0].altEn;
              const facts = [
                `${vehicle.seats} ${fleetT("seatsShort")}`,
                fuels(vehicle.fuel)
              ];

              return (
                <li key={vehicle.slug}>
                  <Reveal delay={index * 70}>
                    <Link
                      href={`/cars/${vehicle.slug}`}
                      prefetch={false}
                      className="group block overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-[var(--token-duration-normal)] ease-brand hover:-translate-y-0.5 hover:shadow-panel"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-background">
                        <Image
                          src={assetPath(vehicle.image)}
                          alt={alt}
                          fill
                          quality={90}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-[var(--token-duration-slow)] ease-brand group-hover:scale-[1.02]"
                        />
                        <Badge
                          variant="demo"
                          className="absolute left-3 top-3 shadow-sm"
                        >
                          {t("fleet.demo")}
                        </Badge>
                      </div>

                      <div className="flex items-start justify-between gap-3 p-5">
                        <div className="min-w-0">
                          <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand">
                            {categories(vehicle.category)}
                          </p>
                          <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug text-ink">
                            {name}
                          </h3>
                          <ul className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
                            {facts.map((fact, index) => (
                              <li
                                key={fact}
                                className="inline-flex items-center gap-1.5"
                              >
                                {index === 0 ? (
                                  <UsersRound
                                    aria-hidden="true"
                                    className="size-3.5 text-muted"
                                  />
                                ) : (
                                  <Fuel
                                    aria-hidden="true"
                                    className="size-3.5 text-muted"
                                  />
                                )}
                                {fact}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <span
                          aria-hidden="true"
                          className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand group-hover:border-brand group-hover:bg-brand-subtle"
                        >
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>

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

          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-line pt-6">
                <Reveal delay={index * 80}>
                  <span className="text-[0.6875rem] font-bold tracking-[0.2em] text-brand">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-[1.0625rem] font-semibold leading-snug text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[40ch] text-[0.9375rem] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Services — workshop, tuning, parts and rental at the same site. */}
      <section className="py-16 md:py-24">
        <div className="page-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <SectionHeading
                eyebrow={t("services.eyebrow")}
                title={t("services.title")}
                description={t("services.description")}
              />
            </Reveal>
            <Link
              href="/services"
              prefetch={false}
              className="group hidden min-h-11 shrink-0 items-center gap-2 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] hover:text-brand-hover md:inline-flex"
            >
              {t("services.cta")}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {services.map((item, index) => {
              const Icon = serviceIcons[index] ?? Wrench;

              return (
                <li key={item.title} className="bg-surface p-6">
                  <Reveal delay={index * 60}>
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 items-center justify-center rounded-full bg-brand-subtle text-brand"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-[1.0625rem] font-semibold leading-snug text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <Link
            href="/services"
            prefetch={false}
            className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] hover:text-brand-hover md:hidden"
          >
            {t("services.cta")}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-0.5"
            />
          </Link>
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
