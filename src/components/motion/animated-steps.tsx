"use client";

import * as React from "react";
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

/**
 * EasyUI Stepper-inspired three-step progression.
 * Triggers sequential top-bar draw fills and step-badge highlights once when
 * scrolled into view, while keeping markup visible without JS or under
 * `prefers-reduced-motion: reduce`.
 */
export function AnimatedSteps({
  steps,
  variant = "home",
  headingLevel = "h3",
  className
}: AnimatedStepsProps) {
  const listRef = React.useRef<HTMLOListElement>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || typeof IntersectionObserver === "undefined") {
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
      {rootMargin: "0px 0px -8% 0px", threshold: 0.1}
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const HeadingTag = headingLevel;

  if (variant === "page") {
    return (
      <ol
        ref={listRef}
        data-animated-steps=""
        data-steps-active={active ? "true" : "false"}
        className={cn(
          "grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3",
          className
        )}
      >
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="relative bg-surface p-6 md:p-8"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 top-0 h-[2px] origin-left bg-brand transition-transform duration-700 ease-[var(--token-ease-expo)]",
                active ? "scale-x-100" : "scale-x-0"
              )}
              style={{transitionDelay: `${index * 150}ms`}}
            />
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-[0.2em] transition-colors duration-500 ease-[var(--token-ease-out)]",
                active
                  ? "border-brand/30 bg-brand-subtle text-brand"
                  : "border-line bg-background text-brand"
              )}
              style={{transitionDelay: `${index * 150 + 120}ms`}}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <HeadingTag className="mt-4 text-[1.125rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
              {step.title}
            </HeadingTag>
            <p className="mt-2.5 max-w-[40ch] text-[0.9375rem] leading-relaxed text-muted">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      ref={listRef}
      data-animated-steps=""
      data-steps-active={active ? "true" : "false"}
      className={cn("mt-10 grid gap-8 md:grid-cols-3 md:gap-10", className)}
    >
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative border-t border-line pt-6"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 -top-px h-[2px] origin-left bg-brand transition-transform duration-700 ease-[var(--token-ease-expo)]",
              active ? "scale-x-100" : "scale-x-0"
            )}
            style={{transitionDelay: `${index * 150}ms`}}
          />
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-[0.2em] transition-colors duration-500 ease-[var(--token-ease-out)]",
              active
                ? "border-brand/30 bg-brand-subtle text-brand"
                : "border-line bg-background text-brand"
            )}
            style={{transitionDelay: `${index * 150 + 120}ms`}}
          >
            0{index + 1}
          </span>
          <HeadingTag className="mt-3.5 text-[1.0625rem] font-semibold leading-snug text-ink">
            {step.title}
          </HeadingTag>
          <p className="mt-2.5 max-w-[40ch] text-[0.9375rem] leading-relaxed text-muted">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
