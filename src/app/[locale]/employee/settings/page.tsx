
import { getTranslations } from 'next-intl/server';
import { ProfileForm } from '@/components/shared/profile-form';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function EmployeeSettingsPage() {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect('/login');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {t('common.settings')}
            </h1>

            <ProfileForm user={session.user} />
        </div>
    );
}
