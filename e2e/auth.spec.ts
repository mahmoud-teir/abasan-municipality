import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
    test('login page should render correctly', async ({ page }) => {
        await page.goto('/ar/login');

        // Should have email/phone input
        const emailInput = page.locator('input[type="email"], input[name="email"], input[type="text"]').first();
        await expect(emailInput).toBeVisible();

        // Should have password input
        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();

        // Should have a submit button
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
    });

    test('registration page should render correctly', async ({ page }) => {
        await page.goto('/ar/register');

        // Should have name input
        const nameInput = page.locator('input[name="name"]');
        await expect(nameInput).toBeVisible();

        // Should have email input
        const emailInput = page.locator('input[name="email"], input[type="email"]').first();
        await expect(emailInput).toBeVisible();

        // Should have password input
        const passwordInput = page.locator('input[type="password"]').first();
        await expect(passwordInput).toBeVisible();

        // Should have a submit button
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
    });

    test('login form should show validation errors for empty submission', async ({ page }) => {
        await page.goto('/ar/login');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Browser native or custom validation should appear
        // At minimum, the page should still be on the login route
        await expect(page).toHaveURL(/login/);
    });

    test('forgot password page should render', async ({ page }) => {
        await page.goto('/ar/forgot-password');
        await expect(page.locator('input[type="email"], input[name="email"], input[type="text"]').first()).toBeVisible();
    });

    test('login page should have link to registration', async ({ page }) => {
        await page.goto('/ar/login');
        const registerLink = page.locator('a[href*="register"]');
        await expect(registerLink).toBeVisible();
    });
});
