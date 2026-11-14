import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

/**
 * Small status label. `demo` is deliberately high-contrast: every stock
 * photograph mapped to a vehicle card must carry it (see
 * public/images/reference/CREDITS.md).
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold uppercase leading-none tracking-[0.14em]",
  {
    variants: {
      variant: {
        neutral: "border-line bg-surface text-muted",
        brand: "border-transparent bg-brand-subtle text-brand-hover",
        demo: "border-transparent bg-media text-white",
        outline: "border-line bg-transparent text-ink",
        heritage:
          "border-line/70 bg-accent-yellow text-accent-yellow-ink dark:border-line dark:bg-brand-subtle dark:text-ink",
        orange:
          "border-transparent bg-accent-orange text-white dark:bg-brand-strong dark:text-brand-ink"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({className, variant, ...props}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({variant}), className)}
      {...props}
    />
  );
}

export {Badge, badgeVariants};
export type {BadgeProps};
