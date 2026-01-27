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
import { useState } from 'react';
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
        <div className="flex flex-col h-full bg-card border-e">
            <div className="p-6 border-b flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-lg">{t('metadata.title')}</span>
            </div>

            {/* Verification Status Card */}
            {session && (
                <div className={cn(
                    "mx-4 mt-4 p-3 rounded-lg border flex items-center gap-3",
                    isVerified ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                )}>
                    {isVerified ? (
                        <div className="bg-green-100 p-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                    ) : (
                        <div className="bg-amber-100 p-1.5 rounded-full">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-medium", isVerified ? "text-green-700" : "text-amber-700")}>
                            {isVerified ? 'Verified Citizen' : 'Unverified'}
                        </span>
                        {!isVerified && (
                            <span className="text-xs text-amber-600">Action required</span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 py-4 px-4 space-y-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start gap-4 text-base font-normal',
                                isActive && 'bg-primary/10 text-primary hover:bg-primary/20',
                                item.href === '/citizen/verification' && !isVerified && "animate-pulse text-amber-600 font-medium"
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

            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <aside className="max-md:hidden flex w-72 flex-col fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-4 start-4 z-50">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
