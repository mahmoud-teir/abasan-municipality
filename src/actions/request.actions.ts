'use server';

import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

// ============================================
// Schemas
// ============================================
const createRequestSchema = z.object({
    type: z.string().min(1, 'نوع الطلب مطلوب'),
    propertyAddress: z.string().min(5, 'العنوان مطلوب'),
    plotNumber: z.string().optional(),
    basinNumber: z.string().optional(),
    description: z.string().optional(),
});

// ============================================
// Types
// ============================================
export type ActionResult<T = unknown> =
    | { success: true; data: T }
    | { success: false; error: string };

// ============================================
// Actions
// ============================================

/**
 * Create a new building permit request
 */
/**
 * Create a new building permit request
 */
export async function createRequest(
    userId: string,
    formData: FormData
): Promise<ActionResult> {
    try {
        const rawData = {
            type: formData.get('type'),
            propertyAddress: formData.get('propertyAddress'),
            plotNumber: formData.get('plotNumber'),
            basinNumber: formData.get('basinNumber'),
            description: formData.get('description'),
        };

        const documentsJson = formData.get('documents') as string;
        const documents = documentsJson ? JSON.parse(documentsJson) : [];

        const validatedData = createRequestSchema.parse(rawData);

        // Generate Random Official Request ID: REQ-YYYY-XXXXX
        const year = new Date().getFullYear();
        let requestNo = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            attempts++;
            const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random
            requestNo = `REQ-${year}-${random}`;

            const existing = await prisma.request.findUnique({
                where: { requestNo }
            });

            if (!existing) {
                isUnique = true;
            }
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique request number');
        }

        const request = await prisma.request.create({
            data: {
                ...validatedData,
                requestNo,
                userId,
                status: 'PENDING',
                submittedAt: new Date(),
                documents: {
                    create: documents.map((doc: any) => ({
                        type: doc.type || 'OTHER',
                        name: doc.name,
                        url: doc.url,
                    })),
                },
            },
        });

        revalidatePath('/citizen/requests');

        return { success: true, data: request };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' };
        }
        console.error('Error creating request:', error);
        return { success: false, error: 'حدث خطأ أثناء إنشاء الطلب' };
    }
}

/**
 * Get user requests
 */
export async function getUserRequests(userId: string) {
    try {
        const requests = await prisma.request.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                documents: true,
            },
        });
        return { success: true, data: requests };
    } catch (error) {
        console.error('Error fetching requests:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب الطلبات' };
    }
}

/**
 * Get all requests (for employees/admins)
 */
export async function getRequests(status?: string) {
    try {
        const where = status ? { status: status as any } : {};

        const requests = await prisma.request.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                documents: true,
            },
        });
        return { success: true, data: requests };
    } catch (error) {
        console.error('Error fetching requests:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب الطلبات' };
    }
}

/**
 * Update request status (for employees/admins)
 */
export async function updateRequestStatus(
    requestId: string,
    status: 'UNDER_REVIEW' | 'NEEDS_DOCUMENTS' | 'APPROVED' | 'REJECTED',
    note?: string
): Promise<ActionResult> {
    try {
        const request = await prisma.request.update({
            where: { id: requestId },
            data: {
                status,
                reviewedAt: new Date(),
                ...(status === 'APPROVED' || status === 'REJECTED' ? { completedAt: new Date() } : {}),
            },
        });

        await logAudit({
            action: 'UPDATE_REQUEST_STATUS',
            details: `Request ${request.requestNo} status changed to ${status}${note ? `. Note: ${note}` : ''}`,
            targetId: requestId
        });

        if (note) {
            await prisma.note.create({
                data: {
                    content: note,
                    requestId,
                    authorId: 'system', // TODO: Get from session
                    internal: false,
                },
            });
        }

        // Create Notification
        // Create Notification (Convex)
        try {
            const { ConvexHttpClient } = await import("convex/browser");
            const { api } = await import("../../convex/_generated/api");

            if (process.env.NEXT_PUBLIC_CONVEX_URL) {
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
                await convex.mutation(api.notifications.send, {
                    userId: request.userId,
                    title: `Request Updated: ${request.requestNo}`,
                    message: `Your request status has been updated to ${status}. ${note ? `\nNote: ${note}` : ''}`,
                    link: `/citizen/requests/${request.id}`
                });
            }
        } catch (error) {
            console.error("Failed to send Convex notification:", error);
        }

        revalidatePath('/employee/requests');
        revalidatePath('/citizen/requests');

        return { success: true, data: request };
    } catch (error) {
        console.error('Error updating request:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث الطلب' };
    }
}

/**
 * Cancel a request (by citizen)
 */
export async function cancelRequest(
    requestId: string,
    userId: string
): Promise<ActionResult> {
    try {
        const request = await prisma.request.findFirst({
            where: { id: requestId, userId },
        });

        if (!request) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        const NON_CANCELLABLE_STATUSES = ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

        if (NON_CANCELLABLE_STATUSES.includes(request.status)) {
            return { success: false, error: 'لا يمكن إلغاء هذا الطلب في مرحلته الحالية' };
        }

        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'CANCELLED' },
        });

        revalidatePath('/citizen/requests');

        return { success: true, data: null };
    } catch (error) {
        console.error('Error cancelling request:', error);
        return { success: false, error: 'حدث خطأ أثناء إلغاء الطلب' };
    }
}

/**
 * Get single request details
 */
export async function getRequestById(requestId: string, userId: string): Promise<ActionResult> {
    try {
        const request = await prisma.request.findFirst({
            where: { id: requestId, userId },
            include: {
                documents: true,
                notes: {
                    where: { internal: false },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!request) {
            return { success: false, error: 'Request not found' };
        }

        return { success: true, data: request };
    } catch (error) {
        console.error('Error fetching request:', error);
        return { success: false, error: 'Failed to fetch request' };
    }
}
