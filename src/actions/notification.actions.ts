'use server';

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

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

// We keep these for now if used elsewhere, but ideally should switch to Convex
export async function getNotifications(userId: string) {
    // This is now client-side via useQuery, but for server usage:
    try {
        const notifications = await convex.query(api.notifications.list, { userId });
        const unreadCount = await convex.query(api.notifications.unreadCount, { userId });
        return { success: true, data: { notifications, unreadCount } };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

export async function markAsRead(notificationId: string) {
    // Managed by client
    return { success: true };
}

export async function markAllAsRead(userId: string) {
    // Managed by client
    return { success: true };
}
