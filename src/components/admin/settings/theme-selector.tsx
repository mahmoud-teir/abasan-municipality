'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { Check, Loader2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateSystemSetting } from '@/actions/settings.actions';
import { toast } from 'sonner';

interface ThemeSelectorProps {
    currentTheme: string;
}

const THEMES = [
    { id: 'default', name: 'Alkabera Blue (Default)', color: '#3b82f6', class: '' },
    { id: 'green', name: 'Abasan Green', color: '#16a34a', class: 'theme-green' },
    { id: 'red', name: 'Crimson Red', color: '#dc2626', class: 'theme-red' },
    { id: 'violet', name: 'Royal Violet', color: '#7c3aed', class: 'theme-violet' },
    { id: 'orange', name: 'Sunset Orange', color: '#ea580c', class: 'theme-orange' },
];

export function ThemeSelector({ currentTheme }: ThemeSelectorProps) {
    const [selected, setSelected] = useState(currentTheme || 'default');
    console.log('Current Props Theme in Selector:', currentTheme);
    const [pending, startTransition] = useTransition();

    const onSelect = (themeId: string) => {
        if (themeId === selected) return;

        setSelected(themeId);
        startTransition(async () => {
            try {
                // If default, we save an empty string or 'default'. 
                // layout.tsx checks strict equality for 'green', 'red', etc.
                // If it's default, we might want to save '' or 'default'.
                // layout.tsx logic: const themeClass = theme === 'green' ? 'theme-green' : '';
                // We need to update layout.tsx to handle other themes.

                const result = await updateSystemSetting('theme', themeId);
                if (result.success) {
                    toast.success(`Theme updated to ${THEMES.find(t => t.id === themeId)?.name}`);
                    window.location.reload();
                } else {
                    toast.error('Failed to update theme');
                    setSelected(selected); // Revert
                }
            } catch (error) {
                toast.error('An error occurred');
                setSelected(selected); // Revert
            }
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">System Theme</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {THEMES.map((theme) => (
                    <div
                        key={theme.id}
                        onClick={() => !pending && onSelect(theme.id)}
                        className={cn(
                            "cursor-pointer group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 hover:bg-accent transition-all",
                            selected === theme.id ? "border-primary bg-accent" : "border-transparent bg-card shadow-sm hover:border-muted-foreground/30",
                            pending && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div
                            className="h-12 w-12 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: theme.color }}
                        >
                            {selected === theme.id && (
                                <Check className="h-6 w-6 text-white" />
                            )}
                            {pending && selected === theme.id && (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-center">{theme.name}</span>
                    </div>
                ))}
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
                Select the primary color theme for the administration panel and public website.
            </p>
        </div>
    );
}
