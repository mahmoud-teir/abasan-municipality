
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getComplaintById } from '@/actions/complaint.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export default async function ComplaintDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const t = await getTranslations('services.complaints');

    const result = await getComplaintById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const complaint = result.data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-slate-100 text-slate-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-6">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/citizen/complaints">
                        <ArrowRight className="w-4 h-4 me-2" />
                        {t('backToComplaints')}
                    </Link>
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
                        <p className="text-slate-500 text-sm mt-1">#{complaint.complaintNo}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(complaint.status)}>
                        {t(`status.${complaint.status}` as any)}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t('complaintInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Tag className="w-4 h-4" />
                                <span>{t(`categories.${complaint.category}` as any)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(complaint.createdAt), 'dd/MM/yyyy - hh:mm a')}</span>
                            </div>
                            {complaint.location && (
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                                    <MapPin className="w-4 h-4" />
                                    <span>{complaint.location}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h3 className="font-medium text-sm text-slate-900">{t('form.detailsLabel')}</h3>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {complaint.description}
                            </p>
                        </div>

                        {complaint.imageUrl && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-slate-900">{t('attachments')}</h3>
                                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-slate-100">
                                    <Image
                                        src={complaint.imageUrl}
                                        alt={complaint.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {complaint.responses && complaint.responses.length > 0 && (
                    <Card className="border-green-200">
                        <CardHeader className="bg-green-50/50 pb-3">
                            <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                                {t('response')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {complaint.responses.map((response: any) => (
                                <div key={response.id} className="space-y-2">
                                    <p className="text-slate-800">{response.content}</p>
                                    <p className="text-xs text-slate-500">
                                        {format(new Date(response.createdAt), 'dd/MM/yyyy - hh:mm a')}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
