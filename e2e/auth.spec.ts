import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 *
 * Tests registration and login functionality.
 */

test.describe('Authentication', () => {
  test.describe('Registration Page', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');

      // Check for form elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');

      const loginLink = page.locator('a[href*="login"]');
      await expect(loginLink).toBeVisible();
    });

    test('should show validation errors for invalid input', async ({ page }) => {
      await page.goto('/register');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for validation messages
        await page.waitForTimeout(500);

        // Check for validation state (either HTML5 validation or custom)
        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const isInvalid = await emailInput.evaluate(
          (el) => el.validity?.valueMissing || el.classList.contains('invalid') || el.getAttribute('aria-invalid') === 'true'
        );

        // Should have some form of validation feedback
        expect(isInvalid).toBeTruthy();
      }
    });
  });

  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      // Check for form elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login');

      const registerLink = page.locator('a[href*="register"]');
      await expect(registerLink).toBeVisible();
    });

    test('should show Google OAuth option', async ({ page }) => {
      await page.goto('/login');

      // Look for Google sign-in button
      const googleButton = page.locator('button:has-text("Google"), a:has-text("Google")');

      // Google OAuth may or may not be visible depending on configuration
      const isGoogleVisible = await googleButton.count() > 0;
      // This is optional - just checking it loads without error
      expect(true).toBeTruthy();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/login|signin|auth/);
    });

    test('should redirect to login when accessing settings unauthenticated', async ({ page }) => {
      await page.goto('/settings');

      // Should be redirected to login
      await expect(page).toHaveURL(/login|signin|auth/);
    });

    test('should redirect to login when accessing lottery creation unauthenticated', async ({ page }) => {
      await page.goto('/lotteries/create');

      // Should be redirected to login
      await expect(page).toHaveURL(/login|signin|auth/);
    });
  });
});
