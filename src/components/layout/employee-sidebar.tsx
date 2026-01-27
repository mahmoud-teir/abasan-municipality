'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    Archive,
    LogOut,
    Menu,
    CheckCircle2,
    Settings,
    Calendar,
    Globe
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth/auth-client';
import { signOut } from '@/lib/auth/auth-client';

const sidebarItems = [
    { icon: Globe, label: 'nav.website', href: '/' },
    { icon: LayoutDashboard, label: 'employee.dashboard', href: '/employee' },
    { icon: FileText, label: 'employee.requests', href: '/employee/requests' },
    { icon: MessageSquare, label: 'employee.complaints', href: '/employee/complaints' },
    { icon: Calendar, label: 'employee.appointments', href: '/employee/appointments' },
    { icon: Archive, label: 'employee.archive', href: '/employee/archive' },
    { icon: Settings, label: 'common.settings', href: '/employee/settings' },
];

export function EmployeeSidebar() {
    const pathname = usePathname();
    const t = useTranslations();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { data: session } = authClient.useSession();
    const userRole = (session?.user as any)?.role;

    const filteredItems = sidebarItems.filter(item => {
        // Common items for all employees
        if (item.href === '/employee' || item.href === '/employee/settings') return true;

        // Specific role permissions
        switch (userRole) {
            case 'ENGINEER':
                return item.href === '/employee/requests'; // Only requests for Engineer
            case 'ACCOUNTANT':
                // TODO: Add Payment handling page for Accountant
                // For now, let's assume they might see requests too or we need a new page
                // Let's hide requests/complaints for accountant if they are not relevant
                // But wait, the plan said: "Accountant: Sees Payments"
                // I don't have a payments page yet for employee.
                // For now, let's give them access to dashboard and settings only until payments page exists
                return false;
            case 'PR_MANAGER':
                return item.href === '/employee/complaints'; // News is in Admin, Complaints here
            case 'EMPLOYEE':
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return true; // Default employee/admin sees all
            default:
                return true; // Fallback
        }
    });

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
        <div className="flex flex-col h-full bg-slate-50 border-e border-slate-200">
            <div className="p-6 border-b border-slate-200 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-bold text-lg text-slate-800">{t('employee.title')}</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {filteredItems.map((item) => {
                    // Exact match for root, startsWith for sub-pages
                    const isActive = item.href === '/employee'
                        ? pathname === '/employee' || pathname === '/en/employee' || pathname === '/ar/employee'
                        : pathname?.includes(item.href);

                    return (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-4 text-base font-normal text-slate-600 hover:bg-slate-200 hover:text-slate-900',
                                isActive && 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
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

            <div className="p-4 border-t border-slate-200">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-slate-500 hover:text-red-600 hover:bg-red-50"
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
                    <SheetTitle className="sr-only">Employee Navigation Menu</SheetTitle>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
