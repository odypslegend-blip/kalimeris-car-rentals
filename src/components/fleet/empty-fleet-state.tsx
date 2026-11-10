import {SearchX} from "lucide-react";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {cn} from "@/lib/utils";

type EmptyFleetStateProps = {
  clearHref: string;
  className?: string;
};

/**
 * Honest empty result: no "show everything anyway" trickery, just a clear
 * explanation and a way back to the full list.
 */
export function EmptyFleetState({clearHref, className}: EmptyFleetStateProps) {
  const t = useTranslations("Fleet");

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-line bg-surface px-6 py-14 text-center shadow-card",
        className
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-subtle text-brand">
        <SearchX aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-5 max-w-[26ch] text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {t("emptyTitle")}
      </h2>
      <p className="mt-2 max-w-[42ch] text-[0.9375rem] leading-relaxed text-muted">
        {t("emptyBody")}
      </p>
      <Link
        href={clearHref}
        prefetch={false}
        className="mt-5 inline-flex min-h-11 items-center rounded-field border border-line bg-surface px-5 text-[0.875rem] font-semibold text-brand transition-colors duration-[var(--token-duration-fast)] ease-brand hover:border-brand hover:bg-brand-subtle"
      >
        {t("clear")}
      </Link>
    </div>
  );
}
