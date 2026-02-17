'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    MessageSquare,
    MessageCircle,
    Newspaper,
    ShieldCheck,
    History,
    Layers,
    Briefcase,
    Globe,
    Calendar,
    Bell,
    Image,
    Siren
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { signOut, useSession } from '@/lib/auth/auth-client';

const sidebarItems = [
    { icon: Globe, label: 'nav.website', href: '/' },
    { icon: LayoutDashboard, label: 'admin.dashboard', href: '/admin' },
    { icon: Users, label: 'admin.users', href: '/admin/users' },
    { icon: Newspaper, label: 'admin.news', href: '/admin/news' },
    { icon: Siren, label: "admin.alerts", href: "/admin/alerts" },
    { icon: FileText, label: 'admin.requests', href: '/admin/requests' },
    { icon: MessageSquare, label: 'admin.complaints', href: '/admin/complaints' },
    { icon: MessageCircle, label: 'admin.messages', href: '/admin/messages' },
    { icon: Calendar, label: 'admin.appointments', href: '/admin/appointments' },
    { icon: Briefcase, label: 'admin.projects', href: '/admin/projects' },
    { icon: Users, label: 'admin.careers', href: '/admin/careers' },
    { icon: Layers, label: 'admin.servicesMenu', href: '/admin/services' },
    { icon: Bell, label: 'admin.notifications.title', href: '/admin/notifications' },
    { icon: History, label: 'admin.logs', href: '/admin/logs' },
    { icon: Image, label: 'admin.media.title', href: '/admin/media' },
    { icon: Settings, label: 'admin.settings', href: '/admin/settings' },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const t = useTranslations();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/login');
                },
            },
        });
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-e border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-bold text-lg">{t('admin.title')}</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-custom [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700/30 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent">
                {sidebarItems.map((item) => {
                    const isProtected = item.label === 'admin.logs' || item.label === 'admin.servicesMenu';

                    if (isProtected) {
                        // Match server state (hidden) until mounted
                        if (!mounted) return null;

                        if (item.label === 'admin.logs' &&
                            userRole !== 'SUPER_ADMIN' &&
                            userRole !== 'ADMIN') {
                            return null;
                        }

                        if (item.label === 'admin.servicesMenu' && userRole !== 'SUPER_ADMIN') {
                            return null;
                        }
                    }

                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-4 text-base font-normal hover:bg-slate-800 hover:text-white',
                                isActive && 'bg-red-600 text-white hover:bg-red-700'
                            )}
                            asChild
                            onClick={() => setOpen(false)}
                        >
                            <Link href={item.href}>
                                <item.icon className="w-5 h-5" />
                                {t(item.label)}
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    {t('nav.logout')}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mobile-trigger md:hidden fixed top-4 start-4 z-50 bg-background/80 backdrop-blur-sm border shadow-sm">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-slate-800 md:hidden">
                    <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
