'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createJob, updateJob } from '@/actions/job.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const jobSchema = z.object({
    titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
    titleEn: z.string().min(1, 'English title is required'),
    department: z.string().optional(),
    type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP']),
    descriptionAr: z.string().min(1, 'الوصف العربي مطلوب'),
    descriptionEn: z.string().min(1, 'English description is required'),
    requirementsAr: z.string().min(1, 'المتطلبات العربية مطلوبة'),
    requirementsEn: z.string().min(1, 'English requirements are required'),
    deadline: z.string().min(1, 'Deadline is required'),
    isActive: z.boolean(),
});

type JobFormValues = z.infer<typeof jobSchema>;

type Props = {
    locale: string;
    job?: any;
};

export function JobForm({ locale, job }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isAr = locale === 'ar';

    const form = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            titleAr: job?.titleAr || '',
            titleEn: job?.titleEn || '',
            department: job?.department || '',
            type: job?.type || 'FULL_TIME',
            descriptionAr: job?.descriptionAr || '',
            descriptionEn: job?.descriptionEn || '',
            requirementsAr: job?.requirementsAr || '',
            requirementsEn: job?.requirementsEn || '',
            deadline: job?.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
            isActive: job?.isActive ?? true,
        },
    });

    async function onSubmit(data: JobFormValues) {
        setLoading(true);
        try {
            const res = job
                ? await updateJob(job.id, data)
                : await createJob(data);

            if (res.success) {
                toast.success(job ? (isAr ? 'تم تحديث الوظيفة' : 'Job updated') : (isAr ? 'تم إنشاء الوظيفة' : 'Job created'));
                router.push(`/${locale}/admin/careers`);
                router.refresh();
            } else {
                toast.error(res.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (error) {
            toast.error(isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border">

                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="titleAr"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'المسمى الوظيفي (عربي)' : 'Job Title (Arabic)'}</FormLabel>
                                <FormControl>
                                    <Input {...field} dir="rtl" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="titleEn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'المسمى الوظيفي (إنجليزي)' : 'Job Title (English)'}</FormLabel>
                                <FormControl>
                                    <Input {...field} dir="ltr" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'القسم / الدائرة' : 'Department'}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'نوع الوظيفة' : 'Job Type'}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">{isAr ? 'دوام كامل' : 'Full Time'}</SelectItem>
                                        <SelectItem value="PART_TIME">{isAr ? 'دوام جزئي' : 'Part Time'}</SelectItem>
                                        <SelectItem value="CONTRACT">{isAr ? 'عقد' : 'Contract'}</SelectItem>
                                        <SelectItem value="TEMPORARY">{isAr ? 'مؤقت' : 'Temporary'}</SelectItem>
                                        <SelectItem value="INTERNSHIP">{isAr ? 'تدريب' : 'Internship'}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="deadline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'آخر موعد للتقديم' : 'Deadline'}</FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="descriptionAr"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'الوصف الوظيفي (عربي)' : 'Description (Arabic)'}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="rtl" className="h-32" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="descriptionEn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'الوصف الوظيفي (إنجليزي)' : 'Description (English)'}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="ltr" className="h-32" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="requirementsAr"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'المتطلبات (عربي)' : 'Requirements (Arabic)'}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="rtl" className="h-32" placeholder="أدخل كل متطلب في سطر جديد" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requirementsEn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isAr ? 'المتطلبات (إنجليزي)' : 'Requirements (English)'}</FormLabel>
                                <FormControl>
                                    <Textarea {...field} dir="ltr" className="h-32" placeholder="One requirement per line" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">{isAr ? 'تفعيل الوظيفة' : 'Active Status'}</FormLabel>
                                <FormDescription>
                                    {isAr ? 'إظهار الوظيفة في صفحة الوظائف العامة' : 'Show this job on public careers page'}
                                </FormDescription>
                            </div>
                            <FormControl>
                                <div style={{ direction: 'ltr' }}>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="me-4">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        {job ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'نشر الوظيفة' : 'Post Job')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
