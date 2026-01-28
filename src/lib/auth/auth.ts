import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '@/lib/db/prisma';
import { banPlugin } from './plugins/ban-plugin';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
        sendResetPassword: async ({ user, url }) => {
            console.log('----------------------------------------');
            console.log(`Reset Password Link for ${user.email}:`);
            console.log(url);
            console.log('----------------------------------------');
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
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
        },
    },
    logger: {
        level: "debug",
    },
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL ? (
            (process.env.NEXT_PUBLIC_APP_URL.startsWith('http') ? process.env.NEXT_PUBLIC_APP_URL : `https://${process.env.NEXT_PUBLIC_APP_URL}`)
                .replace(/\/(en|ar)\/?$/, '')
        ) : 'http://localhost:3000',
    ],
    plugins: [banPlugin]
});

export type Session = typeof auth.$Infer.Session;
