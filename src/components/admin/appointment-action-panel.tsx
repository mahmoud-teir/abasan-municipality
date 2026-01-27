'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateAppointmentStatus } from '@/actions/appointment.actions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    User,
    Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    appointment: any;
};

export default function AppointmentActionPanel({ appointment }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => {
        setLoading(true);
        try {
            const result = await updateAppointmentStatus(appointment.id, status);
            if (result.success) {
                toast.success('تم تحديث حالة الموعد');
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
        SCHEDULED: 'bg-blue-100 text-blue-800',
        CONFIRMED: 'bg-green-100 text-green-800',
        COMPLETED: 'bg-slate-100 text-slate-800',
        CANCELLED: 'bg-red-100 text-red-800',
        NO_SHOW: 'bg-orange-100 text-orange-800',
    };

    const serviceMap: any = {
        BUILDING_PERMIT: 'مراجعة رخصة بناء',
        COMPLAINT_FOLLOWUP: 'متابعة شكوى',
        MAYOR_MEETING: 'لقاء رئيس البلدية',
        ENGINEERING: 'الدائرة الهندسية',
        FINANCE: 'الدائرة المالية',
        OTHER: 'أخرى'
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
                                    <CardTitle>{serviceMap[appointment.serviceType] || appointment.serviceType}</CardTitle>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {appointment.user.name}
                                    </div>
                                </div>
                                <Badge variant="outline" className={(statusColors as any)[appointment.status]}>
                                    {appointment.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">التاريخ</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(appointment.date), 'EEEE dd MMMM yyyy')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">الوقت</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {appointment.timeSlot}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">رقم الهاتف</Label>
                                    <p className="font-medium">
                                        {appointment.user.phone || 'غير متوفر'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                                    <p className="font-medium">
                                        {appointment.user.email}
                                    </p>
                                </div>
                            </div>

                            {appointment.notes && (
                                <div className="space-y-2 pt-4 border-t">
                                    <Label className="text-muted-foreground">ملاحظات المواطن</Label>
                                    <p className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                        {appointment.notes}
                                    </p>
                                </div>
                            )}
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
                            <div className="flex flex-col gap-2">
                                {appointment.status === 'SCHEDULED' && (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction('CONFIRMED')}
                                        disabled={loading}
                                    >
                                        <CheckCircle2 className="w-4 h-4 me-2" />
                                        تأكيد الموعد
                                    </Button>
                                )}

                                {appointment.status === 'CONFIRMED' && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleAction('COMPLETED')}
                                        disabled={loading}
                                    >
                                        تحديد كمكتمل
                                    </Button>
                                )}

                                {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={() => handleAction('CANCELLED')}
                                        disabled={loading}
                                    >
                                        <XCircle className="w-4 h-4 me-2" />
                                        إلغاء الموعد
                                    </Button>
                                )}
                                {(appointment.status === 'CONFIRMED') && (
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => handleAction('NO_SHOW')}
                                        disabled={loading}
                                    >
                                        عدم حضور
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
