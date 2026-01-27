import { getJobBySlug } from '@/actions/job.actions';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, Briefcase, Clock, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ApplicationForm } from '@/components/careers/application-form';

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

export default async function SingleJobPage({ params }: Props) {
    const { locale, slug } = await params;
    const isAr = locale === 'ar';
    const t = await getTranslations();

    const result = await getJobBySlug(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    const job = result.data;

    // Helper to split text by lines
    const getLines = (text: string) => text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="container mx-auto py-12 space-y-8">
            {/* Back Link */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/${locale}/careers`} className="hover:text-primary flex items-center gap-1">
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isAr ? 'العودة للوظائف' : 'Back to Careers'}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">

                        {/* Header */}
                        <div className="space-y-4 border-b pb-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {isAr ? job.titleAr : job.titleEn}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        {job.department && (
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                <span>{job.department}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{job.type.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={job.isActive ? 'default' : 'secondary'} className="text-sm">
                                    {job.isActive ? (isAr ? 'متاح للتقديم' : 'Open') : (isAr ? 'مغلق' : 'Closed')}
                                </Badge>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                {isAr ? 'الوصف الوظيفي' : 'Job Description'}
                            </h3>
                            <div className="prose max-w-none text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-xl">
                                <p className="whitespace-pre-line">
                                    {isAr ? job.descriptionAr : job.descriptionEn}
                                </p>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                {isAr ? 'المتطلبات والمؤهلات' : 'Requirements'}
                            </h3>
                            <ul className="space-y-3">
                                {getLines(isAr ? job.requirementsAr : job.requirementsEn).map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Sidebar Info & Apply */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6 sticky top-24">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-8 h-8 text-primary opacity-20" />
                                <div>
                                    <span className="block text-sm font-medium text-muted-foreground">{isAr ? 'تاريخ النشر' : 'Published At'}</span>
                                    <span className="font-bold text-gray-900">{format(new Date(job.createdAt), 'dd MMMM yyyy')}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                                <Clock className="w-8 h-8 text-red-500 opacity-20" />
                                <div>
                                    <span className="block text-sm font-medium text-red-800">{isAr ? 'آخر موعد للتقديم' : 'Deadline'}</span>
                                    <span className="font-bold text-red-900">{format(new Date(job.deadline), 'dd MMMM yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        {job.isActive ? (
                            <ApplicationForm
                                jobId={job.id}
                                jobTitle={isAr ? job.titleAr : job.titleEn}
                                locale={locale}
                            />
                        ) : (
                            <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500 font-medium">
                                {isAr ? 'انتهى موعد التقديم' : 'Applications Closed'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
