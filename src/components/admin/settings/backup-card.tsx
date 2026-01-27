
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, Loader2 } from 'lucide-react';
import { generateBackup } from '@/actions/backup.actions';
import { toast } from 'sonner';

export function BackupCard() {
    const t = useTranslations('admin.settingsPage.backup');
    const [isLoading, setIsLoading] = useState(false);

    const handleBackup = async () => {
        setIsLoading(true);
        try {
            const result = await generateBackup();

            if (result.success && result.data) {
                // Create blob and download
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `abasan-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success(t('success'));
            } else {
                toast.error('Failed to generate backup');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleBackup}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 me-2 animate-spin" />
                            {t('downloading')}
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 me-2" />
                            {t('download')}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
