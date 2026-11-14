import * as React from "react";
import {cn} from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
};

/**
 * Shared section intro: eyebrow, heading and optional description.
 * Uses only design tokens so every section keeps the same type rhythm.
 */
export function SectionHeading({
  eyebrow,
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
      {eyebrow ? (
        <p className="min-w-0 max-w-full font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
          {eyebrow}
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
