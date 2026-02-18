import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/db/prisma';
import { banPlugin } from './plugins/ban-plugin';
import { sendResetPasswordEmail } from '@/lib/email';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
        sendResetPassword: async ({ user, url }) => {
            await sendResetPasswordEmail({
                email: user.email,
                url,
            });
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        // cookieCache disabled — we update emailVerified via Prisma directly
        // (bypassing Better Auth), so the cookie cache would serve stale data.
        // cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'CITIZEN',
                required: false,
            },
            phone: {
                type: 'string',
                required: false,
            },
            nationalId: {
                type: 'string',
                required: false,
            },
            address: {
                type: 'string',
                required: false,
            },
        },
    },
    databaseHooks: {
        session: {
            create: {
                after: async (session) => {
                    try {
                        // Get user info for logging
                        const user = await prisma.user.findUnique({
                            where: { id: session.userId },
                            select: { name: true, email: true },
                        });
                        await prisma.auditLog.create({
                            data: {
                                action: 'LOGIN',
                                details: `User ${user?.name || user?.email || session.userId} signed in`,
                                actorId: session.userId,
                                ipAddress: session.ipAddress || 'unknown',
                            },
                        });
                    } catch (error) {
                        console.error('[AuditLog] Failed to log sign-in:', error);
                    }
                },
            },
        },
    },
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL ? (
            (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
                .replace(/\/(en|ar)\/?$/, '')
        ) : 'http://localhost:3000',
        'https://abasan-municipality.vercel.app'
    ],
    plugins: [banPlugin]
});

export type Session = typeof auth.$Infer.Session;
