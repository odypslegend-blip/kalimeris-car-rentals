import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  ChevronRight,
  Cog,
  Fuel,
  Gauge,
  UsersRound
} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {RequestPanel} from "@/components/fleet/request-panel";
import {VehicleGallery} from "@/components/fleet/vehicle-gallery";
import {VehicleSpecRow} from "@/components/fleet/vehicle-spec-row";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Link} from "@/i18n/navigation";
import {getVehicleName} from "@/lib/data/fleet";
import {buildAlternates} from "@/lib/seo";
import {getPublishedVehicles, getVehicleForPublic} from "@/lib/vehicles/store";
import {toVehicleView} from "@/lib/vehicles/view";

type VehiclePageProps = {
  params: Promise<{locale: string; slug: string}>;
};

export const revalidate = 30;

export async function generateStaticParams() {
  const vehicles = await getPublishedVehicles();
  return vehicles.map((vehicle) => ({slug: vehicle.slug}));
}

export async function generateMetadata({
  params
}: VehiclePageProps): Promise<Metadata> {
  const {locale, slug} = await params;
  const record = await getVehicleForPublic(slug);

  if (!record) {
    return {title: "404"};
  }

  const vehicle = toVehicleView(record, locale);
  const name = getVehicleName(vehicle);
  const description =
    locale === "el" ? vehicle.descriptionEl : vehicle.descriptionEn;

  return {
    title: `${name} — ${vehicle.modelNote}`,
    description,
    alternates: buildAlternates(locale, `/cars/${vehicle.slug}`)
  };
}

