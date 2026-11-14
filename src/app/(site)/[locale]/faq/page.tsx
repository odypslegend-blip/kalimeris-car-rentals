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
              <Accordion
                type="single"
                collapsible
                className="border-t border-line"
              >
                {items.map((item, index) => (
                  <AccordionItem key={item.question} value={`faq-${index}`}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>

            <Reveal delay={90}>
              <div className="mt-12 border-t border-line pt-8">
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
