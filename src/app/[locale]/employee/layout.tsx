import { EmployeeSidebar } from '@/components/layout/employee-sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export default async function EmployeeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'EMPLOYEE' &&
        session.user.role !== 'ADMIN' &&
        session.user.role !== 'SUPER_ADMIN' &&
        session.user.role !== 'ENGINEER' &&
        session.user.role !== 'SUPERVISOR'
    ) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <EmployeeSidebar />
            <div className="md:ps-72 min-h-screen transition-all duration-300 ease-in-out">
                <header className="h-16 border-b bg-white flex items-center justify-end px-4 md:px-8 sticky top-0 md:static w-full z-10">
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8 pt-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
