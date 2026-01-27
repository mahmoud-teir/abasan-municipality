import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function PaymentsPage() {
    const t = await getTranslations('services.payments.comingSoon');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Hammer className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-xl text-muted-foreground max-w-md">
                {t('description')}
            </p>
            <Button asChild>
                <Link href="/citizen/dashboard">{t('back')}</Link>
            </Button>
        </div>
    );
}
