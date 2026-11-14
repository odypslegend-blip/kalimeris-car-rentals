"use client";

import * as React from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import {CheckCircle2, Info, Loader2, TriangleAlert} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {useForm, useWatch, type FieldErrors} from "react-hook-form";
import {toast} from "sonner";
import {DateRangePicker, type DateRangeValue} from "@/components/booking/date-range-picker";
import {LocationSelect} from "@/components/booking/location-select";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Link} from "@/i18n/navigation";
import {
  inquirySchema,
  isInquiryErrorCode,
  localizedFieldErrors,
  type InquiryFieldErrors,
  type InquiryFieldName,
  type InquiryInput
} from "@/lib/validation/inquiry";
import {cn} from "@/lib/utils";

export type RequestFormVehicle = {
  slug: string;
  name: string;
};

export type RequestFormTransport = {
  configured: boolean;
  devSink: boolean;
};

export type RequestFormDefaults = {
  vehicleId?: string;
  pickupLocation: string;
  returnLocation: string;
  from?: string;
  to?: string;
};

type RequestFormProps = {
  vehicles: RequestFormVehicle[];
  defaults: RequestFormDefaults;
  transport: RequestFormTransport;
};

type FormAlertCode =
  | "rateLimited"
  | "notConfigured"
  | "deliveryFailed"
  | "network"
  | "invalid";

/** Radix Select cannot hold an empty string value, so "any" is a sentinel. */
const ANY_VEHICLE = "any";

const FOCUS_ORDER: InquiryFieldName[] = [
  "vehicleId",
  "pickupLocation",
  "returnLocation",
  "from",
  "to",
  "name",
  "email",
  "phone",
  "message",
  "consent"
];

function FieldError({id, message}: {id: string; message?: string}) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="text-xs leading-snug text-danger">
      {message}
    </p>
  );
}

