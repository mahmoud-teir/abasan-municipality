'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSetting(key: string) {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        });
        return setting?.value || null;
    } catch (error) {
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
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update system setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}
