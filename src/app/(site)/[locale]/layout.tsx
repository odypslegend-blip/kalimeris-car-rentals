import type {Metadata, Viewport} from "next";
import {JetBrains_Mono, Manrope, Syne} from "next/font/google";
import {notFound} from "next/navigation";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {DisclosureStrip} from "@/components/layout/disclosure-strip";
import {SiteFooter} from "@/components/layout/site-footer";
import {SiteHeader} from "@/components/layout/site-header";
import {SmoothScrollProvider} from "@/components/motion/smooth-scroll";
import {SiteToaster} from "@/components/providers/site-toaster";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {routing} from "@/i18n/routing";
import {buildAlternates} from "@/lib/seo";
import {themeInitScript} from "@/lib/theme/theme-init";
import "../../globals.css";

const syne = Syne({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-syne",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
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
  colorScheme: "light dark",
  themeColor: [
    {media: "(prefers-color-scheme: light)", color: "#f7f8f7"},
    {media: "(prefers-color-scheme: dark)", color: "#1c1c1c"}
  ]
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
    <html
      lang={locale}
      className={`${syne.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <script
          id="theme-init"
          key="theme-init"
          dangerouslySetInnerHTML={{__html: themeInitScript}}
        />
        <NextIntlClientProvider>
          <ThemeProvider>
            <SmoothScrollProvider />
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
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
