/**
 * Theme constants shared by the client provider.
 *
 * The pre-paint bootstrap itself lives in `public/theme-init.js` and is loaded
 * by the server layout with `next/script` `strategy="beforeInteractive"`, so it
 * runs from the static HTML head before the first paint. It must use the same
 * storage key as below.
 */
export const THEME_STORAGE_KEY = "kalimeris-theme";

export type Theme = "light" | "dark" | "system";
