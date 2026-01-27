import { NextIntlClientProvider } from 'next-intl';
// Layout for handling locale context
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { AutoLogoutProvider } from "@/components/providers/auto-logout-provider";
import { AlertBanner } from '@/components/ui/alert-banner';
import { GlobalChatWidget } from '@/components/chat/global-chat-widget';

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

    // Get messages for the current locale
    const messages = await getMessages();

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
