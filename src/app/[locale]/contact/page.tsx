import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {PageHeader} from "@/components/sections/page-header";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {buildAlternates} from "@/lib/seo";

type ContactPageProps = {
  params: Promise<{locale: string}>;
};

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
  const pendingItems = t.raw("pendingItems") as string[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-12 md:py-16">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* No invented phone, email or address: only what is missing. */}
          <div>
            <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
              {t("pendingTitle")}
            </h2>
            <ul className="mt-5 border-y border-line">
              {pendingItems.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline justify-between gap-4 border-b border-hairline py-4 last:border-b-0"
                >
                  <span className="text-[0.9375rem] font-medium text-ink">
                    {item}
                  </span>
                  <span className="text-right text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
                    {t("pendingValue")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.875rem] leading-relaxed text-muted">
              {t("hours")}
            </p>
          </div>

          <div className="rounded-card border border-line bg-surface p-6 md:p-8">
            <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
              {t("channelTitle")}
            </h2>
            <p className="mt-3 max-w-[48ch] text-[0.9375rem] leading-relaxed text-muted">
              {t("channelBody")}
            </p>
            <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
              <Link href="/request" prefetch={false}>
                {t("cta")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
