import * as React from "react";
import {TriangleAlert} from "lucide-react";
import {cn} from "@/lib/utils";

type LegalNoticeProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Draft/legal-review notice. `role="note"` keeps it out of the heading order
 * while still announcing the caveat with the surrounding text.
 */
export function LegalNotice({children, className}: LegalNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-card border border-notice-border bg-notice px-4 py-4 md:px-5",
        className
      )}
    >
      <TriangleAlert
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-notice-ink"
      />
      <p className="text-[0.875rem] font-medium leading-relaxed text-notice-ink">
        {children}
      </p>
    </div>
  );
}
