import { getLocale } from 'next-intl/server';
import { getServiceTypes } from '@/actions/service.actions';
import AppointmentForm from './appointment-form';

export default async function BookAppointmentPage() {
    const locale = await getLocale();
    const result = await getServiceTypes(locale as 'ar' | 'en');
    const services = result.success ? result.data : [];

    return <AppointmentForm services={services} />;
}
