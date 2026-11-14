import * as React from "react";
import {cn} from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  index?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
};

/**
 * Shared section intro: automotive eyebrow bar, heading and optional
 * description. Uses design tokens so every section keeps the same type rhythm
 * in light and dark themes.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  className,
  id
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow || index ? (
        <p
          className={cn(
            "flex min-w-0 max-w-full items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand-hover dark:text-brand",
            align === "center" && "justify-center"
          )}
        >
          <span
            aria-hidden="true"
            className="h-[2px] w-3.5 shrink-0 bg-accent-orange dark:bg-brand"
          />
          <span className="min-w-0">
            {index ? (
              <span className="text-muted">
                {index} {eyebrow ? "// " : ""}
              </span>
            ) : null}
            {eyebrow}
          </span>
        </p>
      ) : null}
      <Heading
        id={id}
        className="min-w-0 max-w-[min(22ch,100%)] font-display text-[length:var(--step-head)] font-bold leading-[1.12] tracking-[-0.025em] text-ink"
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "min-w-0 max-w-[min(58ch,100%)] text-[0.9375rem] leading-relaxed text-muted sm:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
