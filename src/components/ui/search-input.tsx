'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce'; // We might need to install this or implement custom debounce

interface SearchInputProps {
    placeholder?: string;
    className?: string;
}

export function SearchInput({ placeholder, className }: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get('search') || '');

    // Custom debounce logic if package not available, but let's assume simple timeout for now
    // Or better, let's install use-debounce if needed, but I'll implement a simple one here to avoid extra deps if possible
    // actually use-debounce is great. Let's check if we can live without it for a sec.
    // I'll implementation a simple useEffect debounce.

    useEffect(() => {
        setValue(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value === (searchParams.get('search') || '')) return;

            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }

            startTransition(() => {
                router.replace(`?${params.toString()}`);
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [value, router, searchParams]);

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-9" // Adjust padding based on RTL/LTR but generally icon is at start
            />
            {isPending && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}
        </div>
    );
}
