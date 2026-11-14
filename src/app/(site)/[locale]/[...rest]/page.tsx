import {notFound} from "next/navigation";

/**
 * Unknown paths inside a locale (e.g. `/el/does-not-exist`) match this
 * catch-all and render the localized `[locale]/not-found.tsx` inside the
 * site layout. Next.js alone would fall back to its unstyled root 404.
 */
export default function CatchAllPage() {
  notFound();
}
