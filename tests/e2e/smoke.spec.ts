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

  test("EasyUI motion components, scroll progress, spotlight cards, and reduced motion", async ({
    page,
    browser
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.setViewportSize({width: 1440, height: 900});
    await page.goto("/en", {waitUntil: "networkidle"});

    await expect(page.getByRole("heading", {level: 1})).toHaveText(
      "Rent with confidence."
    );
    await expect(page.locator(".hero-underline-path")).toBeAttached();

    const progress = page.locator("[data-scroll-progress]");
    await expect(progress).toBeAttached();
    await expect(progress).toHaveCSS("opacity", "0");

    const callBtn = page.locator('header a.book-call-btn[href^="tel:"]');
    await expect(callBtn).toBeVisible();
    const callBox = await callBtn.boundingBox();
    expect(callBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const spotlightCards = page.locator(".spotlight-card");
    expect(await spotlightCards.count()).toBeGreaterThanOrEqual(7);

    const firstCard = spotlightCards.first();
    await firstCard.scrollIntoViewIfNeeded();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox).not.toBeNull();
    if (cardBox) {
      await page.mouse.move(
        cardBox.x + cardBox.width / 2,
        cardBox.y + cardBox.height / 2
      );
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      );
      const mouseX = await firstCard.evaluate((el) =>
        el.style.getPropertyValue("--mouse-x")
      );
      expect(mouseX).toMatch(/px$/);
    }

    const steps = page.locator("[data-animated-steps]");
    await steps.scrollIntoViewIfNeeded();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    await expect(steps).toHaveAttribute("data-steps-active", "true");
    await expect(progress).toHaveCSS("opacity", "1");

    const desktopOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    );
    expect(desktopOverflow).toBe(true);

    await page.goto("/en/cars", {waitUntil: "networkidle"});
    expect(await page.locator(".spotlight-card").count()).toBeGreaterThanOrEqual(
      6
    );
    await page.setViewportSize({width: 390, height: 844});
    const mobileOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    );
    expect(mobileOverflow).toBe(true);
    expect(errors).toEqual([]);

    const reducedContext = await browser.newContext({reducedMotion: "reduce"});
    try {
      const reducedPage = await reducedContext.newPage();
      const reducedErrors: string[] = [];
      reducedPage.on("pageerror", (err) => reducedErrors.push(err.message));
      reducedPage.on("console", (msg) => {
        if (msg.type() === "error") reducedErrors.push(msg.text());
      });

      await reducedPage.setViewportSize({width: 1440, height: 900});
      await reducedPage.goto("/el", {waitUntil: "networkidle"});
      await expect(reducedPage.locator("h1.hero-load-rise")).toHaveCSS(
        "animation-name",
        "hero-rise"
      );
      await expect(reducedPage.locator(".hero-underline-path")).toHaveCSS(
        "animation-name",
        "hero-stroke"
      );

      const reducedCard = reducedPage.locator(".spotlight-card").first();
      await reducedCard.scrollIntoViewIfNeeded();
      const reducedCardBox = await reducedCard.boundingBox();
      expect(reducedCardBox).not.toBeNull();
      if (reducedCardBox) {
        await reducedPage.mouse.move(
          reducedCardBox.x + reducedCardBox.width / 3,
          reducedCardBox.y + reducedCardBox.height / 3
        );
        await reducedPage.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            )
        );
        const [mouseX, tiltX] = await reducedCard.evaluate((el) => [
          el.style.getPropertyValue("--mouse-x"),
          el.style.getPropertyValue("--tilt-x")
        ]);
        expect(mouseX).toMatch(/px$/);
        expect(tiltX).toMatch(/deg$/);
      }

      const reducedSteps = reducedPage.locator("[data-animated-steps]");
      await reducedSteps.scrollIntoViewIfNeeded();
      await reducedPage.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
      );
      await expect(reducedSteps).toHaveAttribute("data-steps-active", "true");
      const parallaxY = await reducedPage.evaluate(() =>
        document.documentElement.style.getPropertyValue("--hero-parallax-y")
      );
      expect(parallaxY).toMatch(/px$/);
      expect(parseFloat(parallaxY)).toBeGreaterThan(0);

      const visibleReveal = reducedPage.locator('[data-reveal="visible"]').first();
      await expect(visibleReveal).toHaveCSS("opacity", "1");
      expect(reducedErrors).toEqual([]);
    } finally {
      await reducedContext.close();
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
