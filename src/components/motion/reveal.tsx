"use client";

import {useEffect, useRef, useState} from "react";
import type {CSSProperties, ReactNode} from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  variant?: "up" | "scale";
  className?: string;
};

/**
 * One shared observer for the whole page. Each mounted element registers a
 * callback here and unregisters as soon as it has revealed, so the observer
 * only ever tracks elements that are still hidden.
 */
const callbacks = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const callback = callbacks.get(entry.target);
        if (!callback) continue;

        callback();
        callbacks.delete(entry.target);
        observer!.unobserve(entry.target);
      }
    },
    {rootMargin: "0px 0px -8% 0px", threshold: 0.08}
  );

  return observer;
}

/**
 * Progressive enhancement only: markup renders fully visible without JS and
 * without IntersectionObserver, and never hides the hero or its LCP text.
 */
export function Reveal({
  children,
  delay,
  variant = "up",
  className
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // A scripted browser without IntersectionObserver, or an element already
    // within the initial viewport, reveals on the next animation frame so
    // React's `set-state-in-effect` rule is respected without delaying paint.
    if (
      typeof IntersectionObserver === "undefined" ||
      element.getBoundingClientRect().top < window.innerHeight * 0.94
    ) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    // This element's identity never changes, so the effect intentionally runs
    // once per mount; nothing belongs in the dependency list.
    callbacks.set(element, () => setVisible(true));
    getObserver().observe(element);

    return () => {
      callbacks.delete(element);
      observer?.unobserve(element);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={visible ? "visible" : "hidden"}
      data-reveal-variant={variant === "scale" ? "scale" : undefined}
      className={className}
      style={
        delay
          ? ({["--reveal-delay"]: `${delay}ms`} as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
