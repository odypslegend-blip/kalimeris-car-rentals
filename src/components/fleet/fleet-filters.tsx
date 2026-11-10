"use client";

import * as React from "react";
import {SlidersHorizontal} from "lucide-react";
import {useTranslations} from "next-intl";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {Link, useRouter} from "@/i18n/navigation";
import {
  buildQueryParams,
  hasFleetFilters,
  withFleetParams,
  withoutFleetFilters,
  type FleetSearchParams
} from "@/lib/search-params";
import {
  vehicleCategories,
  type VehicleTransmission
} from "@/lib/data/fleet";
import {cn} from "@/lib/utils";

type FleetFiltersProps = {
  params: FleetSearchParams;
  className?: string;
};

const chipBase =
  "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[0.8125rem] font-semibold transition-colors duration-[var(--token-duration-fast)] ease-brand";

/**
 * Category chips are real links (shareable, middle-clickable); the two
 * Selects update the URL through next-intl's locale-aware router. Every
 * change preserves the pickup/return/date context.
 */
export function FleetFilters({params, className}: FleetFiltersProps) {
  const t = useTranslations("Fleet");
  const categories = useTranslations("Categories");
  const router = useRouter();
  const uid = React.useId().replaceAll(":", "");
  const categoryLabelId = `fleet-category-${uid}`;
  const transmissionId = `fleet-transmission-${uid}`;
  const seatsId = `fleet-seats-${uid}`;

  const hasFilters = hasFleetFilters(params);

  function updateFilter(
    key: "transmission" | "seats",
    value: string
  ) {
    const next: FleetSearchParams = {...params};

    if (value === "all") {
      delete next[key];
    } else if (key === "transmission") {
      next.transmission = value as VehicleTransmission;
    } else {
      next.seats = value as FleetSearchParams["seats"];
    }

    router.replace({
      pathname: "/cars",
      query: buildQueryParams(next)
    });
  }

  return (
    <section
      aria-labelledby={categoryLabelId}
      className={cn("min-w-0", className)}
    >
      <h2 id={categoryLabelId} className="sr-only">
        {t("filters")}
      </h2>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted">
            {t("category")}
          </p>

          <nav
            aria-label={t("category")}
            className="mt-2 min-w-0 overflow-x-auto pb-1 [scrollbar-width:none]"
          >
            <ul className="flex w-max items-center gap-2">
              <li>
                <Link
                  href={withFleetParams("/cars", {
                    ...params,
                    category: undefined
                  })}
                  prefetch={false}
                  aria-current={!params.category ? "page" : undefined}
                  className={cn(
                    chipBase,
                    !params.category
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
                  )}
                >
                  {t("all")}
                </Link>
              </li>

              {vehicleCategories.map((category) => {
                const isActive = params.category === category;

                return (
                  <li key={category}>
                    <Link
                      href={withFleetParams("/cars", {...params, category})}
                      prefetch={false}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        chipBase,
                        isActive
                          ? "border-brand bg-brand text-white"
                          : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
                      )}
                    >
                      {categories(category)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[23rem]">
          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={transmissionId}>{t("transmission")}</Label>
            <Select
              value={params.transmission ?? "all"}
              onValueChange={(value) => updateFilter("transmission", value)}
            >
              <SelectTrigger id={transmissionId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="automatic">{t("automatic")}</SelectItem>
                <SelectItem value="manual">{t("manual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={seatsId}>{t("seats")}</Label>
            <Select
              value={params.seats ?? "all"}
              onValueChange={(value) => updateFilter("seats", value)}
            >
              <SelectTrigger id={seatsId}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                <SelectItem value="5">{t("seatsFive")}</SelectItem>
                <SelectItem value="7">{t("seatsSeven")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
        <p className="inline-flex items-center gap-2 text-[0.75rem] font-semibold text-muted">
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          {t("filters")}
        </p>

        {hasFilters ? (
          <Link
            href={withFleetParams("/cars", withoutFleetFilters(params))}
            prefetch={false}
            className="inline-flex min-h-9 items-center text-[0.8125rem] font-semibold text-brand underline-offset-4 hover:underline"
          >
            {t("clear")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
