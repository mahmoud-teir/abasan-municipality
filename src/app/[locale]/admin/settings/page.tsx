
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/shared/profile-form';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ThemeSelector } from '@/components/admin/settings/theme-selector';
import { getSystemSetting } from '@/actions/settings.actions';
import { AboutImageManager } from '@/components/admin/about-image-manager';
import { FontSelector } from '@/components/admin/settings/font-selector';
import { BackupCard } from '@/components/admin/settings/backup-card';
import { ARABIC_FONTS, ENGLISH_FONTS } from '@/lib/fonts';
import { Lightbulb, MessageCircle, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { MaintenanceToggle } from '@/components/admin/settings/maintenance-toggle';
import { SocialLinksForm } from '@/components/admin/settings/social-links-form';
import { LogoManager } from '@/components/admin/settings/logo-manager';

export default async function AdminSettingsPage() {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect('/login');

    const [
        theme,
        fontArabic,
        fontEnglish,
        aboutImage,
        maintenanceMode,
        siteLogo,
        siteFavicon,
        facebook,
        twitter,
        instagram,
        youtube,
        website
    ] = await Promise.all([
        getSystemSetting('theme'),
        getSystemSetting('font_arabic'),
        getSystemSetting('font_english'),
        getSystemSetting('about_image_url'),
        getSystemSetting('maintenance_mode'),
        getSystemSetting('site_logo'),
        getSystemSetting('site_favicon'),
        getSystemSetting('social_facebook'),
        getSystemSetting('social_twitter'),
        getSystemSetting('social_instagram'),
        getSystemSetting('social_youtube'),
        getSystemSetting('social_website'),
    ]);

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('admin.settings')}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t('admin.settingsPage.subtitle')}
                </p>
            </div>

            <div className="grid gap-8">
                {/* Critical Actions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <MaintenanceToggle initialValue={maintenanceMode || 'false'} />
                    <LogoManager logoUrl={siteLogo || ''} faviconUrl={siteFavicon || ''} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SocialLinksForm initialLinks={{
                        facebook: facebook || '',
                        twitter: twitter || '',
                        instagram: instagram || '',
                        youtube: youtube || '',
                        website: website || ''
                    }} />
                    <div className="space-y-8">
                        <ThemeSelector currentTheme={theme || 'default'} />
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">{t('admin.settingsPage.typography')}</h3>
                            <div className="grid gap-4">
                                <FontSelector
                                    type="arabic"
                                    currentFont={fontArabic || 'cairo'}
                                    fonts={ARABIC_FONTS}
                                    label={t('admin.settingsPage.arabicFont')}
                                />
                                <FontSelector
                                    type="english"
                                    currentFont={fontEnglish || 'outfit'}
                                    fonts={ENGLISH_FONTS}
                                    label={t('admin.settingsPage.englishFont')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AboutImageManager currentImageUrl={aboutImage} />

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Link href="/admin/settings/faq" className="block h-full">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white border shadow-sm rounded-lg text-primary">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{t('admin.settingsPage.chat.title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('admin.settingsPage.chat.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/admin/settings/hero" className="block h-full">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white border shadow-sm rounded-lg text-primary">
                                            <MonitorPlay className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{t('admin.settingsPage.hero.title')}</h3>
                                            <p className="text-sm text-muted-foreground">{t('admin.settingsPage.hero.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <BackupCard />
                    </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{t('admin.settingsPage.suggestions.title')}</h3>
                            <ul className="space-y-2 text-slate-600 list-disc list-inside">
                                <li>{t('admin.settingsPage.suggestions.logo')}</li>
                                <li>{t('admin.settingsPage.suggestions.social')}</li>
                                <li>{t('admin.settingsPage.suggestions.hero')}</li>
                                <li>{t('admin.settingsPage.suggestions.maintenance')}</li>
                                <li>{t('admin.settingsPage.suggestions.analytics')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8">
                    <h2 className="text-xl font-semibold mb-4">{t('admin.settingsPage.profile')}</h2>
                    <ProfileForm user={session.user} />
                </div>
            </div>
        </div>
    );
}
