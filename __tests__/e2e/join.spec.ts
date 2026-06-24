import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Join Us page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/en/join`, { waitUntil: "networkidle" });
  });

  test("shows 3 profile tabs", async ({ page }) => {
    // Profile tabs are inside the grid above the form
    const tabs = page.locator(".grid.grid-cols-3 button");
    await expect(tabs).toHaveCount(3);
  });

  test("Youth tab is selected by default", async ({ page }) => {
    const youthBtn = page.locator(".grid.grid-cols-3 button").first();
    await expect(youthBtn).toHaveClass(/bg-mauve/);
  });

  test("switching to Teacher tab shows institution & specialty fields", async ({ page }) => {
    await page.locator(".grid.grid-cols-3 button").nth(1).click();
    await expect(page.getByPlaceholder(/institution name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/specialty/i)).toBeVisible();
  });

  test("switching to Institution tab shows description textarea", async ({ page }) => {
    await page.locator(".grid.grid-cols-3 button").nth(2).click();
    // Look for the description label text
    await expect(page.getByText(/why are you looking to contact us/i)).toBeVisible();
  });

  test("shows error when submitting empty Youth form", async ({ page }) => {
    await page.getByRole("button", { name: /register/i }).click();
    const errors = page.getByText(/required/i);
    await expect(errors.first()).toBeVisible();
  });

  test("underage section appears when age < 17", async ({ page }) => {
    await page.getByPlaceholder(/full name/i).fill("Test User");
    await page.getByPlaceholder(/email/i).fill("test@test.com");
    await page.getByPlaceholder(/^age$/i).fill("14");
    await expect(page.getByText(/parental consent required/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /download the form/i })).toBeVisible();
  });

  test("adult section appears when age >= 17", async ({ page }) => {
    await page.getByPlaceholder(/full name/i).fill("Test User");
    await page.getByPlaceholder(/email/i).fill("test@test.com");
    await page.getByPlaceholder(/^age$/i).fill("20");
    await expect(page.getByText(/registration form required/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /download registration form/i })).toBeVisible();
  });

  test("underage section hides when age changes to >= 17", async ({ page }) => {
    const ageInput = page.getByPlaceholder(/^age$/i);
    await ageInput.fill("14");
    await expect(page.getByText(/parental consent required/i)).toBeVisible();
    await ageInput.fill("18");
    await expect(page.getByText(/parental consent required/i)).not.toBeVisible();
  });

  test("terms link is visible in form", async ({ page }) => {
    // Terms link is inside the form at the bottom
    const termsLink = page.locator("form").getByRole("link", { name: /terms/i });
    await expect(termsLink).toBeVisible();
  });

  test("Arabic version shows Arabic labels", async ({ page }) => {
    await page.goto(`${BASE}/ar/join`, { waitUntil: "networkidle" });
    const tabs = page.locator(".grid.grid-cols-3 button");
    await expect(tabs.first()).toContainText(/شباب/);
  });

  test("register button is present", async ({ page }) => {
    await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
  });
});
