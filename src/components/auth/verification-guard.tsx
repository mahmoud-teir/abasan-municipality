'use client';

import { useSession } from '@/lib/auth/auth-client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function VerificationGuard({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isPending) return;

        // If user is not logged in, auth middleware usually handles it, but just in case
        if (!session?.user) return;

        // If user is NOT verified
        if (!session.user.emailVerified) {
            // Allow access to verification page and settings (for logout etc)
            // Also allow dashboard if we want them to see the sidebar status, 
            // BUT user said "Redirect him to verification".
            // Let's allow '/citizen/verification' and '/citizen/settings'.
            const allowedPaths = ['/citizen/verification', '/citizen/settings'];

            // Check if current path is allowed
            const isAllowed = allowedPaths.some(path => pathname?.startsWith(path));

            if (!isAllowed) {
                toast.error('You must verify your identity to access services.');
                router.push('/citizen/verification');
            }
        }
    }, [session, isPending, pathname, router]);

    return <>{children}</>;
}
