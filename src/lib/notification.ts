import prisma from '@/lib/db/prisma';

/**
 * Send a notification to a specific user
 * 
 * @param userId - Recipient user ID
 * @param title - Notification title
 * @param message - Notification body/message
 * @param link - Optional link to navigate to when clicked
 */
export async function sendNotification({
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
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                link
            }
        });

        // FUTURE: Real-time update via WebSocket or Server Sent Events (SSE)

    } catch (error) {
        console.error('[Notification] Failed to send notification:', error);
    }
}

/**
 * Send notifications to all admins (e.g., system alerts)
 */
export async function notifyAdmins({
    title,
    message,
    link
}: {
    title: string;
    message: string;
    link?: string;
}) {
    try {
        const admins = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'SUPER_ADMIN' }
                ]
            },
            select: { id: true }
        });

        if (admins.length === 0) return;

        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title,
                message,
                link
            }))
        });

    } catch (error) {
        console.error('[Notification] Failed to notify admins:', error);
    }
}
