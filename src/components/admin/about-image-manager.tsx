'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { updateSystemSetting } from "@/actions/settings.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadBtn = generateUploadButton<OurFileRouter>();

type Props = {
    currentImageUrl?: string | null;
};

export function AboutImageManager({ currentImageUrl }: Props) {
    const router = useRouter();
    const t = useTranslations('admin.settingsPage.aboutImage');
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

    // Sync state with props when server-side data changes
    useEffect(() => {
        setPreview(currentImageUrl || null);
    }, [currentImageUrl]);

    const handleUploadComplete = async (res: any[]) => {
        if (res && res.length > 0) {
            const url = res[0].url;
            console.log("Upload complete, URL:", url);
            setPreview(url);

            startTransition(async () => {
                const result = await updateSystemSetting('about_image_url', url);
                if (result.success) {
                    toast.success(t('success'));
                    router.refresh();
                } else {
                    toast.error(t('error'));
                }
            });
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        startTransition(async () => {
            // Revert to default or empty
            const result = await updateSystemSetting('about_image_url', '');
            if (result.success) {
                toast.success(t('removeSuccess'));
                router.refresh();
            } else {
                toast.error(t('removeError'));
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] p-8 bg-slate-50/50">
                    {preview ? (
                        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl border border-white/20 ring-1 ring-black/5">
                            {/* Blurred Background */}
                            <Image
                                src={preview}
                                alt="Background"
                                fill
                                className="object-cover blur-xl scale-110 opacity-40"
                                unoptimized
                            />

                            {/* Main Image */}
                            <div className="relative w-full h-full p-4">
                                <Image
                                    src={preview}
                                    alt="About Preview"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                    unoptimized
                                />
                            </div>
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 w-8 h-8 rounded-full"
                                onClick={handleRemoveImage}
                                disabled={isPending}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t('noImage')}</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <UploadBtn
                            endpoint="newsImageUploader"
                            onClientUploadComplete={handleUploadComplete}
                            onUploadError={(error: Error) => {
                                toast.error(`${t('uploadError')}: ${error.message}`);
                            }}
                            appearance={{
                                button: "bg-primary text-primary-foreground hover:bg-primary/90",
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
