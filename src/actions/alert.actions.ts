'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

export async function createAlert(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const message = formData.get('message') as string;
        const type = formData.get('type') as 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';
        const expiresAtStr = formData.get('expiresAt') as string;

        await prisma.alert.create({
            data: {
                title,
                message,
                type,
                expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
                isActive: true
            }
        });

        await logAudit({
            action: 'CREATE_ALERT',
            details: `Created ${type} alert: ${title}`
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error creating alert:', error);
        return { success: false, error: 'Failed to create alert' };
    }
}

export async function getActiveAlert() {
    try {
        // Find the most recent active alert that hasn't expired
        const alert = await prisma.alert.findFirst({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: alert };
    } catch (error) {
        console.error('Error fetching alert:', error);
        return { success: false };
    }
}

export async function deactivateAlert(id: string) {
    try {
        await prisma.alert.update({
            where: { id },
            data: { isActive: false }
        });

        await logAudit({
            action: 'DEACTIVATE_ALERT',
            details: 'Alert deactivated',
            targetId: id
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deactivating alert:', error);
        return { success: false, error: 'Failed to deactivate alert' };
    }
}

export async function getAlerts() {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: alerts };
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return { success: false, error: 'Failed to fetch alerts' };
    }
}
