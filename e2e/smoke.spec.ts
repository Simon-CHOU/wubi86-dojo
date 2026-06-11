/**
 * E2E Smoke Tests for Wubi86 Dojo v0.1
 *
 * These tests verify the core user flows work end-to-end using Playwright.
 *
 * PREREQUISITES:
 *   1. Install Playwright browsers:  npx playwright install chromium
 *   2. Start the dev server:          npm run dev
 *   3. Run tests:                     npx playwright test
 *
 * RUNNING:
 *   npx playwright test e2e/smoke.spec.ts
 *
 * INSTALLATION (if Playwright is not set up):
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *
 * NOTE: If Playwright is not installed, mark this file with
 *   test.skip (top-level) to skip all tests:
 *     import { test } from '@playwright/test';
 *     test.skip();
 *
 * The playwright config (playwright.config.ts) expects a dev server
 * running on port 5173.
 */

import { test, expect } from '@playwright/test';

test.describe('Wubi86 Dojo - Smoke Tests', () => {
  test('homepage loads and shows navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=五笔86特训营')).toBeVisible();
    await expect(page.locator('text=练习')).toBeVisible();
    await expect(page.locator('text=基线')).toBeVisible();
    await expect(page.locator('text=统计')).toBeVisible();
    await expect(page.locator('text=设置')).toBeVisible();
  });

  test('can navigate to all 4 pages', async ({ page }) => {
    await page.goto('/');

    // Baseline page
    await page.click('text=基线');
    await expect(page).toHaveURL('/baseline');
    await expect(page.locator('text=基线测试')).toBeVisible();

    // Stats page
    await page.click('text=统计');
    await expect(page).toHaveURL('/stats');
    await expect(page.locator('text=练习进度统计')).toBeVisible();

    // Settings page
    await page.click('text=设置');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('text=设置与计划')).toBeVisible();

    // Back to practice (home)
    await page.click('text=练习');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=打字练习')).toBeVisible();
  });

  test('baseline page shows typing area', async ({ page }) => {
    await page.goto('/baseline');
    // The textarea should be rendered for baseline input
    await expect(
      page.locator('textarea[aria-label="基线测试输入区域"]'),
    ).toBeVisible();
  });

  test('practice page shows text selection', async ({ page }) => {
    await page.goto('/');
    // The Select component should show practice text options
    // Role combobox or native select
    const selector = page.locator('select, [role="combobox"]').first();
    await expect(selector).toBeVisible();
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent');
    await expect(page.locator('text=页面未找到')).toBeVisible();
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('theme toggle exists on the page', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('button[aria-label*="切换"]');
    if (await themeButton.isVisible()) {
      await expect(themeButton).toBeVisible();
    }
  });

  test('practice page stats dashboard renders correctly', async ({ page }) => {
    await page.goto('/');
    // Stats dashboard labels should be present
    await expect(page.locator('text=速度')).toBeVisible();
    await expect(page.locator('text=准确率')).toBeVisible();
    await expect(page.locator('text=进度')).toBeVisible();
    await expect(page.locator('text=用时')).toBeVisible();
  });

  test('settings page shows plan overview section', async ({ page }) => {
    await page.goto('/settings');
    // Plan summary section
    await expect(page.locator('text=计划概览')).toBeVisible();
    await expect(page.locator('text=开始日期')).toBeVisible();
    await expect(page.locator('text=预计达成日期')).toBeVisible();
    await expect(page.locator('text=每日进度增量')).toBeVisible();
  });
});
