"use client";

import {useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {EmptyFleetState} from "@/components/fleet/empty-fleet-state";
import {FleetFilters} from "@/components/fleet/fleet-filters";
import {VehicleCard} from "@/components/fleet/vehicle-card";
import type {Vehicle} from "@/lib/data/fleet";
import {
  parseFleetSearchParams,
  withFleetParams,
  withoutFleetFilters
} from "@/lib/search-params";

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
    <div className={className}>
      <FleetFilters params={search} className="mt-8" />

      <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-[0.875rem] font-semibold text-ink">
          {t("count", {count: filtered.length})}
        </p>
        <p className="max-w-[56ch] text-[0.75rem] leading-relaxed text-muted">
          {t("demoNote")}
        </p>
      </div>

      {filtered.length > 0 ? (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle, index) => (
            <li key={vehicle.slug} className="min-w-0">
              <VehicleCard
                vehicle={vehicle}
                locale={locale}
                search={search}
                priority={index < 3}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyFleetState clearHref={clearHref} className="mt-5" />
      )}
    </div>
  );
}
