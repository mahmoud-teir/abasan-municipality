'use client';

import { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createUser } from '@/actions/user.actions';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import { useTranslations } from 'next-intl';

export function CreateUserDialog() {
    const t = useTranslations('admin.createUser');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE', // Default to employee
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role: string) => {
        setFormData({ ...formData, role });
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await createUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (res.success) {
                toast.success(t('success'));
                setOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'EMPLOYEE',
                });
            } else {
                toast.error(res.error || t('error'));
            }
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all hover:scale-[1.02]">
                    <UserPlus className="w-4 h-4" />
                    {t('button')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl !fixed !top-[50%] !left-[50%] !-translate-x-1/2 !-translate-y-1/2 gap-4 sm:rounded-xl max-h-[90vh] overflow-y-auto z-[200]">
                <DialogHeader className="p-6 pb-2 bg-slate-50 dark:bg-slate-900 border-b text-start">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {t('title')}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-start">
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                                {t('name')}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="..."
                                className="h-10 bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                                {t('email')}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@municipality.ps"
                                className="h-10 bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 sm:col-span-1">
                            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1">
                                {t('password')}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="h-10 bg-slate-50/50 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label className="text-sm font-medium mb-1.5 block">{t('role')}</Label>
                            <Select value={formData.role} onValueChange={handleRoleChange}>
                                <SelectTrigger className="h-11 bg-slate-50/50 focus:bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[300]">
                                    <SelectItem value="EMPLOYEE">🔧 {t('roles.EMPLOYEE')}</SelectItem>
                                    <SelectItem value="ENGINEER">🏗️ {t('roles.ENGINEER')}</SelectItem>
                                    <SelectItem value="ACCOUNTANT">💰 {t('roles.ACCOUNTANT')}</SelectItem>
                                    <SelectItem value="PR_MANAGER">📢 {t('roles.PR_MANAGER')}</SelectItem>
                                    <SelectItem value="ADMIN">🛡️ {t('roles.ADMIN')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                {t('roleDescription')}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="h-10 px-6"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
