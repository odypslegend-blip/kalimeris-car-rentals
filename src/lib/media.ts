const configured = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();

/**
 * Homepage hero video sources.
 *
 * Defaults to self-hosted VP9 WebM (royalty-free codec supported across all
 * Chromium/Electron webviews and Firefox/Chrome) paired with an H.264 MP4
 * fallback (`public/videos/hero-loop.mp4`) for Safari/legacy players. When
 * `NEXT_PUBLIC_HERO_VIDEO_URL` overrides the video URL, only that configured
 * source is used.
 */
export const heroVideoSrc: string | null =
  configured && configured.length > 0 ? configured : "/videos/hero-loop.mp4";

export const heroVideoWebmSrc: string | null =
  configured && configured.length > 0 ? null : "/videos/hero-loop.webm";
