"use client";

import * as React from "react";
import {ArrowRight, Info} from "lucide-react";
import {useTranslations} from "next-intl";
import {DateRangePicker} from "@/components/booking/date-range-picker";
import {LocationSelect} from "@/components/booking/location-select";
import {Button} from "@/components/ui/button";
import {useRouter} from "@/i18n/navigation";
import {
  hasBookingErrors,
  validateBookingInput,
  type BookingErrorCode,
  type FleetSearchParams
} from "@/lib/search-params";
import {cn} from "@/lib/utils";

type RequestPanelProps = {
  slug: string;
  vehicleName: string;
  defaults?: FleetSearchParams;
  className?: string;
};

type FieldErrors = {
  pickup?: string;
  return?: string;
  dates?: string;
};

/**
 * Vehicle inquiry panel. It never claims a booking: a valid submit only
 * carries the vehicle and dates to the request page. /request is built in a
 * later phase, so no success state is shown here.
 */
export function RequestPanel({
  slug,
  vehicleName,
  defaults,
  className
}: RequestPanelProps) {
  const t = useTranslations("Booking");
  const tv = useTranslations("Vehicle");
  const router = useRouter();
  const uid = React.useId().replaceAll(":", "");
  const formRef = React.useRef<HTMLFormElement>(null);

  const initialPickup = defaults?.pickup ?? "";
  const initialReturn = defaults?.return ?? initialPickup;
  const initialSameAsPickup =
    !defaults?.return || defaults.return === defaults.pickup;

  const [pickup, setPickup] = React.useState(initialPickup);
  const [sameAsPickup, setSameAsPickup] = React.useState(initialSameAsPickup);
  const [returnLocation, setReturnLocation] = React.useState(initialReturn);
  const [from, setFrom] = React.useState<string | undefined>(defaults?.from);
  const [to, setTo] = React.useState<string | undefined>(defaults?.to);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const pickupId = `request-pickup-${uid}`;
  const returnId = `request-return-${uid}`;
  const datesId = `request-dates-${uid}`;

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

  function errorText(code: BookingErrorCode | undefined) {
    return code ? t(`errors.${code}`) : undefined;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const codes = validateBookingInput({
      pickup,
      returnLocation,
      sameAsPickup,
      from,
      to
    });

    const nextErrors: FieldErrors = {
      pickup: errorText(codes.pickup),
      return: errorText(codes.return),
      dates: errorText(codes.dates)
    };

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

    const effectiveReturn = sameAsPickup ? pickup : returnLocation;
    const query = new URLSearchParams({
      vehicle: slug,
      pickup,
      return: effectiveReturn,
      from: from ?? "",
      to: to ?? ""
    }).toString();

    router.push(`/request?${query}`);
  }

  const sameAsPickupControl = (
    <label
      htmlFor={`request-same-as-pickup-${uid}`}
      className="-my-1.5 inline-flex max-w-full h-9 cursor-pointer items-center gap-2 rounded-field text-[0.75rem] font-semibold text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink"
    >
      <input
        id={`request-same-as-pickup-${uid}`}
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
      <span className="min-w-0 max-w-full">{t("sameAsPickup")}</span>
    </label>
  );

  return (
    <aside
      className={cn(
        "rounded-card border border-line bg-surface p-5 shadow-panel sm:p-6",
        className
      )}
    >
      <h2 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {tv("requestTitle")}
      </h2>
      <p className="mt-1 text-[0.8125rem] text-muted">{vehicleName}</p>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-5">
        <div className="grid gap-3">
          <LocationSelect
            id={pickupId}
            label={t("pickup")}
            placeholder={t("chooseLocation")}
            value={pickup}
            onValueChange={handlePickupChange}
            error={errors.pickup}
            required
          />

          <LocationSelect
            id={returnId}
            label={t("return")}
            placeholder={t("chooseLocation")}
            value={sameAsPickup ? pickup : returnLocation}
            onValueChange={handleReturnChange}
            error={errors.return}
            required
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
            required
            labels={{
              calendar: t("calendar.label"),
              chooseStart: t("calendar.chooseStart"),
              chooseEnd: t("calendar.chooseEnd"),
              rangeSelected: t("calendar.rangeSelected")
            }}
          />

          <Button type="submit" size="lg" className="mt-1 w-full">
            {tv("cta")}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>

      <div className="mt-4 flex items-start gap-2 rounded-field bg-brand-subtle p-3">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
        <p className="text-[0.75rem] leading-relaxed text-ink/80">
          {tv("requestNote")}
        </p>
      </div>
    </aside>
  );
}
