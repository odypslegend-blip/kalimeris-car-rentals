"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Car,
  Check,
  FileCheck2,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Wrench
} from "lucide-react";
import {useLocale} from "next-intl";
import {SpotlightCard} from "@/components/motion/spotlight-card";
import {Button} from "@/components/ui/button";
import {Link} from "@/i18n/navigation";
import {site} from "@/lib/site";
import {cn} from "@/lib/utils";

type Step = {
  title: string;
  body: string;
};

type AnimatedStepsProps = {
  steps: readonly Step[];
  variant?: "home" | "page";
  headingLevel?: "h2" | "h3";
  className?: string;
};

const AUTO_ADVANCE_MS = 5000;

/**
 * Interactive "Live Process Switcher" for the 3-step Kalimeris quote-request flow.
 * Preserves `data-animated-steps` and `data-steps-active` via IntersectionObserver,
 * renders all 3 step titles in an accessible tablist rail, and auto-advances until
 * hovered, focused, or explicitly selected.
 */
export function AnimatedSteps({
  steps,
  variant = "home",
  headingLevel = "h3",
  className
}: AnimatedStepsProps) {
  const locale = useLocale();
  const isEl = locale === "el";
  const uid = React.useId().replaceAll(":", "");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const [active, setActive] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    const frame = window.requestAnimationFrame(sync);

    media.addEventListener("change", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, []);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setActive(true));
      return () => window.cancelAnimationFrame(frame);
    }

    if (element.getBoundingClientRect().top < window.innerHeight * 0.94) {
      const frame = window.requestAnimationFrame(() => setActive(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      {rootMargin: "0px 0px -4% 0px", threshold: 0.05}
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stepCount = steps.length;
  const boundedIndex = stepCount > 0 ? activeIndex % stepCount : 0;

  React.useEffect(() => {
    if (!active || paused || hovered || focused || reducedMotion || stepCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stepCount);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [active, paused, hovered, focused, reducedMotion, stepCount]);

  if (stepCount === 0) return null;

  const currentStep = steps[boundedIndex];
  const HeadingTag = headingLevel;
  const cardSurface = variant === "home" ? "bg-background" : "bg-surface";
  const insetSurface = variant === "home" ? "bg-surface" : "bg-background";

  function selectStep(index: number, focusTab = false) {
    const normalized = ((index % stepCount) + stepCount) % stepCount;
    setActiveIndex(normalized);
    setPaused(true);
    if (focusTab) {
      window.requestAnimationFrame(() => {
        tabRefs.current[normalized]?.focus();
      });
    }
  }

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectStep(index + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectStep(index - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectStep(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectStep(stepCount - 1, true);
    }
  }

  const activeTabId = `${uid}-tab-${boundedIndex}`;
  const panelId = `${uid}-panel`;
  const narrativeLabelsEl = [
    "ΕΠΙΛΟΓΗ ΟΧΗΜΑΤΟΣ",
    "ΑΙΤΗΜΑ & ΠΡΟΣΦΟΡΑ",
    "ΠΑΡΑΔΟΣΗ ΟΧΗΜΑΤΟΣ"
  ] as const;
  const narrativeLabelsEn = [
    "VEHICLE SELECTION",
    "REQUEST & QUOTE",
    "VEHICLE HANDOVER"
  ] as const;
  const stageBadgesEl = ["ΕΠΙΛΟΓΗ", "ΕΠΙΒΕΒΑΙΩΣΗ", "ΠΑΡΑΔΟΣΗ"] as const;
  const stageBadgesEn = ["SELECTION", "CONFIRMATION", "HANDOVER"] as const;
  const currentNarrativeLabel = isEl
    ? (narrativeLabelsEl[boundedIndex] ?? "ΒΗΜΑ")
    : (narrativeLabelsEn[boundedIndex] ?? "STEP");
  const currentStageBadge = isEl
    ? (stageBadgesEl[boundedIndex] ?? "ΣΤΑΔΙΟ")
    : (stageBadgesEn[boundedIndex] ?? "STAGE");

  return (
    <div
      ref={containerRef}
      data-animated-steps=""
      data-steps-active={active ? "true" : "false"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      className={cn("space-y-5", className)}
    >
      {/* Interactive 3-step Selector Rail — all titles remain visible and clickable. */}
      <div
        role="tablist"
        aria-label={
          isEl
            ? "Επιλογή βήματος διαδικασίας ενοικίασης"
            : "Rental process steps"
        }
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
      >
        {steps.map((step, index) => {
          const isSelected = index === boundedIndex;

          return (
            <button
              key={step.title}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`${uid}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => selectStep(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                "group relative flex min-h-12 min-w-0 items-center gap-3 overflow-hidden rounded-card border px-4 py-3 text-left transition-[background-color,border-color,color,box-shadow] duration-[var(--token-duration-fast)] ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                isSelected
                  ? cn("border-brand shadow-card text-ink", cardSurface)
                  : "border-line bg-transparent text-muted hover:border-accent-orange/50 hover:text-ink dark:hover:border-brand/50"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 top-0 h-[2px] origin-left bg-accent-orange transition-transform duration-500 ease-[var(--token-ease-expo)] motion-reduce:transition-none dark:bg-brand",
                  active && isSelected ? "scale-x-100" : "scale-x-0"
                )}
              />
              <span className="font-display min-w-0 text-[0.9375rem] font-semibold leading-snug">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 12-Column Live Stage */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={activeTabId}
        className="grid items-stretch gap-6 lg:grid-cols-12"
      >
        {/* Left Panel — Step narrative & navigation */}
        <div
          className={cn(
            "flex min-w-0 flex-col justify-between rounded-card border border-line p-5 sm:p-7 lg:col-span-5",
            cardSurface
          )}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[0.75rem] font-bold uppercase tracking-[0.16em] text-brand">
                {currentNarrativeLabel}
              </span>
            </div>

            {/* Segmented step progress bar */}
            <div
              aria-hidden="true"
              className="mt-4 grid grid-cols-3 gap-1.5"
            >
              {steps.map((step, index) => (
                <span
                  key={step.title}
                  className={cn(
                    "h-1 rounded-full transition-colors duration-300",
                    index === boundedIndex
                      ? "bg-accent-orange dark:bg-brand-strong"
                      : index < boundedIndex
                        ? "bg-brand-strong"
                        : "bg-line"
                  )}
                />
              ))}
            </div>

            <div
              key={`narrative-${boundedIndex}`}
              className="mt-6 animate-in fade-in-0 duration-300 motion-reduce:animate-none"
            >
              <HeadingTag className="font-display text-[1.375rem] font-bold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[1.625rem]">
                {currentStep.title}
              </HeadingTag>
              <p className="mt-3 max-w-[44ch] text-[0.9375rem] leading-relaxed text-muted sm:text-base">
                {currentStep.body}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-hairline pt-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectStep(boundedIndex - 1)}
                aria-label={isEl ? "Προηγούμενο βήμα" : "Previous step"}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-field border border-line px-3 text-sm font-semibold text-ink transition-colors duration-[var(--token-duration-fast)] hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => selectStep(boundedIndex + 1)}
                aria-label={isEl ? "Επόμενο βήμα" : "Next step"}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-field border border-line px-3.5 text-sm font-semibold text-ink transition-colors duration-[var(--token-duration-fast)] hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <span>{isEl ? "Επόμενο" : "Next"}</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Stage Preview Card */}
        <div className="min-w-0 lg:col-span-7">
          <SpotlightCard
            tilt={false}
            className={cn(
              "flex h-full flex-col border border-line shadow-card",
              cardSurface
            )}
          >
            {/* Warm route-telemetry top strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-elevated/70 px-5 py-3 dark:bg-transparent sm:px-7">
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {isEl ? "ΔΙΑΔΡΟΜΗ ΚΡΑΤΗΣΗΣ" : "RENTAL PROCESS"}
              </span>

              <span className="inline-flex items-center rounded-full border border-line/60 bg-accent-yellow px-2.5 py-1 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-accent-yellow-ink dark:border-brand/25 dark:bg-brand-subtle dark:text-ink">
                {currentStageBadge}
              </span>
            </div>

            <div
              key={`preview-${boundedIndex}`}
              className="flex flex-1 flex-col justify-between gap-6 p-5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none sm:p-7"
            >
              {boundedIndex === 0 ? (
                <StepOnePreview isEl={isEl} insetSurface={insetSurface} />
              ) : boundedIndex === 1 ? (
                <StepTwoPreview isEl={isEl} insetSurface={insetSurface} />
              ) : (
                <StepThreePreview isEl={isEl} insetSurface={insetSurface} />
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}

type StagePreviewProps = {
  isEl: boolean;
  insetSurface: string;
};

function StepOnePreview({isEl, insetSurface}: StagePreviewProps) {
  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
            {isEl ? "ΑΙΤΗΜΑ ΠΡΟΣΦΟΡΑΣ" : "QUOTE REQUEST INTAKE"}
          </span>
          <span className="inline-flex items-center rounded-full border border-brand/25 bg-brand-subtle px-2.5 py-1 text-[0.75rem] font-semibold text-brand">
            {isEl
              ? "Χωρίς κάρτα · Χωρίς δέσμευση"
              : "No card · No obligation"}
          </span>
        </div>

        <div
          className={cn(
            "flex items-start gap-3 rounded-field border border-line p-4",
            insetSurface
          )}
        >
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand"
          >
            <MapPin className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {isEl ? "Έδρα παραλαβής" : "Pickup base"}
            </p>
            <p className="mt-1 text-[0.9375rem] font-semibold leading-snug text-ink">
              {isEl ? site.address.fullEl : site.address.fullEn}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              "flex items-start gap-3 rounded-field border border-line p-4",
              insetSurface
            )}
          >
            <CalendarRange
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
            />
            <div className="min-w-0">
              <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {isEl ? "Ημερομηνίες" : "Date range"}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {isEl
                  ? "Ημερομηνία παραλαβής & επιστροφής"
                  : "Pickup & return dates"}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-start gap-3 rounded-field border border-line p-4",
              insetSurface
            )}
          >
            <Car
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
            />
            <div className="min-w-0">
              <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {isEl ? "Κατηγορία οχήματος" : "Vehicle class"}
              </p>
              <p className="mt-1 text-sm font-medium text-ink">
                {isEl
                  ? "Οικονομικά · SUV · Οικογενειακά · 9θέσια Van"
                  : "Economy · SUV · Family · 9-seat Van"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[38ch] text-xs leading-relaxed text-muted">
          {isEl
            ? "Μεταφορά από και προς αεροδρόμιο κατόπιν συνεννόησης."
            : "Airport transfer coordination available by arrangement."}
        </p>
        <Button asChild size="md" className="w-full shrink-0 sm:w-auto">
          <Link href="/request" prefetch={false}>
            {isEl ? "Στείλτε αίτημα" : "Send a request"}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </>
  );
}

function StepTwoPreview({isEl, insetSurface}: StagePreviewProps) {
  const checks = isEl
    ? [
        {
          label: "Έλεγχος διαθεσιμότητας οχήματος",
          meta: "Πριν την απάντηση"
        },
        {
          label: "Γραπτή επιβεβαίωση ενοικίασης",
          meta: "Όροι & τελικό κόστος"
        },
        {
          label: "Παράδοση σε αεροδρόμιο / σταθμό κατόπιν συνεννόησης",
          meta: "Ευέλικτος συντονισμός"
        }
      ]
    : [
        {
          label: "Vehicle availability check",
          meta: "Verified first"
        },
        {
          label: "Written rental confirmation",
          meta: "Terms & final quote"
        },
        {
          label: "Airport / station handover coordination by arrangement",
          meta: "Flexible pickup"
        }
      ];

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
            {isEl ? "ΕΠΙΒΕΒΑΙΩΣΗ ΚΑΙ ΠΡΟΣΦΟΡΑ" : "QUOTE & AVAILABILITY"}
          </span>
          <span className="inline-flex items-center rounded-full border border-brand/25 bg-brand-subtle px-2.5 py-1 text-[0.75rem] font-semibold text-brand">
            {isEl ? "Απευθείας απάντηση" : "Direct follow-up"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink",
              insetSurface
            )}
          >
            <PhoneCall aria-hidden="true" className="size-3.5 text-brand" />
            <span>
              {isEl ? "Τηλέφωνο" : "Phone"} · {site.phone.display}
            </span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink",
              insetSurface
            )}
          >
            <MessageSquare aria-hidden="true" className="size-3.5 text-brand" />
            <span>WhatsApp · {site.reservationsPhone.display}</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink",
              insetSurface
            )}
          >
            <Mail aria-hidden="true" className="size-3.5 text-brand" />
            <span>{site.email}</span>
          </span>
        </div>

        <ul
          className={cn(
            "divide-y divide-hairline rounded-field border border-line",
            insetSurface
          )}
        >
          {checks.map((item) => (
            <li
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-ink">
                <span
                  aria-hidden="true"
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand"
                >
                  <Check className="size-3.5" />
                </span>
                <span className="min-w-0">{item.label}</span>
              </span>
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
                {item.meta}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-hairline pt-5">
        <p className="text-xs leading-relaxed text-muted">
          {isEl
            ? "Η ενοικίαση προχωρά μόνο αφού επιβεβαιώσετε γραπτώς το κόστος και τους όρους."
            : "A rental proceeds only after you confirm the written quote and terms."}
        </p>
      </div>
    </>
  );
}

function StepThreePreview({isEl, insetSurface}: StagePreviewProps) {
  const milestones = isEl
    ? [
        {
          icon: Wrench,
          title: "Έλεγχος πριν την παράδοση",
          detail: "Τεχνική επιθεώρηση & προετοιμασία από το συνεργείο μας"
        },
        {
          icon: FileCheck2,
          title: "Αναλυτική παρουσίαση συμφωνητικού",
          detail: "Σαφής έλεγχος εγγράφων οδηγού, παραλαβής και επιστροφής"
        },
        {
          icon: Headphones,
          title: "24ωρη υποστήριξη από την Κοζάνη",
          detail: "Άμεση τηλεφωνική επικοινωνία καθ’ όλη τη διάρκεια της ενοικίασης"
        }
      ]
    : [
        {
          icon: Wrench,
          title: "Pre-handover inspection",
          detail: "Prepared and checked at our own Bosch Car Service premises"
        },
        {
          icon: FileCheck2,
          title: "Clear contract walkthrough",
          detail: "Driver documents, pickup details and return agreement reviewed together"
        },
        {
          icon: Headphones,
          title: "24/7 Kozani support readiness",
          detail: "Direct local assistance by phone throughout your rental"
        }
      ];

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
            {isEl ? "ΔΙΑΦΑΝΗΣ ΠΑΡΑΔΟΣΗ" : "TRANSPARENT HANDOVER"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand-subtle px-2.5 py-1 text-[0.75rem] font-semibold text-brand">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            <span>{isEl ? "24ωρη υποστήριξη" : "24/7 support"}</span>
          </span>
        </div>

        <div
          className={cn(
            "divide-y divide-hairline rounded-field border border-line",
            insetSurface
          )}
        >
          {milestones.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3.5 px-4 py-3.5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted">
        <span>
          {isEl ? site.address.streetEl : site.address.streetEn}
        </span>
        <span>
          {isEl
            ? "Δευ–Παρ 9:00–19:30 · Σαβ 9:00–13:00"
            : "Mon–Fri 9:00–19:30 · Sat 9:00–13:00"}
        </span>
      </div>
    </>
  );
}
