'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, User, Home, Info, Layers, Newspaper, Phone, UserPlus, LogIn, Search, Building2, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import styles from './header.module.css';
import { UserNav } from '@/components/layout/user-nav';
import { NotificationBell } from '@/components/layout/notification-bell';
import { useSession } from '@/lib/auth/auth-client';

import { getDashboardLink } from '@/lib/role-utils';

export function Header() {
    const t = useTranslations('nav');
    const tMetadata = useTranslations('metadata');
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Helper to check active link
    const isActive = (path: string) => pathname.includes(path);

    const links = [
        { href: '/', label: t('home'), icon: Home },
        { href: '/about', label: t('about'), icon: Info },
        { href: '/services', label: t('services'), icon: Layers },
        { href: '/projects', label: t('projects'), icon: Building2 }, // Need to import Building2 or similar
        { href: '/careers', label: t('careers'), icon: Briefcase },
        { href: '/track', label: t('track'), icon: Search },
        { href: '/news', label: t('news'), icon: Newspaper },
        { href: '/contact', label: t('contact'), icon: Phone },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container relative flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary tracking-tight hover:scale-105 transition-transform">
                    <span>{tMetadata('title')}</span>
                </Link>

                {/* Desktop Nav - Centered */}
                <nav className={`${styles.desktopNav} items-center gap-1 bg-secondary/30 backdrop-blur-md px-2 py-1.5 rounded-full border border-border/40 shadow-sm mx-auto`}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                                isActive(link.href) && link.href !== '/'
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : (link.href === '/' && pathname === '/ar')
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "hover:bg-background/80 hover:text-primary text-foreground/80"
                            )}
                        >
                            <span className="relative z-10">{link.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Actions */}

                <div className={`${styles.desktopOnly} items-center gap-3`}>
                    <LanguageSwitcher />
                    <div className="h-6 w-px bg-border/60 mx-1"></div>

                    {mounted ? (
                        session ? (
                            <div className="flex items-center gap-3">
                                <NotificationBell />
                                <Button asChild variant="ghost" size="sm" className="rounded-full">
                                    <Link href={getDashboardLink((session.user as any).role)}>
                                        {t('dashboard')}
                                    </Link>
                                </Button>
                                <UserNav />
                            </div>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                    <Link href="/login">
                                        {t('login')}
                                    </Link>
                                </Button>
                                <Button asChild size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                                    <Link href="/register">
                                        {t('register')}
                                    </Link>
                                </Button>
                            </>
                        )
                    ) : (
                        // Server fallback
                        <>
                            <Button asChild variant="ghost" size="sm" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                <Link href="/login">
                                    {t('login')}
                                </Link>
                            </Button>
                            <Button asChild size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                                <Link href="/register">
                                    {t('register')}
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
                {/* Actions - Mobile */}
                <div className={styles.mobileOnly}>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <div className="flex flex-col gap-6 mt-8 h-[calc(100vh-80px)] overflow-y-auto pb-8 scrollbar-custom [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
                                    <nav className="flex flex-col gap-2">
                                        {links.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                                                    isActive(link.href)
                                                        ? "bg-primary/10 text-primary border border-primary/20"
                                                        : "hover:bg-muted text-foreground/80"
                                                )}
                                            >
                                                <link.icon className="w-5 h-5" />
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border/50">
                                        {session ? (
                                            <>
                                                <div className="flex items-center gap-3 px-2 pb-4">
                                                    <div className="h-10 w-10 relative rounded-full overflow-hidden border">
                                                        <Image
                                                            src={session.user.image || '/placeholder-user.jpg'}
                                                            alt={session.user.name || 'User'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{session.user.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user.email}</span>
                                                    </div>
                                                </div>
                                                <Button asChild className="w-full justify-start h-12 rounded-xl text-base font-medium shadow-md">
                                                    <Link href={getDashboardLink((session.user as any).role)} onClick={() => setIsOpen(false)}>
                                                        <Layers className="w-5 h-5 me-2" />
                                                        {t('dashboard')}
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start h-12 rounded-xl text-base font-medium text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={async () => {
                                                        const { signOut } = await import('@/lib/auth/auth-client');
                                                        await signOut();
                                                        window.location.href = '/login';
                                                    }}
                                                >
                                                    <LogIn className="w-5 h-5 me-2 rotate-180" />
                                                    {t('logout')}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button asChild variant="outline" className="w-full justify-start h-12 rounded-xl text-base font-medium border-primary/20 hover:bg-primary/5 hover:text-primary">
                                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                                        <LogIn className="w-5 h-5 me-2" />
                                                        {t('login')}
                                                    </Link>
                                                </Button>
                                                <Button asChild className="w-full justify-start h-12 rounded-xl text-base font-medium shadow-md">
                                                    <Link href="/register" onClick={() => setIsOpen(false)}>
                                                        <UserPlus className="w-5 h-5 me-2" />
                                                        {t('register')}
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header >
    );
}
