import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
    test('about page should load', async ({ page }) => {
        await page.goto('/ar/about');
        await expect(page.locator('main')).toBeVisible();
        // Page title should contain relevant text
        await expect(page).toHaveTitle(/بلدية|عبسان|About/i);
    });

    test('news listing page should load', async ({ page }) => {
        await page.goto('/ar/news');
        await expect(page.locator('main')).toBeVisible();
    });

    test('projects page should load', async ({ page }) => {
        await page.goto('/ar/projects');
        await expect(page.locator('main')).toBeVisible();
    });

    test('careers page should load', async ({ page }) => {
        await page.goto('/ar/careers');
        await expect(page.locator('main')).toBeVisible();
    });

    test('contact page should load', async ({ page }) => {
        await page.goto('/ar/contact');
        await expect(page.locator('main')).toBeVisible();
    });

    test('track request page should load', async ({ page }) => {
        await page.goto('/ar/track');
        await expect(page.locator('main')).toBeVisible();
        // Should have an input for request number
        const trackInput = page.locator('input').first();
        await expect(trackInput).toBeVisible();
    });

    test('services page should load', async ({ page }) => {
        await page.goto('/ar/services');
        await expect(page.locator('main')).toBeVisible();
    });

    test('privacy page should load', async ({ page }) => {
        await page.goto('/ar/privacy');
        await expect(page.locator('main')).toBeVisible();
    });
});
