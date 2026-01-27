'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Send a message for a request
 */
export async function sendMessage(
    requestId: string,
    senderId: string,
    content: string
) {
    try {
        if (!content || content.trim() === '') {
            return { success: false, error: 'Message content is required' };
        }

        const message = await prisma.requestMessage.create({
            data: {
                requestId,
                senderId,
                content,
            },
        });

        // Revalidate paths to update UI
        revalidatePath(`/citizen/requests/${requestId}`);
        revalidatePath(`/employee/requests/${requestId}`);

        return { success: true, data: message };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: 'Failed to send message' };
    }
}

/**
 * Get messages for a request
 */
export async function getMessages(requestId: string) {
    try {
        const messages = await prisma.requestMessage.findMany({
            where: { requestId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        image: true,
                    },
                },
            },
        });

        return { success: true, data: messages };
    } catch (error) {
        console.error('Error fetching messages:', error);
        return { success: false, error: 'Failed to fetch messages' };
    }
}
