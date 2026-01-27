'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateSystemSetting } from "@/actions/settings.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Type } from "lucide-react";
import { ARABIC_FONTS, ENGLISH_FONTS } from "@/lib/fonts";
import { useTranslations } from "next-intl";

type Props = {
    currentArabicFont?: string | null;
    currentEnglishFont?: string | null;
};

export function FontSelector({ currentArabicFont, currentEnglishFont }: Props) {
    const router = useRouter();
    const t = useTranslations('admin.settingsPage.fonts');
    const [isPending, startTransition] = useTransition();

    const handleFontChange = (type: 'arabic' | 'english', value: string) => {
        startTransition(async () => {
            const result = await updateSystemSetting(
                type === 'arabic' ? 'font_arabic' : 'font_english',
                value
            );

            if (result.success) {
                toast.success(t('success'));
                router.refresh();
            } else {
                toast.error(t('error'));
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    {t('title')}
                </CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label>{t('arabicLabel')}</Label>
                        <Select
                            defaultValue={currentArabicFont || 'cairo'}
                            onValueChange={(val) => handleFontChange('arabic', val)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('arabicPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(ARABIC_FONTS).map((font) => (
                                    <SelectItem key={font} value={font}>
                                        {font.charAt(0).toUpperCase() + font.slice(1).replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {t('arabicExample')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label>{t('englishLabel')}</Label>
                        <Select
                            defaultValue={currentEnglishFont || 'outfit'}
                            onValueChange={(val) => handleFontChange('english', val)}
                            disabled={isPending}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('englishPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(ENGLISH_FONTS).map((font) => (
                                    <SelectItem key={font} value={font}>
                                        {font.charAt(0).toUpperCase() + font.slice(1).replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground font-english">
                            {t('englishExample')}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
