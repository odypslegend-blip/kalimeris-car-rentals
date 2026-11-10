import type {MetadataRoute} from "next";
import {basePath} from "@/lib/base-path";
import {siteUrl} from "@/lib/seo";

/** Static so the GitHub Pages export can emit it; harmless on the server. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The request form has no search value and the API is not public.
        // `basePath` is empty for the server build and `/kalimeris-car-rentals`
        // for the static export, where these paths live under the sub-path.
        disallow: [
          `${basePath}/api/`,
          `${basePath}/el/request`,
          `${basePath}/en/request`
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
