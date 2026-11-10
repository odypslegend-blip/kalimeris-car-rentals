"use client";

import * as React from "react";
import {MapPin} from "lucide-react";
import {useLocale} from "next-intl";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {getLocationName, getLocationNote, locations} from "@/lib/data/locations";
import {cn} from "@/lib/utils";

type LocationSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /** Marks the field as required for assistive technology. */
  required?: boolean;
  /** Optional control rendered on the right of the label row (e.g. a toggle). */
  labelAction?: React.ReactNode;
  className?: string;
};

/**
 * Pickup / return location. Radix Select keeps keyboard, typeahead and
 * screen-reader behaviour native; the option row shows the name plus the
 * honest address note.
 */
export function LocationSelect({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  error,
  disabled,
  required,
  labelAction,
  className
}: LocationSelectProps) {
  const locale = useLocale();
  const errorId = `${id}-error`;

  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <div className="flex min-h-6 min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>

      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-required={required ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin
              aria-hidden="true"
              className="size-4 shrink-0 text-muted"
            />
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>

        <SelectContent>
          {locations.map((location) => {
            const name = getLocationName(location, locale);
            const note = getLocationNote(location, locale);

            return (
              <SelectItem
                key={location.id}
                value={location.id}
                textValue={`${name} — ${note}`}
              >
                <span className="flex flex-col gap-0.5 py-0.5 text-left">
                  <span className="text-[0.9375rem] font-medium leading-snug text-ink">
                    {name}
                  </span>
                  <span className="text-xs font-normal leading-snug text-muted">
                    {note}
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-snug text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
