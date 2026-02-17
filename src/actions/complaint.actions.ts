'use server';

import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { createComplaintSchema } from '@/lib/validators/schemas';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createNotification } from './notification.actions';
import { logAudit } from '@/lib/audit';

// Define ActionResult type
type ActionResult = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function createComplaint(
    userId: string,
    formData: FormData
): Promise<ActionResult> {
    try {
        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            location: formData.get('location'),
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
            // We don't valid image with Zod here as we handle it manually
        };

        const validatedData = createComplaintSchema.parse(rawData);

        // Handle Image Upload
        let imageUrl: string | undefined;
        const imageFile = formData.get('image') as File | null;

        if (imageFile && imageFile.size > 0) {
            // Basic validation
            if (!imageFile.type.startsWith('image/')) {
                return { success: false, error: 'File must be an image' };
            }
            if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
                return { success: false, error: 'Image size must be less than 5MB' };
            }

            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = imageFile.name.split('.').pop() || 'jpg';
            const filename = `complaint-${uniqueSuffix}.${extension}`;

            // Save path
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'complaints');

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            imageUrl = `/uploads/complaints/${filename}`;
        }

        // Generate Random Official Complaint ID: COM-YYYY-XXXXX
        const year = new Date().getFullYear();
        let complaintNo = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            attempts++;
            const random = Math.floor(10000 + Math.random() * 90000); // 5 digit random
            complaintNo = `COM-${year}-${random}`;

            const existing = await prisma.complaint.findUnique({
                where: { complaintNo }
            });

            if (!existing) {
                isUnique = true;
            }
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique complaint number');
        }

        const complaint = await prisma.complaint.create({
            data: {
                ...validatedData,
                // image field removed as it does not exist in Prisma schema
                complaintNo,
                userId,
                status: 'OPEN',
                imageUrl,
            },
        });

        revalidatePath('/citizen/complaints');
        revalidatePath('/employee/complaints');

        return { success: true, data: complaint };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation error' };
        }
        console.error('Error creating complaint:', error);
        return { success: false, error: 'حدث خطأ أثناء إرسال الشكوى' };
    }
}

/**
 * Get user complaints
 */
export async function getUserComplaints(userId: string) {
    try {
        const complaints = await prisma.complaint.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                responses: true
            }
        });
        return { success: true, data: complaints };
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب الشكاوى' };
    }
}

/**
 * Get all complaints (for employees)
 */
export async function getComplaints(status?: string) {
    try {
        const where = status ? { status: status as any } : {};

        const complaints = await prisma.complaint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        return { success: true, data: complaints };
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب الشكاوى' };
    }
}

/**
 * Get complaint by ID
 */
export async function getComplaintById(complaintId: string) {
    try {
        const complaint = await prisma.complaint.findUnique({
            where: { id: complaintId },
            include: {
                responses: true,
                user: {
                    select: { name: true, email: true, phone: true, nationalId: true }
                }
            }
        });

        if (!complaint) {
            return { success: false, error: 'Complaint not found' };
        }

        return { success: true, data: complaint };
    } catch (error) {
        console.error('Error fetching complaint:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب تفاصيل الشكوى' };
    }
}

/**
 * Update complaint status
 */
export async function updateComplaintStatus(
    complaintId: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    responseContent?: string,
    responderId?: string
) {
    try {
        const complaint = await prisma.complaint.update({
            where: { id: complaintId },
            data: { status },
        });

        await logAudit({
            action: 'UPDATE_COMPLAINT_STATUS',
            details: `Complaint ${complaint.complaintNo} status changed to ${status}`,
            targetId: complaintId
        });

        if (responseContent && responderId) {
            await prisma.response.create({
                data: {
                    content: responseContent,
                    complaintId: complaintId,
                    responderId: responderId
                }
            });
        }

        // Trigger Notification
        if (complaint.userId) {
            const statusMsg = status === 'RESOLVED' ? 'تم حل شكواك' : status === 'IN_PROGRESS' ? 'شكواك قيد المعالجة' : 'تم تحديث حالة شكواك';
            await createNotification({
                userId: complaint.userId,
                title: 'تحديث على الشكوى',
                message: `${statusMsg}: ${complaint.title}`,
                link: `/citizen/complaints/${complaintId}`
            });
        }

        revalidatePath('/citizen/complaints');
        revalidatePath('/employee/complaints');

        return { success: true, data: complaint };
    } catch (error) {
        console.error('Error updating complaint:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث الشكوى' };
    }
}
