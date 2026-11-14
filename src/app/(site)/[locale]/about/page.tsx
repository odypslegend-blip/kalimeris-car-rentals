import type {Metadata} from "next";
import {ArrowRight, Car, KeyRound, Package, Wrench} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {HeritageBadge} from "@/components/brand/automotive-accents";
import {PageHeader} from "@/components/sections/page-header";
import {SectionHeading} from "@/components/sections/section-heading";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {site} from "@/lib/site";
import {cn} from "@/lib/utils";

type AboutPageProps = {
  params: Promise<{locale: string}>;
};

type Activity = {
  title: string;
  body: string;
};

type Stat = {
  value: string;
  label: string;
};

/** One label/value row of the company-facts definition list. */
function FactRow({label, value}: {label: string; value: string}) {
  return (
    <div className="grid gap-1 border-b border-hairline py-4 last:border-b-0 sm:grid-cols-[minmax(0,13rem)_1fr] sm:items-baseline sm:gap-6">
      <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="text-[0.9375rem] leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

export async function generateMetadata({
  params
}: AboutPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "About"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/about"),
    robots: {index: true, follow: true}
  };
}

export default async function AboutPage({params}: AboutPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("About");
  const isGreek = locale === "el";
  const stats = t.raw("stats") as Stat[];
  const activities = t.raw("activities") as Activity[];
  const numberFormat = new Intl.NumberFormat(isGreek ? "el-GR" : "en-US");

  const workshopFacts = [
    {
      label: isGreek ? "Συνεργεία στην Ευρώπη" : "Workshops in Europe",
      value: `${numberFormat.format(site.workshop.europeWorkshops)}+`
    },
    {
      label: isGreek ? "Παγκοσμίως" : "Worldwide",
      value: `${numberFormat.format(site.workshop.worldwideWorkshops)}+`
    },
    {
      label: isGreek ? "Συνεργείο" : "Workshop",
      value: `${site.workshop.areaSqm} m²`
    },
    {
      label: isGreek ? "Θέσεις εργασίας" : "Service bays",
      value: String(site.workshop.serviceBays)
    }
  ];

  const activityIcons = [Car, Wrench, Package, KeyRound] as const;

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/contact" prefetch={false}>
                {t("ctaPrimary")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/services" prefetch={false}>
                {t("ctaSecondary")}
              </Link>
            </Button>
          </>
        }
      />

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <dl className="grid grid-cols-1 divide-y divide-hairline overflow-hidden rounded-card border border-line bg-surface shadow-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:[&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-hairline md:grid-cols-4 md:[&>*:nth-child(n+3)]:border-t-0 dark:shadow-none">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex flex-col justify-between gap-4 p-6 md:p-7"
              >
                <div
                  aria-hidden="true"
                  className="flex items-center"
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      index === 0
                        ? "bg-accent-orange dark:bg-brand"
                        : "bg-brand/45 dark:bg-brand/50"
                    )}
                  />
                </div>

                <div className="flex flex-col-reverse gap-2">
                  <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-[1.75rem] font-bold leading-none tabular-nums tracking-[-0.03em] text-ink md:text-[2rem]">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-12 md:mt-16">
            <SectionHeading title={t("activitiesTitle")} />
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {activities.map((activity, index) => {
                const Icon = activityIcons[index] ?? Car;
                const isOrange = index === 1 || index === 3;
                return (
                  <li
                    key={activity.title}
                    className={cn(
                      "flex flex-col justify-between rounded-card border border-line border-t-2 bg-surface p-6 shadow-card dark:border-t dark:border-t-line dark:shadow-none",
                      isOrange ? "border-t-accent-orange" : "border-t-brand"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "inline-flex size-8 items-center justify-center rounded-full dark:bg-brand-subtle dark:text-brand",
                            isOrange
                              ? "bg-accent-orange-subtle text-accent-orange"
                              : "bg-brand-subtle text-brand"
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-[1.0625rem] font-bold leading-snug text-ink">
                        {activity.title}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                        {activity.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-12 md:py-16">
        <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              title={t("boschTitle")}
              description={t("boschBody")}
            />
            <HeritageBadge
              label="BOSCH CAR SERVICE"
              sublabel={
                isGreek
                  ? `${site.workshop.areaSqm} τ.μ. · ${site.workshop.serviceBays} ΘΕΣΕΙΣ`
                  : `${site.workshop.areaSqm} m² · ${site.workshop.serviceBays} BAYS`
              }
              className="mt-5 dark:hidden"
            />
          </div>

          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card dark:bg-transparent dark:shadow-none">
            <div
              aria-hidden="true"
              className="flex items-center justify-between border-b border-hairline bg-surface-elevated/75 px-5 py-2.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted dark:bg-background"
            >
              <span className="inline-flex items-center gap-2 text-ink">
                <span className="size-1.5 rounded-full bg-accent-orange dark:bg-brand" />
                BOSCH CAR SERVICE
              </span>
              <span>{isGreek ? "ΚΟΖΑΝΗ" : "KOZANI"}</span>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-hairline dark:bg-line">
              {workshopFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-col-reverse gap-2 bg-background/70 p-5 md:p-6 dark:bg-background"
                >
                  <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
                    {fact.label}
                  </dt>
                  <dd className="font-display text-[1.375rem] font-bold leading-none tabular-nums text-ink md:text-[1.5rem]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <SectionHeading title={t("factsTitle")} />

          <dl className="mt-6 max-w-[52rem] rounded-card border border-line bg-surface px-5 py-1 shadow-card sm:px-6 dark:rounded-none dark:border-x-0 dark:border-y dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none">
            <FactRow
              label={t("factLegalLabel")}
              value={t("factLegalValue")}
            />
            <FactRow
              label={t("factAddressLabel")}
              value={t("factAddressValue")}
            />
            <FactRow
              label={t("factPhoneLabel")}
              value={t("factPhoneValue")}
            />
            <FactRow
              label={t("factEmailLabel")}
              value={t("factEmailValue")}
            />
            <FactRow label={t("factVatLabel")} value={t("factVatValue")} />
            <FactRow label={t("factGemiLabel")} value={t("factGemiValue")} />
            <FactRow
              label={t("factHoursLabel")}
              value={t("factHoursValue")}
            />
          </dl>

          <p className="mt-6 max-w-[68ch] text-[0.8125rem] leading-relaxed text-muted">
            {t("disclosure")}
          </p>

          <div className="mt-10 rounded-card border border-line border-t-2 border-t-accent-orange bg-surface p-6 shadow-card md:p-8 dark:border-t dark:border-t-line dark:bg-brand-subtle dark:shadow-none">
            <h2 className="text-[1.375rem] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[1.625rem]">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
              {t("ctaBody")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/contact" prefetch={false}>
                  {t("ctaPrimary")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/services" prefetch={false}>
                  {t("ctaSecondary")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
