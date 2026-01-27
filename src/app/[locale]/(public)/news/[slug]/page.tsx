import { getNewsBySlug } from '@/actions/news.actions';
import { ShareComponent } from '@/components/news/share-component';
import { CommentsSection } from '@/components/news/comments-section';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { Metadata } from 'next';

// ... existing imports

type Props = {
    params: Promise<{ slug: string; locale: string }>;
};

// ... CATEGORY_MAP ...

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const result = await getNewsBySlug(slug);

    if (!result.success || !result.data) {
        return {
            title: 'Not Found',
        };
    }

    const news = result.data;
    const title = locale === 'ar' ? news.titleAr : news.titleEn;
    const description = news.excerpt || (locale === 'ar' ? news.contentAr : news.contentEn).substring(0, 160);
    const imageUrl = news.images && news.images.length > 0 ? news.images[0] : ''; // Fallback image if needed. 
    // Usually absolute URL is preferred but Next.js resolves relative if base is set in layout. 
    // But for safety, external services prefer absolute. 
    // Assuming images are uploaded and are full URLs or relative.

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            type: 'article',
            url: `/news/${slug}`,
            images: imageUrl ? [imageUrl] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

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

export default async function SingleNewsPage({ params }: Props) {
    const { slug, locale } = await params;
    const t = await getTranslations();

    const result = await getNewsBySlug(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    const newsItem = result.data;

    return (
        <article className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <div className="mb-8">
                    <Button variant="ghost" asChild className="hover:bg-slate-200">
                        <Link href="/news">
                            <ArrowLeft className="w-4 h-4 me-2" />
                            {t('public.news.back')}
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <header className="space-y-6 mb-12">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {newsItem.category && (
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-sm py-1 px-3">
                                {getCategoryLabel(newsItem.category, locale)}
                            </Badge>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {newsItem.publishedAt ? format(new Date(newsItem.publishedAt), 'MMMM dd, yyyy', { locale: locale === 'ar' ? ar : enUS }) : ''}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                        {locale === 'ar' ? newsItem.titleAr : newsItem.titleEn}
                    </h1>
                </header>

                {/* Content */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm prose prose-lg prose-slate max-w-none dark:prose-invert">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {locale === 'ar' ? newsItem.contentAr : newsItem.contentEn}
                    </ReactMarkdown>
                </div>

                {/* Additional Images Gallery */}
                {newsItem.images && newsItem.images.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                        {newsItem.images.slice(1).map((img, index) => (
                            <div key={index} className="relative h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                <Image
                                    src={img}
                                    alt={`${locale === 'ar' ? newsItem.titleAr : newsItem.titleEn} - ${index + 2}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Share/Footer */}
                <div className="mt-8 pt-8 border-t flex justify-between items-center">
                    <p className="text-muted-foreground font-medium">{t('public.news.share')}</p>
                    <ShareComponent
                        title={locale === 'ar' ? newsItem.titleAr : newsItem.titleEn}
                        locale={locale}
                    />
                </div>

                {/* Comments */}
                <CommentsSection newsId={newsItem.id} locale={locale} />
            </div>
        </article>
    );
}
