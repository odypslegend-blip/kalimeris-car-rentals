import {createNavigation} from "next-intl/navigation";
import {routing} from "./routing";

/**
 * Locale-aware replacements for Next.js navigation APIs.
 * Always import `Link` / `usePathname` / `redirect` from here, never from
 * `next/link` or `next/navigation`, so the active locale is preserved.
 */
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
