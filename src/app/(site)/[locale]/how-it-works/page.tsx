import type {Metadata} from "next";
import {ArrowRight, Check, Minus} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {AnimatedSteps} from "@/components/motion/animated-steps";
import {SpotlightCard} from "@/components/motion/spotlight-card";
import {PageHeader} from "@/components/sections/page-header";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {cn} from "@/lib/utils";

type HowItWorksPageProps = {
  params: Promise<{locale: string}>;
};

type Step = {
  title: string;
  body: string;
};

export async function generateMetadata({
  params
}: HowItWorksPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "HowItWorks"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/how-it-works"),
    robots: {index: true, follow: true}
  };
}

export default async function HowItWorksPage({
  params
}: HowItWorksPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HowItWorks");
  const steps = t.raw("steps") as Step[];
  const needs = t.raw("needs.items") as string[];
  const notItems = t.raw("not.items") as string[];

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
              <Link href="/cars" prefetch={false}>
                {t("ctaSecondary")}
              </Link>
            </Button>
          </>
        }
      />

      {/* Three steps — interactive live process switcher. */}
      <section className="py-12 md:py-16">
        <div className="page-shell">
          <AnimatedSteps steps={steps} variant="page" headingLevel="h2" />
        </div>
      </section>

      {/* What we need / what the request is not — 12-column asymmetric split. */}
      <section className="border-y border-line bg-surface py-12 md:py-16">
        <div className="page-shell grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <h2 className="font-display text-[1.25rem] font-bold leading-snug tracking-[-0.015em] text-ink md:text-[1.5rem]">
              {t("needs.title")}
            </h2>

            <div className="mt-6 overflow-hidden rounded-card border border-line bg-background shadow-card dark:shadow-none">
              <ul className="divide-y divide-hairline">
                {needs.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2 shrink-0 rounded-full dark:bg-brand",
                          index % 2 === 0 ? "bg-accent-orange" : "bg-brand"
                        )}
                      />
                      <span className="text-[0.9375rem] font-medium leading-relaxed text-ink">
                        {item}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-brand/25 bg-brand-subtle text-brand"
                    >
                      <Check className="size-3.5" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <SpotlightCard
              tilt={false}
              className="border border-line border-t-2 border-t-accent-orange bg-surface p-6 shadow-card md:p-8 dark:border-t dark:border-t-line dark:bg-brand-subtle"
            >
              <h2 className="font-display text-[1.25rem] font-bold leading-snug tracking-[-0.015em] text-ink md:text-[1.375rem]">
                {t("not.title")}
              </h2>

              <ul className="mt-6 divide-y divide-line/70 border-t border-line/70">
                {notItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3.5 py-3.5 first:pt-4 last:pb-1"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-accent-orange/25 bg-accent-orange-subtle text-accent-orange dark:border-line dark:bg-surface dark:text-brand"
                    >
                      <Minus className="size-3.5" />
                    </span>
                    <span className="text-[0.9375rem] font-medium leading-relaxed text-ink/90">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <div className="flex flex-col gap-6 rounded-card border border-line border-t-2 border-t-brand bg-surface p-6 shadow-card md:flex-row md:items-center md:justify-between md:p-8 dark:border-t dark:border-t-line dark:shadow-none">
            <div>
              <h2 className="font-display text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                {t("ctaTitle")}
              </h2>
              <p className="mt-1.5 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
                {t("ctaBody")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/request" prefetch={false}>
                  {t("ctaPrimary")}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/cars" prefetch={false}>
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
