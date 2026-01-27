
'use server';

import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export async function generateBackup() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const [
            users,
            requests,
            complaints,
            appointments,
            services,
            payments,
            news
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.request.findMany({ include: { documents: true, notes: true } }),
            prisma.complaint.findMany({ include: { responses: true } }),
            prisma.appointment.findMany(),
            prisma.serviceType.findMany(),
            prisma.payment.findMany(),
            prisma.news.findMany()
        ]);

        const backupData = {
            metadata: {
                version: '1.0',
                generatedAt: new Date().toISOString(),
                generatedBy: session.user.email,
            },
            data: {
                users,
                requests,
                complaints,
                appointments,
                services,
                payments,
                news
            }
        };

        return { success: true, data: JSON.stringify(backupData, null, 2) };
    } catch (error) {
        console.error('Backup generation failed:', error);
        return { success: false, error: 'Failed to generate backup' };
    }
}
