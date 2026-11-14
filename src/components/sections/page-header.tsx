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
      <div className="page-shell min-w-0 pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="min-w-0 max-w-full font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-3 min-w-0 max-w-[min(24ch,100%)] font-display text-[length:calc(var(--step-head)*1.08)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 min-w-0 max-w-[min(62ch,100%)] text-[1rem] leading-relaxed text-muted sm:text-[1.0625rem]">
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
