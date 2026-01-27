import prisma from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import RequestActionPanel from '@/components/admin/request-action-panel';
import { RequestChat } from '@/components/requests/request-chat';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminRequestDetailsPage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations();

    const request = await prisma.request.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                }
            },
            documents: true,
            notes: true
        }
    });

    if (!request) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/requests">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-start flex items-center gap-2">
                        {t('requests.details')}
                        <span dir="ltr" className="text-muted-foreground">#{request.requestNo || request.id.substring(0, 8)}</span>
                    </h1>
                </div>
            </div>

            <RequestActionPanel request={request} user={request.user} />

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">{t('admin.chat') || 'Chat & History'}</h2>
                <RequestChat requestId={request.id} />
            </div>
        </div>
    );
}
