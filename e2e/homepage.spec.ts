import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/ar');
    });

    test('should load the homepage successfully', async ({ page }) => {
        await expect(page).toHaveTitle(/بلدية عبسان الكبيرة/);
    });

    test('should display the hero section', async ({ page }) => {
        // Hero slider or fallback hero section should be visible
        const hero = page.locator('main section').first();
        await expect(hero).toBeVisible();
    });

    test('should render 4 service cards', async ({ page }) => {
        const servicesSection = page.locator('section').filter({ hasText: /الخدمات|Services/ });
        await expect(servicesSection).toBeVisible();

        const serviceCards = servicesSection.locator('a.group');
        await expect(serviceCards).toHaveCount(4);
    });

    test('should display statistics section', async ({ page }) => {
        const statsSection = page.locator('section.bg-slate-900');
        await expect(statsSection).toBeVisible();

        // Should have 4 stat items
        const statItems = statsSection.locator('.text-center');
        await expect(statItems).toHaveCount(4);
    });

    test('should display the news section', async ({ page }) => {
        const newsSection = page.locator('section').filter({ hasText: /الأخبار|News/ }).last();
        await expect(newsSection).toBeVisible();
    });

    test('service cards should link to correct pages', async ({ page }) => {
        const firstServiceLink = page.locator('a[href*="/citizen/requests/new"]');
        await expect(firstServiceLink).toBeVisible();

        const complaintsLink = page.locator('a[href*="/citizen/complaints"]');
        await expect(complaintsLink).toBeVisible();

        const appointmentsLink = page.locator('a[href*="/citizen/appointments"]');
        await expect(appointmentsLink).toBeVisible();

        const paymentsLink = page.locator('a[href*="/citizen/payments"]');
        await expect(paymentsLink).toBeVisible();
    });
});
