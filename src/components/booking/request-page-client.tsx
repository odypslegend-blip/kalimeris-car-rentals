"use client";

import Image from "next/image";
import {useSearchParams} from "next/navigation";
import {ArrowRight, CalendarDays, Info, MapPin} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {
  RequestForm,
  type RequestFormTransport
} from "@/components/booking/request-form";
import {Badge} from "@/components/ui/badge";
import {Link} from "@/i18n/navigation";
import {assetPath} from "@/lib/base-path";
import {getVehicleName, type Vehicle} from "@/lib/data/fleet";
import {findLocation, getLocationName, locations} from "@/lib/data/locations";
import {formatIsoDateLabel} from "@/lib/dates";
import {
  buildQueryString,
  parseFleetSearchParams
} from "@/lib/search-params";

function firstString(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Client half of `/request`: it reads the query string in the browser (a
 * static export cannot see `searchParams` on the server) and renders the same
 * summary + form layout the server page used to build.
 */
export function RequestPageClient({
  transport,
  vehicles
}: {
  transport: RequestFormTransport;
  /** Published vehicles, injected by the server page in public ordering. */
  vehicles: Vehicle[];
}) {
  const t = useTranslations("Request");
  const common = useTranslations("Common");
  const locale = useLocale();
  const rawParams = useSearchParams();

  // Shared parser: malformed dates or unknown locations degrade to undefined
  // instead of throwing.
  const search = parseFleetSearchParams(
    new URLSearchParams(rawParams.toString())
  );

  const requestedSlug = firstString(rawParams.get("vehicle"));
  const vehicle = requestedSlug
    ? vehicles.find((item) => item.slug === requestedSlug)
    : undefined;

  const pickup = findLocation(search.pickup) ?? locations[0];
  const returnLocation = findLocation(search.return) ?? pickup;

  const fromLabel = formatIsoDateLabel(search.from, locale);
  const toLabel = formatIsoDateLabel(search.to, locale);
  const datesLabel = fromLabel
    ? toLabel
      ? `${fromLabel} – ${toLabel}`
      : `${fromLabel} – …`
    : "—";

  const vehicleHref = vehicle
    ? `/cars/${vehicle.slug}${buildQueryString(search)}`
    : undefined;

  const vehicleImageAlt =
    vehicle && vehicle.gallery[0]
      ? locale === "el"
        ? vehicle.gallery[0].altEl
        : vehicle.gallery[0].altEn
      : undefined;

  const nextSteps = [t("next1"), t("next2"), t("next3")];

  return (
    <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-8">
      <aside
        aria-labelledby="request-summary-heading"
        className="order-2 min-w-0 lg:order-2 lg:sticky lg:top-[calc(var(--token-header-h)+24px)]"
      >
        <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2
            id="request-summary-heading"
            className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {t("summary")}
          </h2>

          {vehicle ? (
            <div className="mt-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-field bg-background">
                <Image
                  src={assetPath(vehicle.image)}
                  alt={vehicleImageAlt ?? getVehicleName(vehicle)}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
                <Badge
                  variant="demo"
                  className="absolute left-3 top-3 shadow-sm"
                >
                  {common("demo")}
                </Badge>
              </div>

              <p className="mt-3 text-[1rem] font-semibold leading-snug text-ink">
                {getVehicleName(vehicle)}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-muted">
                {vehicle.modelNote}
              </p>

              {vehicleHref ? (
                <Link
                  href={vehicleHref}
                  prefetch={false}
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] font-semibold text-brand underline-offset-4 hover:underline"
                >
                  {t("viewVehicle")}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-field border border-dashed border-line bg-background p-4">
              <p className="text-[0.9375rem] font-medium leading-snug text-ink">
                {t("summaryAnyVehicle")}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
                {t("anyVehicleNote")}
              </p>
            </div>
          )}

          <div className="mt-4 grid gap-3 border-t border-hairline pt-4">
            <div className="flex items-start gap-2.5">
              <MapPin
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted"
              />
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                  {t("pickup")} / {t("return")}
                </p>
                <p className="mt-0.5 text-[0.875rem] leading-snug text-ink">
                  {getLocationName(pickup, locale)}
                  {returnLocation.id !== pickup.id
                    ? ` → ${getLocationName(returnLocation, locale)}`
                    : null}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarDays
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-muted"
              />
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                  {t("dates")}
                </p>
                <p className="mt-0.5 text-[0.875rem] leading-snug text-ink">
                  {datesLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-hairline pt-4">
            <h3 className="text-[0.875rem] font-semibold text-ink">
              {t("nextTitle")}
            </h3>
            <ol className="mt-2.5 grid gap-2">
              {nextSteps.map((step) => (
                <li
                  key={step}
                  className="text-[0.8125rem] leading-relaxed text-muted"
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 grid gap-2 border-t border-hairline pt-4">
            <p className="flex items-start gap-2 text-[0.75rem] font-semibold leading-relaxed text-ink">
              <Info
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-brand"
              />
              {t("notBooking")}
            </p>
            <p className="text-[0.75rem] leading-relaxed text-muted">
              {t("noPrice")}
            </p>
            <p className="text-[0.75rem] leading-relaxed text-muted">
              {t("fleetNote")}
            </p>
          </div>
        </div>
      </aside>

      <div className="order-1 min-w-0 lg:order-1">
        <RequestForm
          vehicles={vehicles.map((item) => ({
            slug: item.slug,
            name: getVehicleName(item)
          }))}
          defaults={{
            vehicleId: vehicle?.slug,
            pickupLocation: pickup.id,
            returnLocation: returnLocation.id,
            from: search.from,
            to: search.to
          }}
          transport={{
            configured: transport.configured,
            devSink: transport.devSink
          }}
        />
      </div>
    </div>
  );
}