export default async function VehiclePage({params}: VehiclePageProps) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const record = await getVehicleForPublic(slug);

  if (!record) {
    notFound();
  }

  const vehicle = toVehicleView(record, locale);

  const [tv, tnav, tcommon, categories, transmissions, fuels, conditions] =
    await Promise.all([
      getTranslations("Vehicle"),
      getTranslations("Nav"),
      getTranslations("Common"),
      getTranslations("Categories"),
      getTranslations("Transmission"),
      getTranslations("Fuel"),
      getTranslations("Conditions")
    ]);

  const name = getVehicleName(vehicle);
  const description =
    locale === "el" ? vehicle.descriptionEl : vehicle.descriptionEn;
  // No query string here: this page is prerendered for the static export and
  // an export has no `searchParams`. The fleet cards still carry booking
  // context; `/request` reads it client-side.
  const backHref = "/cars";

  const specRows = [
    {
      icon: CalendarDays,
      label: tv("labels.year"),
      value: String(vehicle.year)
    },
    {
      icon: UsersRound,
      label: tv("labels.seats"),
      value: String(vehicle.seats)
    },
    {
      icon: Briefcase,
      label: tv("labels.luggage"),
      value: String(vehicle.luggage)
    },
    {
      icon: Cog,
      label: tv("labels.transmission"),
      value: transmissions(vehicle.transmission)
    },
    {
      icon: Fuel,
      label: tv("labels.fuel"),
      value: fuels(vehicle.fuel)
    },
    ...(vehicle.powerHp !== undefined
      ? [
          {
            icon: Gauge,
            label: tv("labels.power"),
            value: tv("powerValue", {value: vehicle.powerHp})
          }
        ]
      : [])
  ];

  const allSpecs = [
    {label: tv("labels.make"), value: vehicle.make},
    {label: tv("labels.model"), value: vehicle.model},
    {label: tv("labels.version"), value: vehicle.modelNote},
    {label: tv("labels.year"), value: String(vehicle.year)},
    {label: tv("labels.category"), value: categories(vehicle.category)},
    {
      label: tv("labels.transmission"),
      value: transmissions(vehicle.transmission)
    },
    {label: tv("labels.fuel"), value: fuels(vehicle.fuel)},
    {label: tv("labels.seats"), value: String(vehicle.seats)},
    {label: tv("labels.luggage"), value: String(vehicle.luggage)},
    ...(vehicle.powerHp !== undefined
      ? [
          {
            label: tv("labels.power"),
            value: tv("powerValue", {value: vehicle.powerHp})
          }
        ]
      : [])
  ];

  return (
    <section className="pb-16 pt-6 md:pb-24 md:pt-8">
      <div className="page-shell">
        <nav aria-label={tv("breadcrumb")}>
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
            <li>
              <Link
                href={backHref}
                prefetch={false}
                className="inline-flex min-h-11 items-center text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink"
              >
                {tnav("cars")}
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted">
              <ChevronRight className="size-3.5" />
            </li>
            <li
              aria-current="page"
              className="min-w-0 truncate font-medium text-ink"
            >
              {name}
            </li>
          </ol>
        </nav>

        <div className="mt-3 rounded-card border border-line border-t-2 border-t-accent-orange bg-surface p-5 shadow-card sm:p-7 dark:mt-2 dark:rounded-none dark:border-0 dark:bg-transparent dark:p-0 dark:shadow-none">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="heritage">{categories(vehicle.category)}</Badge>
            <Badge variant="demo">{tcommon("demo")}</Badge>
          </div>

          <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink lg:text-[2.5rem]">
            {name}
          </h1>
          <p className="mt-1.5 font-mono text-[0.875rem] text-muted dark:font-sans dark:text-[0.9375rem]">
            {vehicle.modelNote}
          </p>
          {vehicle.pricePerDay != null ? (
            <p className="mt-2 text-[1.0625rem] font-semibold text-ink">
              {vehicle.pricePerDay} € /{" "}
              {locale === "el" ? "ημέρα" : "day"}
            </p>
          ) : null}
          <p className="mt-4 max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base">
            {description}
          </p>

          <dl className="mt-6 grid max-w-[44rem] gap-x-8 rounded-field border border-hairline bg-surface-elevated/45 px-4 py-1 sm:grid-cols-2 dark:rounded-none dark:border-0 dark:bg-transparent dark:px-0 dark:py-0">
            {specRows.map((row) => (
              <VehicleSpecRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={row.value}
              />
            ))}
          </dl>

          <p className="mt-4 max-w-[62ch] text-[0.75rem] leading-relaxed text-muted">
            {tv("demoNote")}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10">
          <div className="min-w-0">
            <VehicleGallery images={vehicle.gallery} />
          </div>

          <RequestPanel
            slug={vehicle.slug}
            vehicleName={name}
            className="lg:sticky lg:top-24"
          />
        </div>

        <section className="mt-12 border-t border-line pt-8 md:mt-16">
          <h2 className="sr-only">{tv("tabsLabel")}</h2>
          <Tabs defaultValue="overview">
            <TabsList aria-label={tv("tabsLabel")}>
              <TabsTrigger value="overview">
                {tv("tabs.overview")}
              </TabsTrigger>
              <TabsTrigger value="specifications">
                {tv("tabs.specifications")}
              </TabsTrigger>
              <TabsTrigger value="conditions">
                {tv("tabs.conditions")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-6">
              <div className="max-w-[70ch] rounded-card border border-line bg-surface p-5 shadow-card sm:p-6 dark:rounded-none dark:border-0 dark:bg-transparent dark:p-0 dark:shadow-none">
                <h3 className="text-[1.0625rem] font-semibold text-ink">
                  {tv("tabs.overview")}
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                  {description}
                </p>
                <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
                  {tv("demoNote")}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="pt-6">
              <dl className="grid max-w-[62rem] gap-x-10 rounded-card border border-line bg-surface px-5 py-2 shadow-card sm:grid-cols-2 dark:rounded-none dark:border-0 dark:bg-transparent dark:px-0 dark:py-0 dark:shadow-none">
                {allSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-4 border-b border-hairline py-3 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                  >
                    <dt className="text-[0.8125rem] text-muted">
                      {spec.label}
                    </dt>
                    <dd className="text-right text-[0.875rem] font-medium text-ink">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </TabsContent>

            <TabsContent value="conditions" className="pt-6">
              <div className="max-w-[70ch] rounded-card border border-line border-t-2 border-t-brand bg-surface p-5 shadow-card sm:p-6 dark:border-t dark:border-t-line">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[1.0625rem] font-semibold text-ink">
                    {conditions("title")}
                  </h3>
                  <Badge variant="outline">{conditions("pending")}</Badge>
                </div>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                  {conditions("body")}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </section>
  );
}
