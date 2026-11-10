import * as React from "react";
import {cn} from "@/lib/utils";

/**
 * Multi-line text input. Matches `Input`'s field styling so a form never shows
 * two different borders, and keeps a comfortable touch height.
 */
function Textarea({className, ...props}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[7.5rem] w-full min-w-0 resize-y rounded-field border border-control bg-surface px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink shadow-none transition-colors duration-[var(--token-duration-fast)] ease-brand",
        "placeholder:text-muted hover:border-ink/20 focus-visible:border-brand",
        "disabled:cursor-not-allowed disabled:bg-background disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:focus-visible:border-danger",
        className
      )}
      {...props}
    />
  );
}

export {Textarea};
