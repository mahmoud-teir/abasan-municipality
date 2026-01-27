import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Building2,
    FileText,
    Calendar,
    CreditCard,
    ClipboardList,
    MapPin,
    Lightbulb,
    Droplets,
    Trees,
    Truck,
    ArrowRight
} from 'lucide-react';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('services');

    const services = [
        {
            icon: Building2,
            key: 'buildingPermit',
            href: '/citizen/requests/new?type=BUILDING_PERMIT',
            category: 'engineering'
        },
        {
            icon: FileText,
            key: 'complaints',
            href: '/citizen/complaints',
            category: 'general'
        },
        {
            icon: Calendar,
            key: 'appointments',
            href: '/citizen/appointments',
            category: 'general'
        },
        {
            icon: CreditCard,
            key: 'payments',
            href: '/citizen/payments',
            category: 'financial'
        },
        {
            icon: Lightbulb,
            key: 'lighting',
            href: '/citizen/requests/new?type=LIGHTING',
            category: 'maintenance'
        },
        {
            icon: Droplets,
            key: 'water',
            href: '/citizen/requests/new?type=WATER',
            category: 'maintenance'
        },
        {
            icon: Trees,
            key: 'garding',
            href: '/citizen/requests/new?type=GARDENING',
            category: 'environment'
        },
        {
            icon: Truck,
            key: 'waste',
            href: '/citizen/requests/new?type=WASTE',
            category: 'environment'
        }
    ];

    const categories = ['engineering', 'financial', 'general', 'maintenance', 'environment'];

    return (
        <main className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
            </div>

            <div className="space-y-16">
                {categories.map((category) => {
                    const categoryServices = services.filter(s => s.category === category);
                    if (categoryServices.length === 0) return null;

                    return (
                        <div key={category} className="space-y-6">
                            <h2 className="text-2xl font-bold border-b pb-2">{t(`categories.${category}`)}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {categoryServices.map((service) => (
                                    <Card key={service.key} className="hover:shadow-lg transition-all group">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                                <service.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <CardTitle>{t(`items.${service.key}.title`)}</CardTitle>
                                            <CardDescription>{t(`items.${service.key}.description`)}</CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button asChild variant="ghost" className="w-full justify-between group-hover:text-primary">
                                                <Link href={service.href}>
                                                    {t('applyNow')}
                                                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </main>
    );
}
