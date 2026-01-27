'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Building2,
    MessageSquare,
    Calendar,
    CreditCard,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getCitizenDashboardStats } from '@/actions/dashboard.actions';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

export default function DashboardPage() {
    const t = useTranslations();
    const currentLocale = useLocale();
    const { data: session, isPending: isSessionPending } = useSession();
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (session?.user?.id) {
                const result = await getCitizenDashboardStats(session.user.id);
                if (result.success) {
                    setStatsData(result.data);
                }
                setLoading(false);
            } else if (!isSessionPending && !session) {
                setLoading(false);
            }
        }

        if (!isSessionPending) {
            fetchStats();
        }
    }, [session, isSessionPending]);

    if (isSessionPending || loading) {
        return <DashboardSkeleton />;
    }

    const userName = session?.user?.name || 'مواطن';

    const stats = [
        {
            label: 'requests.status.pending',
            value: statsData?.pendingCount || 0,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'requests.status.underReview',
            value: statsData?.underReviewCount || 0,
            icon: AlertCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'requests.status.approved',
            value: statsData?.approvedCount || 0,
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'dashboard.payments',
            value: statsData?.paymentsCount || 0,
            icon: CreditCard,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
    ];

    const quickActions = [
        { label: 'home.services.buildingPermit', icon: Building2, href: '/citizen/requests/new', color: 'bg-blue-500' },
        { label: 'home.services.complaints', icon: MessageSquare, href: '/citizen/complaints', color: 'bg-amber-500' },
        { label: 'home.services.appointments', icon: Calendar, href: '/citizen/appointments', color: 'bg-green-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('dashboard.welcome', { name: userName })}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
                <Button asChild size="lg" className="gap-2">
                    <Link href="/citizen/requests/new">
                        <Plus className="w-5 h-5" />
                        {t('dashboard.newRequest')}
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {t(stat.label)}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('dashboard.myRequests')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsData?.recentRequests?.length > 0 ? (
                                statsData.recentRequests.map((req: any) => (
                                    <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-full bg-blue-500/10">
                                                <Building2 className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{req.requestNo}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(req.createdAt), {
                                                        addSuffix: true,
                                                        locale: currentLocale === 'ar' ? ar : enUS
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                                req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-amber-500/10 text-amber-500'}`}>
                                            {t(`requests.status.${req.status.toLowerCase()}`)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('common.noResults')}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('dashboard.quickServices')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href} className="group">
                                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">{t(action.label)}</span>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="grid gap-8 md:grid-cols-7">
                <Skeleton className="col-span-4 h-96" />
                <Skeleton className="col-span-3 h-96" />
            </div>
        </div>
    );
}
