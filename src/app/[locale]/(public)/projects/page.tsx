import { getProjects } from '@/actions/project.actions';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, BarChart3 } from 'lucide-react';
import { ProjectStatus } from '@prisma/client';

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ status?: string; page?: string }>;
};

function getStatusLabel(status: string, isAr: boolean) {
    const labels: Record<string, { ar: string; en: string; color: string }> = {
        PLANNED: { ar: 'مخطط له', en: 'Planned', color: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
        COMPLETED: { ar: 'مكتمل', en: 'Completed', color: 'bg-green-100 text-green-800' },
        ON_HOLD: { ar: 'معلق', en: 'On Hold', color: 'bg-orange-100 text-orange-800' },
        CANCELLED: { ar: 'ملغي', en: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    return labels[status] || { ar: status, en: status, color: 'bg-gray-100 text-gray-800' };
}

export default async function ProjectsPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const { status, page } = await searchParams;
    const isAr = locale === 'ar';
    const t = await getTranslations();

    const result = await getProjects(
        Number(page) || 1,
        12,
        status as ProjectStatus
    );

    const projects = result.success ? result.data?.projects || [] : [];

    // Status Filter Links could be added here
    const statuses = ['IN_PROGRESS', 'COMPLETED', 'PLANNED'];

    return (
        <div className="container mx-auto py-12 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">{isAr ? 'مشاريع البلدية' : 'Municipality Projects'}</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    {isAr
                        ? 'تابع أحدث المشاريع التنموية والخدمية التي تقوم بها البلدية لخدمة المدينة والمواطنين.'
                        : 'Follow the latest development and service projects undertaken by the municipality to serve the city and citizens.'}
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2">
                <Link href={`/${locale}/projects`} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!status ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {isAr ? 'الكل' : 'All'}
                </Link>
                {statuses.map(s => {
                    const info = getStatusLabel(s, isAr);
                    return (
                        <Link key={s} href={`/${locale}/projects?status=${s}`} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${status === s ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {isAr ? info.ar : info.en}
                        </Link>
                    );
                })}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                    const statusInfo = getStatusLabel(project.status, isAr);
                    const image = project.images[0] || '/images/placeholder-project.jpg'; // Fallback

                    return (
                        <Link key={project.id} href={`/${locale}/projects/${project.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border">
                            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                <Image
                                    src={image}
                                    alt={isAr ? project.titleAr : project.titleEn}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge className={statusInfo.color} variant="secondary">
                                        {isAr ? statusInfo.ar : statusInfo.en}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                    {isAr ? project.titleAr : project.titleEn}
                                </h3>

                                <div className="space-y-2 text-sm text-gray-600">
                                    {project.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span>{project.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        <span>{isAr ? 'نسبة الإنجاز:' : 'Completion:'} {project.completionPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.completionPercentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {projects.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    {isAr ? 'لا توجد مشاريع مضافة حالياً' : 'No projects found'}
                </div>
            )}
        </div>
    );
}
