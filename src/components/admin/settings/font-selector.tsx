'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateSystemSetting } from '@/actions/settings.actions';
import { toast } from 'sonner';

interface FontSelectorProps {
    type: 'arabic' | 'english';
    currentFont: string;
    fonts: Record<string, any>;
    label: string;
}

export function FontSelector({ type, currentFont, fonts, label }: FontSelectorProps) {
    const [value, setValue] = useState(currentFont);
    const [pending, startTransition] = useTransition();

    const settingKey = type === 'arabic' ? 'font_arabic' : 'font_english';

    const onSelect = (currentValue: string) => {
        setValue(currentValue);
        startTransition(async () => {
            try {
                const result = await updateSystemSetting(settingKey, currentValue);
                if (result.success) {
                    toast.success(`${label} updated successfully`);
                    // Force refresh to apply font
                    window.location.reload();
                } else {
                    toast.error('Failed to update font');
                }
            } catch (error) {
                toast.error('An error occurred');
            }
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{label}</span>
            <Select disabled={pending} onValueChange={onSelect} value={value} defaultValue={currentFont}>
                <SelectTrigger className="w-full">
                    {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    <SelectValue placeholder={`Select ${label}...`} />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(fonts).map((fontKey) => (
                        <SelectItem key={fontKey} value={fontKey}>
                            {fontKey}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-[0.8rem] text-muted-foreground">
                Select the default {label.toLowerCase()} for the website.
            </p>
        </div>
    );
}
