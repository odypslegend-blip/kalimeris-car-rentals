import {getTranslations} from "next-intl/server";

/**
 * Site-wide honesty strip. Sits directly above the footer and repeats the
 * non-negotiables: illustrative fleet, unconfirmed photos/specs/terms, no price.
 */
export async function DisclosureStrip() {
  const t = await getTranslations("Footer");

  return (
    <aside
      aria-label={t("disclosureLabel")}
      className="border-t border-line bg-surface-elevated/80 dark:bg-brand-subtle"
    >
      <div className="page-shell py-3.5">
        <p className="text-center text-[0.75rem] leading-relaxed text-ink/80">
          <span
            aria-hidden="true"
            className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-accent-orange align-middle dark:bg-brand"
          />
          {t("disclosure")}
        </p>
      </div>
    </aside>
  );
}
