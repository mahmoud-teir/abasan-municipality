'use client';

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTransition, useState } from "react";
import { updateSystemSetting } from "@/actions/settings.actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Props = {
    initialValue: string; // "true" or "false"
};

export function MaintenanceToggle({ initialValue }: Props) {
    const t = useTranslations('admin.settingsPage.maintenance');
    const [isEnabled, setIsEnabled] = useState(initialValue === 'true');
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        setIsEnabled(checked);
        startTransition(async () => {
            const result = await updateSystemSetting('maintenance_mode', checked.toString());
            if (result.success) {
                toast.success(checked ? t('enabledSuccess') : t('disabledSuccess'));
            } else {
                setIsEnabled(!checked); // Revert
                toast.error(t('error'));
            }
        });
    };

    return (
        <Card className={isEnabled ? "border-red-200 bg-red-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <AlertCircle className={`w-5 h-5 ${isEnabled ? "text-red-600" : "text-slate-500"}`} />
                        {t('title')}
                    </CardTitle>
                    <CardDescription className={isEnabled ? "text-red-700" : ""}>
                        {t('description')}
                    </CardDescription>
                </div>
                <div style={{ direction: 'ltr' }}>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                        className="data-[state=checked]:bg-red-600"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {isEnabled ? t('activeMessage') : t('inactiveMessage')}
                </p>
            </CardContent>
        </Card>
    );
}
