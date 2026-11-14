"use client";

import {useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {EmptyFleetState} from "@/components/fleet/empty-fleet-state";
import {FleetFilters} from "@/components/fleet/fleet-filters";
import {VehicleCard} from "@/components/fleet/vehicle-card";
import {Reveal} from "@/components/motion/reveal";
import type {Vehicle} from "@/lib/data/fleet";
import {
  parseFleetSearchParams,
  withFleetParams,
  withoutFleetFilters
} from "@/lib/search-params";
import {cn} from "@/lib/utils";

type FleetBrowserProps = {
  vehicles: readonly Vehicle[];
  className?: string;
};

/**
 * Client-side fleet list.
 *
 * The page is prerendered once (both builds), so filtering cannot happen on
 * the server: `useSearchParams` reads the live URL, `FleetFilters` rewrites it
 * with next-intl's locale-aware router, and the list re-filters in the browser
 * with no server round-trip and no data fetching. Filtering rules are identical
 * to the previous server page: category, transmission, minimum seats.
 */
export function FleetBrowser({vehicles, className}: FleetBrowserProps) {
  const t = useTranslations("Fleet");
  const locale = useLocale();
  const rawParams = useSearchParams();

  // Reuse the shared parser so a malformed or unknown value degrades to
  // "no filter" instead of throwing.
  const search = parseFleetSearchParams(
    new URLSearchParams(rawParams.toString())
  );

  const filtered = vehicles.filter((vehicle) => {
    if (search.category && vehicle.category !== search.category) return false;
    if (search.transmission && vehicle.transmission !== search.transmission) {
      return false;
    }
    if (search.seats && vehicle.seats < Number(search.seats)) return false;
    return true;
  });

  const clearHref = withFleetParams("/cars", withoutFleetFilters(search));

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "mt-8 min-w-0 rounded-card border border-line bg-surface p-4 shadow-card transition-colors duration-[var(--token-duration-normal)] ease-brand sm:p-5 md:sticky md:top-[calc(var(--token-header-h)+0.75rem)] md:z-20 dark:border-hairline dark:bg-surface/85 dark:backdrop-blur-md",
          "[&_nav]:overflow-visible [&_nav]:pb-0 [&_nav_ul]:w-full [&_nav_ul]:max-w-full [&_nav_ul]:flex-wrap [&_nav_ul]:gap-1 [&_nav_ul]:rounded-field [&_nav_ul]:border [&_nav_ul]:border-hairline [&_nav_ul]:bg-surface-elevated/65 [&_nav_ul]:p-1 dark:[&_nav_ul]:bg-background/80",
          "[&_nav_a]:min-h-9 [&_nav_a]:rounded-[7px] [&_nav_a]:px-3 [&_nav_a]:text-[0.8125rem]",
          "[&_nav_a:not([aria-current=page])]:border-transparent [&_nav_a:not([aria-current=page])]:bg-transparent [&_nav_a:not([aria-current=page])]:text-muted [&_nav_a:not([aria-current=page])]:hover:bg-surface [&_nav_a:not([aria-current=page])]:hover:text-ink dark:[&_nav_a:not([aria-current=page])]:hover:bg-surface/85",
          "[&_nav_a[aria-current=page]]:border-brand-strong [&_nav_a[aria-current=page]]:bg-brand-strong [&_nav_a[aria-current=page]]:text-brand-ink [&_nav_a[aria-current=page]]:shadow-xs"
        )}
      >
        <FleetFilters params={search} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-field border border-hairline bg-surface-elevated/55 px-3 py-2 dark:bg-background/70">
          <p
            aria-live="polite"
            className="font-mono text-[0.8125rem] font-semibold tabular-nums text-ink"
          >
            {t("count", {count: filtered.length})}
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-[min(56ch,100%)] text-[0.75rem] leading-relaxed text-muted">
        {t("demoNote")}
      </p>

      {filtered.length > 0 ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle, index) => (
            <li key={vehicle.slug} className="min-w-0">
              <Reveal delay={(index % 6) * 55} variant="scale" className="h-full">
                <VehicleCard
                  vehicle={vehicle}
                  locale={locale}
                  search={search}
                  priority={index < 3}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyFleetState clearHref={clearHref} className="mt-5" />
      )}
    </div>
  );
}
