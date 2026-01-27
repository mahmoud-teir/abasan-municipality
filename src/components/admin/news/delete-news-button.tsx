'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteNews } from '@/actions/news.actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DeleteNewsButtonProps {
    id: string;
}

export function DeleteNewsButton({ id }: DeleteNewsButtonProps) {
    const t = useTranslations('admin.newsPage');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteNews(id);
            if (result.success) {
                toast.success(t('table.deleteSuccess') || 'News deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete news');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('table.deleteConfirmTitle') || 'Delete News'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('table.deleteConfirmDesc') || 'Are you sure you want to delete this news? This action cannot be undone.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('form.cancel') || 'Cancel'}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : (t('table.delete') || 'Delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
