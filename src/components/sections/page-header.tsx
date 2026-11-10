import * as React from "react";
import {cn} from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Shared information-page header: eyebrow, the page's only h1, a 62ch intro
 * and optional actions. The hairline keeps the header and the section below
 * on the same editorial rhythm used across the site.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-hairline", className)}>
      <div className="page-shell pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-[24ch] text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.25rem] lg:text-[2.5rem]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 max-w-[62ch] text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">
            {intro}
          </p>
        ) : null}
        {actions ? (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
