import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import {notFound} from "next/navigation";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {DisclosureStrip} from "@/components/layout/disclosure-strip";
import {SiteFooter} from "@/components/layout/site-footer";
import {SiteHeader} from "@/components/layout/site-header";
import {SiteToaster} from "@/components/providers/site-toaster";
import {routing} from "@/i18n/routing";
import {buildAlternates} from "@/lib/seo";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap"
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8f7",
  colorScheme: "light"
};

export async function generateMetadata({
  params
}: LocaleLayoutProps): Promise<Metadata> {
  const {locale} = await params;
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const t = await getTranslations({locale: activeLocale, namespace: "Meta"});
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // `NEXT_PUBLIC_SITE_URL` may include the deployment base path (GitHub Pages
  // serves the export from `/kalimeris-car-rentals`). `buildAlternates` already
  // carries that base path, and Next joins `metadataBase.pathname` with every
  // relative metadata URL — so metadataBase is deliberately the origin only,
  // otherwise the base path would appear twice in canonical/hreflang.
  const metadataBase = new URL(siteUrl);
  metadataBase.pathname = "/";

  return {
    metadataBase,
    title: {
      default: t("title"),
      template: `%s · ${t("brand")}`
    },
    description: t("description"),
    applicationName: t("brand"),
    alternates: buildAlternates(activeLocale, ""),
    openGraph: {
      type: "website",
      siteName: t("brand"),
      title: t("title"),
      description: t("description"),
      locale: activeLocale === "el" ? "el_GR" : "en_US",
      alternateLocale: activeLocale === "el" ? "en_US" : "el_GR"
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for the locale segment.
  setRequestLocale(locale);

  const t = await getTranslations({locale, namespace: "A11y"});

  return (
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <DisclosureStrip />
          <SiteFooter />
          <SiteToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
