import {getTranslations} from "next-intl/server";
import {Wordmark} from "@/components/brand/wordmark";
import {LanguageSwitcher} from "@/components/layout/language-switcher";
import {MobileNav} from "@/components/layout/mobile-nav";
import {ThemeToggle} from "@/components/layout/theme-toggle";
import {NavLinks} from "@/components/layout/nav-links";
import {BookCallButton} from "@/components/motion/book-call-button";
import {Link} from "@/i18n/navigation";
import {site} from "@/lib/site";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-b-hairline border-t-2 border-t-accent-orange bg-surface transition-colors duration-[var(--token-duration-normal)] ease-brand dark:border-t-0">
      <div className="page-shell flex h-[var(--token-header-h)] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label={`${t("Common.brandName")} ${t("Common.brandSuffix")}`}
            className="rounded-field"
          >
            <Wordmark />
          </Link>
          <span
            aria-hidden="true"
            className="hidden items-center rounded-full border border-line/70 bg-accent-yellow px-2.5 py-0.5 font-mono text-[0.6875rem] font-bold leading-none tracking-[0.12em] tabular-nums text-accent-yellow-ink dark:border-line dark:bg-brand-subtle dark:text-muted 2xl:inline-flex"
          >
            {site.foundedYear}
          </span>
        </div>

        <NavLinks />

        <div className="flex items-center gap-2">
          <BookCallButton
            href={site.phone.href}
            label={site.phone.display}
            className="hidden xl:inline-flex"
          />
          <ThemeToggle label={t("A11y.themeToggle")} />
          <LanguageSwitcher
            label={t("A11y.languageSwitcher")}
            className="hidden sm:flex"
          />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
