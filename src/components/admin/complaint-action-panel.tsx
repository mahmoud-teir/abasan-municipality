'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateComplaintStatus } from '@/actions/complaint.actions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    Clock,
    MapPin,
    Calendar,
    MessageSquare,
    User,
    AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    complaint: any;
};

export default function ComplaintActionPanel({ complaint }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') => {
        setLoading(true);
        try {
            // In a real app we pass current user ID as responder
            const result = await updateComplaintStatus(complaint.id, status, response, 'system');
            if (result.success) {
                toast.success('تم تحديث حالة الشكوى');
                router.refresh();
            } else {
                toast.error(result.error || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        OPEN: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-amber-100 text-amber-800',
        RESOLVED: 'bg-green-100 text-green-800',
        CLOSED: 'bg-slate-100 text-slate-800',
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <CardTitle>{complaint.title}</CardTitle>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span className="font-mono">{complaint.complaintNo || complaint.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={(statusColors as any)[complaint.status]}>
                                    {complaint.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">التصنيف</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        {complaint.category}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">التاريخ</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">مقدم الشكوى</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {complaint.user.name}
                                        <span className="text-xs text-muted-foreground">({complaint.user.phone})</span>
                                    </p>
                                </div>
                                {complaint.location && (
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">الموقع</Label>
                                        <p className="font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {complaint.location}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label className="text-muted-foreground">تفاصيل المشكلة</Label>
                                <p className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                    {complaint.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>الإجراءات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>الرد / الملاحظات (اختياري)</Label>
                                <Textarea
                                    placeholder="أضف رداً للمواطن..."
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                {complaint.status === 'OPEN' && (
                                    <Button
                                        className="w-full bg-amber-500 hover:bg-amber-600"
                                        onClick={() => handleAction('IN_PROGRESS')}
                                        disabled={loading}
                                    >
                                        <Clock className="w-4 h-4 me-2" />
                                        بدء المعالجة
                                    </Button>
                                )}

                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700 w-full"
                                    onClick={() => handleAction('RESOLVED')}
                                    disabled={loading || complaint.status === 'RESOLVED'}
                                >
                                    <CheckCircle2 className="w-4 h-4 me-2" />
                                    تم الحل
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleAction('CLOSED')}
                                    disabled={loading || complaint.status === 'CLOSED'}
                                >
                                    إغلاق الشكوى
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
