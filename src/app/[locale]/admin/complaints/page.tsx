'use client';

import { useTranslations } from 'next-intl';
import { getComplaints } from '@/actions/complaint.actions';
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

type ComplaintWithUser = {
    id: string;
    title: string;
    category: string;
    status: string;
    createdAt: Date;
    user: {
        name: string;
        email: string;
    };
};

export default function AdminComplaintsPage() {
    const t = useTranslations();
    const locale = useLocale();
    const [complaints, setComplaints] = useState<ComplaintWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            const res = await getComplaints();
            if (res.success) {
                setComplaints(res.data as any);
            }
            setLoading(false);
        };
        fetchComplaints();
    }, []);

    const statusColors: Record<string, string> = {
        OPEN: 'bg-red-100 text-red-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        RESOLVED: 'bg-green-100 text-green-800',
        CLOSED: 'bg-gray-100 text-gray-800',
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
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('services.items.complaints.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {complaints.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('common.noResults')}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('requests.type')}</TableHead>
                                    <TableHead>{t('services.categories.general')}</TableHead>
                                    <TableHead>{t('common.name')}</TableHead>
                                    <TableHead>{t('admin.usersPage.table.joinedAt')}</TableHead>
                                    <TableHead>{t('admin.usersPage.table.role')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complaints.map((comp) => (
                                    <TableRow key={comp.id}>
                                        <TableCell className="font-medium">
                                            {comp.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{comp.category}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{comp.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{comp.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(comp.createdAt), 'PPP', { locale: locale === 'ar' ? ar : enUS })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-0 ${statusColors[comp.status] || 'bg-gray-100'}`}>
                                                {t(`services.items.complaints.status.${comp.status}`) || comp.status}
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
