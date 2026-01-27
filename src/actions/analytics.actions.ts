'use server';

import prisma from '@/lib/db/prisma';
import { subDays, format } from 'date-fns';

export async function getDailyRequestStats() {
    try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30); // Last 30 days

        const requests = await prisma.request.groupBy({
            by: ['submittedAt'],
            _count: {
                id: true,
            },
            where: {
                submittedAt: {
                    gte: startDate,
                },
            },
            orderBy: {
                submittedAt: 'asc',
            },
        });

        // Prisma groupBy date might return full timestamps, we need to group by Day.
        // Prisma doesn't support DATE() extraction easily in all providers without raw query.
        // For simplicity and portability, let's fetch reduced data and process in JS, 
        // OR use raw query if postgres. We are using SQlite/Postgres via Prisma.
        // Let's assume fetching all recent requests and processing is cheap enough for MVP (<< 10k records).

        const rawRequests = await prisma.request.findMany({
            where: {
                submittedAt: {
                    gte: startDate
                }
            },
            select: {
                submittedAt: true
            }
        });

        const statsMap = new Map<string, number>();

        // Initialize last 30 days with 0
        for (let i = 0; i <= 30; i++) {
            const d = subDays(endDate, 30 - i);
            const key = format(d, 'yyyy-MM-dd');
            statsMap.set(key, 0);
        }

        rawRequests.forEach(req => {
            const key = format(new Date(req.submittedAt), 'yyyy-MM-dd');
            if (statsMap.has(key)) {
                statsMap.set(key, (statsMap.get(key) || 0) + 1);
            }
        });

        const data = Array.from(statsMap.entries()).map(([date, count]) => ({
            date,
            count
        }));

        return { success: true, data };
    } catch (error) {
        console.error('Analytics Error:', error);
        return { success: false, error: 'Failed to fetch analytics' };
    }
}
