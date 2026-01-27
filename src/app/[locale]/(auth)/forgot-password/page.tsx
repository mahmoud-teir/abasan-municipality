'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const t = useTranslations('auth.forgotPassword');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(data: ForgotPasswordInput) {
        setLoading(true);
        try {
            const { error } = await (authClient as any).forgetPassword({
                email: data.email,
                redirectTo: '/reset-password', // This will be appended to the reset link
            });

            if (error) {
                toast.error(error.message);
            } else {
                setSuccess(true);
                toast.success(t('emailSentSuccess'));
            }
        } catch (err) {
            toast.error(t('submitError'));
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle className="text-xl">{t('successTitle')}</CardTitle>
                        <CardDescription>
                            {t('successDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">{t('backToLogin')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>
                        {t('description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('emailLabel')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('emailPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('submit')}
                            </Button>
                            <div className="text-center">
                                <Link href="/login" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-3 h-3 rtl:rotate-180" />
                                    {t('backToLogin')}
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
