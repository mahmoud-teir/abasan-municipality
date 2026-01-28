'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createNews } from '@/actions/news.actions';
import { createNewsSchema, CreateNewsInput } from '@/lib/validators/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/shared/image-upload';
import { useState } from 'react';
import { deleteMediaByKeys } from '@/actions/media.actions';

export default function CreateNewsPage() {
    const t = useTranslations();
    const router = useRouter();
    const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);

    const form = useForm<CreateNewsInput>({
        resolver: zodResolver(createNewsSchema),
        defaultValues: {
            titleAr: '',
            titleEn: '',
            contentAr: '',
            contentEn: '',
            excerpt: '',
            published: false,
            featured: false,
            images: [],
        },
    });

    async function onSubmit(data: CreateNewsInput) {
        const result = await createNews(data);

        if (result.success) {
            toast.success(t('admin.newsPage.form.success'));
            router.push('/admin/news');
        } else {
            toast.error(result.error || t('admin.newsPage.form.error'));
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/news">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{t('admin.newsPage.form.title')}</h1>
                    <Badge variant={form.watch("published") ? "default" : "secondary"}>
                        {form.watch("published") ? t('admin.newsPage.table.published') : t('admin.newsPage.table.draft')}
                    </Badge>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Arabic Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin.newsPage.form.arabicContent')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="titleAr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('admin.newsPage.form.titleArLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('admin.newsPage.form.titleArPlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contentAr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('admin.newsPage.form.contentArLabel')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('admin.newsPage.form.contentArPlaceholder')}
                                                    className="min-h-[200px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* English Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin.newsPage.form.englishContent')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="titleEn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('admin.newsPage.form.titleEnLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('admin.newsPage.form.titleEnPlaceholder')} dir="ltr" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contentEn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('admin.newsPage.form.contentEnLabel')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('admin.newsPage.form.contentEnPlaceholder')}
                                                    className="min-h-[200px]"
                                                    dir="ltr"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.newsPage.form.media') || 'Media (Images)'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('admin.newsPage.form.imagesLabel') || 'Images'}</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                onRemove={(url) => field.onChange((field.value || []).filter((current) => current !== url))}
                                                onUploadComplete={(res) => {
                                                    const newKeys = res.map((r: any) => r.key);
                                                    setUploadedKeys(prev => [...prev, ...newKeys]);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.newsPage.form.settings')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('admin.newsPage.form.excerptLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('admin.newsPage.form.excerptPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center gap-8">
                                <FormField
                                    control={form.control}
                                    name="published"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    {t('admin.newsPage.form.publishLabel')}
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('admin.newsPage.form.publishDesc')}
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="featured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    {t('admin.newsPage.form.featuredLabel')}
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('admin.newsPage.form.featuredDesc')}
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={async () => {
                                if (uploadedKeys.length > 0) {
                                    toast.loading(t('admin.newsPage.form.cleaning') || 'Cleaning up...');
                                    await deleteMediaByKeys(uploadedKeys);
                                    toast.dismiss();
                                }
                                router.push('/admin/news');
                            }}
                        >
                            {t('admin.newsPage.form.cancel')}
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                                    {t('admin.newsPage.form.saving')}
                                </>
                            ) : (
                                t('admin.newsPage.form.save')
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
