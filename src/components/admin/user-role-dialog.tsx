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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateUserRole } from '@/actions/user.actions';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';

type Props = {
    userId: string;
    currentRole: string;
    userName: string;
    currentUserRole: string;
};

import { useTranslations } from 'next-intl';

export function UserRoleDialog({ userId, currentRole, userName, currentUserRole }: Props) {
    const t = useTranslations('admin.usersPage');
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);
        try {
            const result = await updateUserRole(userId, role);
            if (result.success) {
                toast.success(t('roleDialog.success'));
                setOpen(false);
            } else {
                toast.error(result.error || t('roleDialog.error'));
            }
        } catch (error) {
            toast.error(t('roleDialog.error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" disabled={!isSuperAdmin}>
                    <Shield className="w-4 h-4" />
                    {currentRole}
                </Button>
            </DialogTrigger>
            {isSuperAdmin ? (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('roleDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('roleDialog.description')} <span className="font-medium text-foreground">{userName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CITIZEN">{t('table.roles.CITIZEN')}</SelectItem>
                                <SelectItem value="EMPLOYEE">{t('table.roles.EMPLOYEE')}</SelectItem>
                                <SelectItem value="ENGINEER">{t('table.roles.ENGINEER')}</SelectItem>
                                <SelectItem value="ACCOUNTANT">{t('table.roles.ACCOUNTANT')}</SelectItem>
                                <SelectItem value="PR_MANAGER">{t('table.roles.PR_MANAGER')}</SelectItem>
                                <SelectItem value="ADMIN">{t('table.roles.ADMIN')}</SelectItem>
                                <SelectItem value="SUPER_ADMIN">{t('table.roles.SUPER_ADMIN')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t('roleDialog.cancel')}
                        </Button>
                        <Button onClick={handleSave} disabled={loading || role === currentRole}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('roleDialog.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            ) : null}
        </Dialog>
    );
}
