import { UserNav } from '@/components/layout/user-nav';
import { CitizenSidebar } from '@/components/layout/citizen-sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

import { VerificationGuard } from '@/components/auth/verification-guard';

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20">
            <CitizenSidebar />
            <div className="md:ps-72 min-h-screen transition-all duration-300 ease-in-out">
                {/* Mobile Header */}
                <header className="h-16 border-b bg-card flex items-center justify-end px-4 md:px-8 absolute top-0 w-full z-10 md:static">
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <UserNav />
                    </div>
                </header>
                <main className="container mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-fade-in">
                    <VerificationGuard>
                        {children}
                    </VerificationGuard>
                </main>
            </div>
        </div>
    );
}
