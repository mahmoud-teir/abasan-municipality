
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { updateComplaintStatus } from '@/actions/complaint.actions';
import { Loader2, Send } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSession } from '@/lib/auth/client';

interface ComplaintResponseFormProps {
    complaintId: string;
    currentStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export function ComplaintResponseForm({ complaintId, currentStatus }: ComplaintResponseFormProps) {
    const t = useTranslations('employee.complaints');
    const [status, setStatus] = useState<string>(currentStatus);
    const [response, setResponse] = useState('');
    const [isPending, startTransition] = useTransition();
    const { data: session } = useSession();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            toast.error('User not authenticated');
            return;
        }

        startTransition(async () => {
            const result = await updateComplaintStatus(
                complaintId,
                status as any,
                response || undefined,
                session.user.id
            );

            if (result.success) {
                toast.success('تم تحديث الشكوى بنجاح');
                setResponse(''); // Clear response field
            } else {
                toast.error(result.error || 'حدث خطأ ما');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>حالة الشكوى</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="OPEN">جديدة (Open)</SelectItem>
                        <SelectItem value="IN_PROGRESS">قيد المعالجة (In Progress)</SelectItem>
                        <SelectItem value="RESOLVED">تم الحل (Resolved)</SelectItem>
                        <SelectItem value="CLOSED">مغلقة (Closed)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>نص الرد (اختياري)</Label>
                <Textarea
                    placeholder="اكتب رداً للمواطن..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                />
                <p className="text-xs text-slate-500">
                    هذا الرد سيظهر للمواطن في صفحة تفاصيل الشكوى.
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        جاري الحفظ...
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 me-2" />
                        حفظ التغييرات وإرسال الرد
                    </>
                )}
            </Button>
        </form>
    );
}
