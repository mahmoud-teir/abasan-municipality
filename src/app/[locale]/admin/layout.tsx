import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // ... auth check ...
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AdminSidebar />
            <div className="md:ps-72 min-h-screen transition-all duration-300 ease-in-out flex flex-col">
                <AdminHeader />
                <main className="container mx-auto p-4 md:p-8 pt-6 animate-fade-in flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
