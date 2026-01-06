import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Home Page and Lottery Browsing
 *
 * Tests guest browsing functionality and page navigation.
 */

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/gomigomi/i);
  });

  test('should display lottery listings', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check for either lottery cards or empty state message
    const hasLotteries = await page.locator('[data-testid="lottery-card"]').count() > 0;
    const hasEmptyState = await page.locator('text=/no lotteries/i').count() > 0;

    expect(hasLotteries || hasEmptyState).toBeTruthy();
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should show login/register buttons for guests', async ({ page }) => {
    await page.goto('/');

    // Look for login or sign in buttons
    const loginButton = page.locator('a[href*="login"], button:has-text("Login"), button:has-text("Sign")');
    await expect(loginButton.first()).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Find and click login link
    const loginLink = page.locator('a[href*="login"]').first();

    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');

    // Find register link
    const registerLink = page.locator('a[href*="register"]').first();

    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });
});
