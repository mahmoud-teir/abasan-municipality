import { useCallback, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useTyping(conversationId: string | undefined, userId: string | undefined) {
    const setTyping = useMutation(api.typing.setTyping);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const notifyTyping = useCallback(() => {
        if (!conversationId || !userId) return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Send typing indicator
        setTyping({ conversationId, userId });

        // Auto-expire after 3 seconds (backend has 5s expiry)
        timeoutRef.current = setTimeout(() => {
            // Typing indicator will auto-expire on backend
        }, 3000);
    }, [conversationId, userId, setTyping]);

    return { notifyTyping };
}
