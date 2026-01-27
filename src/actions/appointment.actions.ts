'use server';

import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { createAppointmentSchema } from '@/lib/validators/schemas';

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
 * Create a new appointment
 */
export async function createAppointment(
    userId: string,
    formData: FormData
): Promise<ActionResult> {
    try {
        const rawData = {
            serviceType: formData.get('serviceType') as string,
            date: formData.get('date') as string,
            timeSlot: formData.get('timeSlot') as string,
            notes: (formData.get('notes') as string) || undefined,
        };

        const validatedData = createAppointmentSchema.parse(rawData);

        // Optional: Check availability logic implementation later
        // For MVP, simplistic check or no check

        // Ensure date is valid DateTime
        const dateObj = new Date(validatedData.date);

        const appointment = await prisma.appointment.create({
            data: {
                serviceType: validatedData.serviceType,
                date: dateObj,
                timeSlot: validatedData.timeSlot,
                notes: validatedData.notes,
                userId,
                status: 'SCHEDULED',
            },
        });

        revalidatePath('/citizen/appointments');
        revalidatePath('/employee/appointments');

        return { success: true, data: appointment };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error('Error creating appointment:', error);
        return { success: false, error: 'حدث خطأ أثناء حجز الموعد' };
    }
}

/**
 * Get user appointments
 */
export async function getUserAppointments(userId: string) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
        return { success: true, data: appointments };
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب المواعيد' };
    }
}

/**
 * Get all appointments (for employees)
 */
export async function getAppointments(status?: string, dateStr?: string) {
    try {
        const where: any = {};
        if (status) where.status = status;

        // Date filtering logic if needed (e.g. for specific day)
        if (dateStr) {
            const start = new Date(dateStr);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateStr);
            end.setHours(23, 59, 59, 999);
            where.date = {
                gte: start,
                lte: end
            };
        }

        const appointments = await prisma.appointment.findMany({
            where,
            orderBy: { date: 'asc' },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        return { success: true, data: appointments };
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب المواعيد' };
    }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
    appointmentId: string,
    status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
) {
    try {
        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });

        revalidatePath('/citizen/appointments');
        revalidatePath('/employee/appointments');

        return { success: true, data: appointment };
    } catch (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث الموعد (Admin)' };
    }
}

/**
 * Cancel appointment (Citizen)
 */
export async function cancelAppointment(
    appointmentId: string,
    userId: string
) {
    try {
        const appointment = await prisma.appointment.findFirst({
            where: { id: appointmentId, userId }
        });

        if (!appointment) {
            return { success: false, error: 'الموعد غير موجود' };
        }

        if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CONFIRMED') {
            return { success: false, error: 'لا يمكن إلغاء هذا الموعد' };
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CANCELLED' }
        });

        revalidatePath('/citizen/appointments');

        return { success: true, data: updated };
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: 'حدث خطأ أثناء إلغاء الموعد' };
    }
}
