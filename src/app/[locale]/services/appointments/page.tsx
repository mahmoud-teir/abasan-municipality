import { AppointmentBooking } from '@/components/services/appointment-booking';
import { getTranslations } from 'next-intl/server';
import { CalendarDays } from 'lucide-react';

export default async function AppointmentsPage() {
    const t = await getTranslations('services'); // Assuming services namespace

    return (
        <div className="container py-10 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                <div className="p-3 bg-primary/10 rounded-full">
                    <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
                <p className="text-muted-foreground text-lg">
                    Schedule a meeting with our municipal departments to discuss your needs in person.
                    Please perform a booking request and wait for confirmation.
                </p>
            </div>

            <AppointmentBooking />
        </div>
    );
}
