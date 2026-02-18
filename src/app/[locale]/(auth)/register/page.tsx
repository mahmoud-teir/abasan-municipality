'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, Link } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp } from '@/lib/auth/auth-client';
import { checkPhoneUsage, checkNationalIdUsage } from '@/actions/auth-checks';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, User, Phone, FileText, MapPin } from 'lucide-react';

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
        const address = formData.get('address') as string;


        if (password !== confirmPassword) {
            toast.error(t('passwordsDoNotMatch') || 'Password mismatch');
            setIsLoading(false);
            return;
        }

        // Validate optional fields if provided
        if (phone && phone.length !== 10) {
            toast.error(t('phoneLengthError') || 'رقم الهاتف يجب أن يكون 10 أرقام');
            setIsLoading(false);
            return;
        }

        if (nationalId && nationalId.length !== 9) {
            toast.error(t('nationalIdLengthError') || 'رقم الهوية يجب أن يكون 9 أرقام');
            setIsLoading(false);
            return;
        }

        // Check for duplicates
        if (phone) {
            const phoneExists = await checkPhoneUsage(phone);
            if (phoneExists) {
                toast.error(t('phoneExistsError') || 'رقم الهاتف مستخدم بالفعل');
                setIsLoading(false);
                return;
            }
        }

        if (nationalId) {
            const nidExists = await checkNationalIdUsage(nationalId);
            if (nidExists) {
                toast.error(t('nationalIdExistsError') || 'رقم الهوية مستخدم بالفعل');
                setIsLoading(false);
                return;
            }
        }


        try {
            await signUp.email({
                email,
                password,
                name,
                phone: phone || undefined,
                nationalId: nationalId || undefined,
                address: address || undefined,
                callbackURL: '/citizen/dashboard',
            } as any, {
                onRequest: () => {
                    // creating user...
                },
                onSuccess: () => {
                    toast.success(t('success') || 'Account created successfully');
                    router.push('/citizen/dashboard');
                },
                onError: (ctx) => {
                    toast.error(ctx.error?.message || 'Error creating account');
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
                                        maxLength={10}
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
                                        type="tel"
                                        placeholder={t('nationalIdPlaceholder')}
                                        className="ps-10"
                                        disabled={isLoading}
                                        maxLength={9}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('address')}</Label>
                            <div className="relative">
                                <MapPin className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder={t('addressPlaceholder')}
                                    className="ps-10"
                                    disabled={isLoading}
                                />
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
