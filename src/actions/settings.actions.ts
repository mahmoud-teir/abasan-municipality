'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

export async function getSystemSetting(key: string) {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        });
        return setting?.value || null;
    } catch (error: any) {
        // Suppress connection errors during build/static generation
        if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database')) {
            console.warn(`[getSystemSetting] DB unreachable for key "${key}" (likely build time). Returning null.`);
            return null;
        }
        console.error('Failed to get system setting:', error);
        return null;
    }
}

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });

        await logAudit({
            action: 'UPDATE_SETTING',
            details: `Setting "${key}" updated`
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update system setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}

export async function updateSystemSettings(settings: Record<string, string>) {
    try {
        const transactions = Object.entries(settings).map(([key, value]) =>
            prisma.setting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            })
        );

        await prisma.$transaction(transactions);

        await logAudit({
            action: 'UPDATE_SETTINGS',
            details: `Updated settings: ${Object.keys(settings).join(', ')}`
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update system settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}
