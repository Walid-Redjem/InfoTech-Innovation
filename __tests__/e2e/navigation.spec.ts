import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3000";

async function goto(page: Page, path: string) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
}

// ── HOME ─────────────────────────────────────────────────────────────────────

test.describe("Home page", () => {
  test("loads and shows hero title", async ({ page }) => {
    await goto(page, "/en");
    await expect(page.locator("h1").first()).toContainText("InfoTech Innovation");
  });

  test("shows Join Us CTA button", async ({ page }) => {
    await goto(page, "/en");
    const joinBtn = page.locator("section").first().getByRole("link", { name: /join us/i });
    await expect(joinBtn).toBeVisible();
  });

  test("shows service cards section", async ({ page }) => {
    await goto(page, "/en");
    await page.evaluate(() => window.scrollBy(0, 2000));
    await expect(page.getByText("What We Offer")).toBeVisible();
  });

  test("shows WhatsApp button", async ({ page }) => {
    await goto(page, "/en");
    await expect(page.locator("[aria-label='WhatsApp support']")).toBeVisible();
  });

  test("Arabic version loads correctly", async ({ page }) => {
    await goto(page, "/ar");
    await expect(page.locator("h1").first()).toContainText("InfoTech Innovation");
  });

  test("page has RTL direction in Arabic", async ({ page }) => {
    await goto(page, "/ar");
    // Wait for HtmlAttributes client component to set dir
    await page.waitForTimeout(500);
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe("rtl");
  });

  test("language toggle switches from EN to AR", async ({ page }) => {
    await goto(page, "/en");
    await page.locator("nav").getByRole("button", { name: /عربي/i }).click();
    await page.waitForURL(/\/ar/);
    expect(page.url()).toContain("/ar");
  });
});

// ── NAVBAR ───────────────────────────────────────────────────────────────────

test.describe("Navbar", () => {
  test("shows key navigation links on desktop", async ({ page }) => {
    await goto(page, "/en");
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("link", { name: /^home$/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^about$/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /^join us$/i })).toBeVisible();
  });

  test("shows language switcher button", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goto(page, "/en");
    const nav = page.locator("nav").first();
    await expect(nav.getByRole("button", { name: /عربي/i })).toBeVisible();
  });

  test("logo links to home", async ({ page }) => {
    await goto(page, "/en/about");
    await page.locator("nav img[alt='InfoTech Innovation']").click();
    await page.waitForURL(/\/en$/);
    expect(page.url()).toMatch(/\/en$/);
  });
});

// ── PAGES ─────────────────────────────────────────────────────────────────────

test.describe("Page loading", () => {
  const pages = [
    { path: "/en/about",      text: /empowering communities/i },
    { path: "/en/join",       text: /be part of the change/i },
    { path: "/en/issues",     text: /your voice/i },
    { path: "/en/surveys",    text: /your opinion/i },
    { path: "/en/activities", text: /innovation journey/i },
    { path: "/en/terms",      text: /terms & privacy/i },
  ];

  for (const { path, text } of pages) {
    test(`${path} loads correctly`, async ({ page }) => {
      await goto(page, path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toContainText(text);
    });
  }
});

// ── FOOTER ───────────────────────────────────────────────────────────────────

test.describe("Footer", () => {
  test("shows Terms & Privacy link in quick links", async ({ page }) => {
    await goto(page, "/en");
    const termsLink = page.locator("footer").getByRole("link", { name: /terms/i }).first();
    await expect(termsLink).toBeVisible();
  });

  test("Terms link navigates correctly", async ({ page }) => {
    await goto(page, "/en");
    await page.locator("footer").getByRole("link", { name: /terms/i }).first().click();
    await page.waitForURL(/\/terms/);
    expect(page.url()).toContain("/terms");
  });

  test("shows WhatsApp floating button on all pages", async ({ page }) => {
    await goto(page, "/en/about");
    await expect(page.locator("[aria-label='WhatsApp support']")).toBeVisible();
  });
});
