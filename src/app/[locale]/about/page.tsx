import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {PageHeader} from "@/components/sections/page-header";
import {buildAlternates} from "@/lib/seo";

type AboutPageProps = {
  params: Promise<{locale: string}>;
};

type Principle = {
  title: string;
  body: string;
};

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
  const principles = t.raw("principles") as Principle[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-12 md:py-16">
        <div className="page-shell">
          <h2 className="text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink md:text-[1.375rem]">
            {t("principlesTitle")}
          </h2>

          <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {principles.map((principle) => (
              <li key={principle.title} className="border-t border-line pt-6">
                <h3 className="text-[1.0625rem] font-semibold leading-snug text-ink">
                  {principle.title}
                </h3>
                <p className="mt-2 max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-6 md:p-7">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-brand">
                {t("identityTitle")}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                {t("identityNote")}
              </p>
            </div>
            <div className="rounded-card border border-line bg-surface p-6 md:p-7">
              <p className="text-[0.9375rem] font-medium leading-relaxed text-ink">
                {t("markNote")}
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-[68ch] border-t border-line pt-6 text-[0.8125rem] leading-relaxed text-muted">
            {t("disclosure")}
          </p>
        </div>
      </section>
    </>
  );
}
