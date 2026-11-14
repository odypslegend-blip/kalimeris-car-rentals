"use client";

import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {assetPath} from "@/lib/base-path";
import {cn} from "@/lib/utils";

type HeroMediaProps = {
  posterSrc: string;
  videoSrc?: string | null;
  alt?: string;
  className?: string;
};

/** Poster image is the LCP base layer; an optional decorative video fades in. */
export function HeroMedia({
  posterSrc,
  videoSrc,
  alt = "",
  className
}: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [allowVideo, setAllowVideo] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    // `canplay` can fire before hydration attaches the JSX handler, which would
    // pin `ready` to false for the whole first loop. Listen natively here and
    // also seed from the element's own readyState.
    const markReady = () => setReady(true);
    const frame = requestAnimationFrame(() => {
      if (video.readyState >= 3) markReady();
    });

    video.addEventListener("canplay", markReady);
    video.addEventListener("loadeddata", markReady);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      const element = videoRef.current;
      if (!element) return;
      if (motionQuery.matches) {
        setAllowVideo(false);
        element.pause();
      } else {
        setAllowVideo(true);
        void element.play().catch(() => {});
      }
    };

    apply();
    motionQuery.addEventListener("change", apply);

    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("loadeddata", markReady);
      motionQuery.removeEventListener("change", apply);
    };
  }, [videoSrc]);

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
      {videoSrc ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          tabIndex={-1}
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-brand",
            ready && allowVideo ? "opacity-100" : "opacity-0",
            className
          )}
        >
          <source src={assetPath(videoSrc)} />
        </video>
      ) : null}
    </>
  );
}
