import { NextIntlClientProvider } from 'next-intl';
// Layout for handling locale context
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { AutoLogoutProvider } from "@/components/providers/auto-logout-provider";
import { AlertBanner } from '@/components/ui/alert-banner';
import { GlobalChatWidget } from '@/components/chat/global-chat-widget';
import { getSystemSetting } from '@/actions/settings.actions';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { MaintenanceScreen } from '@/components/shared/maintenance-screen';

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Fetch data in parallel
    const [messages, maintenanceMode, session] = await Promise.all([
        getMessages(),
        getSystemSetting('maintenance_mode'),
        auth.api.getSession({
            headers: await headers()
        })
    ]);

    // Check Maintenance Mode
    if (maintenanceMode === 'true') {
        const userRole = session?.user?.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (!isAdmin) {
            const isRTL = locale === 'ar';
            return (
                <div dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <MaintenanceScreen />
                    </NextIntlClientProvider>
                </div>
            );
        }
    }

    const isRTL = locale === 'ar';

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
            <NextIntlClientProvider messages={messages} locale={locale}>
                <AlertBanner />
                <AutoLogoutProvider>
                    {children}
                    <GlobalChatWidget />
                </AutoLogoutProvider>
            </NextIntlClientProvider>
        </div>
    );
}
