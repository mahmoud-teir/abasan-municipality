
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/shared/profile-form';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ThemeSelector } from '@/components/admin/theme-selector';
import { getSystemSetting } from '@/actions/settings.actions';
import { AboutImageManager } from '@/components/admin/about-image-manager';
import { FontSelector } from '@/components/admin/font-selector';
import { BackupCard } from '@/components/admin/settings/backup-card';
import { Lightbulb, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSettingsPage() {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect('/login');

    const [theme, fontArabic, fontEnglish, aboutImage] = await Promise.all([
        getSystemSetting('theme'),
        getSystemSetting('font_arabic'),
        getSystemSetting('font_english'),
        getSystemSetting('about_image_url'),
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
                <ThemeSelector currentTheme={theme} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FontSelector
                        currentArabicFont={fontArabic}
                        currentEnglishFont={fontEnglish}
                    />
                    <AboutImageManager currentImageUrl={aboutImage} />
                    <AboutImageManager currentImageUrl={aboutImage} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/admin/settings/faq" className="block">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white border shadow-sm rounded-lg text-primary">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Chat Responses</h3>
                                    <p className="text-sm text-muted-foreground">Manage bot FAQs</p>
                                </div>
                            </div>
                        </div>
                    </Link>
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

                <BackupCard />

                <div className="border-t pt-8">
                    <h2 className="text-xl font-semibold mb-4">{t('admin.settingsPage.profile')}</h2>
                    <ProfileForm user={session.user} />
                </div>
            </div>
        </div>
    );
}
