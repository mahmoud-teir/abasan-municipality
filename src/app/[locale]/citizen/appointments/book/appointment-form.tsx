'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createAppointment } from '@/actions/appointment.actions';
import { createAppointmentSchema, CreateAppointmentInput } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import Link from 'next/link';
import { ServiceType } from '@prisma/client';

// Simple time slots for MVP
const TIME_SLOTS = [
    "08:30", "09:00", "09:30", "10:00",
    "10:30", "11:00", "11:30", "12:00",
    "12:30", "13:00"
];

interface AppointmentFormProps {
    services: { value: string; label: string }[];
}

export default function AppointmentForm({ services }: AppointmentFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const { data: session } = useSession();

    const form = useForm<CreateAppointmentInput>({
        resolver: zodResolver(createAppointmentSchema),
        defaultValues: {
            serviceType: '',
            date: '',
            timeSlot: '',
            notes: '',
        },
    });

    async function onSubmit(data: CreateAppointmentInput) {
        if (!session?.user?.id) {
            toast.error(t('common.error'));
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, value.toString());
        });

        const result = await createAppointment(session.user.id, formData);

        if (result.success) {
            toast.success(t('services.appointments.book.success'));
            router.refresh();
            router.push('/citizen/appointments');
        } else {
            toast.error(result.error || t('common.error'));
        }
    }

    // Get tomorrow's date for min date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/citizen/appointments">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{t('services.appointments.book.title')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('services.appointments.book.details')}</CardTitle>
                    <CardDescription>
                        {t('services.appointments.book.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="serviceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.appointments.book.serviceType')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('services.appointments.book.selectService')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {services.length > 0 ? (
                                                    services.map((service) => (
                                                        <SelectItem key={service.value} value={service.value}>
                                                            {service.label}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    // This case should be rare if seeded
                                                    <SelectItem value="OTHER">{t('services.appointments.book.types.OTHER')}</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.appointments.book.date')}</FormLabel>
                                            <FormControl>
                                                <Input type="date" min={minDate} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="timeSlot"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.appointments.book.time')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('services.appointments.book.selectTime')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {TIME_SLOTS.map((slot) => (
                                                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.appointments.book.notes')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('services.appointments.book.notesPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                        {t('services.appointments.book.submitting')}
                                    </>
                                ) : (
                                    t('services.appointments.book.submit')
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
