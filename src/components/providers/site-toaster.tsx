"use client";

import {Toaster} from "sonner";
import {useTheme} from "@/components/providers/theme-provider";

/**
 * Transient network feedback only (e.g. the fetch itself failed).
 *
 * Form validation, delivery failure and "not configured" are *not* toasts: they
 * are inline, `role="alert"` regions that survive a page re-render and can
 * be read with a screen reader. A toast must never be the only evidence of a
 * failed submission.
 */
export function SiteToaster() {
  const {resolvedTheme} = useTheme();

  return (
    <Toaster
      position="top-center"
      // Sonner styles its own close button and icons per theme; keep them in
      // step with the site instead of pinning "light" on a dark page.
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      closeButton
      duration={6000}
      toastOptions={{
        classNames: {
          toast:
            "rounded-card border border-line bg-surface text-ink shadow-panel text-[0.875rem]",
          title: "font-semibold text-ink",
          description: "text-muted",
          actionButton: "bg-brand-strong text-white",
          cancelButton: "border border-line bg-surface text-ink"
        }
      }}
    />
  );
}
