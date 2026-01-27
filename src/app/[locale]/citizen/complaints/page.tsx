import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getUserComplaints } from '@/actions/complaint.actions';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function ComplaintsPage() {
    const t = await getTranslations('services.complaints');
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const result = await getUserComplaints(session.user.id);
    const complaints = result.success ? (result.data as any[]) : [];

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('pageTitle')}
                </h1>
                <Button asChild>
                    <Link href="/citizen/complaints/new">
                        <Plus className="w-4 h-4 me-2" />
                        {t('newComplaint')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {complaints.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('empty.title')}</h3>
                            <p className="text-slate-500 mb-4">{t('empty.description')}</p>
                            <Button asChild variant="outline">
                                <Link href="/citizen/complaints/new">{t('empty.button')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    complaints.map((complaint) => (
                        <Card key={complaint.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <Badge variant="secondary" className="font-normal">
                                                {t(`categories.${complaint.category}` as any)}
                                            </Badge>
                                            <span>•</span>
                                            <span>{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(complaint.status)}>
                                        {t(`status.${complaint.status}` as any)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 line-clamp-2 mb-4">
                                    {complaint.description}
                                </p>

                                {complaint.location && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                                        <MapPin className="w-3 h-3" />
                                        {complaint.location}
                                    </div>
                                )}

                                {complaint.responses && complaint.responses.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-md text-sm border-s-4 border-green-500">
                                        <span className="font-bold block mb-1">{t('response')}</span>
                                        {complaint.responses[0].content}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/citizen/complaints/${complaint.id}`}>
                                            {t('viewDetails')}
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
