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
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={id}
        className="max-w-[22ch] text-[1.75rem] font-semibold leading-[1.14] tracking-[-0.02em] text-ink sm:text-[2rem] lg:text-[2.375rem]"
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "max-w-[58ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
