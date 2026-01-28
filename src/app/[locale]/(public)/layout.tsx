import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EmergencyBanner } from '@/components/ui/emergency-banner';

import { getSystemSetting } from '@/actions/settings.actions';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch social media links
    const [
        facebook,
        twitter,
        instagram,
        youtube,
        website
    ] = await Promise.all([
        getSystemSetting('social_facebook'),
        getSystemSetting('social_twitter'),
        getSystemSetting('social_instagram'),
        getSystemSetting('social_youtube'),
        getSystemSetting('social_website'),
    ]);

    const socialLinks = {
        facebook: facebook || undefined,
        twitter: twitter || undefined,
        instagram: instagram || undefined,
        youtube: youtube || undefined,
        website: website || undefined,
    };

    return (
        <div className="flex flex-col min-h-screen">
            <EmergencyBanner />
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer socialLinks={socialLinks} />
        </div>
    );
}
