'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createComplaint } from '@/actions/complaint.actions';
import { createComplaintSchema, CreateComplaintInput } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
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
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/map-picker').then(mod => mod.MapPicker), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function NewComplaintPage() {
    const t = useTranslations();
    const router = useRouter();
    const { data: session } = useSession();

    const form = useForm<CreateComplaintInput>({
        resolver: zodResolver(createComplaintSchema),
        defaultValues: {
            title: '',
            description: '',
            category: 'OTHER',
            location: '',
        },
    });

    async function onSubmit(data: CreateComplaintInput) {
        if (!session?.user?.id) {
            toast.error(t('common.error'));
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, value.toString());
        });

        const result = await createComplaint(session.user.id, formData);

        if (result.success) {
            toast.success(t('services.complaints.form.success'));
            router.refresh();
            router.push('/citizen/complaints');
        } else {
            toast.error(result.error || t('common.error'));
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/citizen/complaints">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">{t('dashboard.newComplaint')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('services.complaints.form.title')}</CardTitle>
                    <CardDescription>
                        {t('services.complaints.form.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.complaints.form.subjectLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('services.complaints.form.subjectPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.complaints.form.categoryLabel')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('services.complaints.form.categoryPlaceholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="ROADS">{t('services.complaints.categories.ROADS')}</SelectItem>
                                                    <SelectItem value="WATER">{t('services.complaints.categories.WATER')}</SelectItem>
                                                    <SelectItem value="ELECTRICITY">{t('services.complaints.categories.ELECTRICITY')}</SelectItem>
                                                    <SelectItem value="SEWAGE">{t('services.complaints.categories.SEWAGE')}</SelectItem>
                                                    <SelectItem value="GARBAGE">{t('services.complaints.categories.GARBAGE')}</SelectItem>
                                                    <SelectItem value="PARKS">{t('services.complaints.categories.PARKS')}</SelectItem>
                                                    <SelectItem value="NOISE">{t('services.complaints.categories.NOISE')}</SelectItem>
                                                    <SelectItem value="OTHER">{t('services.complaints.categories.OTHER')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('services.complaints.form.locationLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('services.complaints.form.locationPlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Map Picker */}
                            <div className="space-y-2">
                                <FormLabel>{t('services.complaints.form.mapLabel') || 'Pinpoint Location'}</FormLabel>
                                <div className="rounded-md border overflow-hidden">
                                    <MapPicker
                                        onChange={(pos) => {
                                            form.setValue('latitude', pos.lat);
                                            form.setValue('longitude', pos.lng);
                                        }}
                                    />
                                </div>
                                <input type="hidden" {...form.register('latitude')} />
                                <input type="hidden" {...form.register('longitude')} />
                            </div>

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.complaints.form.imageLabel')}</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                                                            <span className="font-semibold text-xs uppercase text-muted-foreground">
                                                                {t('common.upload')}
                                                            </span>
                                                        </div>
                                                        <Input
                                                            {...fieldProps}
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                                            onChange={(event) => {
                                                                const file = event.target.files && event.target.files[0];
                                                                if (file) {
                                                                    onChange(file);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 text-sm text-muted-foreground truncate">
                                                        {value ? (
                                                            <span className="text-green-600 font-medium flex items-center gap-2">
                                                                ✓ {value.name}
                                                            </span>
                                                        ) : (
                                                            <span>{t('services.complaints.form.noFileChosen') || 'No file chosen'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('services.complaints.form.detailsLabel')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('services.complaints.form.detailsPlaceholder')}
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t('services.complaints.form.detailsHint')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                        {t('services.complaints.form.submitting')}
                                    </>
                                ) : (
                                    t('services.complaints.form.submit')
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
