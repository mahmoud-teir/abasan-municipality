'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteService } from '@/actions/service.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteServiceButtonProps {
    id: string;
    name: string;
}

export function DeleteServiceButton({ id, name }: DeleteServiceButtonProps) {
    const t = useTranslations('admin.services');
    const tCommon = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onDelete() {
        setLoading(true);
        const result = await deleteService(id);
        setLoading(false);

        if (result.success) {
            setOpen(false);
            router.refresh();
            toast.success(tCommon('success'));
        } else {
            toast.error(tCommon('error'));
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteConfirm', { name })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600 focus:ring-red-500">
                        {loading ? tCommon('loading') : tCommon('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
