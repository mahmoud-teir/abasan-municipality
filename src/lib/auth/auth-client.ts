import { createAuthClient } from 'better-auth/react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const secureBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
const cleanBaseUrl = secureBaseUrl.replace(/\/(en|ar)\/?$/, '');

export const authClient = createAuthClient({
    baseURL: cleanBaseUrl,
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
