import prisma from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import RequestActionPanel from '@/components/admin/request-action-panel';
import { RequestChat } from '@/components/requests/request-chat';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RequestDetailsPage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations();

    const [request, session] = await Promise.all([
        prisma.request.findUnique({
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
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                documents: true,
                notes: true
            }
        }),
        auth.api.getSession({ headers: await headers() })
    ]);

    if (!request) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-start">
                    {t('requests.details')} <span dir="ltr">#{request.requestNo}</span>
                </h1>
                <p className="text-muted-foreground text-start">{t('employee.requestsPage.title')}</p>
            </div>

            <RequestActionPanel
                request={request}
                user={request.user}
                currentUserId={session?.user?.id}
            />

            <div className="mt-8">
                <RequestChat requestId={request.id} />
            </div>
        </div>
    );
}
