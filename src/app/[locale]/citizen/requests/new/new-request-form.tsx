'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createRequest } from '@/actions/request.actions';
import { createRequestSchema, CreateRequestInput } from '@/lib/validators/schemas';
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
import { Loader2, FileText, X } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { UploadDropzone } from '@/lib/uploadthing';
import { useState } from 'react';

interface NewRequestFormProps {
    services: { value: string; label: string }[];
}

export function NewRequestForm({ services }: NewRequestFormProps) {
    const t = useTranslations();
    const router = useRouter();
    const { data: session } = useSession();
    const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);

    const form = useForm<CreateRequestInput>({
        resolver: zodResolver(createRequestSchema),
        defaultValues: {
            type: 'BUILDING_PERMIT',
            propertyAddress: '',
            description: '',
            plotNumber: '',
            basinNumber: '',
        },
    });

    async function onSubmit(data: CreateRequestInput) {
        if (!session?.user?.id) {
            toast.error(t('common.error'));
            return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        if (uploadedFiles.length > 0) {
            formData.append('documents', JSON.stringify(uploadedFiles));
        }

        const result = await createRequest(session.user.id, formData);

        if (result.success) {
            toast.success(t('requests.createSuccess'));
            router.refresh(); // Ensure list is updated
            router.push('/citizen/requests');
        } else {
            toast.error(result.error || t('common.error'));
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboard.newRequest')}</CardTitle>
                    <CardDescription>
                        {t('requests.newRequestDescription')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('requests.type')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('requests.selectType')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {services.map((service) => (
                                                    <SelectItem key={service.value} value={service.value}>
                                                        {service.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="basinNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('requests.basinNumber')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="plotNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('requests.plotNumber')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="456" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="propertyAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('requests.address')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('requests.addressPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel>{t('requests.documents.uploadLabel')}</FormLabel>
                                <div className="border rounded-lg p-4 bg-muted/20">
                                    <UploadDropzone
                                        endpoint="documentUploader"
                                        onClientUploadComplete={(res) => {
                                            setUploadedFiles(prev => [
                                                ...prev,
                                                ...res.map(file => ({ url: file.url, name: file.name }))
                                            ]);
                                            toast.success(t('requests.documents.uploadSuccess'));
                                        }}
                                        onUploadError={(error: Error) => {
                                            toast.error(t('requests.documents.uploadError', { error: error.message }));
                                        }}
                                        appearance={{
                                            button: "bg-primary text-primary-foreground hover:bg-primary/90",
                                            container: "border-primary/20",
                                        }}
                                    />

                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium">{t('requests.documents.uploadedList')}</p>
                                            {uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded bg-background border text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive"
                                                        onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== idx))}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('requests.description')}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t('requests.descriptionPlaceholder')}
                                                className="min-h-[100px]"
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
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    t('common.save')
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
