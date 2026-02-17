import { BroadcastSender } from "@/components/admin/notifications/broadcast-sender";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
    const t = await getTranslations('admin.notifications');
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect('/login');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <BroadcastSender userId={session.user.id} />
        </div>
    );
}
