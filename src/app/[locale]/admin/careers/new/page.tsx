import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { JobForm } from '@/components/admin/careers/job-form';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function NewJobPage({ params }: Props) {
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const t = await getTranslations();
    const isAr = locale === 'ar';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'إضافة وظيفة جديدة' : 'Add New Job'}</h1>
            <JobForm locale={locale} />
        </div>
    );
}
