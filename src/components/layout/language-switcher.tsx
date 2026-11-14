"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link, usePathname} from "@/i18n/navigation";
import {routing} from "@/i18n/routing";
import {cn} from "@/lib/utils";

/**
 * Each language names itself, whatever the current UI locale is: EL reads
 * "Ελληνικά" and EN reads "English" on both pages. Falls back to the
 * translated label if the runtime has no locale data for it.
 */
function endonym(locale: string, fallback: string) {
  try {
    return (
      new Intl.DisplayNames([locale], {type: "language"}).of(locale) ?? fallback
    );
  } catch {
    return fallback;
  }
}

type LanguageSwitcherProps = {
  label: string;
  className?: string;
  /** Called before navigating, so a mobile sheet can close itself. */
  onNavigate?: () => void;
};

/**
 * Visible EL/EN switcher. Renders real links so it works without JavaScript
 * and each locale has its own crawlable URL.
 */
export function LanguageSwitcher({
  label,
  className,
  onNavigate
}: LanguageSwitcherProps) {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("A11y");

  // Preserve the current query string and hash across a language switch. Read
  // from `window` after hydration instead of `useSearchParams`, which would
  // require a Suspense boundary and force dynamic rendering on static pages.
  // Keyed on `pathname` so a client-side navigation re-reads the live URL.
  const [suffix, setSuffix] = useState("");

  useEffect(() => {
    // Deliberate post-hydration read: the server cannot know the query/hash,
    // and rendering it eagerly would mismatch hydration. One state update per
    // path change is the smallest correct fix.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuffix(window.location.search + window.location.hash);
  }, [pathname]);

  return (
    <nav
      aria-label={label}
      className={cn(
        "flex items-center gap-1 rounded-full border border-line bg-surface p-1",
        className
      )}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        const languageName = endonym(locale, t(`languageName.${locale}`));
        const description = isActive
          ? t("currentLanguage", {language: languageName})
          : t("switchToLanguage", {language: languageName});

        return (
          <Link
            key={locale}
            href={`${pathname}${suffix}`}
            locale={locale}
            lang={locale}
            onClick={onNavigate}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${locale.toUpperCase()} — ${description}`}
            className={cn(
              "inline-flex min-h-9 min-w-10 items-center justify-center rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] transition-colors duration-[var(--token-duration-fast)] ease-brand",
              isActive
                ? "bg-brand-strong text-white"
                : "text-muted hover:bg-brand-subtle hover:text-ink"
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
