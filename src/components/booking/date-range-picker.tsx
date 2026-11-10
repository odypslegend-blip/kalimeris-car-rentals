"use client";

import * as React from "react";
import type {DateRange} from "@daypicker/react";
import {isAfter} from "date-fns";
import {CalendarDays, ChevronDown} from "lucide-react";
import {useLocale} from "next-intl";
import {Calendar} from "@/components/ui/calendar";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {parseIsoDate, startOfMonthNoon, toIsoDate, noonToday, formatDateLabel} from "@/lib/dates";
import {cn} from "@/lib/utils";

export type DateRangeValue = {
  from?: string;
  to?: string;
};

type DateRangePickerProps = {
  id: string;
  label: string;
  placeholder: string;
  from?: string;
  to?: string;
  onChange: (value: DateRangeValue) => void;
  labels: {
    calendar: string;
    chooseStart: string;
    chooseEnd: string;
    rangeSelected: string;
  };
  error?: string;
  /** Marks the field as required for assistive technology. */
  required?: boolean;
  className?: string;
};

/**
 * Accessible range picker: a real button trigger, a Radix Popover with a
 * focus-managed calendar, past days disabled, and a close on complete range.
 */
export function DateRangePicker({
  id,
  label,
  placeholder,
  from,
  to,
  onChange,
  labels,
  error,
  required,
  className
}: DateRangePickerProps) {
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  // Lazy initial value: the calendar only mounts after a click, so this never
  // takes part in server rendering or hydration.
  const [today] = React.useState<Date>(() => noonToday());

  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  const errorId = `${id}-error`;

  const selected: DateRange | undefined = fromDate
    ? {from: fromDate, to: toDate}
    : undefined;

  const display = fromDate
    ? toDate
      ? `${formatDateLabel(fromDate, locale)} – ${formatDateLabel(toDate, locale)}`
      : `${formatDateLabel(fromDate, locale)} – …`
    : placeholder;

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      onChange({});
      return;
    }

    const nextFrom = toIsoDate(range.from);

    if (!range.to) {
      onChange({from: nextFrom});
      return;
    }

    const nextTo = toIsoDate(range.to);

    if (!isAfter(range.to, range.from)) {
      // A same-day range is not a valid rental window: keep the start and wait
      // for a later return day instead of committing an invalid range.
      onChange({from: nextFrom});
      return;
    }

    onChange({from: nextFrom, to: nextTo});
    window.setTimeout(() => setOpen(false), 0);
  }

  const footer = toDate
    ? labels.rangeSelected
    : fromDate
      ? labels.chooseEnd
      : labels.chooseStart;

  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            // The trigger opens a calendar popover, so combobox is the role that
            // both matches the interaction and legally carries aria-required
            // (a plain button role does not, which axe flags as aria-allowed-attr).
            // Radix PopoverTrigger sets aria-expanded and aria-controls itself.
            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
            role="combobox"
            data-invalid={error ? true : undefined}
            aria-expanded={open}
            aria-required={required ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "flex h-11 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-field border border-control bg-surface px-3 text-left text-[0.9375rem] transition-colors duration-[var(--token-duration-fast)] ease-brand",
              "hover:border-ink/20 focus-visible:border-brand data-[state=open]:border-brand",
              "data-[invalid=true]:border-danger data-[invalid=true]:focus-visible:border-danger",
              fromDate ? "text-ink" : "text-muted"
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <CalendarDays
                aria-hidden="true"
                className="size-4 shrink-0 text-muted"
              />
              <span className="min-w-0 truncate">{display}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent aria-label={labels.calendar}>
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            disabled={{before: today}}
            startMonth={startOfMonthNoon(today)}
            resetOnSelect
            autoFocus
            locale={locale}
            aria-label={labels.calendar}
            footer={
              <p aria-live="polite" className="rdp-footer">
                {footer}
              </p>
            }
          />
        </PopoverContent>
      </Popover>

      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-snug text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
