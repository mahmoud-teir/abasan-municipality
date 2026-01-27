'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, User, Phone, FileText } from 'lucide-react';

export default function RegisterPage() {
    const t = useTranslations('auth.register');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const phone = formData.get('phone') as string;
        const nationalId = formData.get('nationalId') as string;

        if (password !== confirmPassword) {
            toast.error(t('passwordsDoNotMatch') || 'Password mismatch');
            setIsLoading(false);
            return;
        }

        try {
            await signUp.email({
                email,
                password,
                name,
                phone,
                nationalId,
                callbackURL: '/citizen/dashboard',
            }, {
                onRequest: () => {
                    // creating user...
                },
                onSuccess: () => {
                    toast.success(t('success') || 'Account created successfully');
                    router.push('/citizen/dashboard');
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || 'Error creating account');
                }
            });

        } catch (error) {
            console.error(error);
            toast.error('Unexpected error');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>
                        {t('subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name')}</Label>
                            <div className="relative">
                                <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder={t('namePlaceholder')}
                                    className="ps-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <div className="relative">
                                <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    className="ps-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <div className="relative">
                                    <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder={t('phonePlaceholder')}
                                        className="ps-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nationalId">{t('nationalId')}</Label>
                                <div className="relative">
                                    <FileText className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="nationalId"
                                        name="nationalId"
                                        type="text"
                                        placeholder={t('nationalIdPlaceholder')}
                                        className="ps-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={t('passwordPlaceholder')}
                                    className="ps-10"
                                    required
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder={t('confirmPasswordPlaceholder')}
                                    className="ps-10"
                                    required
                                    disabled={isLoading}
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                    {t('submit')}...
                                </>
                            ) : (
                                t('submit')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">{t('hasAccount')} </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            {t('loginNow')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
