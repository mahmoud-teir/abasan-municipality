import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    FileText,
    Newspaper,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import prisma from '@/lib/db/prisma';
import { OverviewChart } from '@/components/admin/overview-chart';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { EmergencyManager } from '@/components/admin/emergency-manager';

export default async function AdminDashboardPage() {
    const t = await getTranslations();

    // Fetch real stats
    const [usersCount, requestsCount, newsCount, complaintsCount] = await Promise.all([
        prisma.user.count(),
        prisma.request.count(),
        prisma.news.count(),
        prisma.complaint.count(),
    ]);

    // Fetch requests for chart (current year)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const requestsThisYear = await prisma.request.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            createdAt: true
        }
    });

    // Aggregate requests by month (for existing chart)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(currentYear, i).toLocaleString('en-US', { month: 'short' });
        return { name: monthName, total: 0 };
    });

    requestsThisYear.forEach(req => {
        const month = req.createdAt.getMonth();
        monthlyData[month].total += 1;
    });

    // Group Requests by Type
    const requestsByGroup = await prisma.request.groupBy({
        by: ['type'],
        _count: {
            id: true,
        },
    });

    const requestsByType = requestsByGroup.map(item => ({
        name: item.type.replace('_PERMIT', '').replace('_', ' '),
        value: item._count.id
    }));

    // Group Complaints by Category
    const complaintsByGroup = await prisma.complaint.groupBy({
        by: ['category'],
        _count: {
            id: true,
        },
    });

    const complaintsByCategory = complaintsByGroup.map(item => ({
        name: item.category,
        value: item._count.id
    }));




    const stats = [
        { label: 'admin.users', value: usersCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/users' },
        { label: 'admin.requests', value: requestsCount, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/admin/requests' },
        { label: 'admin.news', value: newsCount, icon: Newspaper, color: 'text-green-500', bg: 'bg-green-500/10', href: '/admin/news' },
        { label: 'admin.complaints', value: complaintsCount, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', href: '/admin/complaints' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {t('admin.dashboard')}
                </h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Link href={stat.href} key={index}>
                        <Card className="border-none shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {t(stat.label) || stat.label}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                    <span className="text-green-500 font-medium">+2.5%</span> {t('admin.growth')}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 md:col-span-4">
                    <CardHeader>
                        <CardTitle>{t('admin.overview') || 'Overview'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={monthlyData} />
                    </CardContent>
                </Card>

                {/* Emergency Manager - Now added */}
                <div className="col-span-4 md:col-span-3">
                    <EmergencyManager />
                </div>
            </div>

            {/* Advanced Analytics */}
            <AnalyticsDashboard
                requestsByType={requestsByType}
                complaintsByCategory={complaintsByCategory}
            />
        </div>
    );
}
