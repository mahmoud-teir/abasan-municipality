'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { getEmployeesList, assignRequest } from '@/actions/request.actions';

type Employee = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type Props = {
    requestId: string;
    currentUserId: string;
    onAssigned?: () => void;
};

export function AssignRequestDialog({ requestId, currentUserId, onAssigned }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        if (open) {
            setLoadingEmployees(true);
            getEmployeesList().then((res) => {
                if (res.success) {
                    setEmployees(res.data as Employee[]);
                }
                setLoadingEmployees(false);
            });
        }
    }, [open]);

    const handleAssign = async () => {
        if (!selectedEmployeeId) {
            toast.error(t('requests.assignment.selectEmployee'));
            return;
        }

        setLoading(true);
        try {
            const result = await assignRequest(requestId, selectedEmployeeId, currentUserId, reason || undefined);
            if (result.success) {
                toast.success(t('requests.assignment.assignSuccess'));
                setOpen(false);
                setSelectedEmployeeId('');
                setReason('');
                router.refresh();
                onAssigned?.();
            } else {
                toast.error(result.error || t('common.error'));
            }
        } catch {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                    <UserPlus className="w-4 h-4" />
                    {t('requests.assignment.assignTo')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('requests.assignment.assignTo')}</DialogTitle>
                    <DialogDescription>
                        {t('requests.assignment.assignDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('requests.assignment.employee')}</Label>
                        {loadingEmployees ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('requests.assignment.selectEmployee')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            <div className="flex flex-col">
                                                <span>{emp.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {t(`admin.usersPage.table.roles.${emp.role}`)} — {emp.email}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('requests.assignment.reason')} ({t('requests.assignment.optional')})</Label>
                        <Textarea
                            placeholder={t('requests.assignment.reasonPlaceholder')}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedEmployeeId}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {t('requests.assignment.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
