import type {Metadata} from "next";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {
  LegalDocument,
  type LegalSection
} from "@/components/sections/legal-document";
import {LegalNotice} from "@/components/sections/legal-notice";
import {PageHeader} from "@/components/sections/page-header";
import {buildAlternates} from "@/lib/seo";

type RentalTermsPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({
  params
}: RentalTermsPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "RentalTerms"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/rental-terms"),
    // Draft legal copy must stay out of the index until it is approved.
    robots: {index: false, follow: true}
  };
}

export default async function RentalTermsPage({
  params
}: RentalTermsPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("RentalTerms");
  const sections = t.raw("sections") as LegalSection[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-10 md:py-14">
        <div className="page-shell">
          <LegalNotice className="max-w-[68ch]">{t("notice")}</LegalNotice>
          <LegalDocument
            sections={sections}
            contentsLabel={t("contents")}
            className="mt-10 md:mt-12"
          />
        </div>
      </section>
    </>
  );
}
