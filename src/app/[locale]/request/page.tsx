import type {Metadata} from "next";
import {connection} from "next/server";
import {Suspense} from "react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {RequestPageClient} from "@/components/booking/request-page-client";
import {Skeleton} from "@/components/ui/skeleton";
import {getTransportStatus} from "@/lib/inquiry/transport";
import {buildAlternates} from "@/lib/seo";

type RequestPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({
  params
}: RequestPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Request"});

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: buildAlternates(locale, "/request"),
    // A request form is useful to a visitor but has no value as a search
    // result; links inside it stay crawlable (follow) but it is not indexed.
    robots: {index: false, follow: true}
  };
}

/**
 * Static shell for `/request`.
 *
 * The summary depends on the query string (`vehicle`, `pickup`, `from`, `to`),
 * which a static export cannot read on the server, so the summary + form live
 * in `RequestPageClient` and read `useSearchParams` after hydration. The header
 * stays server-rendered and translated.
 */
export default async function RequestPage({params}: RequestPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Request");

  // The static export has no `/api/inquiries` route, so it must stay a static
  // page that honestly reports submission as unavailable. The server build
  // resolves the real transport (webhook/Resend) from runtime env, so it has to
  // render per request instead of baking the build machine's env into a
  // prerendered page.
  if (process.env.STATIC_EXPORT !== "1") {
    await connection();
  }

  const transport =
    process.env.STATIC_EXPORT === "1"
      ? {configured: false, devSink: false}
      : getTransportStatus();

  return (
    <section className="pb-16 pt-8 md:pb-24 md:pt-10">
      <div className="page-shell">
        <header className="max-w-[62ch]">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.08] tracking-[-0.025em] text-ink lg:text-[2.5rem]">
            {t("title")}
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <Suspense fallback={<RequestSkeleton />}>
          <RequestPageClient transport={transport} />
        </Suspense>
      </div>
    </section>
  );
}

/** Same two-column rhythm as the real layout, with nothing fabricated in it. */
function RequestSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-8"
    >
      <Skeleton className="order-1 h-[38rem]" />
      <Skeleton className="order-2 h-[26rem]" />
    </div>
  );
}
