
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, FileText, Download, Printer } from 'lucide-react';
import Link from 'next/link';
import { getRequestById } from '@/actions/request.actions';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { CancelRequestButton } from '@/components/requests/cancel-request-button';
import { RequestChat } from '@/components/requests/request-chat';

export default async function RequestDetailsPage({ params }: { params: { id: string } }) {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const { id } = await params;
    const result = await getRequestById(id, session.user.id);

    if (!result.success || !result.data) {
        notFound();
    }

    const request = result.data as any;

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
        return t(map[type] || 'requests.types.other');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/citizen/requests">
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {t('requests.details')}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {request.requestNo}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Main Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{getRequestTypeLabel(request.type)}</CardTitle>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                    {t(`requests.status.${request.status}`)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-500">{t('requests.address')}</label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span>{request.propertyAddress}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-500">{t('requests.date')}</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>{format(new Date(request.createdAt), 'dd/MM/yyyy PPP')}</span>
                                    </div>
                                </div>
                                {(request.plotNumber || request.basinNumber) && (
                                    <>
                                        {request.plotNumber && (
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-500">{t('requests.plotNumber')}</label>
                                                <span>{request.plotNumber}</span>
                                            </div>
                                        )}
                                        {request.basinNumber && (
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-500">{t('requests.basinNumber')}</label>
                                                <span>{request.basinNumber}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <label className="text-sm font-medium text-slate-500">{t('requests.description')}</label>
                                <p className="text-sm leading-relaxed">
                                    {request.description || t('requests.noDescription')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('requests.documents.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {request.documents && request.documents.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {request.documents.map((doc: any) => (
                                        <a
                                            key={doc.id}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{doc.name}</p>
                                                <p className="text-xs text-slate-500">{doc.type}</p>
                                            </div>
                                            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">{t('common.noResults')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Status / Review Notes */}
                    {(request.notes && request.notes.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t('requests.reviewNotes')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.notes.map((note: any) => (
                                    <div key={note.id} className="p-3 bg-amber-50 text-amber-900 rounded-lg text-sm">
                                        <p>{note.content}</p>
                                        <p className="text-xs text-amber-700 mt-2 opacity-75">
                                            {format(new Date(note.createdAt), 'dd/MM/yyyy')}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('common.settings')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(request.status === 'PENDING' || request.status === 'DRAFT') && (
                                <CancelRequestButton
                                    requestId={request.id}
                                    currentStatus={request.status}
                                    label={t('requests.requestActions.cancel')}
                                    confirmTitle={t('requests.requestActions.cancelTitle')}
                                    confirmDesc={t('requests.requestActions.cancelConfirm')}
                                    cancelLabel={t('common.cancel')}
                                    confirmLabel={t('requests.requestActions.cancelButton')}
                                />
                            )}

                            {request.status === 'APPROVED' && (
                                <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                    <Link href={`/print/permit/${request.id}`} target="_blank">
                                        <Printer className="w-4 h-4" />
                                        {t('requests.printPermit') || 'طباعة التصريح'}
                                    </Link>
                                </Button>
                            )}
                            {/* Can add more actions like "Upload Missing Docs" later */}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Request Chat */}
            <div className="mt-8">
                <RequestChat requestId={request.id} />
            </div>
        </div>
    );
}
