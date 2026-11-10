import type {MetadataRoute} from "next";
import {routing} from "@/i18n/routing";
import {vehicles} from "@/lib/data/fleet";
import {absoluteAlternates, absoluteUrl} from "@/lib/seo";

/**
 * The sitemap is a pure function of build-time data, so it is explicitly
 * static — required for the GitHub Pages `output: "export"` target, and a
 * no-op for the server build.
 */
export const dynamic = "force-static";

type SitemapRoute = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
};

/**
 * Every public, indexable route. `/request` is deliberately absent: it is a
 * form with `robots: noindex, follow`. `/privacy` and `/rental-terms` are also
 * absent: both pages carry `robots: noindex` while their copy is a draft
 * pending legal review, so listing them in the sitemap would ask search
 * engines to index a noindex URL. They stay reachable from the footer.
 */
const routes: SitemapRoute[] = [
  {path: "", changeFrequency: "monthly", priority: 1},
  {path: "/cars", changeFrequency: "monthly", priority: 0.9},
  ...vehicles.map((vehicle) => ({
    path: `/cars/${vehicle.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7
  })),
  {path: "/how-it-works", changeFrequency: "yearly", priority: 0.6},
  {path: "/faq", changeFrequency: "yearly", priority: 0.6},
  {path: "/about", changeFrequency: "yearly", priority: 0.5},
  {path: "/contact", changeFrequency: "yearly", priority: 0.5}
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url: absoluteUrl(locale, route.path),
      changeFrequency: route.changeFrequency,
      priority:
        locale === routing.defaultLocale
          ? route.priority
          : Math.max(0.1, Number((route.priority - 0.1).toFixed(1))),
      alternates: {languages: absoluteAlternates(route.path)}
    }))
  );
}
