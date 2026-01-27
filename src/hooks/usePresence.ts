import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function usePresence(userId: string | undefined) {
    const heartbeat = useMutation(api.presence.heartbeat);

    useEffect(() => {
        if (!userId) return;

        // Send initial heartbeat
        heartbeat({ userId });

        // Send heartbeat every 30 seconds
        const interval = setInterval(() => {
            heartbeat({ userId });
        }, 30000);

        return () => clearInterval(interval);
    }, [userId, heartbeat]);
}
