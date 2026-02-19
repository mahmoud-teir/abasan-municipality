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
export async function getRequests(status?: string, assignedToId?: string) {
    try {
        const where: any = {};
        if (status) where.status = status;
        if (assignedToId) where.assignedToId = assignedToId;

        const requests = await prisma.request.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true }
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

/**
 * Get list of employees (for assignment dropdowns)
 */
export async function getEmployeesList(): Promise<ActionResult> {
    try {
        const employees = await prisma.user.findMany({
            where: {
                role: {
                    in: ['EMPLOYEE', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN', 'ENGINEER', 'ACCOUNTANT', 'PR_MANAGER']
                },
                isBanned: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: { name: 'asc' },
        });
        return { success: true, data: employees };
    } catch (error) {
        console.error('Error fetching employees:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب قائمة الموظفين' };
    }
}

/**
 * Assign a request to an employee
 */
export async function assignRequest(
    requestId: string,
    assignedToId: string,
    assignedById: string,
    reason?: string
): Promise<ActionResult> {
    try {
        // Update the request
        const request = await prisma.request.update({
            where: { id: requestId },
            data: { assignedToId },
        });

        // Create assignment log
        await prisma.requestAssignment.create({
            data: {
                requestId,
                assignedById,
                assignedToId,
                reason: reason || null,
            },
        });

        // Audit log
        const assignee = await prisma.user.findUnique({ where: { id: assignedToId }, select: { name: true } });
        await logAudit({
            action: 'ASSIGN_REQUEST',
            details: `Request ${request.requestNo} assigned to ${assignee?.name || assignedToId}${reason ? `. Reason: ${reason}` : ''}`,
            targetId: requestId
        });

        // Send notification to assigned employee
        try {
            const { ConvexHttpClient } = await import("convex/browser");
            const { api } = await import("../../convex/_generated/api");

            if (process.env.NEXT_PUBLIC_CONVEX_URL) {
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
                await convex.mutation(api.notifications.send, {
                    userId: assignedToId,
                    title: `تم تعيين طلب لك: ${request.requestNo}`,
                    message: `تم تعيين الطلب رقم ${request.requestNo} لك للمراجعة.${reason ? `\nالسبب: ${reason}` : ''}`,
                    link: `/employee/requests/${request.id}`
                });
            }
        } catch (error) {
            console.error("Failed to send Convex notification:", error);
        }

        revalidatePath('/employee/requests');
        revalidatePath('/admin/requests');

        return { success: true, data: request };
    } catch (error) {
        console.error('Error assigning request:', error);
        return { success: false, error: 'حدث خطأ أثناء تعيين الطلب' };
    }
}

/**
 * Transfer a request to another employee
 */
export async function transferRequest(
    requestId: string,
    newAssigneeId: string,
    transferredById: string,
    reason: string
): Promise<ActionResult> {
    try {
        const request = await prisma.request.findUnique({
            where: { id: requestId },
            select: { requestNo: true, assignedToId: true, id: true }
        });

        if (!request) {
            return { success: false, error: 'الطلب غير موجود' };
        }

        // Update the request
        await prisma.request.update({
            where: { id: requestId },
            data: { assignedToId: newAssigneeId },
        });

        // Create assignment log
        await prisma.requestAssignment.create({
            data: {
                requestId,
                assignedById: transferredById,
                assignedToId: newAssigneeId,
                reason,
            },
        });

        // Audit log
        const [oldAssignee, newAssignee] = await Promise.all([
            request.assignedToId ? prisma.user.findUnique({ where: { id: request.assignedToId }, select: { name: true } }) : null,
            prisma.user.findUnique({ where: { id: newAssigneeId }, select: { name: true } }),
        ]);

        await logAudit({
            action: 'TRANSFER_REQUEST',
            details: `Request ${request.requestNo} transferred from ${oldAssignee?.name || 'unassigned'} to ${newAssignee?.name || newAssigneeId}. Reason: ${reason}`,
            targetId: requestId
        });

        // Send notification to new assignee
        try {
            const { ConvexHttpClient } = await import("convex/browser");
            const { api } = await import("../../convex/_generated/api");

            if (process.env.NEXT_PUBLIC_CONVEX_URL) {
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
                await convex.mutation(api.notifications.send, {
                    userId: newAssigneeId,
                    title: `تم تحويل طلب إليك: ${request.requestNo}`,
                    message: `تم تحويل الطلب رقم ${request.requestNo} إليك.\nالسبب: ${reason}`,
                    link: `/employee/requests/${request.id}`
                });
            }
        } catch (error) {
            console.error("Failed to send Convex notification:", error);
        }

        revalidatePath('/employee/requests');
        revalidatePath('/admin/requests');

        return { success: true, data: request };
    } catch (error) {
        console.error('Error transferring request:', error);
        return { success: false, error: 'حدث خطأ أثناء تحويل الطلب' };
    }
}

/**
 * Get assignment history for a request
 */
export async function getRequestAssignmentHistory(requestId: string): Promise<ActionResult> {
    try {
        const history = await prisma.requestAssignment.findMany({
            where: { requestId },
            orderBy: { createdAt: 'desc' },
            include: {
                assignedBy: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });
        return { success: true, data: history };
    } catch (error) {
        console.error('Error fetching assignment history:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب سجل التعيينات' };
    }
}
