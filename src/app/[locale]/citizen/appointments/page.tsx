import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CancelAppointmentButton } from '@/components/appointments/cancel-appointment-button';

import { getUserAppointments } from '@/actions/appointment.actions';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function AppointmentsPage() {
    const t = await getTranslations();
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) return null;

    const result = await getUserAppointments(session.user.id);
    const appointments = result.success ? (result.data as any[]) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-slate-100 text-slate-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        return t(`services.appointments.status.${status}`);
    };

    const getServiceLabel = (type: string) => {
        // Try to translate using known keys, otherwise fallback to type
        // Note: For fully dynamic types added by admin, we should ideally fetch the nameEn/nameAr from DB.
        // But for MVP/hybrid, we can check if it's one of the known keys or just return type.
        // A better approach for the listing page is to fetch the service name from the relation if possible, 
        // OR rely on the fact that we might have added them to en.json/ar.json.

        // Since we are moving to dynamic, let's try to map the known ones using t() correctly,
        // and for unknown ones, just display the slug or ideally we should have stored the name snapshot.
        // Given current DB schema doesn't store name snapshot in Appointment, we might need to join with ServiceType?
        // Appointment schema has: serviceType String. It matches ServiceType.slug.
        // So we really should fetch the ServiceType details or use a lookup.

        // For now, let's use t() which handles the core ones we seeded.
        // If it's a new custom one, it will fallback to the key path if not found, so we might want to handle that.
        // Actually, t() with next-intl throws if not found unless fallback is configured.

        // Safest bet for now to fix the "Mixed Language" issue reported:
        // Use t() for the known ones.
        return t(`services.appointments.book.types.${type}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t('services.appointments.pageTitle')}
                </h1>
                <Button asChild>
                    <Link href="/citizen/appointments/book">
                        <Plus className="w-4 h-4 me-2" />
                        {t('services.appointments.newAppointment')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('services.appointments.empty.title')}</h3>
                            <p className="text-slate-500 mb-4">{t('services.appointments.empty.description')}</p>
                            <Button asChild variant="outline">
                                <Link href="/citizen/appointments/book">{t('services.appointments.empty.button')}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    appointments.map((apt) => (
                        <Card key={apt.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{getServiceLabel(apt.serviceType)}</CardTitle>
                                        <div className="text-sm text-slate-500">
                                            {format(new Date(apt.date), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(apt.status)}>
                                        {getStatusLabel(apt.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{apt.timeSlot}</span>
                                    </div>
                                    {apt.notes && (
                                        <div className="w-full bg-muted/40 p-2 rounded text-xs mt-2">
                                            {apt.notes}
                                        </div>
                                    )}
                                </div>
                                {['SCHEDULED', 'CONFIRMED'].includes(apt.status) && (
                                    <div className="mt-4 flex justify-end">
                                        <CancelAppointmentButton appointmentId={apt.id} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
