import type {Metadata} from "next";
import type {ReactNode} from "react";
import {ArrowRight, ArrowUpRight, Check} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {RouteIndicator} from "@/components/brand/automotive-accents";
import {PageHeader} from "@/components/sections/page-header";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {directionsUrl, getSiteAddress, site} from "@/lib/site";

type ContactPageProps = {
  params: Promise<{locale: string}>;
};

/**
 * One label/value row of the contact definition list. `dt` carries the small
 * muted label and `dd` the readable value, on the site's hairline rhythm.
 */
function DetailRow({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink">
        {children}
      </dd>
    </div>
  );
}

export async function generateMetadata({
  params
}: ContactPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Contact"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/contact"),
    robots: {index: true, follow: true}
  };
}

export default async function ContactPage({params}: ContactPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Contact");
  const services = t.raw("services") as string[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-12 md:py-16">
        <div className="page-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="rounded-card border border-line bg-surface p-6 shadow-card md:p-8 dark:rounded-none dark:border-0 dark:bg-transparent dark:p-0 dark:shadow-none">
              <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
                {t("detailsTitle")}
              </h2>

              <RouteIndicator
                code={
                  locale === "el"
                    ? `ΕΔΡΑ · ${site.address.postalCode}`
                    : `HQ · ${site.address.postalCode}`
                }
                route={
                  locale === "el"
                    ? site.address.streetEl
                    : site.address.streetEn
                }
                className="mt-3"
              />

              <dl className="mt-5 border-t border-hairline dark:border-y dark:border-line">
                <DetailRow label={t("phoneLabel")}>
                  <a
                    href={site.phone.href}
                    className="inline-flex min-h-11 items-center text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand hover:underline"
                  >
                    {site.phone.display}
                  </a>
                </DetailRow>

                <DetailRow label={t("reservationsLabel")}>
                  <a
                    href={site.reservationsPhone.href}
                    className="inline-flex min-h-11 items-center text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand hover:underline"
                  >
                    {site.reservationsPhone.display}
                  </a>
                  <span className="mt-1 block text-[0.8125rem] text-muted">
                    {t("reservationsManager")}
                  </span>
                </DetailRow>

                <DetailRow label={t("emailLabel")}>
                  <a
                    href={`mailto:${site.email}`}
                    className="flex min-h-11 min-w-0 items-center break-all font-medium text-brand hover:underline"
                  >
                    {site.email}
                  </a>
                  <span className="mt-1 block text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {t("serviceEmailLabel")}
                  </span>
                  <a
                    href={`mailto:${site.serviceEmail}`}
                    className="flex min-h-11 min-w-0 items-center break-all font-medium text-brand hover:underline"
                  >
                    {site.serviceEmail}
                  </a>
                </DetailRow>

                <DetailRow label={t("addressLabel")}>
                  <address className="not-italic">{getSiteAddress(locale)}</address>
                  <a
                    href={directionsUrl(locale)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[0.875rem] font-semibold text-brand hover:underline"
                  >
                    {t("mapCta")}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </DetailRow>

                <DetailRow label={t("hoursLabel")}>
                  <span className="block">{t("hoursWeekdays")}</span>
                  <span className="mt-1 block">{t("hoursSaturday")}</span>
                </DetailRow>
              </dl>
            </div>

            <div className="rounded-card border border-line bg-surface p-6 shadow-card md:p-8 dark:shadow-none">
              <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
                {t("companyTitle")}
              </h2>

              <dl className="mt-3">
                <DetailRow label={t("companyNameLabel")}>
                  {t("companyName")}
                </DetailRow>
                <DetailRow label={t("activityLabel")}>
                  {t("activityValue")}
                </DetailRow>
                <DetailRow label={t("vatLabel")}>{site.vat}</DetailRow>
                <DetailRow label={t("gemiLabel")}>{site.gemi}</DetailRow>
              </dl>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-card border border-line border-t-2 border-t-accent-orange bg-surface p-6 shadow-card md:p-8 dark:border-t dark:border-t-line dark:shadow-none">
              <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
                {t("formTitle")}
              </h2>
              <p className="mt-3 max-w-[48ch] text-[0.9375rem] leading-relaxed text-muted">
                {t("formBody")}
              </p>
              <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
                <Link href="/request" prefetch={false}>
                  {t("cta")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="rounded-card border border-line bg-surface-warm/70 p-6 shadow-card md:p-8 dark:bg-brand-subtle dark:shadow-none">
              <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
                {t("servicesTitle")}
              </h2>
              <ul className="mt-5 space-y-3">
                {services.map((service) => (
                  <li
                    key={service}
                    className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink"
                  >
                    <Check
                      aria-hidden="true"
                      className="size-4 shrink-0 translate-y-0.5 text-brand"
                    />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
