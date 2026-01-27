import prisma from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import AppointmentActionPanel from '@/components/admin/appointment-action-panel';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AppointmentDetailsPage({ params }: Props) {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                }
            }
        }
    });

    if (!appointment) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">تفاصيل الموعد</h1>
                <p className="text-muted-foreground">تأكيد وإدارة حجز الموعد.</p>
            </div>

            <AppointmentActionPanel appointment={appointment} />
        </div>
    );
}
