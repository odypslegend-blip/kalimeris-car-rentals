/**
 * Deployment base path, empty for the server build.
 *
 * The GitHub Pages export is served from a repository sub-path
 * (`/kalimeris-car-rentals`). `next.config.ts` hands that value to Next via
 * `basePath`, which already prefixes routes and `_next/*` assets — but a
 * `next/image` `src` pointing at `/images/...` is written by the app itself, so
 * it needs the same prefix explicitly. `NEXT_PUBLIC_*` is inlined at build
 * time, so this also works inside client components.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefix a root-relative local asset path with `basePath`.
 * Absolute/remote URLs and already-relative paths pass through untouched.
 */
export function assetPath(path: string) {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
