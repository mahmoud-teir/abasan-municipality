'use client';

import { useSession, signOut } from '@/lib/auth/auth-client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
    const t = useTranslations();
    const { data: session } = useSession();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(async () => {
        if (!session) return;

        try {
            await signOut();
            await signOut();
            toast.info(t('auth.autoLogout.title'), {
                description: t('auth.autoLogout.description'),
            });
            router.push('/login');
        } catch (error) {
            console.error('Auto logout failed:', error);
        }
    }, [session, router]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (session) {
            timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
        }
    }, [session, handleLogout]);

    useEffect(() => {
        if (!session) return;

        // Events to track activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        // Initial set
        resetTimer();

        // Event listener wrapper to debounce slightly if needed, but direct call is fine for reset
        const onActivity = () => {
            resetTimer();
        };

        events.forEach((event) => {
            window.addEventListener(event, onActivity);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach((event) => {
                window.removeEventListener(event, onActivity);
            });
        };
    }, [session, resetTimer]);

    return <>{children}</>;
}
