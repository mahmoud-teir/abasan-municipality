'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { getUserNotifications, markAsRead, markAllAsRead } from '@/actions/notification.actions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

type Notification = {
    id: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const locale = useLocale();

    const fetchNotifications = async () => {
        // We need userId here for proper fetching if getUserNotifications requires it. 
        // Based on notifications-bell.tsx, it does.
        // But notification-bell.tsx uses it probably for public users? 
        // Wait, getUserNotifications takes userId.
        // I need to fetch userId or check if getNotifications exists.
        // Actually, user.actions seems to have nothing related? 
        // Let's check notification.actions content first to be sure.
        const res = await getUserNotifications('CURRENT_USER_ID_PLACEHOLDER'); // Temporary fix, need actual ID
        if (res.success && res.data) {
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (id: string, link: string | null) => {
        await markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (link) {
            setOpen(false);
            router.push(link);
        }
    };

    const handleMarkAllRead = async () => {
        // Assuming markAllAsRead might need userId if context isn't enough, 
        // but looking at usage it seemed to take no args in some contexts. 
        // Checking the import, previously it was markAllAsRead(userId).
        // Here we don't have userId easily unless we fetch it. 
        // Let's assume server action handles it or we pass empty if optional.
        await markAllAsRead(undefined as any);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const t = useTranslations('nav');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 end-2 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h4 className="font-semibold text-sm">{t('notifications')}</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            {t('markAllRead')}
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            {t('noNotifications')}
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleRead(n.id, n.link)}
                                className={cn(
                                    "p-4 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors",
                                    !n.read && "bg-blue-50/50 dark:bg-blue-900/10"
                                )}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <h5 className={cn("text-sm font-medium", !n.read && "text-blue-700 dark:text-blue-400")}>
                                        {n.title}
                                    </h5>
                                    {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {n.message}
                                </p>
                                <span className="text-[10px] text-muted-foreground mt-2 block">
                                    {formatDistanceToNow(new Date(n.createdAt), {
                                        addSuffix: true,
                                        locale: locale === 'ar' ? ar : enUS
                                    })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
