'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { getNewsById, updateNews } from '@/actions/news.actions';
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
import { useEffect, useState } from 'react';

export default function EditNewsPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        async function fetchNews() {
            const res = await getNewsById(id);
            if (res.success && res.data) {
                const news = res.data;
                form.reset({
                    titleAr: news.titleAr,
                    titleEn: news.titleEn,
                    contentAr: news.contentAr,
                    contentEn: news.contentEn,
                    excerpt: news.excerpt || '',
                    published: news.published,
                    featured: news.featured,
                    images: news.images || [],
                });
            } else {
                toast.error(res.error || 'News not found');
                router.push('/admin/news');
            }
            setLoading(false);
        }
        if (id) fetchNews();
    }, [id, form, router]);

    async function onSubmit(data: CreateNewsInput) {
        // cast data to match updateNews expectation if needed, or updateNews should accept CreateNewsInput fields
        // UpdateNews takes Partial, but we are sending full object which is fine
        const result = await updateNews(id, data);

        if (result.success) {
            toast.success('News updated successfully');
            router.push('/admin/news');
        } else {
            toast.error(result.error || t('admin.newsPage.form.error'));
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
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
                    <h1 className="text-2xl font-bold">{t('admin.newsPage.form.editTitle') || 'Edit News'}</h1>
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
                        <Button variant="outline" asChild>
                            <Link href="/admin/news">{t('admin.newsPage.form.cancel')}</Link>
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
