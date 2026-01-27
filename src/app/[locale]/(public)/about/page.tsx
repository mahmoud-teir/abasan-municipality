import { getSystemSetting } from '@/actions/settings.actions';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, History, Target, Users } from 'lucide-react';
import Image from 'next/image';

export default async function AboutPage() {
    const t = await getTranslations('public.about');
    const customImage = await getSystemSetting('about_image_url');
    const imageSrc = customImage || '/about/municipality.png';

    return (
        <div className="container mx-auto px-4 py-12 space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                    {t('title')}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    {t('description')}
                </p>
            </section>

            {/* History Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <History className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900">{t('historyTitle')}</h2>
                    </div>
                    <p className="text-lg text-slate-600 leading-8">
                        {t('historyText')}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="border border-slate-200 rounded-xl p-4 text-center">
                            <strong className="block text-3xl font-bold text-blue-600 mb-1">1950</strong>
                            <span className="text-sm text-slate-500">{t('foundedYear')}</span>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-4 text-center">
                            <strong className="block text-3xl font-bold text-blue-600 mb-1">50k+</strong>
                            <span className="text-sm text-slate-500">{t('population')}</span>
                        </div>
                    </div>
                </div>
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src={imageSrc}
                        alt={t('title')}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                        priority
                    />
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-50 border-none shadow-none hover:bg-slate-100 transition-colors">
                    <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4">
                            <Target className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{t('visionTitle')}</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {t('visionText')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-50 border-none shadow-none hover:bg-slate-100 transition-colors">
                    <CardContent className="p-8 space-y-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{t('missionTitle')}</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {t('missionText')}
                        </p>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
