import {ArrowUpRight} from "lucide-react";
import {getLocale, getTranslations} from "next-intl/server";
import {Wordmark} from "@/components/brand/wordmark";
import {Link} from "@/i18n/navigation";
import {directionsUrl, site} from "@/lib/site";

const footerLinkClasses =
  "inline-flex min-h-11 items-center text-[0.875rem] text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink";

const contactLinkClasses =
  "inline-flex min-h-11 items-center break-words text-[0.875rem] text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink";

const externalLinkClasses =
  "inline-flex min-h-11 items-center gap-1.5 text-[0.875rem] text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-brand";

const externalSmallLinkClasses =
  "inline-flex min-h-11 items-center gap-1.5 text-[0.8125rem] text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-brand";

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations();
  const address =
    locale === "el" ? site.address.fullEl : site.address.fullEn;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              {t("Footer.tagline")}
            </p>

            <div className="mt-4 flex flex-col">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer noopener"
                className={externalLinkClasses}
              >
                Facebook
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
              <a
                href={site.social.tiktok}
                target="_blank"
                rel="noreferrer noopener"
                className={externalLinkClasses}
              >
                TikTok
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>

            <div className="mt-3 flex flex-col">
              <a
                href={site.carGr.cars}
                target="_blank"
                rel="noreferrer noopener"
                className={externalSmallLinkClasses}
              >
                {t("Footer.carsForSale")}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
              <a
                href={site.carGr.parts}
                target="_blank"
                rel="noreferrer noopener"
                className={externalSmallLinkClasses}
              >
                {t("Footer.parts")}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </div>

          <nav aria-label={t("Footer.explore")}>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
              {t("Footer.explore")}
            </h2>
            <ul className="mt-2 flex flex-col">
              <li>
                <Link href="/cars" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.cars")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  prefetch={false}
                  className={footerLinkClasses}
                >
                  {t("Footer.links.services")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  prefetch={false}
                  className={footerLinkClasses}
                >
                  {t("Footer.links.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/faq" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.faq")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("Footer.information")}>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
              {t("Footer.information")}
            </h2>
            <ul className="mt-2 flex flex-col">
              <li>
                <Link href="/about" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  prefetch={false}
                  className={footerLinkClasses}
                >
                  {t("Footer.links.contact")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  prefetch={false}
                  className={footerLinkClasses}
                >
                  {t("Footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/rental-terms"
                  prefetch={false}
                  className={footerLinkClasses}
                >
                  {t("Footer.links.rentalTerms")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
              {t("Footer.contactTitle")}
            </h2>

            <address className="mt-2 flex flex-col not-italic">
              <a
                href={directionsUrl(locale)}
                target="_blank"
                rel="noreferrer noopener"
                className={contactLinkClasses}
              >
                {address}
              </a>
              <a href={site.phone.href} className={contactLinkClasses}>
                {site.phone.display}
              </a>
              <a href={site.reservationsPhone.href} className={contactLinkClasses}>
                {t("Footer.reservationsLabel")}: {site.reservationsPhone.display}
              </a>
              <a href={`mailto:${site.email}`} className={contactLinkClasses}>
                {site.email}
              </a>
              <a href={`mailto:${site.serviceEmail}`} className={contactLinkClasses}>
                {site.serviceEmail}
              </a>
            </address>

            <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
              {t("Footer.hoursLabel")}
            </p>
            <ul className="mt-2 flex flex-col gap-1 text-[0.8125rem] leading-relaxed text-muted">
              {site.hours.map((h) => (
                <li key={h.daysEn}>
                  {locale === "el" ? h.daysEl : h.daysEn} ·{" "}
                  {locale === "el" ? h.timeEl : h.timeEn}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
              {t("Footer.vatLabel")} {site.vat} · {t("Footer.gemiLabel")}{" "}
              {site.gemi}
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-hairline pt-6 text-[0.8125rem] leading-relaxed text-muted md:mt-12">
          {t("Footer.status")}
        </p>

        <div className="mt-4 flex flex-col gap-2 text-[0.75rem] leading-relaxed text-muted md:flex-row md:items-center md:justify-between">
          <p>{t("Footer.photoCredit")}</p>
          <p>
            &copy; {year} {t("Common.brandName")} {t("Common.brandSuffix")}.{" "}
            {t("Footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
