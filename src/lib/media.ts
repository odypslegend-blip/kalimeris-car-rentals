const configured = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();

/**
 * Homepage hero video.
 *
 * Defaults to the self-hosted loop in `public/videos/hero-loop.mp4` so the site
 * works with no configuration. `NEXT_PUBLIC_HERO_VIDEO_URL` overrides it: set it
 * to a root-relative path or an absolute https URL. `NEXT_PUBLIC_*` is inlined at
 * build time, so this works in the static GitHub Pages export too.
 */
export const heroVideoSrc: string | null =
  configured && configured.length > 0 ? configured : "/videos/hero-loop.mp4";
