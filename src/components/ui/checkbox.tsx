"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {Check} from "lucide-react";
import {cn} from "@/lib/utils";

/**
 * Radix checkbox (shadcn/ui conventions). The control itself is 20px so it
 * reads as a checkbox, not a button; the surrounding label is expected to
 * provide the 44px touch target.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-[5px] border border-control bg-surface text-brand-ink transition-colors duration-[var(--token-duration-fast)] ease-brand",
        "hover:border-muted focus-visible:border-brand",
        "data-[state=checked]:border-brand-strong data-[state=checked]:bg-brand-strong data-[state=indeterminate]:border-brand-strong data-[state=indeterminate]:bg-brand-strong",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "aria-invalid:border-danger",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export {Checkbox};
