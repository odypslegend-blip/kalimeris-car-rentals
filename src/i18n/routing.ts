import {defineRouting} from "next-intl/routing";

/**
 * Greek is the primary business language, so `el` is the default locale and
 * `/` always resolves to `/el`. English stays one visible click away.
 */
export const routing = defineRouting({
  locales: ["el", "en"],
  defaultLocale: "el",
  localePrefix: "always",
  localeDetection: false
});

export type Locale = (typeof routing.locales)[number];
