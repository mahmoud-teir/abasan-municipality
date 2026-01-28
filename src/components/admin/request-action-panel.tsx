'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateRequestStatus } from '@/actions/request.actions';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowBigRight,
    User,
    MapPin,
    Calendar,
    FileText,
    Printer
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

type Props = {
    request: any; // Using detailed type in real app
    user: any;
};

export default function RequestActionPanel({ request, user }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: 'APPROVED' | 'REJECTED' | 'NEEDS_DOCUMENTS' | 'UNDER_REVIEW') => {
        setLoading(true);
        try {
            const result = await updateRequestStatus(request.id, status, note);
            if (result.success) {
                toast.success(t('common.success'));
                router.refresh();
            } else {
                toast.error(result.error || t('common.error'));
            }
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        PENDING: 'bg-amber-100 text-amber-800',
        UNDER_REVIEW: 'bg-blue-100 text-blue-800',
        NEEDS_DOCUMENTS: 'bg-orange-100 text-orange-800',
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{t('requests.details')}</CardTitle>
                                <Badge variant="outline" className={(statusColors as any)[request.status]}>
                                    {t(`requests.status.${request.status.toLowerCase().replace(/_([a-z])/g, (g: string) => g[1].toUpperCase())}`)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('requests.type')}</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t(`requests.types.${request.type.toLowerCase().split('_')[0]}`) || request.type}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('requests.date')}</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('requests.applicant')}</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {request.user.name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">{t('requests.address')}</Label>
                                    <p className="font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {request.propertyAddress}
                                    </p>
                                </div>
                            </div>

                            {request.documents && request.documents.length > 0 && (
                                <div className="space-y-2 pt-4 border-t">
                                    <Label className="text-muted-foreground">{t('requests.documents.title')}</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {request.documents.map((doc: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{doc.name || t('requests.documents.defaultName')}</p>
                                                    <p className="text-xs text-muted-foreground">{t('requests.documents.download')}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t">
                                <Label className="text-muted-foreground">{t('requests.description')}</Label>
                                <p className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                    {request.description || t('requests.noDescription')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('employee.actions')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('requests.reviewNotes')}</Label>
                                <Textarea
                                    placeholder={t('requests.reviewNotesPlaceholder')}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                {request.status === 'APPROVED' && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                                        asChild
                                    >
                                        <Link href={`/print/permit/${request.id}`} target="_blank">
                                            <Printer className="w-4 h-4" />
                                            {t('requests.printPermit') || 'Print Permit'}
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={() => handleAction('UNDER_REVIEW')}
                                    disabled={loading || request.status === 'UNDER_REVIEW'}
                                >
                                    <CheckCircle2 className="w-4 h-4 me-2" />
                                    {t('requests.requestActions.startReview')}
                                </Button>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction('APPROVED')}
                                        disabled={loading || request.status === 'APPROVED'}
                                    >
                                        {t('requests.requestActions.approve')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleAction('REJECTED')}
                                        disabled={loading || request.status === 'REJECTED'}
                                    >
                                        {t('requests.requestActions.reject')}
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                    onClick={() => handleAction('NEEDS_DOCUMENTS')}
                                    disabled={loading}
                                >
                                    <AlertCircle className="w-4 h-4 me-2" />
                                    {t('requests.requestActions.requestChanges')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
