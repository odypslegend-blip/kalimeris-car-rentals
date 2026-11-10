import {defineConfig, devices} from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * One worker, no retries: the inquiry suite owns a single in-process webhook
 * receiver and asserts exact delivery counts, so tests must never overlap.
 * The app is started from the production build (`npm run test:e2e` builds
 * first) and configured to deliver to that receiver — never to Resend.
 */
const BASE_URL = "http://127.0.0.1:4400";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npx next start -p 4400",
    url: "http://127.0.0.1:4400/api/health",
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      INQUIRY_WEBHOOK_URL: "http://127.0.0.1:9299/inquiry",
      INQUIRY_WEBHOOK_SECRET: "e2e-test",
      INQUIRY_RATE_LIMIT_PER_HOUR: "100",
      RESEND_API_KEY: "",
      INQUIRY_FROM_EMAIL: "",
      INQUIRY_TO_EMAIL: ""
    }
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome"
      }
    }
  ]
});
