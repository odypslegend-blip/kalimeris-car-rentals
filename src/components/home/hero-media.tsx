"use client";

import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {assetPath} from "@/lib/base-path";
import {cn} from "@/lib/utils";

type HeroMediaProps = {
  posterSrc: string;
  videoSrc?: string | null;
  webmSrc?: string | null;
  alt?: string;
  className?: string;
};

type VideoSource = {
  src: string;
  type: string;
};

function resolveSources(
  webmSrc?: string | null,
  videoSrc?: string | null
): VideoSource[] {
  const sources: VideoSource[] = [];

  if (webmSrc) {
    sources.push({src: assetPath(webmSrc), type: "video/webm"});
  }

  if (videoSrc) {
    const resolved = assetPath(videoSrc);
    sources.push({
      src: resolved,
      type: resolved.toLowerCase().endsWith(".webm")
        ? "video/webm"
        : "video/mp4"
    });
  }

  return sources;
}

/**
 * Poster image is the LCP base layer & error fallback; decorative car-driving
 * video auto-plays above it across both VP9 WebM (including Electron/Chromium
 * builds without proprietary H.264) and H.264 MP4 browsers.
 *
 * Intentionally does NOT hide behind `prefers-reduced-motion: reduce`, because
 * disabling Windows animation effects (`SPI_GETCLIENTAREAANIMATION=False`) flips
 * that media query in desktop browsers and would replace the requested hero
 * video with the static road photo.
 */
export function HeroMedia({
  posterSrc,
  videoSrc,
  webmSrc,
  alt = "",
  className
}: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sources = resolveSources(webmSrc, videoSrc);
  const sourceKey = sources.map((item) => item.src).join("|");
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const hasSources = sources.length > 0;
  const errored = hasSources && failedKey === sourceKey;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasSources) return;

    video.defaultMuted = true;
    video.muted = true;

    const markFailed = () => setFailedKey(sourceKey);

    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      queueMicrotask(markFailed);
      return;
    }

    const ensurePlay = () => {
      if (video.error) {
        markFailed();
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

    // `<source>` decode/404 errors do not bubble to `<video>`; monitor the final
    // fallback `<source>` so we reveal the poster only when every source fails.
    const sourceElements = video.querySelectorAll("source");
    const lastSource = sourceElements[sourceElements.length - 1];
    lastSource?.addEventListener("error", markFailed);

    return () => {
      video.removeEventListener("loadeddata", ensurePlay);
      video.removeEventListener("canplay", ensurePlay);
      video.removeEventListener("playing", ensurePlay);
      video.removeEventListener("error", markFailed);
      lastSource?.removeEventListener("error", markFailed);
    };
  }, [hasSources, sourceKey]);

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
      {hasSources ? (
        <video
          key={sourceKey}
          ref={videoRef}
          aria-hidden="true"
          tabIndex={-1}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={cn(
            "absolute inset-0 size-full object-cover",
            errored ? "hidden opacity-0" : "opacity-100",
            className
          )}
        >
          {sources.map((item) => (
            <source key={item.src} src={item.src} type={item.type} />
          ))}
        </video>
      ) : null}
    </>
  );
}
