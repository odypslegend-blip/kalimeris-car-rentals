"use client";

import Image from "next/image";
import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {assetPath} from "@/lib/base-path";
import {cn} from "@/lib/utils";

type HeroMediaProps = {
  posterSrc: string;
  videoSrc?: string | null;
  alt?: string;
  className?: string;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** Poster image is the LCP base layer & fallback; decorative car-driving video auto-plays above it unless reduced motion is requested. */
export function HeroMedia({
  posterSrc,
  videoSrc,
  alt = "",
  className
}: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedVideoSrc = videoSrc ? assetPath(videoSrc) : null;
  const errored = resolvedVideoSrc !== null && failedSrc === resolvedVideoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedVideoSrc) return;

    video.defaultMuted = true;
    video.muted = true;

    const markFailed = () => setFailedSrc(resolvedVideoSrc);
    if (video.error) {
      queueMicrotask(markFailed);
      return;
    }

    const ensurePlay = () => {
      if (reducedMotion || video.error) {
        video.pause();
        return;
      }
      if (video.paused) {
        void video.play().catch(() => {});
      }
    };

    ensurePlay();
    video.addEventListener("loadeddata", ensurePlay);
    video.addEventListener("canplay", ensurePlay);
    video.addEventListener("playing", ensurePlay);
    video.addEventListener("error", markFailed);

    return () => {
      video.removeEventListener("loadeddata", ensurePlay);
      video.removeEventListener("canplay", ensurePlay);
      video.removeEventListener("playing", ensurePlay);
      video.removeEventListener("error", markFailed);
    };
  }, [resolvedVideoSrc, reducedMotion]);

  const showVideo = Boolean(resolvedVideoSrc) && !reducedMotion && !errored;

  return (
    <>
      <Image
        src={posterSrc}
        alt={alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className={className}
      />
      {resolvedVideoSrc ? (
        <video
          ref={videoRef}
          src={resolvedVideoSrc}
          aria-hidden="true"
          tabIndex={-1}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailedSrc(resolvedVideoSrc)}
          className={cn(
            "motion-reduce:hidden absolute inset-0 size-full object-cover",
            showVideo ? "opacity-100" : "hidden opacity-0",
            className
          )}
        />
      ) : null}
    </>
  );
}
