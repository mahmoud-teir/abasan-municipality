'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Get users with pagination
 */
export async function getUsers(page = 1, limit = 10, search?: string) {
    try {
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    nationalId: true,
                    nationalIdImage: true,
                    emailVerified: true,
                    failedLoginAttempts: true,
                    isBanned: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            },
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب المستخدمين' };
    }
}


const updateRoleSchema = z.object({
    userId: z.string(),
    role: z.enum(['CITIZEN', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN', 'ENGINEER', 'ACCOUNTANT', 'PR_MANAGER']),
});

import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export async function createUser(data: any) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const dummyHeaders = new Headers();

        const result = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
            headers: dummyHeaders
        });

        if (result?.user) {
            if (data.role && data.role !== 'CITIZEN') {
                await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: data.role as any }
                });
            }

            revalidatePath('/admin/users');
            return { success: true };
        }

        return { success: false, error: 'Failed to create user' };

    } catch (error: any) {
        console.error('Create User Error:', error);
        if (error?.body?.message) {
            return { success: false, error: error.body.message };
        }
        if (error?.code === 'P2002') {
            return { success: false, error: 'Email already exists' };
        }
        return { success: false, error: error.message || 'Failed to create user' };
    }
}


/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
    try {
        const validated = updateRoleSchema.parse({ userId, role });

        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'غير مصرح لك بتغيير الصلاحيات (Super Admin Required)' };
        }

        // Prevent changing own role
        if (session.user.id === validated.userId) {
            return { success: false, error: 'لا يمكنك تغيير صلاحيتك بنفسك' };
        }

        await prisma.user.update({
            where: { id: validated.userId },
            data: { role: validated.role as any },
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating role:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث الصلاحية' };
    }
}

/**
 * Verify User (Manual Identity Verification)
 */
export async function verifyUser(userId: string, isVerified: boolean) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!targetUser) return { success: false, error: 'User not found' };

        // Logic:
        // 1. If I am SUPER_ADMIN, I can verify anyone.
        // 2. If I am the user (Self Verification), I can verify myself ONLY IF I am a CITIZEN.
        // 3. Otherwise, Forbidden.

        const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
        const isSelf = session.user.id === userId;
        const isCitizen = targetUser.role === 'CITIZEN' || targetUser.role === null; // Default to citizen if null

        if (isSuperAdmin) {
            // Authorized
        } else if (isSelf && isCitizen) {
            // Authorized (Self Verification for Citizens)
        } else {
            return { success: false, error: 'Unauthorized: Only Super Admin can verify manually.' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: isVerified }
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error verifying user:', error);
        return { success: false, error: 'Error updating verification status' };
    }
}

/**
 * Lookup email by National ID
 */
export async function lookupEmailByNationalId(nationalId: string) {
    try {
        const user = await prisma.user.findFirst({
            where: { nationalId },
            select: { email: true }
        });

        if (user) {
            return { success: true, email: user.email };
        }
        return { success: false };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Unban User
 */
export async function unbanUser(userId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: false,
                failedLoginAttempts: 0,
                banReason: null
            }
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error unbanning user:', error);
        return { success: false, error: 'Error processing request' };
    }
}

/**
 * Ban User (Manual)
 */
export async function banUser(userId: string, reason?: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        // Prevent banning self
        if (session.user.id === userId) {
            return { success: false, error: 'Cannot ban yourself' };
        }

        // Prevent banning Super Admin or Admin
        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (target?.role === 'SUPER_ADMIN' || target?.role === 'ADMIN') {
            return { success: false, error: 'Cannot ban Admin or Super Admin users' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                banReason: reason || 'Manual ban by admin'
            }
        });

        // Notify Admins about this manual ban
        const { createNotification } = await import('@/actions/notification.actions');

        // Notify the admin who performed the ban (confirmation) and others
        // Actually, maybe better to notify OTHER admins? Or all admins including self?
        // Let's notify all admins to keep a record in their notifications.
        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            select: { id: true }
        });

        const targetUserEmail = target?.email || 'N/A';
        const actorName = session.user.name;

        admins.map(admin =>
            createNotification({
                userId: admin.id,
                title: 'User Banned Manually',
                message: `Admin ${actorName} banned user ${targetUserEmail}. Reason: ${reason || 'N/A'}`,
                link: `/admin/users?search=${encodeURIComponent(targetUserEmail)}`
            })
        );

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        return { success: false, error: 'Error processing request' };
    }
}
