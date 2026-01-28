
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getComplaintById } from '@/actions/complaint.actions';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, User, Calendar, Tag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';
import { ComplaintResponseForm } from '@/components/employee/complaint-response-form';

interface PageProps {
    params: {
        id: string;
        locale: string;
    };
}

export default async function EmployeeComplaintDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role === 'CITIZEN') {
        redirect('/login');
    }

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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/employee/complaints">
                        <ArrowRight className="w-4 h-4 me-2" />
                        عودة للقائمة
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">
                    تفاصيل الشكوى #{complaint.complaintNo}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Complaint Info */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{complaint.title}</CardTitle>
                            <Badge variant="outline" className={getStatusColor(complaint.status)}>
                                {complaint.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full">
                                    <Tag className="w-4 h-4" />
                                    <span>{t(`services.complaints.categories.${complaint.category}` as any)}</span>
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

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <h3 className="font-semibold mb-2 text-sm text-slate-900">الوصف</h3>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {complaint.description}
                                </p>
                            </div>

                            {complaint.imageUrl && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-sm text-slate-900">المرفقات</h3>
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

                    {/* Responses History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                الردود والمتابعة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {complaint.responses && complaint.responses.length > 0 ? (
                                complaint.responses.map((response: any) => (
                                    <div key={response.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-sm text-blue-700">رد البلدية</span>
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(response.createdAt), 'dd/MM/yyyy - hh:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 text-sm whitespace-pre-wrap">
                                            {response.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">لا توجد ردود سابقة</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Applicant Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">بيانات المواطن</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{complaint.user.name}</p>
                                    <p className="text-sm text-slate-500">{complaint.user.email}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">رقم الهاتف:</span>
                                    <span className="font-medium" dir="ltr">{complaint.user.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">رقم الهوية:</span>
                                    <span className="font-medium">{complaint.user.nationalId || '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Form */}
                    <Card className="border-blue-200 shadow-sm">
                        <CardHeader className="bg-blue-50/30">
                            <CardTitle className="text-lg text-blue-900">إجراءات الموظف</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ComplaintResponseForm
                                complaintId={complaint.id}
                                currentStatus={complaint.status}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
