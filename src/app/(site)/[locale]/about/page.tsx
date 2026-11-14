import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {PageHeader} from "@/components/sections/page-header";
import {SectionHeading} from "@/components/sections/section-heading";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {site} from "@/lib/site";

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
          <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse gap-2 p-6 md:p-8"
              >
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </dt>
                <dd className="text-[1.5rem] font-semibold leading-none text-ink md:text-[1.75rem]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 md:mt-16">
            <SectionHeading title={t("activitiesTitle")} />
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {activities.map((activity) => (
                <li
                  key={activity.title}
                  className="rounded-card border border-line bg-surface p-6"
                >
                  <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink">
                    {activity.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                    {activity.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-12 md:py-16">
        <div className="page-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <SectionHeading
            title={t("boschTitle")}
            description={t("boschBody")}
          />

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
            {workshopFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col-reverse gap-2 bg-background p-5 md:p-6"
              >
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
                  {fact.label}
                </dt>
                <dd className="text-[1.375rem] font-semibold leading-none text-ink md:text-[1.5rem]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <SectionHeading title={t("factsTitle")} />

          <dl className="mt-6 max-w-[52rem] border-y border-line">
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

          <div className="mt-10 rounded-card border border-line bg-brand-subtle p-6 md:p-8">
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