function Notice({
  tone = "danger",
  title,
  body,
  className,
  id,
  tabIndex
}: {
  tone?: "danger" | "warning" | "info";
  title: string;
  body?: string;
  className?: string;
  id?: string;
  /** `-1` makes the notice programmatically focusable (submit guard target). */
  tabIndex?: number;
}) {
  const Icon = tone === "danger" ? TriangleAlert : Info;
  const toneClass =
    tone === "danger"
      ? "border-danger/25 bg-danger/5 text-danger"
      : tone === "warning"
        ? "border-notice-border bg-notice text-notice-ink"
        : "border-line bg-background text-ink";

  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-field border p-3.5",
        toneClass,
        className
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-[0.875rem] font-semibold leading-snug">{title}</p>
        {body ? (
          <p className="mt-1 text-[0.8125rem] leading-relaxed">{body}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Success state. Only ever rendered after the API returned 200 `received`,
 * which itself only happens after a transport confirmed delivery or storage.
 * The reference shown here is the one the server generated.
 */
function RequestSuccess({reference}: {reference: string}) {
  const t = useTranslations("Request");
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      role="status"
      aria-live="polite"
      data-request-success=""
      className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-brand-subtle text-brand">
        <CheckCircle2 aria-hidden="true" className="size-5" />
      </span>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-4 text-[1.375rem] font-semibold leading-snug tracking-[-0.015em] text-ink outline-none"
      >
        {t("successTitle")}
      </h2>
      <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted">
        {t("successBody")}
      </p>

      <dl className="mt-5 rounded-field border border-line bg-background px-4 py-3">
        <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
          {t("reference")}
        </dt>
        <dd className="mt-1 font-mono text-[1rem] font-semibold tracking-[0.04em] text-ink">
          {reference}
        </dd>
      </dl>

      <p className="mt-4 text-[0.75rem] font-semibold text-ink">
        {t("notBooking")}
      </p>

      <Button asChild variant="secondary" className="mt-5 w-full sm:w-auto">
        <Link href="/cars">{t("newSearch")}</Link>
      </Button>
    </section>
  );
}

/**
 * The inquiry form.
 *
 * Rules this component follows, deliberately:
 * - Nothing shows success before the server answers 200 `received`.
 * - Entered values survive every failure (React Hook Form state is untouched).
 * - Field errors are inline, `role="alert"`, and connected with aria-describedby.
 * - Form-level failures (rate limit, not configured, delivery, network) live in
 *   a persistent alert region, never only in a toast.
 * - Toasts are reserved for a failed `fetch` (transient network feedback).
 */
export function RequestForm({vehicles, defaults, transport}: RequestFormProps) {
  const t = useTranslations("Request");
  const booking = useTranslations("Booking");
  const activeLocale = useLocale();
  const locale: InquiryInput["locale"] = activeLocale === "en" ? "en" : "el";
  const uid = React.useId().replaceAll(":", "");

  const [reference, setReference] = React.useState<string | null>(null);
  const [formAlert, setFormAlert] = React.useState<FormAlertCode | null>(null);
  const [sameAsPickup, setSameAsPickup] = React.useState(
    defaults.returnLocation === defaults.pickupLocation
  );

  // Client mount time. Held in state (not a ref) so the submit handler stays a
  // pure render-time closure. It is never rendered into the DOM, so the
  // server/client values cannot disagree; the route rejects submissions that
  // arrive less than 2.5s after it.
  const [startedAt] = React.useState(() => Date.now());

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    mode: "onBlur",
    defaultValues: {
      locale,
      vehicleId: defaults.vehicleId ?? "",
      pickupLocation: defaults.pickupLocation,
      returnLocation: defaults.returnLocation,
      from: defaults.from ?? "",
      to: defaults.to ?? "",
      name: "",
      email: "",
      phone: "",
      message: "",
      consent: false,
      website: "",
      startedAt: 0
    }
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    control,
    formState: {errors, isSubmitting}
  } = form;

  // One subscription instead of a `watch()` call per field: `useWatch` is a
  // hook the React Compiler can reason about.
  const values = useWatch({control});

  const vehicleId = `request-vehicle-${uid}`;
  const pickupId = `request-pickup-${uid}`;
  const returnId = `request-return-${uid}`;
  const datesId = `request-dates-${uid}`;
  const nameId = `request-name-${uid}`;
  const emailId = `request-email-${uid}`;
  const phoneId = `request-phone-${uid}`;
  const messageId = `request-message-${uid}`;
  const consentId = `request-consent-${uid}`;
  const honeypotId = `request-website-${uid}`;
  const transportNoticeId = `request-transport-${uid}`;

  const fieldIds: Partial<Record<InquiryFieldName, string>> = {
    vehicleId,
    pickupLocation: pickupId,
    returnLocation: returnId,
    from: datesId,
    to: datesId,
    name: nameId,
    email: emailId,
    phone: phoneId,
    message: messageId,
    consent: consentId
  };

  function focusField(field: InquiryFieldName) {
    const id = fieldIds[field];
    if (!id) return;
    document.getElementById(id)?.focus();
  }

  /**
   * RHF stores whatever the resolver produced. Schema failures carry a code;
   * server-returned failures arrive already localized. Both are handled here.
   */
  function errorText(message: string | undefined): string | undefined {
    if (!message) return undefined;
    return isInquiryErrorCode(message) ? t(`errors.${message}`) : message;
  }

  const selectedVehicle = values.vehicleId ?? "";
  const pickupLocation = values.pickupLocation ?? "";
  const returnLocation = values.returnLocation ?? "";
  const from = values.from;
  const to = values.to;
  const consent = values.consent;

  const vehicleError = errorText(errors.vehicleId?.message);
  const pickupError = errorText(errors.pickupLocation?.message);
  const returnError = errorText(errors.returnLocation?.message);
  const datesError =
    errorText(errors.from?.message) ?? errorText(errors.to?.message);
  const nameError = errorText(errors.name?.message);
  const emailError = errorText(errors.email?.message);
  const phoneError = errorText(errors.phone?.message);
  const messageError = errorText(errors.message?.message);
  const consentError = errorText(errors.consent?.message);

  function handlePickupChange(value: string) {
    setValue("pickupLocation", value, {shouldDirty: true});
    clearErrors("pickupLocation");

    if (sameAsPickup || !returnLocation) {
      setValue("returnLocation", value, {shouldDirty: true});
      clearErrors("returnLocation");
    }
  }

  function handleReturnChange(value: string) {
    setValue("returnLocation", value, {shouldDirty: true});
    clearErrors("returnLocation");
  }

  function handleSameAsPickupChange(checked: boolean) {
    setSameAsPickup(checked);

    if (checked) {
      setValue("returnLocation", pickupLocation, {shouldDirty: true});
      clearErrors("returnLocation");
    } else if (!returnLocation) {
      setValue("returnLocation", pickupLocation, {shouldDirty: true});
    }
  }

  function handleDatesChange(range: DateRangeValue) {
    setValue("from", range.from ?? "", {shouldDirty: true});
    setValue("to", range.to ?? "", {shouldDirty: true});
    clearErrors(["from", "to"]);
  }

  function handleVehicleChange(value: string) {
    setValue("vehicleId", value === ANY_VEHICLE ? "" : value, {
      shouldDirty: true
    });
    clearErrors("vehicleId");
  }

  const onInvalid = (invalid: FieldErrors<InquiryInput>) => {
    const first = FOCUS_ORDER.find((field) => invalid[field]);
    if (!first) return;

    window.requestAnimationFrame(() => focusField(first));
  };

  const onSubmit = handleSubmit(async (values) => {
    // The honest disabled state: nothing is sent while no destination is
    // configured, and the button explains why via aria-describedby.
    if (!transport.configured) return;
    setFormAlert(null);

    let response: Response;

    try {
      response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...values, startedAt})
      });
    } catch {
      setFormAlert("network");
      toast.error(t("errors.network"));
      return;
    }

    if (response.ok) {
      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const payload = data as {status?: string; reference?: string} | null;

      if (
        payload?.status === "received" &&
        typeof payload.reference === "string"
      ) {
        setReference(payload.reference);
        return;
      }

      setFormAlert("deliveryFailed");
      return;
    }

    if (response.status === 429) {
      setFormAlert("rateLimited");
      return;
    }

    if (response.status === 503) {
      setFormAlert("notConfigured");
      return;
    }

    if (response.status === 422) {
      let body: {fieldErrors?: InquiryFieldErrors} | null = null;
      try {
        body = (await response.json()) as {fieldErrors?: InquiryFieldErrors};
      } catch {
        body = null;
      }

      const localized = localizedFieldErrors(body?.fieldErrors ?? {}, (code) =>
        t(`errors.${code}`)
      );
      const entries = Object.entries(localized) as [InquiryFieldName, string][];

      if (entries.length === 0) {
        // Generic rejection (honeypot, timing, malformed body).
        setFormAlert("invalid");
        return;
      }

      for (const [field, message] of entries) {
        setError(field, {type: "server", message});
      }

      window.requestAnimationFrame(() => focusField(entries[0][0]));
      return;
    }

    setFormAlert("deliveryFailed");
  }, onInvalid);

  /**
   * When no delivery destination exists, submitting must not run validation:
   * telling the visitor that "Name is required" while the form cannot send
   * anything would be misleading. The guard only stops the submit and moves
   * focus to the persistent explanation.
   */
  function handleUnconfiguredSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById(transportNoticeId)?.focus();
  }

  if (reference) {
    return <RequestSuccess reference={reference} />;
  }

  return (
    <section
      aria-label={t("formLabel")}
      className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-7"
    >
      <form
        noValidate
        onSubmit={
          transport.configured ? onSubmit : handleUnconfiguredSubmit
        }
        className="grid gap-6"
      >
        <p className="text-[0.8125rem] leading-relaxed text-muted">
          {t("requiredNote")}
        </p>

        {!transport.configured ? (
          <Notice
            id={transportNoticeId}
            tabIndex={-1}
            tone="danger"
            title={t("notConfiguredTitle")}
            body={t("notConfiguredBody")}
          />
        ) : null}

        {transport.devSink ? (
          <Notice tone="warning" title={t("devSink")} />
        ) : null}

        {formAlert ? (
          formAlert === "notConfigured" ? (
            <Notice
              tone="danger"
              title={t("notConfiguredTitle")}
              body={t("notConfiguredBody")}
            />
          ) : (
            <Notice tone="danger" title={t(`errors.${formAlert}`)} />
          )
        ) : null}

        <div
          role="group"
          aria-labelledby={`request-trip-${uid}`}
          className="grid gap-4"
        >
          <h2
            id={`request-trip-${uid}`}
            className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {t("tripDetails")}
          </h2>

          <div className="grid min-w-0 gap-1.5">
            <Label htmlFor={vehicleId}>{t("vehicle")}</Label>
            <Select
              value={selectedVehicle || ANY_VEHICLE}
              onValueChange={handleVehicleChange}
            >
              <SelectTrigger
                id={vehicleId}
                aria-invalid={vehicleError ? true : undefined}
                aria-describedby={vehicleError ? `${vehicleId}-error` : undefined}
              >
                <SelectValue placeholder={t("anyVehicle")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VEHICLE} textValue={t("anyVehicle")}>
                  {t("anyVehicle")}
                </SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem
                    key={vehicle.slug}
                    value={vehicle.slug}
                    textValue={vehicle.name}
                  >
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${vehicleId}-error`} message={vehicleError} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <LocationSelect
              id={pickupId}
              label={t("pickup")}
              placeholder={booking("chooseLocation")}
              value={pickupLocation}
              onValueChange={handlePickupChange}
              error={pickupError}
              required
            />

            <LocationSelect
              id={returnId}
              label={t("return")}
              placeholder={booking("chooseLocation")}
              value={sameAsPickup ? pickupLocation : returnLocation}
              onValueChange={handleReturnChange}
              error={returnError}
              required
              disabled={sameAsPickup}
              labelAction={
                <label
                  htmlFor={`request-same-as-pickup-${uid}`}
                  className="-my-1.5 inline-flex max-w-full min-h-11 cursor-pointer items-center gap-2 rounded-field text-[0.75rem] font-semibold text-muted transition-colors duration-[var(--token-duration-fast)] ease-brand hover:text-ink"
                >
                  <input
                    id={`request-same-as-pickup-${uid}`}
                    type="checkbox"
                    checked={sameAsPickup}
                    onChange={(event) =>
                      handleSameAsPickupChange(event.target.checked)
                    }
                    className="size-4 shrink-0 rounded-[4px] border border-line accent-brand"
                  />
                  <span className="min-w-0 max-w-full">
                    {booking("sameAsPickup")}
                  </span>
                </label>
              }
            />
          </div>

          <DateRangePicker
            id={datesId}
            label={t("dates")}
            placeholder={booking("selectDates")}
            from={from}
            to={to}
            onChange={handleDatesChange}
            error={datesError}
            required
            labels={{
              calendar: booking("calendar.label"),
              chooseStart: booking("calendar.chooseStart"),
              chooseEnd: booking("calendar.chooseEnd"),
              rangeSelected: booking("calendar.rangeSelected")
            }}
          />
        </div>

        <div
          role="group"
          aria-labelledby={`request-contact-${uid}`}
          className="grid gap-4 border-t border-hairline pt-6"
        >
          <h2
            id={`request-contact-${uid}`}
            className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {t("contactDetails")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor={nameId}>{t("name")}</Label>
              <Input
                id={nameId}
                type="text"
                autoComplete="name"
                required
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? `${nameId}-error` : undefined}
                {...register("name")}
              />
              <FieldError id={`${nameId}-error`} message={nameError} />
            </div>

            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor={emailId}>{t("email")}</Label>
              <Input
                id={emailId}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? `${emailId}-error` : undefined}
                {...register("email")}
              />
              <FieldError id={`${emailId}-error`} message={emailError} />
            </div>

            <div className="grid min-w-0 gap-1.5 sm:col-span-2">
              <Label htmlFor={phoneId}>{t("phone")}</Label>
              <Input
                id={phoneId}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                aria-invalid={phoneError ? true : undefined}
                aria-describedby={phoneError ? `${phoneId}-error` : undefined}
                {...register("phone")}
              />
              <FieldError id={`${phoneId}-error`} message={phoneError} />
            </div>

            <div className="grid min-w-0 gap-1.5 sm:col-span-2">
              <Label htmlFor={messageId}>{t("message")}</Label>
              <Textarea
                id={messageId}
                rows={5}
                aria-invalid={messageError ? true : undefined}
                aria-describedby={messageError ? `${messageId}-error` : undefined}
                {...register("message")}
              />
              <FieldError id={`${messageId}-error`} message={messageError} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[0.875rem] leading-relaxed text-ink">
              <input
                id={consentId}
                type="checkbox"
                required
                checked={consent ?? false}
                onChange={(event) => {
                  setValue("consent", event.target.checked, {shouldDirty: true});
                  clearErrors("consent");
                }}
                aria-invalid={consentError ? true : undefined}
                aria-describedby={
                  consentError ? `${consentId}-error` : undefined
                }
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span>{t("consent")}</span>
            </label>
            <FieldError id={`${consentId}-error`} message={consentError} />
          </div>
        </div>

        {/* Honeypot: visually and semantically hidden from real users. */}
        <div hidden aria-hidden="true">
          <label htmlFor={honeypotId}>Website</label>
          <input
            id={honeypotId}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            aria-disabled={!transport.configured || undefined}
            aria-describedby={
              !transport.configured ? transportNoticeId : undefined
            }
            className={cn(
              "w-full sm:w-auto",
              !transport.configured && "opacity-60"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="animate-spin"
                />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>

          <p className="text-[0.75rem] leading-relaxed text-muted sm:max-w-[24rem] sm:text-right">
            {t("ratesNote")}
          </p>
        </div>
      </form>
    </section>
  );
}
