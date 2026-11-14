import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {Reveal} from "@/components/motion/reveal";
import {PageHeader} from "@/components/sections/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";
import {cn} from "@/lib/utils";

type FaqPageProps = {
  params: Promise<{locale: string}>;
};

type FaqItem = {
  question: string;
  answer: string;
};

export async function generateMetadata({
  params
}: FaqPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Faq"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/faq"),
    robots: {index: true, follow: true}
  };
}

export default async function FaqPage({params}: FaqPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <div className="max-w-[52rem]">
            <h2 className="sr-only">{t("sectionTitle")}</h2>
            <Reveal>
              <div className="rounded-card border border-line bg-surface px-4 py-1 shadow-card sm:px-6 dark:rounded-none dark:border-0 dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none">
                <Accordion
                  type="single"
                  collapsible
                  className="border-t border-hairline dark:border-line"
                >
                  {items.map((item, index) => (
                    <AccordionItem
                      key={item.question}
                      value={`faq-${index}`}
                      className={cn(
                        "group relative border-b border-hairline pl-10 transition-colors duration-[var(--token-duration-fast)] sm:pl-12",
                        "border-l-2 border-l-transparent data-[state=open]:border-l-accent-orange dark:border-b-line dark:data-[state=open]:border-l-brand"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-2 top-[1.3rem] inline-flex items-center justify-center rounded-[5px] border border-accent-orange/35 bg-accent-orange-subtle px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold tabular-nums tracking-[0.12em] text-ink transition-colors dark:border-0 dark:bg-transparent dark:px-0 dark:py-0 dark:text-xs dark:text-brand sm:left-3"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="mt-12 rounded-card border border-line border-t-2 border-t-accent-orange bg-surface p-6 shadow-card sm:p-8 dark:rounded-none dark:border-0 dark:border-t dark:border-t-line dark:bg-transparent dark:p-0 dark:pt-8 dark:shadow-none">
                <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                  {t("ctaTitle")}
                </h2>
                <p className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-muted">
                  {t("ctaBody")}
                </p>
                <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
                  <Link href="/request" prefetch={false}>
                    {t("ctaPrimary")}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
