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
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { getEmployeesList, transferRequest } from '@/actions/request.actions';

type Employee = {
    id: string;
    name: string;
    email: string;
    role: string;
};

type Props = {
    requestId: string;
    currentUserId: string;
    currentAssignee?: { id: string; name: string; email: string } | null;
    onTransferred?: () => void;
};

export function TransferRequestDialog({ requestId, currentUserId, currentAssignee, onTransferred }: Props) {
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
                    // Filter out the currently assigned employee
                    const filtered = (res.data as Employee[]).filter(
                        (emp) => emp.id !== currentAssignee?.id
                    );
                    setEmployees(filtered);
                }
                setLoadingEmployees(false);
            });
        }
    }, [open, currentAssignee?.id]);

    const handleTransfer = async () => {
        if (!selectedEmployeeId) {
            toast.error(t('requests.assignment.selectEmployee'));
            return;
        }
        if (!reason.trim()) {
            toast.error(t('requests.assignment.reasonRequired'));
            return;
        }

        setLoading(true);
        try {
            const result = await transferRequest(requestId, selectedEmployeeId, currentUserId, reason);
            if (result.success) {
                toast.success(t('requests.assignment.transferSuccess'));
                setOpen(false);
                setSelectedEmployeeId('');
                setReason('');
                router.refresh();
                onTransferred?.();
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
                    className="w-full gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    {t('requests.assignment.transferTo')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('requests.assignment.transferTo')}</DialogTitle>
                    <DialogDescription>
                        {t('requests.assignment.transferDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {currentAssignee && (
                        <div className="rounded-md bg-muted p-3">
                            <Label className="text-muted-foreground text-xs">{t('requests.assignment.currentAssignee')}</Label>
                            <p className="font-medium">{currentAssignee.name}</p>
                            <p className="text-xs text-muted-foreground">{currentAssignee.email}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>{t('requests.assignment.newEmployee')}</Label>
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
                        <Label>{t('requests.assignment.reason')} *</Label>
                        <Textarea
                            placeholder={t('requests.assignment.transferReasonPlaceholder')}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={loading || !selectedEmployeeId || !reason.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {t('requests.assignment.confirmTransfer')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
