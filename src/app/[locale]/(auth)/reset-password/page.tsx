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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const resetPasswordSchema = z
    .object({
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams(); // Expect ?token=... only for better-auth
    // better-auth might put token in query or as part of verification link.

    // Actually, better-auth verification links are usually like /reset-password?token=xyz
    // Wait, let's check if the client method needs token explicitly or if it handles it.
    // client.resetPassword({ newPassword, token }) needs token.

    const token = searchParams.get('token');

    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: ResetPasswordInput) {
        if (!token) {
            toast.error('Invalid token');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authClient.resetPassword({
                newPassword: data.password,
                token: token
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success('تم تغيير كلمة المرور بنجاح');
                router.push('/login');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <p className="text-red-600 mb-4">رابط غير صالح أو منتهي الصلاحية.</p>
                        <Button asChild>
                            <Link href="/forgot-password">طلب رابط جديد</Link>
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
                    <CardTitle>إعادة تعيين كلمة المرور</CardTitle>
                    <CardDescription>
                        أدخل كلمة المرور الجديدة لحسابك.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>كلمة المرور الجديدة</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>تأكيد كلمة المرور</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'حفظ كلمة المرور'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
