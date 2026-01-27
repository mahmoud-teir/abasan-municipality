import { getJobs } from '@/actions/job.actions';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ department?: string; page?: string }>;
};

export default async function CareersPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { department, page } = await searchParams;
    const isAr = locale === 'ar';
    const t = await getTranslations();

    const result = await getJobs(Number(page) || 1, 12, department);
    const jobs = result.success ? result.data?.jobs || [] : [];

    return (
        <div className="container mx-auto py-12 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{isAr ? 'الوظائف الشاغرة' : 'Careers'}</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {isAr
                        ? 'انضم إلى فريق عمل بلدية عبسان الكبيرة وساهم في خدمة المجتمع وتطوير المدينة.'
                        : 'Join the Abasan Al-Kabera Municipality team and contribute to serving the community and developing the city.'}
                </p>
            </div>

            {/* Job List */}
            <div className="grid gap-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed">
                        <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-muted-foreground">{isAr ? 'لا توجد وظائف شاغرة حالياً' : 'No active job openings'}</p>
                        <p className="text-sm text-gray-400 mt-1">{isAr ? 'يرجى التحقق لاحقاً' : 'Please check back later'}</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="group bg-white p-6 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                        {isAr ? job.titleAr : job.titleEn}
                                    </h3>
                                    <Badge variant="secondary" className="font-normal">
                                        {job.type.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                    {job.department && (
                                        <div className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4" />
                                            <span>{job.department}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{isAr ? 'آخر موعد:' : 'Deadline:'} {format(new Date(job.deadline), 'dd/MM/yyyy')}</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/${locale}/careers/${job.slug}`}
                                className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-primary transition-colors flex items-center justify-center gap-2"
                            >
                                {isAr ? 'التفاصيل والتقديم' : 'View & Apply'}
                                {isAr ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
