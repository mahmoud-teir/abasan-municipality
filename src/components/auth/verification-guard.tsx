'use client';

import { useSession } from '@/lib/auth/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function VerificationGuard({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    useEffect(() => {
        if (isPending) return;

        // If user is not logged in, auth middleware usually handles it
        if (!session?.user) return;

        // If user is NOT verified (emailVerified is used as identity verification status)
        if (!session.user.emailVerified) {
            // Strip the locale prefix from pathname for comparison
            // e.g. "/ar/citizen/verification" → "/citizen/verification"
            const pathWithoutLocale = pathname?.replace(new RegExp(`^/${locale}`), '') || '';

            // Allow access to verification page and settings (for logout etc)
            const allowedPaths = ['/citizen/verification', '/citizen/settings'];

            const isAllowed = allowedPaths.some(path => pathWithoutLocale.startsWith(path));

            if (!isAllowed) {
                toast.error('You must verify your identity to access services.');
                router.push(`/${locale}/citizen/verification`);
            }
        }
    }, [session, isPending, pathname, router, locale]);

    return <>{children}</>;
}
