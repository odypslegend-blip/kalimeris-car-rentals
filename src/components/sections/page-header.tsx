import * as React from "react";
import {cn} from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  index?: string;
  title: string;
  intro?: string;
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Shared information-page header: eyebrow with automotive tick bar, the page's
 * only h1, a 62ch intro and optional actions. Warm elevated framing in light
 * mode transitions cleanly back to monochrome hairline in dark mode.
 */
export function PageHeader({
  eyebrow,
  index,
  title,
  intro,
  actions,
  className
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-line bg-surface-elevated/35 dark:border-hairline dark:bg-transparent",
        className
      )}
    >
      <div className="page-shell min-w-0 pb-10 pt-10 md:pb-14 md:pt-16">
        <p className="flex min-w-0 max-w-full items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand-hover dark:text-brand">
          <span
            aria-hidden="true"
            className="h-[2px] w-3.5 shrink-0 bg-accent-orange dark:bg-brand"
          />
          <span className="min-w-0">
            {index ? <span className="text-muted">{index} {"//"} </span> : null}
            {eyebrow}
          </span>
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
