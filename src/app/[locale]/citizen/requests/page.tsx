
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import { getUserRequests } from '@/actions/request.actions';
import { CancelRequestButton } from '@/components/requests/cancel-request-button';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function RequestsPage() {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const result = await getUserRequests(session.user.id);
    const requests = result.success ? (result.data as any[]) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-800';
            case 'PENDING': return 'bg-blue-100 text-blue-800';
            case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-800';
            case 'NEEDS_DOCUMENTS': return 'bg-orange-100 text-orange-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getRequestTypeLabel = (type: string) => {
        const map: any = {
            BUILDING_PERMIT: 'requests.types.building',
            RENOVATION_PERMIT: 'requests.types.renovation',
            DEMOLITION_PERMIT: 'requests.types.demolition',
            LAND_DIVISION: 'requests.types.division',
            OTHER: 'requests.types.other'
        };
        // Safely try to translate, fallback to type
        // Note: t(key) throws if strict, but let's assume keys exist or handle gracefully
        // Actually, let's just use a hardcoded map for now if keys might be missing, 
        // OR better, use the t function correctly.
        return t(map[type] as any || 'requests.types.other');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('dashboard.myRequests')}
                </h1>
                <Button asChild>
                    <Link href="/citizen/requests/new">
                        <Plus className="w-4 h-4 me-2" />
                        {t('dashboard.newRequest')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('common.noResults')}</h3>
                            <p className="text-slate-500 mb-4">{t('requests.newRequestDescription')}</p>
                            <Button asChild variant="outline">
                                <Link href="/citizen/requests/new">{t('dashboard.newRequest')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            {getRequestTypeLabel(request.type)}
                                        </CardTitle>
                                        <div className="text-sm text-slate-500">
                                            {request.requestNo}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(request.status)}>
                                        {t(`requests.status.${request.status}`)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{request.propertyAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{format(new Date(request.createdAt), 'dd/MM/yyyy')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <CancelRequestButton
                                        requestId={request.id}
                                        currentStatus={request.status}
                                        label={t('requests.requestActions.cancel')}
                                        confirmTitle={t('requests.requestActions.cancelTitle')}
                                        confirmDesc={t('requests.requestActions.cancelConfirm')}
                                        cancelLabel={t('common.cancel')}
                                        confirmLabel={t('requests.requestActions.cancelButton')}
                                    />
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/citizen/requests/${request.id}`}>
                                            <Eye className="w-4 h-4 me-2" />
                                            {t('common.view')}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div >
    );
}
