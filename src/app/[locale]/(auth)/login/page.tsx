'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, Link } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Loader2, Lock, Mail } from 'lucide-react';
import { lookupEmailByNationalId } from '@/actions/user.actions';
import { getDashboardLink } from '@/lib/role-utils';

export default function LoginPage() {
    const t = useTranslations('auth.login');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        let identifier = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Check if identifier is National ID (digits only)
        if (/^\d+$/.test(identifier)) {
            const result = await lookupEmailByNationalId(identifier);
            if (result.success && result.email) {
                identifier = result.email;
            } else {
                toast.error(t('invalidNationalId'));
                setIsLoading(false);
                return;
            }
        }

        try {
            const { data, error } = await signIn.email({
                email: identifier,
                password,
            });

            if (error) {
                toast.error(error.message || t('error'));
            } else {
                toast.success(t('success'));

                // Allow a small delay for cookie to set if needed, though usually better-auth handles it.
                // data.user should contain the role if we configured additional fields correctly.
                // But better-auth typescript client might need type assertions if our schema extension isn't fully picked up in client types yet.
                // Let's safe guard.
                const role = (data?.user as any)?.role;
                const link = getDashboardLink(role);
                router.push(link);
            }
        } catch (error) {
            toast.error(t('error'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>
                        {t('subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailOrNationalId')}</Label>
                            <div className="relative">
                                <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="text"
                                    placeholder={t('emailPlaceholder')}
                                    className="ps-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">{t('password')}</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    {t('forgotPassword')}
                                </Link>
                            </div>
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
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                    {t('loading')}
                                </>
                            ) : (
                                t('submit')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">{t('noAccount')} </span>
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            {t('registerNow')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
