import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Briefcase, Users } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getAdminJobs, deleteJob } from '@/actions/job.actions'; // Assuming deleteJob exists or I add it

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function AdminCareersPage({ params }: Props) {
    const t = await getTranslations();
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const { data: jobs } = await getAdminJobs(); // Need to ensure action returns count
    const isAr = locale === 'ar';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'إدارة الوظائف' : 'Careers Management'}</h1>
                <Button asChild>
                    <Link href={`/${locale}/admin/careers/new`}>
                        <Plus className="w-4 h-4 me-2" />
                        {isAr ? 'إضافة وظيفة' : 'Add Job'}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isAr ? 'قائمة الوظائف' : 'Jobs List'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-start">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'القسم' : 'Department'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'النوع' : 'Type'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'المتقدمين' : 'Applicants'}</TableHead>
                                <TableHead className="text-start">{isAr ? 'آخر موعد' : 'Deadline'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'الحالة' : 'Status'}</TableHead>
                                <TableHead className="text-end">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs?.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                                            {isAr ? job.titleAr : job.titleEn}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{job.department || '-'}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">{job.type}.replace('_', ' ')</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold">
                                            <Users className="w-4 h-4 text-primary" />
                                            {job._count.applications}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(job.deadline), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={job.isActive ? 'default' : 'secondary'}>
                                            {job.isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مغلق' : 'Closed')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/${locale}/admin/careers/${job.id}`}>
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
