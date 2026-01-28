'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { updateSystemSetting } from "@/actions/settings.actions";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";

export const UploadBtn = generateUploadButton<OurFileRouter>();

type Props = {
    logoUrl?: string;
    faviconUrl?: string;
};

export function LogoManager({ logoUrl: initialLogo, faviconUrl: initialFavicon }: Props) {
    const t = useTranslations('admin.settingsPage.branding');
    const [logo, setLogo] = useState(initialLogo);
    const [favicon, setFavicon] = useState(initialFavicon);
    const [isPending, startTransition] = useTransition();

    const handleUpload = async (key: 'site_logo' | 'site_favicon', url: string) => {
        if (key === 'site_logo') setLogo(url);
        else setFavicon(url);

        startTransition(async () => {
            await updateSystemSetting(key, url);
            toast.success(t('success'));
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    {t('title')}
                </CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold">{t('logo')}</h3>
                    <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4 bg-slate-50">
                        {logo ? (
                            <div className="relative w-32 h-32">
                                <Image
                                    src={logo}
                                    alt="Site Logo"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                                    onClick={() => handleUpload('site_logo', '')}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="w-32 h-32 flex items-center justify-center bg-slate-200 rounded-lg text-slate-400">
                                <ImageIcon className="w-10 h-10" />
                            </div>
                        )}
                        <UploadBtn
                            endpoint="newsImageUploader"
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) handleUpload('site_logo', res[0].url);
                            }}
                            appearance={{ button: "bg-slate-900 text-white text-sm" }}
                            content={{ button: t('uploadLogo') }}
                        />
                    </div>
                </div>

                {/* Favicon Section */}
                <div className="space-y-4">
                    <h3 className="font-semibold">{t('favicon')}</h3>
                    <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4 bg-slate-50">
                        {favicon ? (
                            <div className="relative w-16 h-16">
                                <Image
                                    src={favicon}
                                    alt="Favicon"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                                    onClick={() => handleUpload('site_favicon', '')}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-slate-200 rounded-lg text-slate-400">
                                <ImageIcon className="w-8 h-8" />
                            </div>
                        )}
                        <UploadBtn
                            endpoint="newsImageUploader"
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) handleUpload('site_favicon', res[0].url);
                            }}
                            appearance={{ button: "bg-slate-900 text-white text-sm" }}
                            content={{ button: t('uploadFavicon') }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
