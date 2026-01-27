'use client';

import { useTranslations } from 'next-intl';
import { getRequests } from '@/actions/request.actions';
import { ExportButton } from '@/components/ui/export-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type RequestWithUser = {
    id: string;
    type: string;
    status: string;
    submittedAt: Date;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
};

export default function AdminRequestsPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [requests, setRequests] = useState<RequestWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            const res = await getRequests(); // Fetch all
            if (res.success) {
                setRequests(res.data as any);
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        UNDER_REVIEW: 'bg-blue-100 text-blue-800',
        NEEDS_DOCUMENTS: 'bg-orange-100 text-orange-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        COMPLETED: 'bg-slate-100 text-slate-800',
        CANCELLED: 'bg-gray-100 text-gray-800',
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">{t('admin.requests')}</h1>
                <ExportButton
                    data={requests.map(r => ({
                        'Request No': r.id, // Using ID for now, ideally RequestNo
                        Type: r.type,
                        Status: r.status,
                        Date: format(new Date(r.submittedAt), 'yyyy-MM-dd'),
                        'Applicant Name': r.user.name,
                        'Applicant Email': r.user.email,
                        'Applicant Phone': r.user.phone
                    }))}
                    filename="requests_list"
                    label={t('admin.exportRequests') || 'Export Requests'}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.requests')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('common.noResults')}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('requests.type')}</TableHead>
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>{t('admin.usersPage.table.joinedAt')}</TableHead>
                                    <TableHead>{t('admin.usersPage.table.role')}</TableHead>
                                    {/* <TableHead className="text-end">الإجراءات</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/requests/${req.id}`} className="hover:underline flex items-center">
                                                {t(`admin.services.${req.type}`) || req.type}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{req.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{req.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(req.submittedAt), 'PPP', { locale: locale === 'ar' ? ar : enUS })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-0 ${statusColors[req.status] || 'bg-gray-100'}`}>
                                                {t(`requests.status.${req.status}`) || req.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
