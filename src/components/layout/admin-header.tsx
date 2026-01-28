'use client';

import { NotificationBell } from '@/components/layout/notification-bell';
import { useTranslations } from 'next-intl';
// import { ThemeToggle } from '@/components/theme-toggle'; 
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { ModeToggle } from '@/components/mode-toggle';

export function AdminHeader() {
    const t = useTranslations();
    const router = useRouter();

    const { data: session } = useSession();
    const user = session?.user;

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/login');
                },
            },
        });
    };

    // Helper to get initials
    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2 md:hidden ms-10">
                    {/* Mobile Menu Trigger works via fixed button in AdminSidebar */}
                    <span className="font-bold text-lg">{t('admin.title')}</span>
                </div>

                <div className="flex items-center gap-4 ms-auto">
                    <NotificationBell />

                    {/* If ModeToggle exists, use it. If not, I'll assume we can skip or user doesn't have it. 
                        I'll try to import ModeToggle if I saw it in file list earlier or guess.
                        Actually, let's just stick to Bell and User for now.
                    */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || ''}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                                {t('admin.settings')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                {t('nav.logout')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
