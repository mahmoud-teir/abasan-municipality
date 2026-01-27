import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare
} from 'lucide-react';
import prisma from '@/lib/db/prisma';

export default async function EmployeeDashboardPage() {
    const t = await getTranslations();

    // Fetch stats for employee
    const [pendingCount, approvedCount, rejectedCount, complaintsCount] = await Promise.all([
        prisma.request.count({ where: { status: 'PENDING' } }),
        prisma.request.count({ where: { status: 'APPROVED' } }),
        prisma.request.count({ where: { status: 'REJECTED' } }),
        prisma.complaint.count({ where: { status: 'OPEN' } }),
    ]);

    const stats = [
        { label: 'requests.status.pending', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'requests.status.approved', value: approvedCount, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'requests.status.rejected', value: rejectedCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'employee.complaints', value: complaintsCount, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('employee.dashboard')}
                </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm card-hover">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {t(stat.label) || stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-1">
                {/* Placeholder for recent activity or assignment queue */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('employee.recentPending')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground py-8 text-center">{t('common.noResults')}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
