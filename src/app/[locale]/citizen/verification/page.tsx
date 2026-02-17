import { IdVerification } from '@/components/citizen/id-verification';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDashboardLink } from '@/lib/role-utils';

export default async function VerificationPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Server-side check: if user is already verified, redirect to dashboard
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user?.emailVerified) {
        const role = (session.user as any).role || 'CITIZEN';
        redirect(`/${locale}${getDashboardLink(role)}`);
    }

    return (
        <div className="container py-8 flex flex-col items-center justify-center min-h-[80vh]">
            <IdVerification />
        </div>
    );
}
