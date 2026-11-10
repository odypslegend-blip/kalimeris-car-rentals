import http from "node:http";
import {expect, test} from "@playwright/test";
import {requestPath} from "./helpers";

/**
 * Inquiry delivery end-to-end.
 *
 * The production server started by the Playwright webServer is configured with
 * INQUIRY_WEBHOOK_URL=http://127.0.0.1:9299/inquiry, so every delivered request
 * lands in this file's own receiver. Nothing touches Resend, and no success is
 * ever claimed without a payload actually arriving here.
 */

type ReceivedPayload = {
  reference?: string;
  name?: string;
  email?: string;
  vehicleId?: string;
  [key: string]: unknown;
};

const RECEIVER_PORT = 9299;
const ENDPOINT_PATH = "/inquiry";

const received: ReceivedPayload[] = [];
let server: http.Server | undefined;

test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    const pathname = (request.url ?? "").split("?")[0];

    if (request.method !== "POST" || pathname !== ENDPOINT_PATH) {
      response.writeHead(404, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: false, error: "not_found"}));
      return;
    }

    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    request.on("end", () => {
      try {
        received.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        received.push({});
      }

      response.writeHead(200, {"content-type": "application/json"});
      response.end(JSON.stringify({ok: true}));
    });
  });

  await new Promise<void>((resolve, reject) => {
    server?.once("error", reject);
    server?.listen(RECEIVER_PORT, "127.0.0.1", () => resolve());
  });
});

test.afterAll(async () => {
  if (!server) return;

  await new Promise<void>((resolve) => {
    server?.close(() => resolve());
    server?.closeAllConnections?.();
  });

  server = undefined;
});

test("delivers the inquiry and preserves the server reference", async ({
  page
}) => {
  const before = received.length;

  const response = await page.goto(requestPath());
  expect(response?.status()).toBe(200);

  // The API rejects submissions that arrive less than 2.5s after mount.
  await page.waitForTimeout(3200);

  const name = "Maria E2E Test";

  await page.getByLabel("Ονοματεπώνυμο").fill(name);
  await page.getByLabel("Email").fill("maria.e2e@example.com");
  await page.getByLabel("Τηλέφωνο").fill("+30 210 1234567");
  await page.getByRole("checkbox", {name: /Συμφωνώ/}).check();

  await page.getByRole("button", {name: "Στείλτε αίτημα"}).click();

  const success = page.locator("[data-request-success]");
  await expect(success).toBeVisible({timeout: 30_000});
  await expect(success).toContainText("Το αίτημα στάλθηκε.");
  await expect(success).toContainText("KR-");

  const text = await success.innerText();
  const reference = text.match(/KR-\d{8}-[A-Z0-9]{4}/)?.[0];
  expect(reference, "success state must show a KR- reference").toBeTruthy();

  await expect.poll(() => received.length, {timeout: 10_000}).toBe(before + 1);

  const matched = received.filter((entry) => entry.reference === reference);
  expect(matched).toHaveLength(1);
  expect(matched[0].name).toBe(name);
  expect(matched[0].vehicleId).toBe("peugeot-2008");
});

test("never renders success before the server responds", async ({page}) => {
  await page.goto(requestPath());

  await expect(page.locator("[data-request-success]")).toHaveCount(0);
  await expect(page.getByText("Το αίτημα στάλθηκε.")).toHaveCount(0);
});

test("validation errors block delivery", async ({page}) => {
  const before = received.length;

  await page.goto(requestPath());
  await page.waitForTimeout(3000);

  await page.getByRole("button", {name: "Στείλτε αίτημα"}).click();

  await expect(page.getByRole("alert").first()).toBeVisible();

  // Give a wrongly-firing request time to reach the receiver.
  await page.waitForTimeout(750);
  expect(received.length).toBe(before);
});
