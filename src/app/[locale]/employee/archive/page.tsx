
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export default async function EmployeeArchivePage() {
    const t = await getTranslations();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {t('employee.archive')}
            </h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Archive className="w-5 h-5" />
                        {t('common.archive', { defaultValue: 'Archive' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500">
                        {t('common.comingSoon', { defaultValue: 'Archived requests and history will be displayed here.' })}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
