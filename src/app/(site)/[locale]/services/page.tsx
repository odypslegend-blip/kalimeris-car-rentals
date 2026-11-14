import type {Metadata} from "next";
import type {LucideIcon} from "lucide-react";
import {ArrowRight, ArrowUpRight, Car, Gauge, Wrench} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {BookCallButton} from "@/components/motion/book-call-button";
import {Reveal} from "@/components/motion/reveal";
import {SpotlightCard} from "@/components/motion/spotlight-card";
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

type ServiceLedgerSectionProps = {
  group: ServiceGroup;
  icon: LucideIcon;
  surfaceClassName?: string;
  actions?: React.ReactNode;
};

/** 12-column asymmetric split ledger shared across all three service pillars. */
function ServiceLedgerSection({
  group,
  icon: Icon,
  surfaceClassName = "py-12 md:py-16",
  actions
}: ServiceLedgerSectionProps) {
  return (
    <section className={surfaceClassName}>
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-4">
            <Reveal>
              <span
                aria-hidden="true"
                className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-brand-subtle text-brand"
              >
                <Icon className="size-5" />
              </span>
              <SectionHeading
                eyebrow={group.eyebrow}
                title={group.title}
                description={group.body}
              />
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <ol className="divide-y divide-hairline border-y border-hairline">
              {group.items.map((item, index) => (
                <li key={item} className="py-1">
                  <Reveal delay={Math.min(index * 45, 220)}>
                    <div className="group grid gap-2 rounded-xl px-3 py-4 transition-colors duration-[var(--token-duration-fast)] ease-brand hover:bg-surface-elevated/70 sm:grid-cols-[3.5rem_1fr] sm:items-baseline sm:gap-4 sm:px-5 sm:py-5">
                      <span className="font-mono text-xs font-semibold tracking-[0.14em] tabular-nums text-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-[1.0625rem] font-bold leading-snug text-ink sm:text-lg">
                        {item}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>

            {actions ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
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

      <ServiceLedgerSection group={workshop} icon={Wrench} />

      <ServiceLedgerSection
        group={performance}
        icon={Gauge}
        surfaceClassName="border-y border-line bg-surface py-12 md:py-16"
      />

      <ServiceLedgerSection
        group={rental}
        icon={Car}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/cars" prefetch={false}>
                {rental.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {rental.reserve ? (
              <BookCallButton
                href={site.reservationsPhone.href}
                label={rental.reserve}
                className="min-h-12 justify-center sm:justify-start"
              />
            ) : null}
          </>
        }
      />

      <section className="pb-12 md:pb-16">
        <div className="page-shell">
          <Reveal variant="scale">
            <SpotlightCard
              tilt={false}
              className="border border-line bg-brand-subtle p-6 md:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10"
            >
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-muted">
                  {parts.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-[1.375rem] font-bold leading-snug tracking-[-0.015em] text-ink md:text-[1.625rem]">
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
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="page-shell">
          <Reveal variant="scale">
            <SpotlightCard
              tilt={false}
              className="border border-line bg-surface p-6 md:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10"
            >
              <div className="min-w-0">
                <h2 className="font-display text-[1.375rem] font-bold leading-snug tracking-[-0.015em] text-ink md:text-[1.625rem]">
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
            </SpotlightCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}
