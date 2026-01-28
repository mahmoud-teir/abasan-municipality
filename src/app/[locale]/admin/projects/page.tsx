import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/db/prisma';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
// I will need a Delete button component later

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ locale: string }>;
};

function getStatusColor(status: string) {
    switch (status) {
        case 'PLANNED': return 'bg-blue-100 text-blue-800';
        case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
        case 'COMPLETED': return 'bg-green-100 text-green-800';
        case 'ON_HOLD': return 'bg-orange-100 text-orange-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export default async function AdminProjectsPage({ searchParams, params }: Props) {
    const t = await getTranslations();
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = session?.user as any;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const isAr = locale === 'ar';

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'إدارة المشاريع' : 'Projects Management'}</h1>
                <Button asChild>
                    <Link href={`/${locale}/admin/projects/new`}>
                        <Plus className="w-4 h-4 me-2" />
                        {isAr ? 'إضافة مشروع' : 'Add Project'}
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{isAr ? 'قائمة المشاريع' : 'Projects List'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-start">{isAr ? 'العنوان' : 'Title'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'الحالة' : 'Status'}</TableHead>
                                <TableHead className="text-center">{isAr ? 'الإنجاز' : 'Progress'}</TableHead>
                                <TableHead className="text-start">{isAr ? 'تاريخ البدء' : 'Start Date'}</TableHead>
                                <TableHead className="text-end">{isAr ? 'إجراءات' : 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        {isAr ? project.titleAr : project.titleEn}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={getStatusColor(project.status)}>
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {project.completionPercentage}%
                                    </TableCell>
                                    <TableCell>
                                        {project.startDate ? format(new Date(project.startDate), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/${locale}/admin/projects/${project.id}`}>
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            {/* Delete Button Here */}
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
