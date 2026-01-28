import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { JobForm } from '@/components/admin/careers/job-form';
import prisma from '@/lib/db/prisma';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function EditJobPage({ params }: Props) {
    const { locale, id } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const job = await prisma.job.findUnique({
        where: { id },
    });

    if (!job) {
        notFound();
    }

    const t = await getTranslations();
    const isAr = locale === 'ar';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'تعديل الوظيفة' : 'Edit Job'}</h1>
            <JobForm locale={locale} job={job} />
        </div>
    );
}
