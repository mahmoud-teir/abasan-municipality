import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectForm } from '@/components/admin/projects/project-form';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function NewProjectPage({ params }: Props) {
    const { locale } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = session?.user as any;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const t = await getTranslations();
    const isAr = locale === 'ar';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'إضافة مشروع جديد' : 'Add New Project'}</h1>
            <ProjectForm locale={locale} />
        </div>
    );
}
