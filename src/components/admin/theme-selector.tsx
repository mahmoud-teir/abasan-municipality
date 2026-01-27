'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateSystemSetting } from "@/actions/settings.actions";
import { startTransition } from "react";

import { useTranslations } from "next-intl";

export function ThemeSelector({ currentTheme }: { currentTheme: string | null }) {
    const t = useTranslations('admin.settingsPage.theme');
    const [isPending, startTransition] = useTransition();

    const handleThemeChange = (theme: string) => {
        startTransition(async () => {
            const result = await updateSystemSetting('theme', theme);
            if (result.success) {
                toast.success(t('success'));
                // Force a hard refresh to ensure server components re-render with new theme
                window.location.reload();
            } else {
                toast.error(t('error'));
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button
                    variant={currentTheme !== 'green' ? "default" : "outline"}
                    onClick={() => handleThemeChange('default')}
                    disabled={isPending}
                    className="w-32"
                >
                    {t('default')}
                </Button>
                <Button
                    variant={currentTheme === 'green' ? "default" : "outline"}
                    onClick={() => handleThemeChange('green')}
                    disabled={isPending}
                    className="w-32 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {t('green')}
                </Button>
            </CardContent>
        </Card>
    );
}
