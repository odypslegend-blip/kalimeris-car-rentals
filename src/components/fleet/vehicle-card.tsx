import Image from "next/image";
import {ArrowRight, Cog, Fuel, UsersRound} from "lucide-react";
import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {Link} from "@/i18n/navigation";
import {assetPath} from "@/lib/base-path";
import {getVehicleName, type Vehicle} from "@/lib/data/fleet";
import {
  buildQueryString,
  type FleetSearchParams
} from "@/lib/search-params";
import {cn} from "@/lib/utils";

type VehicleCardProps = {
  vehicle: Vehicle;
  locale: string;
  /** Booking context to preserve when the card is opened. */
  search?: FleetSearchParams;
  priority?: boolean;
  className?: string;
};

/**
 * Fleet card: 4:3 demo photograph, category eyebrow, name, three factual
 * attributes and a whole-card link into the vehicle page. Booking params are
 * preserved so opening a car never loses the chosen dates or pickup point.
 */
export function VehicleCard({
  vehicle,
  locale,
  search,
  priority = false,
  className
}: VehicleCardProps) {
  const t = useTranslations("Fleet");
  const common = useTranslations("Common");
  const categories = useTranslations("Categories");
  const transmissions = useTranslations("Transmission");
  const fuels = useTranslations("Fuel");

  const name = getVehicleName(vehicle);
  const href = `/cars/${vehicle.slug}${buildQueryString(search ?? {})}`;
  const alt =
    locale === "el" ? vehicle.gallery[0].altEl : vehicle.gallery[0].altEn;

  const facts = [
    {icon: UsersRound, value: `${vehicle.seats} ${t("seatsShort")}`},
    {icon: Cog, value: transmissions(vehicle.transmission)},
    {icon: Fuel, value: fuels(vehicle.fuel)}
  ];

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group block overflow-hidden rounded-card border border-line bg-surface shadow-card transition-[transform,box-shadow] duration-[var(--token-duration-normal)] ease-brand hover:-translate-y-0.5 hover:shadow-panel focus-visible:-translate-y-0.5",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <Image
          src={assetPath(vehicle.image)}
          alt={alt}
          fill
          priority={priority}
          quality={90}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
          className="object-cover transition-transform duration-[var(--token-duration-slow)] ease-brand group-hover:scale-[1.02]"
        />
        <Badge variant="demo" className="absolute left-3 top-3 shadow-sm">
          {common("demo")}
        </Badge>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand">
              {categories(vehicle.category)}
            </p>
            <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug text-ink">
              {name}
            </h3>
            <p className="mt-1 text-[0.75rem] leading-snug text-muted">
              {vehicle.modelNote}
            </p>
            {typeof vehicle.pricePerDay === "number" ? (
              <p className="mt-1.5 text-right text-[0.8125rem] font-semibold text-ink">
                {vehicle.pricePerDay} €{" "}
                <span className="text-muted">
                  / {locale === "el" ? "ημέρα" : "day"}
                </span>
              </p>
            ) : null}
          </div>

          <span
            aria-hidden="true"
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand group-hover:border-brand group-hover:bg-brand-subtle"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
          {facts.map((fact) => {
            const Icon = fact.icon;

            return (
              <li key={fact.value} className="inline-flex items-center gap-1.5">
                <Icon aria-hidden="true" className="size-3.5 text-muted" />
                {fact.value}
              </li>
            );
          })}
        </ul>

        <span className="sr-only"> — {t("cardCta")}</span>
      </div>
    </Link>
  );
}
