import Image from "next/image";
import {ArrowRight, Cog, Fuel, UsersRound} from "lucide-react";
import {useTranslations} from "next-intl";
import {SpotlightCard} from "@/components/motion/spotlight-card";
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
    <SpotlightCard
      className={cn(
        "h-full border border-line bg-surface shadow-card transition-[box-shadow,border-color] duration-[var(--token-duration-normal)] ease-brand hover:border-brand/50 hover:shadow-panel",
        className
      )}
    >
      <Link
        href={href}
        prefetch={false}
        className="group flex h-full flex-col overflow-hidden rounded-card focus-visible:outline-offset-[-2px]"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-background">
        <Image
          src={assetPath(vehicle.image)}
          alt={alt}
          fill
          priority={priority}
          quality={90}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
          className="object-cover transition-transform duration-[var(--token-duration-slow)] ease-brand group-hover:scale-[1.03]"
        />
        <Badge variant="demo" className="absolute left-3 top-3 shadow-sm">
          {common("demo")}
        </Badge>
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 inline-flex items-center rounded-full border border-line/80 bg-surface/92 px-2.5 py-1 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm backdrop-blur-sm"
        >
          {categories(vehicle.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] tabular-nums text-brand">
              {categories(vehicle.category)}
            </p>
            <h3 className="mt-2 font-display text-[1.125rem] font-bold leading-[1.18] tracking-[-0.02em] text-ink">
              {name}
            </h3>
            <p className="mt-1 font-mono text-[0.75rem] leading-snug tabular-nums text-muted">
              {vehicle.modelNote}
            </p>
            {typeof vehicle.pricePerDay === "number" ? (
              <p className="mt-2 text-right font-mono text-[0.875rem] font-semibold tabular-nums text-ink">
                {vehicle.pricePerDay} €{" "}
                <span className="font-sans text-[0.75rem] font-normal text-muted">
                  / {locale === "el" ? "ημέρα" : "day"}
                </span>
              </p>
            ) : null}
          </div>

          <span
            aria-hidden="true"
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-brand transition-[background-color,border-color,color,transform] duration-[var(--token-duration-fast)] ease-brand group-hover:translate-x-0.5 group-hover:border-accent-orange group-hover:bg-accent-orange group-hover:text-white dark:group-hover:border-brand dark:group-hover:bg-brand-subtle dark:group-hover:text-brand"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>

        <span className="sr-only"> — {t("cardCta")}</span>
      </div>

      <ul className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline bg-surface-elevated/60 dark:bg-background/50">
        {facts.map((fact) => {
          const Icon = fact.icon;

          return (
            <li
              key={fact.value}
              className="flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-2.5 text-center"
            >
              <Icon aria-hidden="true" className="size-3.5 shrink-0 text-brand" />
              <span className="min-w-0 max-w-full break-words font-mono text-[0.6875rem] font-medium leading-tight tabular-nums text-muted">
                {fact.value}
              </span>
            </li>
          );
        })}
      </ul>
      </Link>
    </SpotlightCard>
  );
}
