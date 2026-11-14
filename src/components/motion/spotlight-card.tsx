"use client";

import * as React from "react";
import {cn} from "@/lib/utils";

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  maxTilt?: number;
};

/**
 * EasyUI-inspired pointer spotlight + subtle 3D perspective tilt card.
 * Mutates only CSS custom properties inside requestAnimationFrame (zero React
 * re-renders on hover/pointermove) and respects `prefers-reduced-motion`.
 */
export function SpotlightCard({
  children,
  className,
  tilt = true,
  maxTilt = 2.2
}: SpotlightCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const reducedMotionRef = React.useRef(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = query.matches;
    const onChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reducedMotionRef.current) return;

    const element = cardRef.current;
    if (!element) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      element.style.setProperty("--mouse-x", `${x.toFixed(1)}px`);
      element.style.setProperty("--mouse-y", `${y.toFixed(1)}px`);

      if (tilt) {
        const px = (x / rect.width) * 2 - 1;
        const py = (y / rect.height) * 2 - 1;
        const rotateX = (-py * maxTilt).toFixed(2);
        const rotateY = (px * maxTilt).toFixed(2);
        element.style.setProperty("--tilt-x", `${rotateX}deg`);
        element.style.setProperty("--tilt-y", `${rotateY}deg`);
        element.style.setProperty("--lift-y", "-2px");
      }
    });
  }

  function handlePointerLeave() {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const element = cardRef.current;
    if (!element) return;

    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--lift-y", "0px");
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("spotlight-card rounded-card", className)}
    >
      {children}
    </div>
  );
}
