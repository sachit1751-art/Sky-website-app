import { test, expect } from '@playwright/test';

test.describe('SKY AOSP ROM Portal E2E Tests', () => {
  test('loads home page and checks title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SKY/);
  });

  test('navigates to ROMs page and interacts with search', async ({ page }) => {
    await page.goto('/roms');
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Pixel');
    await expect(searchInput).toHaveValue('Pixel');
  });

  test('toggles theme mode correctly', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('button[title*="theme" i], button[aria-label*="theme" i]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
  });
});
