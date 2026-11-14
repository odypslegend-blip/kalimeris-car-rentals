import * as React from "react";
import {cn} from "@/lib/utils";

type HeritageBadgeProps = {
  label: string;
  sublabel?: string;
  className?: string;
};

type RouteIndicatorProps = {
  code?: string;
  route: string;
  className?: string;
};

type TechnicalDividerProps = {
  label?: string;
  code?: string;
  className?: string;
};

type ChassisIllustrationProps = {
  className?: string;
};

/**
 * Heritage crest pill: warm yellow archival finish with an orange precision
 * marker in light mode, switching to crisp monochrome in dark mode.
 */
export function HeritageBadge({
  label,
  sublabel,
  className
}: HeritageBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-accent-yellow/80 bg-accent-yellow-subtle px-3 py-1.5 font-mono text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-accent-yellow-ink dark:border-line dark:bg-brand-subtle dark:text-ink",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-2 shrink-0 rotate-45 rounded-[1px] bg-accent-orange dark:bg-brand"
      />
      <span className="min-w-0">{label}</span>
      {sublabel ? (
        <>
          <span
            aria-hidden="true"
            className="h-3 w-px shrink-0 bg-ink/20 dark:bg-line"
          />
          <span className="min-w-0 font-medium text-muted">{sublabel}</span>
        </>
      ) : null}
    </span>
  );
}

/**
 * Highway route coordinate strip: pairs an optional route code badge with a
 * live directional marker and road address without risking horizontal overflow.
 */
export function RouteIndicator({
  code,
  route,
  className
}: RouteIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-2 rounded-field border border-line bg-surface/95 px-3 py-1.5 font-mono text-[11px] font-medium leading-snug tracking-[0.1em] text-ink shadow-xs dark:bg-surface dark:shadow-none",
        className
      )}
    >
      {code ? (
        <span className="inline-flex shrink-0 items-center rounded-[4px] border border-brand/25 bg-brand-subtle px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-hover dark:border-line dark:bg-brand-subtle dark:text-brand">
          {code}
        </span>
      ) : null}
      <span className="min-w-0 break-words">{route}</span>
    </span>
  );
}

/**
 * Editorial automotive calibration rule combining a precision tick, optional
 * technical code/label, and the `.road-divider` dashed lane marker.
 */
export function TechnicalDivider({
  label,
  code,
  className
}: TechnicalDividerProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center gap-3 py-1",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-[2px] bg-accent-orange dark:bg-brand"
      />
      {code ? (
        <span className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          {code}
        </span>
      ) : null}
      {label ? (
        <span className="min-w-0 truncate font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          {label}
        </span>
      ) : null}
      <span aria-hidden="true" className="road-divider min-w-6 flex-1" />
      <span
        aria-hidden="true"
        className="hidden h-[2px] w-5 shrink-0 rounded-full bg-brand/45 dark:bg-line sm:inline-block"
      />
    </div>
  );
}

/**
 * Pure-vector architectural touring chassis & wheelbase schematic.
 * Uses vibrant teal, warm yellow and orange technical callouts in light mode,
 * receding cleanly to subtle monochrome lines in dark mode.
 */
export function ChassisIllustration({className}: ChassisIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "automotive-frame relative overflow-hidden rounded-card border border-line/90 bg-surface/85 p-4 dark:border-line dark:bg-surface/40",
        className
      )}
    >
      <svg
        viewBox="0 0 360 116"
        fill="none"
        focusable="false"
        className="h-auto w-full"
      >
        {/* Subtle blueprint horizontal datum lines */}
        <line
          x1="16"
          y1="88"
          x2="344"
          y2="88"
          stroke="var(--token-border)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1="16"
          y1="26"
          x2="344"
          y2="26"
          stroke="var(--token-hairline)"
          strokeWidth="1"
        />

        {/* Warm headlight / telemetry accent wash (muted cleanly in dark) */}
        <path
          d="M294 58L340 50V66L294 63Z"
          className="fill-accent-yellow-subtle dark:opacity-20"
        />

        {/* Upper touring silhouette */}
        <path
          d="M42 74H29C25.5 74 23 71.2 23.5 67.8L27 49C27.8 44.8 31.2 41.8 35.4 41.3L72 37L112 19.5C119.5 16.2 127.6 14.5 135.8 14.5H204C217 14.5 229.6 18.8 239.8 26.8L261 43.5L318 49.5C325.8 50.3 332 56.5 332.8 64.3L333.5 70.5C333.8 72.5 332.2 74 330.2 74H306"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-brand dark:stroke-muted"
        />

        {/* Cabin glass line */}
        <path
          d="M89 39.5L119 23.5C124.2 20.8 130 19.5 135.9 19.5H198C207.8 19.5 217.3 22.8 225 28.8L244 43.5H89V39.5Z"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinejoin="round"
          className="stroke-brand dark:stroke-muted"
        />
        <line
          x1="164"
          y1="20"
          x2="164"
          y2="43.5"
          strokeOpacity="0.4"
          strokeWidth="1.2"
          className="stroke-brand dark:stroke-muted"
        />

        {/* Lower chassis rail between wheel arches */}
        <line
          x1="126"
          y1="74"
          x2="234"
          y2="74"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          className="stroke-ink dark:stroke-muted"
        />

        {/* Rear wheel assembly */}
        <circle
          cx="90"
          cy="74"
          r="21"
          strokeWidth="1.6"
          className="fill-surface stroke-brand dark:stroke-muted"
        />
        <circle
          cx="90"
          cy="74"
          r="11"
          strokeWidth="1.2"
          className="fill-brand-subtle stroke-brand dark:stroke-muted"
        />
        <circle
          cx="90"
          cy="74"
          r="3.2"
          className="fill-accent-orange dark:fill-muted"
        />

        {/* Front wheel assembly */}
        <circle
          cx="270"
          cy="74"
          r="21"
          strokeWidth="1.6"
          className="fill-surface stroke-brand dark:stroke-muted"
        />
        <circle
          cx="270"
          cy="74"
          r="11"
          strokeWidth="1.2"
          className="fill-brand-subtle stroke-brand dark:stroke-muted"
        />
        <circle
          cx="270"
          cy="74"
          r="3.2"
          className="fill-accent-orange dark:fill-muted"
        />

        {/* Wheelbase alignment dimension gauge */}
        <line
          x1="90"
          y1="103"
          x2="270"
          y2="103"
          strokeOpacity="0.85"
          strokeWidth="1.2"
          className="stroke-accent-orange dark:stroke-line"
        />
        <line
          x1="90"
          y1="98"
          x2="90"
          y2="108"
          strokeWidth="1.4"
          className="stroke-accent-orange dark:stroke-muted"
        />
        <line
          x1="270"
          y1="98"
          x2="270"
          y2="108"
          strokeWidth="1.4"
          className="stroke-accent-orange dark:stroke-muted"
        />
        <rect
          x="175"
          y="100.5"
          width="10"
          height="5"
          rx="2.5"
          className="fill-accent-orange dark:fill-muted"
        />
      </svg>
    </div>
  );
}
