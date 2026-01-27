'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createService } from '@/actions/service.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function AddServiceDialog() {
    const t = useTranslations('admin.services'); // Make sure to add translations for this
    const tCommon = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const result = await createService(formData);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 me-2" />
                    {t('add')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('add')}</DialogTitle>
                        <DialogDescription>
                            {t('description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slug" className="text-right">
                                Slug
                            </Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="BUILDING_PERMIT"
                                className="col-span-3 font-mono uppercase"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nameAr" className="text-right">
                                Name (Ar)
                            </Label>
                            <Input
                                id="nameAr"
                                name="nameAr"
                                placeholder="رخصة بناء"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nameEn" className="text-right">
                                Name (En)
                            </Label>
                            <Input
                                id="nameEn"
                                name="nameEn"
                                placeholder="Building Permit"
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? tCommon('loading') : tCommon('save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
