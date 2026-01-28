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
import prisma from '@/lib/db/prisma';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function AuditLogsPage() {
    const t = await getTranslations();

    // Authorization Check: SUPER_ADMIN Only
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = session?.user as any;
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
        redirect('/admin');
        // Ideally show an error or 403 page
    }

    // Fetch Logs
    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: { name: true, email: true, role: true }
            }
        },
        take: 50 // Limit for now
    });

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50 border-green-200';
        if (action.includes('UPDATE')) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 border-red-200';
        return 'text-slate-600 bg-slate-50 border-slate-200';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {t('admin.logsPage.title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('admin.logsPage.subtitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-start">{t('admin.logsPage.table.action')}</TableHead>
                                <TableHead className="text-start">{t('admin.logsPage.table.actor')}</TableHead>
                                <TableHead className="text-start">{t('admin.logsPage.table.details')}</TableHead>
                                <TableHead className="text-start">{t('admin.logsPage.table.date')}</TableHead>
                                <TableHead className="text-start">{t('admin.logsPage.table.ip')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant="outline" className={getActionColor(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{log.actor.name}</span>
                                            <span className="text-xs text-muted-foreground">{log.actor.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate" title={log.details || ''}>
                                        {log.details || '-'}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.ipAddress || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {t('admin.logsPage.table.empty')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
