
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, User, Phone, Lock, Camera, Trash2 } from 'lucide-react';
import { updateProfile, deleteNationalIdImage } from '@/actions/profile.actions';
import { authClient } from '@/lib/auth/auth-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
    user: {
        name: string;
        email: string;
        phone?: string | null;
        image?: string | null;
        nationalIdImage?: string | null;
    };
};

export function ProfileForm({ user }: Props) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);

    async function handleProfileUpdate(formData: FormData) {
        setLoading(true);
        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success(t('common.success'));
                // Clear previews on success as real data revalidates? 
                // Actually server revalidate might take a moment.
            } else {
                toast.error(result.error || t('common.error'));
            }
        } catch (e) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarPreview(url);
            toast.info(t('common.imageSelected') || 'Image selected');
        }
    };

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setIdPreview(url);
            toast.info('ID Image selected');
        }
    };

    // Clean up URLs
    // useEffect(() => { return () => { if(avatarPreview) URL.revokeObjectURL(avatarPreview) } }, [avatarPreview])

    async function handlePasswordUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error(t('settings.password.mismatch'));
            return;
        }

        setPassLoading(true);
        try {
            const { error } = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true
            });

            if (error) {
                toast.error(error.message || t('common.error'));
            } else {
                toast.success(t('common.success'));
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (e) {
            toast.error(t('common.error'));
        } finally {
            setPassLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('common.settings')}</CardTitle>
                    <CardDescription>{t('admin.settingsPage.profile')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleProfileUpdate} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <Avatar className="w-24 h-24 border-2 border-slate-100">
                                    <AvatarImage src={avatarPreview || user.image || undefined} className="object-cover" />
                                    <AvatarFallback className="text-2xl bg-slate-200">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="image-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    <Camera className="w-8 h-8" />
                                </label>
                                <input
                                    id="image-upload"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <p className="text-xs text-slate-400">Allowed *.jpeg, *.jpg, *.png, *.gif max 2MB</p>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('common.email')}</Label>
                            <Input value={user.email} disabled className="bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">{t('common.name')}</Label>
                            <div className="relative">
                                <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name}
                                    className="ps-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('settings.phone')}</Label>
                            <div className="relative">
                                <Phone className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={user.phone || ''}
                                    placeholder="059xxxxxxx"
                                    className="ps-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label>{t('settings.nationalIdImage') || 'National ID Image'}</Label>
                            <div className="flex flex-col gap-4">
                                {(idPreview || user.nationalIdImage) && (
                                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border bg-slate-50 group">
                                        <img
                                            src={idPreview || user.nationalIdImage || ''}
                                            alt="National ID"
                                            className="object-contain w-full h-full"
                                        />
                                        <div className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete your ID image?')) {
                                                        const res = await deleteNationalIdImage();
                                                        if (res.success) {
                                                            toast.success('ID Image deleted');
                                                            setIdPreview(null);
                                                            // Forcibly clear user prop locally if possible or rely on reval
                                                            // Ideally we should use router.refresh() but revalidatePath handles it mostly
                                                        } else {
                                                            toast.error('Failed to delete');
                                                        }
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="id-upload" className="cursor-pointer flex items-center gap-2 p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                                        <Camera className="w-5 h-5 text-slate-500" />
                                        <span className="text-sm text-slate-600">
                                            {user.nationalIdImage || idPreview ? 'Change ID Image' : 'Upload ID Image'}
                                        </span>
                                    </Label>
                                    <input
                                        id="id-upload"
                                        name="nationalIdImage"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleIdChange}
                                    />
                                    <p className="text-[10px] text-slate-400">
                                        Clear image of your ID card. Max 4MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button disabled={loading}>
                            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            {t('common.save')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.password.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t('settings.password.current')}</Label>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="ps-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.password.new')}</Label>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="ps-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('settings.password.confirm')}</Label>
                            <div className="relative">
                                <Lock className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="ps-10"
                                />
                            </div>
                        </div>
                        <Button disabled={passLoading} variant="outline">
                            {passLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            {t('settings.password.update')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
