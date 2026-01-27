'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitApplication } from '@/actions/job.actions';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';

const applicationSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Valid phone number is required'),
    message: z.string().optional(),
    cvUrl: z.string().optional(), // We'll make it optional for now or handle upload
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type Props = {
    jobId: string;
    jobTitle: string;
    locale: string;
};

export function ApplicationForm({ jobId, jobTitle, locale }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const isAr = locale === 'ar';

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: '',
        },
    });

    async function onSubmit(data: ApplicationFormValues) {
        setLoading(true);
        try {
            const res = await submitApplication(jobId, { ...data, cvUrl });
            if (res.success) {
                toast.success(isAr ? 'تم إرسال طلبك بنجاح' : 'Application submitted successfully');
                setOpen(false);
                form.reset();
                setCvUrl(null);
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto gap-2">
                    <Send className="w-4 h-4" />
                    {isAr ? 'قدم الآن لهذه الوظيفة' : 'Apply Now for this Job'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isAr ? `تقديم طلب: ${jobTitle}` : `Apply for: ${jobTitle}`}</DialogTitle>
                    <DialogDescription>
                        {isAr ? 'يرجى تعبئة النموذج أدناه للتقدم للوظيفة.' : 'Please fill the form below to apply.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isAr ? 'الاسم الكامل' : 'Full Name'}</FormLabel>
                                    <FormControl>
                                        <Input {...field} dir={isAr ? 'rtl' : 'ltr'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isAr ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isAr ? 'رقم الهاتف' : 'Phone'}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="ltr" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormItem>
                            <FormLabel>{isAr ? 'السيرة الذاتية (CV)' : 'CV / Resume'}</FormLabel>
                            <div className="border border-input rounded-md p-3 flex items-center justify-between bg-gray-50">
                                {cvUrl ? (
                                    <span className="text-sm text-green-600 truncate max-w-[200px]">CV Uploaded</span>
                                ) : (
                                    <span className="text-sm text-gray-400">{isAr ? 'يرجى رفع ملف PDF' : 'Please upload PDF'}</span>
                                )}
                                <div className="h-8">
                                    <UploadButton
                                        endpoint="documentUploader" // Using existing uploader, assuming allows PDF
                                        onClientUploadComplete={(res) => {
                                            if (res && res[0]) {
                                                setCvUrl(res[0].url);
                                                toast.success("CV Uploaded");
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            toast.error(`Error: ${error.message}`);
                                        }}
                                        appearance={{
                                            button: "bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-2 h-8",
                                            allowedContent: "hidden"
                                        }}
                                        content={{
                                            button: isAr ? 'رفع ملف' : 'Upload'
                                        }}
                                    />
                                </div>
                            </div>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isAr ? 'رسالة تعريفية (اختياري)' : 'Cover Letter (Optional)'}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} dir={isAr ? 'rtl' : 'ltr'} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={loading || !cvUrl}>
                                {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                                {isAr ? 'إرسال الطلب' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
