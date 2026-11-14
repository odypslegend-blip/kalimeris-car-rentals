import type {Metadata} from "next";
import {ArrowRight} from "lucide-react";
import {getLocale, getTranslations} from "next-intl/server";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";

/**
 * The server-rendered `<metadata>` title is correct, but Next.js drops it when
 * the not-found tree hydrates on the client: `document.title` reverted to the
 * layout default, so assistive technology announced the wrong page (WCAG
 * 2.4.2). React 19 hoists a declarative `<title>` rendered anywhere in the tree
 * into `<head>`, on the server *and* on the client, so the title stays correct
 * after hydration.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({locale, namespace: "NotFound"});

  return {title: t("metaTitle")};
}

/**
 * Localized 404. `not-found.tsx` has no `params`, but the `[locale]` layout has
 * already called `setRequestLocale`, so `getTranslations` resolves the active
 * locale. Next.js marks 404 responses `noindex` on its own.
 */
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="page-shell flex min-h-[60vh] flex-col justify-center py-16 md:py-24">
      <title>{t("metaTitle")}</title>
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 max-w-[24ch] text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.25rem] lg:text-[2.5rem]">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">
        {t("body")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg">
          <Link href="/">
            {t("home")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/cars">{t("cars")}</Link>
        </Button>
      </div>
    </section>
  );
}
