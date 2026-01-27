
import { NewRequestForm } from './new-request-form';
import { getServiceTypes } from '@/actions/service.actions';
import { getLocale } from 'next-intl/server';

export default async function NewRequestPage() {
    const locale = await getLocale();
    const result = await getServiceTypes(locale as 'ar' | 'en');
    const services = result.success ? result.data : [];

    return <NewRequestForm services={services} />;
}
