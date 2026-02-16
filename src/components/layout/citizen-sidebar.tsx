'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    MessageSquare,
    Calendar,
    CreditCard,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    ScanFace,
    CheckCircle2,
    AlertCircle,
    Globe
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { signOut, useSession } from '@/lib/auth/auth-client';

const sidebarItems = [
    { icon: Globe, label: 'nav.website', href: '/' },
    { icon: LayoutDashboard, label: 'nav.dashboard', href: '/citizen/dashboard' },
    { icon: Building2, label: 'dashboard.myRequests', href: '/citizen/requests' },
    { icon: MessageSquare, label: 'dashboard.complaints', href: '/citizen/complaints' },
    { icon: Calendar, label: 'dashboard.appointments', href: '/citizen/appointments' },
    { icon: CreditCard, label: 'dashboard.payments', href: '/citizen/payments' },
    { icon: ScanFace, label: 'nav.verification', href: '/citizen/verification' },
    { icon: Settings, label: 'dashboard.settings', href: '/citizen/settings' },
];

export function CitizenSidebar() {
    const pathname = usePathname();
    const t = useTranslations();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
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

    const isVerified = session?.user?.emailVerified === true;

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-e border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-bold text-lg">{t('metadata.title')}</span>
            </div>

            {/* Verification Status Card */}
            {session && mounted && (
                <div className={cn(
                    "mx-4 mt-4 p-3 rounded-lg border flex items-center gap-3",
                    isVerified
                        ? "bg-green-900/10 border-green-800/50"
                        : "bg-amber-900/10 border-amber-800/50"
                )}>
                    {isVerified ? (
                        <div className="bg-green-900/30 p-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                    ) : (
                        <div className="bg-amber-900/30 p-1.5 rounded-full">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-medium", isVerified ? "text-green-400" : "text-amber-400")}>
                            {isVerified ? t('nav.verifiedCitizen') : t('nav.unverified')}
                        </span>
                        {!isVerified && (
                            <span className="text-xs text-amber-500/80">{t('nav.actionRequired')}</span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-custom [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700/30 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-track]:bg-transparent">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'));
                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-4 text-base font-normal hover:bg-slate-800 hover:text-white',
                                isActive && 'bg-red-600 text-white hover:bg-red-700',
                                item.href === '/citizen/verification' && !isVerified && !isActive && "text-amber-500 hover:text-amber-400"
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
        </div >
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
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
