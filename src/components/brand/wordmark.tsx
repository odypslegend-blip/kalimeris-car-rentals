import {cn} from "@/lib/utils";
import {getTranslations} from "next-intl/server";

type WordmarkProps = {
  className?: string;
  /** Hide the "CAR RENTALS" line where vertical space is tight. */
  compact?: boolean;
};

/**
 * Proposed identity from assets/brand/kalimeris-logo-proposal.svg.
 * The K glyph is drawn once; the wordmark stays live text so it scales with
 * the type system and keeps selectable, accessible characters.
 * NOTE: proposed mark, pending client approval.
 */
export async function Wordmark({className, compact = false}: WordmarkProps) {
  const t = await getTranslations("Common");

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="8 6 68 74"
        aria-hidden="true"
        focusable="false"
        className="h-8 w-auto shrink-0 lg:h-9"
      >
        <path
          d="M11 10H26V38L52 10H73L45 39L74 76H55L34 50L26 59V76H11Z"
          fill="var(--token-brand)"
        />
        <path d="M26 40L56 10H71L40 42L26 54Z" fill="var(--token-brand-rib)" />
      </svg>
      <span className="flex flex-col justify-center leading-none">
        <span className="text-[1.0625rem] font-extrabold tracking-[0.1em] text-ink lg:text-[1.1875rem]">
          {t("brandName")}{" "}
        </span>
        {compact ? null : (
          <span className="mt-1.5 text-[0.5rem] font-bold tracking-[0.36em] text-muted lg:text-[0.5625rem]">
            {t("brandSuffix")}
          </span>
        )}
      </span>
    </span>
  );
}
