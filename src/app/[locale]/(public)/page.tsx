import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Building2,
    MessageSquare,
    Calendar,
    CreditCard,
    Users,
    CheckCircle,
    Headphones,
    Layers,
    ArrowRight
} from 'lucide-react';
import prisma from '@/lib/db/prisma';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getActiveHeroSlides } from '@/actions/hero.actions';
import { HeroSlider } from '@/components/home/hero-slider';
type Props = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations(); // await for server component

    // Fetch Latest News
    const latestNews = await prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
    });

    const services = [
        { icon: Building2, key: 'buildingPermit', href: '/citizen/requests/new' },
        { icon: MessageSquare, key: 'complaints', href: '/citizen/complaints' },
        { icon: Calendar, key: 'appointments', href: '/citizen/appointments' },
        { icon: CreditCard, key: 'payments', href: '/citizen/payments' },
    ];

    // Fetch Stats
    const [citizensCount, requestsCount] = await Promise.all([
        prisma.user.count({ where: { role: 'CITIZEN' } }),
        prisma.request.count({ where: { status: 'APPROVED' } }), // Count approved requests
    ]);

    const stats = [
        { icon: Users, value: `${citizensCount}+`, key: 'citizens' },
        { icon: CheckCircle, value: `${requestsCount}+`, key: 'requests' },
        { icon: Layers, value: '8+', key: 'services' }, // We have ~8 services defined
        { icon: Headphones, value: '24/7', key: 'support' },
    ];

    const categoryMap: Record<string, string> = {
        'أخبار عامة': 'General News',
        'بيئة و تراخيص': 'Environment & Permits',
        'تراخيص بيئة': 'Environment Permits',
        'الصحة والبيئة': 'Health & Environment',
        'مشاريع': 'Projects',
        'فعاليات': 'Events',
        'إعلانات': 'Announcements',
        'خدمات': 'Services',
        'تراخيص': 'Permits',
        'بيئة': 'Environment'
    };

    // Fetch Active Hero Slides
    const heroSlides = await getActiveHeroSlides();

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <HeroSlider
                slides={heroSlides}
                defaultTitle={t('home.hero.title')}
                defaultSubtitle={t('home.hero.subtitle')}
                locale={locale}
            />


            {/* Services Section */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 relative">
                        {t('home.services.title')}
                        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded-full"></span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service) => (
                            <Link key={service.key} href={service.href} className="group">
                                <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                                    <CardHeader className="text-center pb-2">
                                        <div className="w-16 h-16 mx-auto bg-primary/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
                                            <service.icon className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
                                        </div>
                                        <CardTitle className="mt-2 text-xl">
                                            {t(`home.services.${service.key}`)}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center text-muted-foreground text-sm">
                                        {t('home.services.cardDescription')}
                                    </CardContent>
                                    <CardFooter className="justify-center pt-0 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="flex items-center gap-1">{t('home.services.startService')} <ArrowRight className="w-4 h-4" /></span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 md:py-24 bg-slate-900 text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        {t('home.stats.title')}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.key} className="text-center p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-500 transition-colors">
                                <stat.icon className="w-10 h-10 mx-auto text-blue-400 mb-4" />
                                <p className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-slate-400 font-medium">
                                    {t(`home.stats.${stat.key}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div className="space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                {t('home.news.title')}
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                {t('home.news.subtitle')}
                            </p>
                        </div>
                        <Button variant="ghost" asChild className="hidden md:inline-flex group">
                            <Link href="/news">
                                {t('home.news.viewAll')} <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {latestNews.length === 0 ? (
                            [1, 2, 3].map((i) => (
                                <Card key={i} className="overflow-hidden border border-slate-100 shadow-sm opacity-50 rounded-3xl h-full">
                                    <div className="h-56 bg-slate-100 flex items-center justify-center animate-pulse">
                                        <span className="text-slate-300">Loading...</span>
                                    </div>
                                    <CardHeader>
                                        <div className="h-6 bg-slate-100 rounded w-3/4 mb-2 animate-pulse"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                                    </CardHeader>
                                </Card>
                            ))
                        ) : (
                            latestNews.map((item: any) => (
                                <Card key={item.id} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col rounded-3xl">
                                    <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                                        {item.images && item.images.length > 0 ? (
                                            <Image
                                                src={item.images[0]}
                                                alt={locale === 'ar' ? item.titleAr : item.titleEn}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300 bg-slate-100">
                                                <span className="text-2xl font-bold opacity-20">NEWS</span>
                                            </div>
                                        )}
                                        {item.category && (
                                            <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-sm border-none px-3 py-1 text-xs font-medium rounded-full cursor-default">
                                                {locale === 'en' ? (
                                                    categoryMap[(item.category as string).trim()] || item.category
                                                ) : item.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardHeader className="flex-1 pb-3">
                                        <div className="flex items-center text-xs font-medium text-slate-500 mb-3 gap-2">
                                            <span className="flex items-center bg-slate-100 px-2 py-1 rounded-full">
                                                <Calendar className="w-3 h-3 me-1" />
                                                {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''}
                                            </span>
                                        </div>
                                        <CardTitle className="line-clamp-2 leading-tight text-xl group-hover:text-primary transition-colors">
                                            <Link href={`/news/${item.slug}`}>
                                                {locale === 'ar' ? item.titleAr : item.titleEn}
                                            </Link>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-3 pt-2 text-slate-600 leading-relaxed">
                                            {item.excerpt || (locale === 'ar' ? item.contentAr.substring(0, 100) : item.contentEn.substring(0, 100)) + '...'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="pt-0 pb-6">
                                        <Button asChild variant="ghost" className="w-full justify-between hover:bg-primary hover:text-white group/btn rounded-xl transition-all duration-300 px-0 hover:px-4">
                                            <Link href={`/news/${item.slug}`}>
                                                {t('home.news.readMore')}
                                                <ArrowRight className="w-4 h-4 ms-2 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
// Force rebuild to fix negative timestamp error
