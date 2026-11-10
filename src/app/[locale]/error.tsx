"use client";

import {ArrowRight, RotateCcw} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";

type LocaleErrorProps = {
  error: Error & {digest?: string};
  reset: () => void;
};

/**
 * Locale-scoped error boundary. It renders inside the locale layout, so
 * `NextIntlClientProvider` is above it and `useTranslations` has messages.
 * No stack trace, digest or internal detail is shown.
 */
export default function LocaleError({reset}: LocaleErrorProps) {
  const t = useTranslations("Error");

  return (
    <section className="page-shell flex min-h-[60vh] flex-col justify-center py-16 md:py-24">
      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 max-w-[24ch] text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.25rem] lg:text-[2.5rem]">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">
        {t("body")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          {t("retry")}
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">
            {t("home")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
