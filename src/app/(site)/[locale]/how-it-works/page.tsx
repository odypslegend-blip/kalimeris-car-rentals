import type {Metadata} from "next";
import {ArrowRight, Check, Minus} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {AnimatedSteps} from "@/components/motion/animated-steps";
import {PageHeader} from "@/components/sections/page-header";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";

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

      {/* Three steps as one equal-edge composition. */}
      <section className="py-12 md:py-16">
        <div className="page-shell">
          <AnimatedSteps steps={steps} variant="page" headingLevel="h2" />
        </div>
      </section>

      {/* What we need / what the request is not. */}
      <section className="border-y border-line bg-surface py-12 md:py-16">
        <div className="page-shell grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
              {t("needs.title")}
            </h2>
            <ul className="mt-6 border-y border-line">
              {needs.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 border-b border-hairline py-3.5 last:border-b-0"
                >
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 translate-y-0.5 text-brand"
                  />
                  <span className="text-[0.9375rem] leading-relaxed text-ink/85">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-line bg-background p-6 md:p-8">
            <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
              {t("not.title")}
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {notItems.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <Minus
                    aria-hidden="true"
                    className="size-4 shrink-0 translate-y-0.5 text-brand"
                  />
                  <span className="text-[0.9375rem] leading-relaxed text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <div className="flex flex-col gap-6 rounded-card border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
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
