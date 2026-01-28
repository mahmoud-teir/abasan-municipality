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
import { updateSystemSettings } from "@/actions/settings.actions";
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

// Extracted component to avoid re-creation on render
function FontSection({
    type,
    presetValue,
    onUpdate,
    isPending,
    t
}: {
    type: 'arabic' | 'english',
    presetValue?: string,
    onUpdate: (val: string) => void,
    isPending: boolean,
    t: any
}) {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{t(`${type}Label`)}</Label>
            </div>

            <div className="space-y-3">
                <Select
                    value={presetValue || (type === 'arabic' ? 'cairo' : 'outfit')}
                    onValueChange={(val) => onUpdate(val)}
                    disabled={isPending}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t(`${type}Placeholder`)} />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(type === 'arabic' ? ARABIC_FONTS : ENGLISH_FONTS).map((font) => (
                            <SelectItem key={font} value={font}>
                                {font.charAt(0).toUpperCase() + font.slice(1).replace(/_/g, ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className={`text-sm text-muted-foreground ${type === 'english' ? 'font-english' : ''}`}>
                    {t(`${type}Example`)}
                </p>
            </div>
        </div>
    );
}

export function FontSelector({
    currentArabicFont,
    currentEnglishFont,
}: Props) {
    const router = useRouter();
    const t = useTranslations('admin.settingsPage.fonts');
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (type: 'arabic' | 'english', value: string) => {
        startTransition(async () => {
            const dbUpdates: Record<string, string> = {};

            if (type === 'arabic') {
                dbUpdates['font_arabic'] = value;
                dbUpdates['font_arabic_url'] = '';
                dbUpdates['font_arabic_family'] = '';
            } else {
                dbUpdates['font_english'] = value;
                dbUpdates['font_english_url'] = '';
                dbUpdates['font_english_family'] = '';
            }

            const result = await updateSystemSettings(dbUpdates);

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
                    <FontSection
                        type="arabic"
                        presetValue={currentArabicFont || 'cairo'}
                        onUpdate={(val) => handleUpdate('arabic', val)}
                        isPending={isPending}
                        t={t}
                    />
                    <FontSection
                        type="english"
                        presetValue={currentEnglishFont || 'outfit'}
                        onUpdate={(val) => handleUpdate('english', val)}
                        isPending={isPending}
                        t={t}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
