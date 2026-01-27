import { getProjectBySlug } from '@/actions/project.actions';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, BarChart3, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
// import { ProjectGallery } from '@/components/projects/project-gallery'; // I can implement a simple gallery here or a separate component

type Props = {
    params: Promise<{ locale: string; slug: string }>;
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

export default async function SingleProjectPage({ params }: Props) {
    const { locale, slug } = await params;
    const isAr = locale === 'ar';
    const t = await getTranslations();

    const result = await getProjectBySlug(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    const project = result.data;
    const statusInfo = getStatusLabel(project.status, isAr);
    const mainImage = project.images[0] || '/images/placeholder-project.jpg';

    return (
        <div className="container mx-auto py-12 space-y-8">
            {/* Breadcrumb / Back Link */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/${locale}/projects`} className="hover:text-primary flex items-center gap-1">
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isAr ? 'العودة للمشاريع' : 'Back to Projects'}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm">
                        <Image
                            src={mainImage}
                            alt={isAr ? project.titleAr : project.titleEn}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isAr ? project.titleAr : project.titleEn}
                            </h1>
                            <Badge className={statusInfo.color} variant="secondary">
                                {isAr ? statusInfo.ar : statusInfo.en}
                            </Badge>
                        </div>

                        <div className="prose max-w-none text-gray-600 leading-relaxed">
                            <p className="whitespace-pre-line">
                                {isAr ? project.descriptionAr : project.descriptionEn}
                            </p>
                        </div>

                        {/* Image Gallery */}
                        {project.images.length > 1 && (
                            <div className="space-y-4 pt-8 border-t">
                                <h3 className="text-lg font-bold">{isAr ? 'معرض الصور' : 'Gallery'}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {project.images.slice(1).map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                            <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
                        <h3 className="font-bold text-lg border-b pb-4">{isAr ? 'بطاقة المشروع' : 'Project Info'}</h3>

                        <div className="space-y-4">
                            {/* Completion */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        {isAr ? 'نسبة الإنجاز' : 'Completion'}
                                    </span>
                                    <span>{project.completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.completionPercentage}%` }} />
                                </div>
                            </div>

                            {/* Location */}
                            {project.location && (
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <span className="block font-medium text-gray-900">{isAr ? 'الموقع' : 'Location'}</span>
                                        <span className="text-gray-600">{project.location}</span>
                                    </div>
                                </div>
                            )}

                            {/* Start Date */}
                            {project.startDate && (
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <span className="block font-medium text-gray-900">{isAr ? 'تاريخ البدء' : 'Start Date'}</span>
                                        <span className="text-gray-600">{format(new Date(project.startDate), 'dd MMMM yyyy')}</span>
                                    </div>
                                </div>
                            )}

                            {/* End Date */}
                            {project.endDate && (
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary mt-1" />
                                    <div>
                                        <span className="block font-medium text-gray-900">{isAr ? 'تاريخ الانتهاء المتوقع' : 'Expected Completion'}</span>
                                        <span className="text-gray-600">{format(new Date(project.endDate), 'dd MMMM yyyy')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Contractor */}
                            {project.contractor && (
                                <div className="pt-4 border-t mt-4">
                                    <span className="block text-xs text-muted-foreground mb-1">{isAr ? 'الشركة المنفذة' : 'Contractor'}</span>
                                    <span className="font-bold text-gray-900 block">{project.contractor}</span>
                                </div>
                            )}

                            {/* Budget */}
                            {project.budget && (
                                <div className="pt-4 border-t mt-4">
                                    <span className="block text-xs text-muted-foreground mb-1">{isAr ? 'الميزانية' : 'Budget'}</span>
                                    <span className="font-bold text-gray-900 block">{Number(project.budget).toLocaleString()} ILS</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
