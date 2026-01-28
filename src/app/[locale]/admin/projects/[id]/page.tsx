import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectForm } from '@/components/admin/projects/project-form';
import prisma from '@/lib/db/prisma';

type Props = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
    const { locale, id } = await params;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const user = session?.user as any;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        redirect('/login');
    }

    const project = await prisma.project.findUnique({
        where: { id },
    });

    if (!project) {
        notFound();
    }

    const t = await getTranslations();
    const isAr = locale === 'ar';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">{isAr ? 'تعديل المشروع' : 'Edit Project'}</h1>
            <ProjectForm locale={locale} project={project} />
        </div>
    );
}
