import type {Metadata} from "next";
import {ArrowRight, ArrowUpRight, Check, Phone, Wrench} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {PageHeader} from "@/components/sections/page-header";
import {SectionHeading} from "@/components/sections/section-heading";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {site} from "@/lib/site";

type ServicesPageProps = {
  params: Promise<{locale: string}>;
};

type ServiceGroup = {
  eyebrow: string;
  title: string;
  body: string;
  items: string[];
  cta?: string;
  reserve?: string;
};

/** Two-column checklist used by every service group. */
function CheckList({items}: {items: string[]}) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink"
        >
          <Check
            aria-hidden="true"
            className="size-4 shrink-0 translate-y-0.5 text-brand"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({
  params
}: ServicesPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Services"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/services"),
    robots: {index: true, follow: true}
  };
}

export default async function ServicesPage({params}: ServicesPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Services");
  const workshop = t.raw("workshop") as ServiceGroup;
  const performance = t.raw("performance") as ServiceGroup;
  const rental = t.raw("rental") as ServiceGroup;
  const parts = t.raw("parts") as Omit<ServiceGroup, "items">;

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request" prefetch={false}>
                {t("ctaPrimary")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/contact" prefetch={false}>
                {t("ctaSecondary")}
              </Link>
            </Button>
          </>
        }
      />

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <div className="flex items-start gap-4 md:gap-5">
            <span
              aria-hidden="true"
              className="hidden size-10 shrink-0 place-items-center rounded-full bg-brand-subtle text-brand sm:grid"
            >
              <Wrench className="size-5" />
            </span>
            <SectionHeading
              eyebrow={workshop.eyebrow}
              title={workshop.title}
              description={workshop.body}
            />
          </div>
          <CheckList items={workshop.items} />
        </div>
      </section>

      <section className="border-y border-line bg-surface py-12 md:py-16">
        <div className="page-shell">
          <SectionHeading
            eyebrow={performance.eyebrow}
            title={performance.title}
            description={performance.body}
          />
          <CheckList items={performance.items} />
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <SectionHeading
            eyebrow={rental.eyebrow}
            title={rental.title}
            description={rental.body}
          />
          <CheckList items={rental.items} />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cars" prefetch={false}>
                {rental.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={site.reservationsPhone.href}>
                <Phone aria-hidden="true" />
                {rental.reserve}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="page-shell">
          <div className="rounded-card border border-line bg-brand-subtle p-6 md:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-muted">
                {parts.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.375rem] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[1.625rem]">
                {parts.title}
              </h2>
              <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
                {parts.body}
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              className="mt-6 w-full shrink-0 sm:w-auto lg:mt-0"
            >
              <a
                href={site.carGr.parts}
                target="_blank"
                rel="noreferrer noopener"
              >
                {parts.cta}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="page-shell">
          <div className="rounded-card border border-line bg-surface p-6 md:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div>
              <h2 className="text-[1.375rem] font-semibold leading-snug tracking-[-0.015em] text-ink md:text-[1.625rem]">
                {t("ctaTitle")}
              </h2>
              <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
                {t("ctaBody")}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/request" prefetch={false}>
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
                <Link href="/contact" prefetch={false}>
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
