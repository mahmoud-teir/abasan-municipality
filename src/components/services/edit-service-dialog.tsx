'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { updateService } from '@/actions/service.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditServiceDialogProps {
    service: {
        id: string;
        slug: string;
        nameAr: string;
        nameEn: string;
        active: boolean;
    };
}

export function EditServiceDialog({ service }: EditServiceDialogProps) {
    const t = useTranslations('admin.services');
    const tCommon = useTranslations('common');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(service.active);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        // Manually handle checkbox state for FormData
        if (active) {
            formData.set('active', 'on');
        } else {
            formData.delete('active');
        }

        const result = await updateService(service.id, formData);
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
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('editTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('editDescription')}
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
                                defaultValue={service.slug}
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
                                defaultValue={service.nameAr}
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
                                defaultValue={service.nameEn}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="active" className="text-right">
                                Active
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch
                                    id="active"
                                    checked={active}
                                    onCheckedChange={setActive}
                                />
                            </div>
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
