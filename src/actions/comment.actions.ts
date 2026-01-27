'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/session';

export async function addComment(newsId: string, content: string) {
    try {
        const user = await getCurrentUser();

        // Ensure user is logged in
        if (!user) {
            return { success: false, error: 'UNAUTHORIZED' };
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                newsId,
                userId: user.id,
            },
        });

        revalidatePath(`/news/${newsId}`);
        // ...

        return { success: true, data: comment };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: 'SERVER_ERROR' };
    }
}

export async function getComments(newsId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { newsId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return { success: true, data: comments };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { success: false, error: 'Failed' };
    }
}
