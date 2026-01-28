'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes in milliseconds

export function SessionManager() {
    const { data: session } = useSession();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(async () => {
        if (!session) return;

        try {
            await signOut();
            toast.warning('Session expired due to inactivity');
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    }, [session, router]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (session) {
            timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
        }
    }, [handleLogout, session]);

    useEffect(() => {
        if (!session) return;

        // Initial start
        resetTimer();

        // Activity listeners
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        // Use a throttled or debounced handler if performance is an issue, 
        // but for simple reset, it's usually fine as long as we don't spam state updates.
        // Here we just clear/set timeout which is lightweight.
        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [session, resetTimer]);

    return null; // This component handles logic only, no UI
}
