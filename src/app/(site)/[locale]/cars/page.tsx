import type {Metadata} from "next";
import {Suspense} from "react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {FleetBrowser} from "@/components/fleet/fleet-browser";
import {Skeleton} from "@/components/ui/skeleton";
import {buildAlternates} from "@/lib/seo";
import {getPublishedVehicles} from "@/lib/vehicles/store";
import {toVehicleView} from "@/lib/vehicles/view";

type CarsPageProps = {
  params: Promise<{locale: string}>;
};

export const revalidate = 30;

export async function generateMetadata({
  params
}: CarsPageProps): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "Fleet"});

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates(locale, "/cars")
  };
}

/**
 * Fleet page shell.
 *
 * It stays a static server component: no `searchParams`, no server filtering.
 * `FleetBrowser` is the client boundary that reads the query string after
 * hydration, so the same page works for `next start` and for a static export.
 */
export default async function CarsPage({params}: CarsPageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Fleet");
  const vehicles = (await getPublishedVehicles()).map((vehicle) =>
    toVehicleView(vehicle, locale)
  );

  return (
    <section className="pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="page-shell">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 max-w-[20ch] text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.5rem]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-[58ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base">
          {t("description")}
        </p>

        <Suspense fallback={<FleetGridSkeleton />}>
          <FleetBrowser vehicles={vehicles} />
        </Suspense>
      </div>
    </section>
  );
}

/** Plain placeholder grid: no fake count, no fake filters. */
function FleetGridSkeleton() {
  return (
    <div className="mt-8" aria-hidden="true">
      <div className="h-[1.375rem] w-40 rounded-field bg-hairline" />
      <div className="mt-6 grid gap-5 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({length: 6}, (_, index) => (
          <Skeleton key={index} className="h-[22rem]" />
        ))}
      </div>
    </div>
  );
}
