import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/db/prisma';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { getPublishedNews } from '@/actions/news.actions';

type Props = {
    params: Promise<{ locale: string }>;
};

const CATEGORY_MAP: Record<string, string> = {
    'أخبار عامة': 'General News',
    'تراخيص': 'Licensing',
    'بيئة': 'Environment',
    'فعاليات': 'Events',
    'مشاريع': 'Projects',
    'إعلانات': 'Announcements',
};

function getCategoryLabel(category: string, locale: string) {
    if (locale === 'ar') return category;
    return CATEGORY_MAP[category] || category;
}

export default async function NewsPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations();

    const result = await getPublishedNews();
    const newsList = result.success ? (result.data as any[]) : [];

    return (
        <div className="container mx-auto px-4 py-12 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('public.news.title')}</h1>
                <p className="text-muted-foreground text-lg">
                    {t('public.news.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsList.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 shadow-sm group rounded-3xl h-full flex flex-col">
                        <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                                <Image
                                    src={item.images[0]}
                                    alt={locale === 'ar' ? item.titleAr : item.titleEn}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300">
                                    <span className="text-4xl font-bold opacity-20">NEWS</span>
                                </div>
                            )}
                            {item.category && (
                                <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-sm border-none px-3 py-1 text-xs font-medium rounded-full">
                                    {getCategoryLabel(item.category, locale)}
                                </Badge>
                            )}
                        </div>
                        <CardHeader className="pb-3">
                            <div className="flex items-center text-xs font-medium text-slate-500 mb-3 gap-2">
                                <span className="flex items-center bg-slate-100 px-2 py-1 rounded-full">
                                    <Calendar className="w-3 h-3 me-1" />
                                    {item.publishedAt ? format(new Date(item.publishedAt), 'dd/MM/yyyy') : ''}
                                </span>
                            </div>
                            <CardTitle className="line-clamp-2 leading-tight text-xl group-hover:text-primary transition-colors">
                                {locale === 'ar' ? item.titleAr : item.titleEn}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                                {item.excerpt || (
                                    (locale === 'ar' ? item.contentAr : item.contentEn)
                                        ? (locale === 'ar' ? item.contentAr : item.contentEn).slice(0, 100) + '...'
                                        : ''
                                )}
                            </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button asChild variant="ghost" className="w-full justify-between hover:bg-primary hover:text-white group/btn rounded-xl transition-all duration-300">
                                <Link href={`/news/${item.slug}`}>
                                    {t('public.news.readMore')}
                                    <ArrowRight className="w-4 h-4 ms-2 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {newsList.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-lg">
                    <p className="text-muted-foreground text-xl">{t('admin.newsPage.empty')}</p>
                </div>
            )}
        </div>
    );
}
