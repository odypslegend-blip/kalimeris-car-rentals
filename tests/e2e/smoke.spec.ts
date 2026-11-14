import {expect, test} from "@playwright/test";
import {expectNoHorizontalOverflow, requestPath} from "./helpers";

/**
 * Greek/English smoke coverage over the real production build.
 *
 * These assertions mirror shipped copy exactly: if a translation or a
 * structural contract (link count, card count, tab content) regresses, the
 * suite fails instead of silently drifting.
 */

test.describe("Greek home", () => {
  test("hero, navigation and booking controls render at 1440", async ({
    page
  }) => {
    await page.setViewportSize({width: 1440, height: 900});

    const response = await page.goto("/el");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", {level: 1})).toHaveText(
      "Νοικιάστε με σιγουριά."
    );

    const header = page.getByRole("banner");

    for (const label of [
      "Τα αυτοκίνητά μας",
      "Πώς λειτουργεί",
      "Συχνές ερωτήσεις",
      "Επικοινωνία"
    ]) {
      await expect(header.getByRole("link", {name: label})).toBeVisible();
    }

    for (const label of ["Παραλαβή", "Επιστροφή", "Ημερομηνίες"]) {
      await expect(page.getByText(label, {exact: true}).first()).toBeVisible();
    }

    await expect(
      page.getByRole("button", {name: "Βρείτε αυτοκίνητο"})
    ).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test("no horizontal overflow at 390", async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});

    const response = await page.goto("/el");
    expect(response?.status()).toBe(200);

    await expectNoHorizontalOverflow(page);
  });

  test("language switch moves to English", async ({page}) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    const response = await page.goto("/el");
    expect(response?.status()).toBe(200);
    const ssrHtml = await response?.text();
    expect(ssrHtml).toMatch(
      /<script[^>]*id="theme-init"[^>]*>[^<]*kalimeris-theme/
    );

    await page.locator('header a[lang="en"]').first().click();

    await expect(page.getByRole("heading", {level: 1})).toHaveText(
      "Rent with confidence."
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(consoleErrors).toEqual([]);
  });

  test("hero car-driving video stays visible and plays under reduced-motion", async ({
    browser
  }) => {
    const context = await browser.newContext({
      viewport: {width: 1440, height: 900},
      reducedMotion: "reduce"
    });
    const page = await context.newPage();

    try {
      const response = await page.goto("/el");
      expect(response?.status()).toBe(200);

      const video = page.locator("video");
      await expect(video).toBeVisible();
      await expect(video.locator("source")).toHaveCount(2);

      await expect
        .poll(async () =>
          video.evaluate((el: HTMLVideoElement) => ({
            readyState: el.readyState,
            paused: el.paused,
            error: el.error?.code ?? null,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height
          }))
        )
        .toMatchObject({
          paused: false,
          error: null
        });

      const metrics = await video.evaluate((el: HTMLVideoElement) => ({
        readyState: el.readyState,
        width: el.getBoundingClientRect().width,
        height: el.getBoundingClientRect().height,
        currentSrc: el.currentSrc
      }));

      expect(metrics.readyState).toBeGreaterThanOrEqual(2);
      expect(metrics.width).toBeGreaterThan(1000);
      expect(metrics.height).toBeGreaterThan(400);
      expect(metrics.currentSrc).toMatch(/hero-loop\.(webm|mp4)$/);
    } finally {
      await context.close();
    }
  });
});

test.describe("Fleet", () => {
  test("lists six vehicles and filters to the two SUVs", async ({page}) => {
    const response = await page.goto("/el/cars");
    expect(response?.status()).toBe(200);

    // Locale-prefixed vehicle links only: the footer also links to the
    // external car.gr listing, whose URL contains "/cars/".
    const vehicleLinks = page.locator('a[href^="/el/cars/"]');
    await expect(vehicleLinks).toHaveCount(6);

    await page.getByRole("link", {name: "SUV", exact: true}).click();
    await expect(page).toHaveURL(/\/el\/cars\?category=suv$/);

    await expect(vehicleLinks).toHaveCount(2);
    await expect(
      page.getByRole("link", {name: /Peugeot 2008/})
    ).toBeVisible();
    await expect(page.getByRole("link", {name: /Kia XCeed/})).toBeVisible();
  });

  test("shows the empty state with a way to clear filters", async ({
    page
  }) => {
    const response = await page.goto(
      "/el/cars?category=van&transmission=automatic"
    );
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", {
        name: "Δεν βρέθηκαν οχήματα με αυτά τα φίλτρα."
      })
    ).toBeVisible();

    // The filter bar also offers a clear link, so scope by destination rather
    // than assuming a single match.
    const clearLink = page
      .getByRole("link", {name: "Καθαρισμός φίλτρων"})
      .first();

    await expect(clearLink).toBeVisible();
    await expect(clearLink).toHaveAttribute("href", "/el/cars");
  });
});

test.describe("Vehicle detail", () => {
  test("gallery and specifications tab render for the Dacia", async ({
    page
  }) => {
    const response = await page.goto("/el/cars/dacia-sandero-stepway");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", {level: 1})).toHaveText(
      "Dacia Sandero Stepway"
    );
    await expect(
      page.getByRole("heading", {name: "Ζητήστε αυτό το αυτοκίνητο"})
    ).toBeVisible();

    await expect(page.locator("button[aria-pressed]")).toHaveCount(2);

    await page.getByRole("tab", {name: "Προδιαγραφές"}).click();

    const panel = page.getByRole("tabpanel");
    await expect(panel).toContainText("Μοντέλο");
    await expect(panel).toContainText("Κιβώτιο");
  });
});

test.describe("Request form validation", () => {
  test("empty contact fields block submission", async ({page}) => {
    const response = await page.goto(requestPath());
    expect(response?.status()).toBe(200);

    await page.waitForTimeout(3000);

    await page.getByRole("button", {name: "Στείλτε αίτημα"}).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(page.locator("[data-request-success]")).toHaveCount(0);
  });
});

test.describe("FAQ", () => {
  test("first accordion item expands with its answer", async ({page}) => {
    const response = await page.goto("/el/faq");
    expect(response?.status()).toBe(200);

    const trigger = page.getByRole("button", {
      name: "Είναι το αίτημα κράτηση;"
    });

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText(/Το αίτημα είναι αίτημα προσφοράς/)
    ).toBeVisible();
  });
});

test.describe("Not found", () => {
  test("serves a localized 404", async ({page}) => {
    const response = await page.goto("/el/does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(page.getByRole("heading", {level: 1})).toHaveText(
      "Η σελίδα δεν βρέθηκε."
    );
  });
});

test.describe("Mobile navigation", () => {
  test("opens at 390 and Escape closes it, restoring focus", async ({
    page
  }) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto("/el");

    const trigger = page.getByRole("button", {name: "Άνοιγμα μενού"});
    await trigger.click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(sheet).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
