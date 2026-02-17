'use server';

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { prisma } from "@/lib/db/prisma";
import { logAudit } from '@/lib/audit';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Internal helper to create notifications using Convex
export async function createNotification({
    userId,
    title,
    message,
    link
}: {
    userId: string;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        await convex.mutation(api.notifications.send, {
            userId,
            title,
            message,
            link
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating notification in Convex:', error);
        return { success: false, error: 'Failed to create notification' };
    }
}

export async function sendBroadcastToUsers(data: {
    title: string;
    message: string;
    type: string;
    audience: string;
    sentBy: string;
    link?: string;
}) {
    try {
        let users: { id: string }[] = [];

        // 1. Fetch Target Users
        if (data.audience === 'all') {
            users = await prisma.user.findMany({ select: { id: true } });
        } else if (data.audience === 'employees') {
            users = await prisma.user.findMany({
                where: { role: { in: ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'ENGINEER', 'ACCOUNTANT', 'PR_MANAGER', 'SUPERVISOR'] } },
                select: { id: true }
            });
        } else if (data.audience === 'citizens') {
            users = await prisma.user.findMany({
                where: { role: 'CITIZEN' },
                select: { id: true }
            });
        }

        if (users.length === 0) {
            return { success: false, error: 'No users found for this audience' };
        }

        // 2. Prepare Notifications Batch
        const notifications = users.map(user => ({
            userId: user.id,
            title: data.title,
            message: data.message,
            link: data.link
        }));

        // 3. Send Batch to Convex
        // Split into chunks of 100 to avoid limits if necessary, 
        // but for now simplistic approach:
        const chunkSize = 100;
        for (let i = 0; i < notifications.length; i += chunkSize) {
            const chunk = notifications.slice(i, i + chunkSize);
            await convex.mutation(api.notifications.sendBatch, {
                notifications: chunk
            });
        }

        // 4. Log Broadcast in Convex History (if not already done by client)
        // Ideally the client calls this action instead of the direct mutation to 'broadcasts'
        // But since the client currently calls 'api.broadcasts.send', 
        // we might want to update the client to call THIS action instead.
        // For now, let's assume this action REPLACES the client mutation call.
        await convex.mutation(api.broadcasts.send, {
            title: data.title,
            message: data.message,
            type: data.type,
            audience: data.audience,
            sentBy: data.sentBy
        });

        await logAudit({
            action: 'SEND_BROADCAST',
            details: `Broadcast "${data.title}" sent to ${data.audience} (${users.length} users)`,
            actorId: data.sentBy
        });

        return { success: true, count: users.length };
    } catch (error) {
        console.error("Broadcast failed:", error);
        return { success: false, error: "Failed to send broadcast" };
    }
}
