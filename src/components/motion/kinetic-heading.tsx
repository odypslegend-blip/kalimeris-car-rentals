"use client";

import * as React from "react";
import {cn} from "@/lib/utils";

type HeroKineticHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * EasyUI ScrollVelocityText-inspired kinetic hero heading.
 * Preserves an unbroken single text node for screen readers and Playwright
 * `getByRole("heading", { level: 1 })` checks while subtly expanding tracking
 * and lifting during top-of-page scroll with requestAnimationFrame LERP damping.
 */
export function HeroKineticHeading({
  children,
  className
}: HeroKineticHeadingProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    const element = headingRef.current;
    if (!element) return;

    let rafId: number | null = null;
    let lastScrollY = window.scrollY;
    let targetShift = 0;
    let currentShift = 0;
    let decayTimer: number | null = null;

    const tick = () => {
      currentShift += (targetShift - currentShift) * 0.15;

      if (Math.abs(targetShift - currentShift) < 0.002 && targetShift === 0) {
        element.style.letterSpacing = "-0.03em";
        element.style.transform = "";
        rafId = null;
        return;
      }

      const trackingEm = (-0.03 + currentShift * 0.015).toFixed(4);
      const translateY = (-currentShift * 4).toFixed(2);
      element.style.letterSpacing = `${trackingEm}em`;
      element.style.transform = `translate3d(0, ${translateY}px, 0)`;

      rafId = window.requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 520) {
        targetShift = 0;
        return;
      }

      const delta = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      targetShift = Math.min(1, Math.max(targetShift, delta / 40));

      if (decayTimer !== null) {
        window.clearTimeout(decayTimer);
      }
      decayTimer = window.setTimeout(() => {
        targetShift = 0;
        if (rafId === null) {
          rafId = window.requestAnimationFrame(tick);
        }
      }, 90);

      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (decayTimer !== null) window.clearTimeout(decayTimer);
    };
  }, []);

  return (
    <h1
      ref={headingRef}
      className={cn(
        "hero-load-rise text-[2.375rem] font-extrabold leading-[1.07] tracking-[-0.03em] text-ink sm:text-[3rem] lg:text-[3.875rem] lg:leading-[1.04]",
        className
      )}
    >
      {children}
    </h1>
  );
}
