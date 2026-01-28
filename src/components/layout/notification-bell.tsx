'use client';

import { Bell } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSession } from '@/lib/auth/auth-client';
import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { playNotificationSound } from '@/lib/sounds';

export function NotificationBell() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const prevUnreadCountRef = useRef<number>(0);

    // Convex hooks
    const notifications = useQuery(api.notifications.list, session?.user?.id ? { userId: session.user.id } : "skip");
    const unreadCount = useQuery(api.notifications.unreadCount, session?.user?.id ? { userId: session.user.id } : "skip");
    const markRead = useMutation(api.notifications.markRead);
    const markAllRead = useMutation(api.notifications.markAllRead);

    // Play sound on new unread notification
    useEffect(() => {
        if (unreadCount !== undefined) {
            // If count increased and it's not the very first load (or if it is, maybe we don't want to beep immediately on page refresh)
            // Let's safe guard: if prev was 0 and now is > 0, it might be initial load.
            // But usually initial load starts undefined -> number. 
            // If we want to avoid initial beep, we can check if prevUnreadCountRef.current is not null?
            // Simple approach: if unreadCount > prevUnreadCountRef.current, play sound.
            if (unreadCount > prevUnreadCountRef.current) {
                playNotificationSound();
            }
            prevUnreadCountRef.current = unreadCount;
        }
    }, [unreadCount]);

    const handleRead = async (notification: any) => {
        if (!notification.read) {
            await markRead({ id: notification._id });
        }
        setOpen(false);
    };

    const handleMarkAllRead = async () => {
        if (!session?.user?.id) return;
        await markAllRead({ userId: session.user.id });
    };

    if (!session) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger aria-haspopup="dialog" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {(unreadCount || 0) > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-950" />
                )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {(unreadCount || 0) > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications === undefined ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No notifications
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification: any) => (
                                <Link
                                    key={notification._id}
                                    href={notification.link || '#'}
                                    onClick={() => handleRead(notification)}
                                    className={`block p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                        <div className="space-y-1">
                                            <p className={`text-sm ${!notification.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
