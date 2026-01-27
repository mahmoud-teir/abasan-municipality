import { auth } from '@/lib/auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

const { GET, POST: originalPOST } = toNextJsHandler(auth);

export { GET };

export const POST = async (req: NextRequest) => {
    // Clone request to read body later if needed (streams are one-time use)
    // However, BetterAuth consumes the body. 
    // We can try to read the body clone first if possible, or parse it from the request if BetterAuth allows re-reading.
    // A safer way is to read the body, then create a new request with that body for BetterAuth.

    let body: any = {};
    const clone = req.clone();
    try {
        body = await clone.json();
    } catch (e) {
        // Body might be empty or not JSON
    }

    const response = await originalPOST(req);

    // Check if this is a sign-in email request and successful
    // Check if this is a sign-in email request
    const url = new URL(req.url);
    const isSignIn = url.pathname.endsWith('/sign-in/email');

    if (isSignIn && body?.email) {
        try {
            if (response.status === 200) {
                // Success: Reset failed attempts
                await prisma.user.updateMany({
                    where: { email: body.email },
                    data: { failedLoginAttempts: 0 }
                });
                // console.log(`[Auth] Reset failed attempts for ${body.email}`);
            } else {
                // Failure: Increment failed attempts
                const user = await prisma.user.findUnique({
                    where: { email: body.email },
                    select: { id: true, failedLoginAttempts: true }
                });

                if (user) {
                    const newAttempts = (user.failedLoginAttempts || 0) + 1;

                    let updateData: any = { failedLoginAttempts: newAttempts };
                    let shouldBan = false;

                    // Ban threshold: 10
                    if (newAttempts === 5) {
                        const { createNotification } = await import('@/actions/notification.actions');
                        const admins = await prisma.user.findMany({
                            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                            select: { id: true }
                        });
                        const notificationPromises = admins.map(admin =>
                            createNotification(
                                admin.id,
                                'Security Warning: Suspicious Activity',
                                `User ${body.email} has failed to login 5 times. Monitoring recommended.`,
                                `/admin/users?search=${encodeURIComponent(body.email)}`
                            )
                        );
                        await Promise.all(notificationPromises);
                    }

                    if (newAttempts >= 10) {
                        updateData.isBanned = true;
                        updateData.banReason = 'Excessive failed login attempts (Auto-ban)';
                        shouldBan = true;
                    }

                    await prisma.user.update({
                        where: { email: body.email },
                        data: updateData
                    });

                    if (shouldBan) {
                        const { createNotification } = await import('@/actions/notification.actions');

                        // Find all Admins/Super Admins to notify
                        const admins = await prisma.user.findMany({
                            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                            select: { id: true }
                        });

                        const notificationPromises = admins.map(admin =>
                            createNotification(
                                admin.id,
                                'Security Alert: User Banned',
                                `User ${body.email} has been auto-banned after 10 failed login attempts.`,
                                `/admin/users?search=${encodeURIComponent(body.email)}`
                            )
                        );

                        await Promise.all(notificationPromises);
                    }
                }
            }
        } catch (e) {
            console.error("[Auth] Failed to update login stats:", e);
        }
    }

    return response;
};
