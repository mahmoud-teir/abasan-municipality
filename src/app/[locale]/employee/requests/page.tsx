import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
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
import { Eye } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import { format } from 'date-fns';
import { SearchInput } from '@/components/ui/search-input';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EmployeeRequestsPage({ searchParams }: Props) {
    const t = await getTranslations();
    const params = await searchParams;
    const statusFilter = typeof params.status === 'string' ? params.status : undefined;
    const searchQuery = typeof params.search === 'string' ? params.search : undefined;
    const assignedFilter = typeof params.assigned === 'string' ? params.assigned : undefined;

    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    // Build filter conditions
    const where: any = {};

    if (statusFilter) {
        where.status = statusFilter;
    }

    if (assignedFilter === 'me' && currentUserId) {
        where.assignedToId = currentUserId;
    }

    if (searchQuery) {
        where.OR = [
            { requestNo: { contains: searchQuery, mode: 'insensitive' } },
            { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
            { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
            { propertyAddress: { contains: searchQuery, mode: 'insensitive' } },
        ];
    }

    const requests = await prisma.request.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true }
            },
            assignedTo: {
                select: { id: true, name: true }
            }
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'PENDING': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const buildFilterUrl = (filterParams: Record<string, string | undefined>) => {
        const base = '/employee/requests';
        const sp = new URLSearchParams();
        if (filterParams.status) sp.set('status', filterParams.status);
        if (filterParams.assigned) sp.set('assigned', filterParams.assigned);
        if (searchQuery) sp.set('search', searchQuery);
        const qs = sp.toString();
        return qs ? `${base}?${qs}` : base;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('employee.requests')}
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <SearchInput
                        placeholder={t('common.search')}
                        className="w-full sm:w-[300px]"
                    />
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" asChild className={!statusFilter && !assignedFilter ? 'bg-slate-100' : ''}>
                            <Link href="/employee/requests">{t('employee.requestsPage.filter.all')}</Link>
                        </Button>
                        <Button variant="outline" asChild className={statusFilter === 'PENDING' ? 'bg-amber-100' : ''}>
                            <Link href={buildFilterUrl({ status: 'PENDING' })}>
                                {t('employee.requestsPage.filter.pending')}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className={assignedFilter === 'me' ? 'bg-indigo-100' : ''}>
                            <Link href={buildFilterUrl({ assigned: 'me' })}>
                                {t('requests.assignment.assignedToMe')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('employee.requestsPage.table.requestNo')}</TableHead>
                                <TableHead>{t('employee.requestsPage.table.applicant')}</TableHead>
                                <TableHead>{t('employee.requestsPage.table.type')}</TableHead>
                                <TableHead>{t('requests.assignment.assignee')}</TableHead>
                                <TableHead>{t('employee.requestsPage.table.date')}</TableHead>
                                <TableHead>{t('employee.requestsPage.table.status')}</TableHead>
                                <TableHead className="text-end">{t('employee.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? t('common.noResults') : t('employee.requestsPage.empty')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-mono">{request.requestNo}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{request.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{request.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{t(`requests.types.${request.type.toLowerCase().split('_')[0]}`) || request.type}</TableCell>
                                        <TableCell>
                                            {request.assignedTo ? (
                                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                                    {request.assignedTo.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{t('requests.assignment.unassigned')}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(new Date(request.createdAt), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(request.status)}>
                                                {t(`requests.status.${request.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-end">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/employee/requests/${request.id}`}>
                                                    <Eye className="w-4 h-4" />
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
