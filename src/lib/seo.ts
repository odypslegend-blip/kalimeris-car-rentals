import {basePath} from "./base-path";

/**
 * Absolute origin used for canonical URLs, hreflang, sitemap and JSON-LD.
 *
 * Production MUST set `NEXT_PUBLIC_SITE_URL` to the public origin (no trailing
 * slash). Without it, canonical/sitemap URLs fall back to localhost, which
 * silently poisons indexing — so the fallback is kept for local work and a
 * loud warning is emitted at module load when the variable is missing in a
 * production build.
 *
 * A static Pages deployment has no origin of its own: there
 * `NEXT_PUBLIC_SITE_URL` is the full origin *plus* base path
 * (`https://owner.github.io/kalimeris-car-rentals`), so `absoluteUrl` below
 * already lands on the right URL.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (process.env.NODE_ENV === "production" && !configuredSiteUrl) {
  console.warn(
    "[seo] NEXT_PUBLIC_SITE_URL is not set in production — canonical/sitemap URLs will fall back to http://localhost:3000. Set NEXT_PUBLIC_SITE_URL to the public origin before launch."
  );
}

export const siteUrl = configuredSiteUrl ?? "http://localhost:3000";

const DEFAULT_LOCALE = "el";

/**
 * Normalizes a locale-less route path: "" for home, "/cars", "/cars/slug".
 * A trailing slash is dropped so canonical and hreflang stay byte-identical
 * across pages.
 */
function normalizePath(path: string): string {
  if (!path || path === "/") return "";

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

/**
 * Canonical + hreflang alternates for a page inside the `[locale]` segment.
 * Values are root-relative and resolve against `metadataBase`, which the
 * locale layout sets from `siteUrl`. The deployment `basePath` is part of the
 * path, not of the origin, so it has to be included here: on GitHub Pages the
 * canonical must read `/kalimeris-car-rentals/el/...`, never `/el/...`.
 */
export function buildAlternates(locale: string, path = "") {
  const suffix = normalizePath(path);

  return {
    canonical: `${basePath}/${locale}${suffix}`,
    languages: {
      el: `${basePath}/el${suffix}`,
      en: `${basePath}/en${suffix}`,
      "x-default": `${basePath}/${DEFAULT_LOCALE}${suffix}`
    }
  };
}

/** Absolute URL for a locale + path, used by the sitemap. */
export function absoluteUrl(locale: string, path = ""): string {
  return `${siteUrl}/${locale}${normalizePath(path)}`;
}

/** Absolute hreflang map for the sitemap, including x-default. */
export function absoluteAlternates(path = ""): Record<string, string> {
  return {
    el: absoluteUrl("el", path),
    en: absoluteUrl("en", path),
    "x-default": absoluteUrl(DEFAULT_LOCALE, path)
  };
}
