import * as React from "react";
import {cn} from "@/lib/utils";

/**
 * Text input. 44px tall on every size so touch targets stay compliant.
 */
function Input({className, type, ...props}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-field border border-control bg-surface px-3 text-[0.9375rem] text-ink shadow-none transition-colors duration-[var(--token-duration-fast)] ease-brand",
        "placeholder:text-muted hover:border-muted focus-visible:border-brand",
        "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:focus-visible:border-danger",
        className
      )}
      {...props}
    />
  );
}

export {Input};
