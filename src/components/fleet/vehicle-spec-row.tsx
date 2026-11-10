import type {LucideIcon} from "lucide-react";

type VehicleSpecRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

/**
 * One spec line. Fixed minimum height keeps the two-column list aligned and
 * avoids a reflow when a longer value (e.g. a transmission name) appears.
 */
export function VehicleSpecRow({icon: Icon, label, value}: VehicleSpecRowProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 border-b border-hairline py-2 last:border-b-0">
      <Icon aria-hidden="true" className="size-[1.125rem] shrink-0 text-brand" />
      <dt className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-muted">
        {label}
      </dt>
      <dd className="text-right text-[0.875rem] font-medium leading-snug text-ink">
        {value}
      </dd>
    </div>
  );
}
