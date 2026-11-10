import type {NextConfig} from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/**
 * Two build targets share this config:
 *
 * - the normal server build (`next build` / `next start`) with the proxy,
 *   `/api/*` route handlers and `headers()`;
 * - a GitHub Pages static export (`STATIC_EXPORT=1`, driven by
 *   `npm run build:pages`), which cannot serve middleware, route handlers or
 *   response headers, so those are dropped and images are left unoptimized.
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Security headers applied to every route.
 *
 * - `script-src` allows `'unsafe-inline'` because Next's App Router bootstrap
 *   and RSC payload scripts are inline; no nonce/hash pipeline is set up here.
 * - `img-src` allows `data:`/`blob:` for the optimized image pipeline.
 * - HSTS is production-only so local `next start` over plain HTTP is unaffected.
 */
const securityHeaders: {key: string; value: string}[] = [
  {key: "X-Content-Type-Options", value: "nosniff"},
  {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
  {key: "X-Frame-Options", value: "DENY"},
  {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()"},
  {key: "Cross-Origin-Opener-Policy", value: "same-origin"},
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'"
  }
];

/** Server deployment: optimized images and real response headers. */
const serverConfig: NextConfig = {
  poweredByHeader: false,
  // Next.js 16 requires an explicit quality allowlist for next/image.
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    const headers = [...securityHeaders];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload"
      });
    }

    return [{source: "/(.*)", headers}];
  }
};

/**
 * GitHub Pages target. `assetPrefix` is deliberately not set: `basePath`
 * already prefixes `_next/*` asset URLs.
 */
const staticConfig: NextConfig = {
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  ...(basePath ? {basePath} : {}),
  images: {unoptimized: true}
};

const nextConfig: NextConfig = isStatic ? staticConfig : serverConfig;

export default withNextIntl(nextConfig);
