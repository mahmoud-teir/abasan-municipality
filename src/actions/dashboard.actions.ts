'use server';

import prisma from '@/lib/db/prisma';

export async function getCitizenDashboardStats(userId: string) {
    try {
        const [
            pendingCount,
            underReviewCount,
            approvedCount,
            paymentsCount,
            recentRequests
        ] = await Promise.all([
            prisma.request.count({
                where: { userId, status: 'PENDING' }
            }),
            prisma.request.count({
                where: { userId, status: 'UNDER_REVIEW' }
            }),
            prisma.request.count({
                where: { userId, status: 'APPROVED' }
            }),
            prisma.payment.count({
                where: { userId, status: 'PENDING' }
            }),
            prisma.request.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ]);

        return {
            success: true,
            data: {
                pendingCount,
                underReviewCount,
                approvedCount,
                paymentsCount,
                recentRequests
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: 'Failed to fetch dashboard stats' };
    }
}
