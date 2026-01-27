'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('nav');

    const switchLanguage = (newLocale: string) => {
        // Handle path replacement more robustly
        let path = pathname;
        if (path.startsWith(`/${locale}`)) {
            path = path.replace(`/${locale}`, `/${newLocale}`);
        } else {
            // If current locale is missing (root), prepend new locale
            path = `/${newLocale}${path}`;
        }
        router.push(path);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent/10 text-foreground w-10 h-10 rounded-full">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuItem
                    onClick={() => switchLanguage('ar')}
                    className={cn("cursor-pointer py-3 px-4 rounded-md my-1 focus:bg-accent/50", locale === 'ar' ? 'bg-accent font-medium' : '')}
                >
                    <span className="flex items-center gap-3 text-base w-full">
                        <span className="text-xl">🇵🇸</span>
                        <span>العربية</span>
                    </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => switchLanguage('en')}
                    className={cn("cursor-pointer py-3 px-4 rounded-md my-1 focus:bg-accent/50", locale === 'en' ? 'bg-accent font-medium' : '')}
                >
                    <span className="flex items-center gap-3 text-base w-full">
                        <span className="text-xl">🇺🇸</span>
                        <span>English</span>
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
