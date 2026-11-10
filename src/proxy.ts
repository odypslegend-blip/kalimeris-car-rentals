import createMiddleware from "next-intl/middleware";
import {routing} from "./i18n/routing";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`; the file must sit next to
 * `app` (here: `src/proxy.ts`) and export the handler as `proxy` or default.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};
