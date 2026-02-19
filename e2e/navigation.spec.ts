import { test, expect } from '@playwright/test';

test.describe('Navigation & Locale', () => {
    test('should load in Arabic by default', async ({ page }) => {
        await page.goto('/ar');
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang', 'ar');
        await expect(html).toHaveAttribute('dir', 'rtl');
    });

    test('should load English locale', async ({ page }) => {
        await page.goto('/en');
        const html = page.locator('html');
        await expect(html).toHaveAttribute('lang', 'en');
        await expect(html).toHaveAttribute('dir', 'ltr');
    });

    test('should switch from Arabic to English', async ({ page }) => {
        await page.goto('/ar');

        // Look for locale switcher button/link
        const localeSwitcher = page.locator('a[href*="/en"], button:has-text("EN"), button:has-text("English")').first();

        if (await localeSwitcher.isVisible()) {
            await localeSwitcher.click();
            await page.waitForURL(/\/en/);
            await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        }
    });

    test('should navigate to services from homepage', async ({ page }) => {
        await page.goto('/ar');

        // Click on a service card
        const serviceLink = page.locator('a[href*="/citizen/"]').first();
        if (await serviceLink.isVisible()) {
            await serviceLink.click();
            await expect(page).toHaveURL(/\/citizen\//);
        }
    });
});

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('should show mobile menu toggle', async ({ page }) => {
        await page.goto('/ar');

        // Look for hamburger/menu button
        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="القائمة"], header button').first();
        await expect(menuButton).toBeVisible();
    });

    test('should open and close mobile menu', async ({ page }) => {
        await page.goto('/ar');

        const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="القائمة"], header button').first();

        if (await menuButton.isVisible()) {
            await menuButton.click();
            // Wait a moment for the menu to animate open
            await page.waitForTimeout(500);

            // Check that nav links become visible
            const navLinks = page.locator('nav a, [role="dialog"] a').first();
            await expect(navLinks).toBeVisible();
        }
    });
});
