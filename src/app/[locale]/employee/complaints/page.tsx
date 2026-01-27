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
import { getComplaints } from '@/actions/complaint.actions';
import { format } from 'date-fns';
import { SearchInput } from '@/components/ui/search-input';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EmployeeComplaintsPage({ searchParams }: Props) {
    const t = await getTranslations();
    const params = await searchParams;
    const statusFilter = typeof params.status === 'string' ? params.status : undefined;

    const result = await getComplaints(statusFilter);
    const complaints = result.success ? (result.data as any[]) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getCategoryLabel = (cat: string) => {
        const map: any = {
            ROADS: 'طرق وأرصفة',
            WATER: 'مياه',
            ELECTRICITY: 'كهرباء',
            SEWAGE: 'صرف صحي',
            GARBAGE: 'نظافة',
            PARKS: 'حدائق',
            NOISE: 'إزعاج',
            OTHER: 'أخرى'
        };
        return map[cat] || cat;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    إدارة الشكاوى
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    {/* Search can be added here if updated in backend action */}
                    <div className="flex gap-2">
                        <Button variant="outline" asChild className={!statusFilter ? 'bg-slate-100' : ''}>
                            <Link href="/employee/complaints">الكل</Link>
                        </Button>
                        <Button variant="outline" asChild className={statusFilter === 'OPEN' ? 'bg-blue-100' : ''}>
                            <Link href="/employee/complaints?status=OPEN">جديدة</Link>
                        </Button>
                        <Button variant="outline" asChild className={statusFilter === 'IN_PROGRESS' ? 'bg-amber-100' : ''}>
                            <Link href="/employee/complaints?status=IN_PROGRESS">قيد المعالجة</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>رقم الشكوى</TableHead>
                                <TableHead>العنوان</TableHead>
                                <TableHead>مقدم الشكوى</TableHead>
                                <TableHead>التصنيف</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-end">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {complaints.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        لا توجد شكاوى
                                    </TableCell>
                                </TableRow>
                            ) : (
                                complaints.map((complaint) => (
                                    <TableRow key={complaint.id}>
                                        <TableCell className="font-mono text-xs">{complaint.complaintNo || complaint.id.slice(0, 8)}</TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate" title={complaint.title}>
                                            {complaint.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{complaint.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{complaint.user.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getCategoryLabel(complaint.category)}</TableCell>
                                        <TableCell>{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(complaint.status)}>
                                                {complaint.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            {/* We will add a dialog to resolve/update status later or here */}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/employee/complaints/${complaint.id}`}>
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
