"use client";

import * as React from "react";
import {ArrowRight} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {DateRangePicker} from "@/components/booking/date-range-picker";
import {LocationSelect} from "@/components/booking/location-select";
import {Button} from "@/components/ui/button";
import {useRouter} from "@/i18n/navigation";
import {
  hasBookingErrors,
  validateBookingInput,
  type BookingErrorCode
} from "@/lib/search-params";
import {cn} from "@/lib/utils";

type HeroSearchProps = {
  helperText: string;
  className?: string;
};

type BookingErrors = {
  pickup?: string;
  return?: string;
  dates?: string;
};

/**
 * Booking search: pickup, optional separate return location, and a date range.
 * A submit never claims a booking — it transfers the chosen query to the fleet
 * page with next-intl's locale-aware router.
 */
export function HeroSearch({helperText, className}: HeroSearchProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const isEl = locale === "el";
  const router = useRouter();
  const uid = React.useId().replaceAll(":", "");
  const formRef = React.useRef<HTMLFormElement>(null);

  const [pickup, setPickup] = React.useState("");
  const [returnLocation, setReturnLocation] = React.useState("");
  const [sameAsPickup, setSameAsPickup] = React.useState(true);
  const [from, setFrom] = React.useState<string | undefined>();
  const [to, setTo] = React.useState<string | undefined>();
  const [errors, setErrors] = React.useState<BookingErrors>({});

  const pickupId = `pickup-${uid}`;
  const returnId = `return-${uid}`;
  const datesId = `dates-${uid}`;

  function handlePickupChange(value: string) {
    setPickup(value);
    if (sameAsPickup || !returnLocation) {
      setReturnLocation(value);
    }
    setErrors((current) => ({...current, pickup: undefined}));
  }

  function handleReturnChange(value: string) {
    setReturnLocation(value);
    setErrors((current) => ({...current, return: undefined}));
  }

  function handleDatesChange(value: {from?: string; to?: string}) {
    setFrom(value.from);
    setTo(value.to);
    setErrors((current) => ({...current, dates: undefined}));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: BookingErrors = {};
    const effectiveReturn = sameAsPickup ? pickup : returnLocation;
    const codes = validateBookingInput({
      pickup,
      returnLocation,
      sameAsPickup,
      from,
      to
    });

    const errorText = (code: BookingErrorCode | undefined) =>
      code ? t(`errors.${code}`) : undefined;

    nextErrors.pickup = errorText(codes.pickup);
    nextErrors.return = errorText(codes.return);
    nextErrors.dates = errorText(codes.dates);

    setErrors(nextErrors);

    if (hasBookingErrors(codes)) {
      window.requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(
            '[aria-invalid="true"], [data-invalid="true"]'
          )
          ?.focus();
      });
      return;
    }

    router.replace({
      pathname: "/cars",
      query: {
        pickup,
        return: effectiveReturn,
        from,
        to
      }
    });
  }

  const sameAsPickupControl = (
    <label
      htmlFor={`same-as-pickup-${uid}`}
      className="-my-1.5 inline-flex h-9 cursor-pointer items-center gap-2 rounded-field text-[0.75rem] font-semibold text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink"
    >
      <input
        id={`same-as-pickup-${uid}`}
        type="checkbox"
        checked={sameAsPickup}
        onChange={(event) => {
          const checked = event.target.checked;
          setSameAsPickup(checked);
          if (checked) {
            setReturnLocation(pickup);
            setErrors((current) => ({...current, return: undefined}));
          } else if (!returnLocation) {
            setReturnLocation(pickup);
          }
        }}
        className="size-4 shrink-0 rounded-[4px] border border-line accent-brand"
      />
      <span className="whitespace-nowrap">{t("sameAsPickup")}</span>
    </label>
  );

  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-4 shadow-panel sm:p-6 lg:p-7",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-hairline pb-3">
        <div className="flex items-center gap-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink">
          <span
            aria-hidden="true"
            className="inline-block size-2 shrink-0 rounded-full bg-accent-orange dark:bg-brand"
          />
          <span>
            {isEl ? "ΔΙΑΔΡΟΜΗ & ΗΜΕΡΟΜΗΝΙΕΣ" : "ROUTE & DATES"}
          </span>
        </div>
        <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
          {isEl ? "ΕΔΡΑ ΚΟΖΑΝΗΣ · 3ο ΧΛΜ." : "KOZANI HQ · 3RD KM"}
        </span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-end xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.12fr)_auto]">
          <LocationSelect
            id={pickupId}
            label={t("pickup")}
            placeholder={t("chooseLocation")}
            value={pickup}
            onValueChange={handlePickupChange}
            error={errors.pickup}
          />

          <LocationSelect
            id={returnId}
            label={t("return")}
            placeholder={t("chooseLocation")}
            value={sameAsPickup ? pickup : returnLocation}
            onValueChange={handleReturnChange}
            error={errors.return}
            disabled={sameAsPickup}
            labelAction={sameAsPickupControl}
          />

          <DateRangePicker
            id={datesId}
            label={t("dates")}
            placeholder={t("selectDates")}
            from={from}
            to={to}
            onChange={handleDatesChange}
            error={errors.dates}
            labels={{
              calendar: t("calendar.label"),
              chooseStart: t("calendar.chooseStart"),
              chooseEnd: t("calendar.chooseEnd"),
              rangeSelected: t("calendar.rangeSelected")
            }}
          />

          <Button
            type="submit"
            size="lg"
            className="group mt-1 h-12 w-full md:col-span-1 md:mt-0 md:w-auto md:justify-self-end xl:min-w-[11.25rem]"
          >
            {t("findCar")}
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-[var(--token-duration-normal)] ease-brand group-hover:translate-x-1"
            />
          </Button>
        </div>
      </form>

      <p className="mt-3.5 border-t border-hairline pt-3 text-[0.75rem] leading-relaxed text-muted">
        {helperText}
      </p>
    </div>
  );
}
