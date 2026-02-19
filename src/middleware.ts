import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed',
    localeDetection: false
});

export default async function middleware(request: NextRequest) {
    // 1. Run i18n middleware first
    const response = intlMiddleware(request);

    // Set x-pathname header so server components (like layout.tsx) can detect the current route
    response.headers.set('x-pathname', request.nextUrl.pathname);

    // 2. Check for protected routes
    const { pathname } = request.nextUrl;

    // Normalize path to remove locale if present for checking
    const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, '');

    // Define protected paths
    const isProtectedRoute =
        pathnameWithoutLocale.startsWith('/citizen') ||
        pathnameWithoutLocale.startsWith('/employee') ||
        pathnameWithoutLocale.startsWith('/admin');

    if (isProtectedRoute) {
        // Check for session token (better-auth default)
        // Note: In production you might have secure prefix
        const sessionToken = request.cookies.get('better-auth.session_token') ||
            request.cookies.get('__Secure-better-auth.session_token');

        if (!sessionToken) {
            // Redirect to login
            const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
            const loginUrl = new URL(`/${locale}/login`, request.url);
            // Append return url
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 3. Check for auth routes (login/register) while logged in
    const isAuthRoute =
        pathnameWithoutLocale === '/login' ||
        pathnameWithoutLocale === '/register' ||
        pathnameWithoutLocale === '/forgot-password'; // Optional: add others if needed

    if (isAuthRoute) {
        const sessionToken = request.cookies.get('better-auth.session_token') ||
            request.cookies.get('__Secure-better-auth.session_token');

        if (sessionToken) {
            // Redirect to home if already logged in
            const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
            return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
