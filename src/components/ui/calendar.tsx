"use client";

import * as React from "react";
import {DayPicker, type DayPickerProps} from "@daypicker/react";
import {el, enGB} from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import {cn} from "@/lib/utils";

/**
 * DayPicker v10 (published as `@daypicker/react`).
 *
 * v10 differences that matter here:
 * - `classNames` keys are the `UI` / `DayFlag` / `SelectionState` enums
 *   (`month_grid`, `button_previous`, `selected`, `range_middle`, ...), not the
 *   old shadcn v9 map (`table`, `nav_button`, `day_selected`).
 * - `onSelect` receives `(range, triggerDate, modifiers, event)`.
 * - `fromDate` / `toDate` no longer exist; navigation bounds are `startMonth` /
 *   `endMonth`, and hidden days use the `hidden` matcher.
 *
 * The visual layer is scoped in globals.css under `.kalimeris-calendar`, so the
 * component stays a thin, typed wrapper.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

type CalendarProps = DistributiveOmit<
  React.ComponentProps<typeof DayPicker>,
  "locale"
> & {
  locale: string;
};

function Calendar({className, locale, ...props}: CalendarProps) {
  return (
    <DayPicker
      noonSafe
      weekStartsOn={1}
      showOutsideDays={false}
      locale={locale === "el" ? el : enGB}
      className={cn("kalimeris-calendar", className)}
      {...(props as DayPickerProps)}
    />
  );
}

export {Calendar};
export type {CalendarProps};
