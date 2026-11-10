import {getTranslations} from "next-intl/server";
import {Wordmark} from "@/components/brand/wordmark";
import {Link} from "@/i18n/navigation";

const footerLinkClasses =
  "inline-flex min-h-11 items-center text-[0.875rem] text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink";

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-12">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              {t("Footer.tagline")}
            </p>
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
                <Link href="/how-it-works" prefetch={false} className={footerLinkClasses}>
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
                <Link href="/contact" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/rental-terms" prefetch={false} className={footerLinkClasses}>
                  {t("Footer.links.rentalTerms")}
                </Link>
              </li>
            </ul>
          </nav>
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
