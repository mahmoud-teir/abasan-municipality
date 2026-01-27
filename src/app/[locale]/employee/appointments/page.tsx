import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAppointments } from '@/actions/appointment.actions';
import { format } from 'date-fns';
import { SearchInput } from '@/components/ui/search-input';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EmployeeAppointmentsPage({ searchParams }: Props) {
    const t = await getTranslations();
    const params = await searchParams;
    const statusFilter = typeof params.status === 'string' ? params.status : undefined;
    // Can add date filter logic here too

    const result = await getAppointments(statusFilter);
    const appointments = result.success ? (result.data as any[]) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-slate-100 text-slate-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getServiceLabel = (type: string) => {
        const map: any = {
            BUILDING_PERMIT: 'مراجعة رخصة بناء',
            COMPLAINT_FOLLOWUP: 'متابعة شكوى',
            MAYOR_MEETING: 'لقاء رئيس البلدية',
            ENGINEERING: 'الدائرة الهندسية',
            FINANCE: 'الدائرة المالية',
            OTHER: 'أخرى'
        };
        return map[type] || type;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    إدارة المواعيد
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search can be added here */}
                    <div className="flex gap-2">
                        <Button variant="outline" asChild className={!statusFilter ? 'bg-slate-100' : ''}>
                            <Link href="/employee/appointments">الكل</Link>
                        </Button>
                        <Button variant="outline" asChild className={statusFilter === 'SCHEDULED' ? 'bg-blue-100' : ''}>
                            <Link href="/employee/appointments?status=SCHEDULED">الجديدة</Link>
                        </Button>
                        <Button variant="outline" asChild className={statusFilter === 'CONFIRMED' ? 'bg-green-100' : ''}>
                            <Link href="/employee/appointments?status=CONFIRMED">المؤكدة</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الخدمة</TableHead>
                                <TableHead>المواطن</TableHead>
                                <TableHead>التاريخ والوقت</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-end">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        لا توجد مواعيد
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((apt) => (
                                    <TableRow key={apt.id}>
                                        <TableCell className="font-medium max-w-[150px] truncate" title={apt.notes}>
                                            {getServiceLabel(apt.serviceType)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{apt.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{apt.user.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{format(new Date(apt.date), 'dd/MM/yyyy')}</span>
                                                <span className="text-xs text-muted-foreground">{apt.timeSlot}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(apt.status)}>
                                                {apt.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/employee/appointments/${apt.id}`}>
                                                    التفاصيل
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
