import prisma from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import RequestActionPanel from '@/components/admin/request-action-panel';
import { RequestChat } from '@/components/requests/request-chat';
import { getTranslations } from 'next-intl/server';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RequestDetailsPage({ params }: Props) {
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
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-start">
                    {/* Manual concatenation for ID to avoid direction issues */}
                    {t('requests.details')} <span dir="ltr">#{request.requestNo}</span>
                </h1>
                <p className="text-muted-foreground text-start">{t('employee.requestsPage.title')}</p>
            </div>

            <RequestActionPanel request={request} user={request.user} />

            <div className="mt-8">
                <RequestChat requestId={request.id} />
            </div>
        </div>
    );
}
