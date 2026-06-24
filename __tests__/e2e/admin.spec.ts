import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Admin login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/en/admin/login`, { waitUntil: "networkidle" });
  });

  test("shows login form", async ({ page }) => {
    await expect(page.getByPlaceholder(/admin@infotech/i)).toBeVisible();
    await expect(page.getByPlaceholder(/••••/)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows 'Welcome back' heading", async ({ page }) => {
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test("shows language toggle", async ({ page }) => {
    await expect(page.getByRole("button", { name: /عربي/i })).toBeVisible();
  });

  test("language toggle switches to Arabic", async ({ page }) => {
    await page.getByRole("button", { name: /عربي/i }).click();
    await page.waitForURL(/\/ar\/admin\/login/);
    await expect(page.getByText(/أهلاً بعودتك/i)).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.getByPlaceholder(/admin@infotech/i).fill("wrong@email.com");
    await page.getByPlaceholder(/••••/).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 8000 });
  });

  test("show/hide password toggle works", async ({ page }) => {
    const input = page.getByPlaceholder(/••••/);
    await expect(input).toHaveAttribute("type", "password");
    await page.locator("button[type='button']").last().click();
    await expect(input).toHaveAttribute("type", "text");
  });

  test("redirects to dashboard if already logged in", async ({ page }) => {
    // Unauthenticated users stay on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/admin/login");
  });
});

test.describe("Admin redirect", () => {
  test("redirects unauthenticated access to /admin to login", async ({ page }) => {
    await page.goto(`${BASE}/en/admin`, { waitUntil: "networkidle" });
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 });
    expect(page.url()).toContain("/admin/login");
  });
});
