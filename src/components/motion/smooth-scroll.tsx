"use client";

import {useEffect, useRef} from "react";
import {usePathname} from "@/i18n/navigation";

const SCROLL_IGNORE_SELECTOR =
  '[role="dialog"], [role="listbox"], [data-radix-popper-content-wrapper], [data-smooth-scroll-ignore]';

function hasScrollableAncestor(target: EventTarget | null): boolean {
  let node = target instanceof HTMLElement ? target : null;

  while (node && node !== document.documentElement) {
    if (node.matches(SCROLL_IGNORE_SELECTOR)) {
      return true;
    }

    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1;

    if (isScrollable) {
      return true;
    }

    node = node.parentElement;
  }

  return false;
}

/**
 * Global scroll progress bar + desktop inertial wheel LERP + hero parallax CSS vars.
 * Zero React re-renders during scroll: mutates DOM progress bar and CSS custom
 * properties inside a self-sleeping requestAnimationFrame loop.
 * Bypasses wheel interception for touch devices, reduced-motion users, overlays,
 * scrollable sub-containers, and navigator.webdriver (Playwright).
 */
export function SmoothScrollProvider() {
  const progressRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    targetYRef.current = window.scrollY;
    currentYRef.current = window.scrollY;
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    let scrollRaf: number | null = null;
    let wheelRaf: number | null = null;
    let lastWheelTime = 0;
    let lastScrollY = window.scrollY;
    let velocityResetTimer: number | null = null;

    targetYRef.current = window.scrollY;
    currentYRef.current = window.scrollY;

    const updateProgressAndVars = () => {
      scrollRaf = null;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      const bar = progressRef.current;

      if (bar) {
        bar.style.transform = `scaleX(${progress.toFixed(4)})`;
        bar.style.opacity = scrollY > 8 ? "1" : "0";
      }

      if (scrollY < 900) {
        const parallaxY = reducedMotionQuery.matches
          ? 0
          : Math.min(scrollY * 0.12, 36);
        root.style.setProperty("--hero-parallax-y", `${parallaxY.toFixed(1)}px`);
      }

      const delta = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      const velocity = reducedMotionQuery.matches
        ? 0
        : Math.min(1, delta / 48);
      root.style.setProperty("--scroll-velocity", velocity.toFixed(3));

      if (velocityResetTimer !== null) {
        window.clearTimeout(velocityResetTimer);
      }
      velocityResetTimer = window.setTimeout(() => {
        root.style.setProperty("--scroll-velocity", "0");
      }, 120);
    };

    const scheduleProgressUpdate = () => {
      if (scrollRaf === null) {
        scrollRaf = window.requestAnimationFrame(updateProgressAndVars);
      }
    };

    const syncTargetFromNative = () => {
      if (!animatingRef.current) {
        targetYRef.current = window.scrollY;
        currentYRef.current = window.scrollY;
      }
      scheduleProgressUpdate();
    };

    const stepWheelScroll = (timestamp: number) => {
      const dt = lastWheelTime ? Math.min(48, timestamp - lastWheelTime) : 16.67;
      lastWheelTime = timestamp;

      const alpha = 1 - Math.pow(1 - 0.14, dt / 16.67);
      const diff = targetYRef.current - currentYRef.current;

      if (Math.abs(diff) < 0.5) {
        window.scrollTo({top: targetYRef.current, behavior: "instant" as ScrollBehavior});
        currentYRef.current = targetYRef.current;
        animatingRef.current = false;
        wheelRaf = null;
        lastWheelTime = 0;
        return;
      }

      currentYRef.current += diff * alpha;
      window.scrollTo({
        top: currentYRef.current,
        behavior: "instant" as ScrollBehavior
      });
      wheelRaf = window.requestAnimationFrame(stepWheelScroll);
    };

    const handleWheel = (event: WheelEvent) => {
      if (
        reducedMotionQuery.matches ||
        !finePointerQuery.matches ||
        navigator.webdriver ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
        hasScrollableAncestor(event.target)
      ) {
        return;
      }

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (maxScroll <= 0) return;

      event.preventDefault();

      if (!animatingRef.current) {
        currentYRef.current = window.scrollY;
        targetYRef.current = window.scrollY;
      }

      const deltaPx =
        event.deltaMode === 1
          ? event.deltaY * 32
          : event.deltaMode === 2
            ? event.deltaY * window.innerHeight
            : event.deltaY;

      targetYRef.current = Math.min(
        maxScroll,
        Math.max(0, targetYRef.current + deltaPx)
      );

      if (!animatingRef.current) {
        animatingRef.current = true;
        wheelRaf = window.requestAnimationFrame(stepWheelScroll);
      }
    };

    const stopWheelAnimation = () => {
      if (wheelRaf !== null) {
        window.cancelAnimationFrame(wheelRaf);
        wheelRaf = null;
      }
      animatingRef.current = false;
      lastWheelTime = 0;
      targetYRef.current = window.scrollY;
      currentYRef.current = window.scrollY;
    };

    updateProgressAndVars();
    window.addEventListener("scroll", syncTargetFromNative, {passive: true});
    window.addEventListener("resize", syncTargetFromNative, {passive: true});
    window.addEventListener("wheel", handleWheel, {passive: false});
    window.addEventListener("keydown", stopWheelAnimation, {passive: true});
    window.addEventListener("mousedown", stopWheelAnimation, {passive: true});
    window.addEventListener("touchstart", stopWheelAnimation, {passive: true});

    return () => {
      if (scrollRaf !== null) window.cancelAnimationFrame(scrollRaf);
      if (wheelRaf !== null) window.cancelAnimationFrame(wheelRaf);
      if (velocityResetTimer !== null) window.clearTimeout(velocityResetTimer);
      window.removeEventListener("scroll", syncTargetFromNative);
      window.removeEventListener("resize", syncTargetFromNative);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", stopWheelAnimation);
      window.removeEventListener("mousedown", stopWheelAnimation);
      window.removeEventListener("touchstart", stopWheelAnimation);
    };
  }, []);

  return (
    <div
      ref={progressRef}
      aria-hidden="true"
      data-scroll-progress=""
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-brand transition-opacity duration-200"
      style={{transform: "scaleX(0)", opacity: 0}}
    />
  );
}
