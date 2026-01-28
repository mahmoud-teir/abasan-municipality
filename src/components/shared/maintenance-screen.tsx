import { Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function MaintenanceScreen() {
    const t = await getTranslations('common');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Wrench className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {t('maintenance.title') || 'Under Maintenance'}
                    </h1>
                    <p className="text-slate-500">
                        {t('maintenance.description') || 'We are currently performing scheduled maintenance. Please check back later.'}
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <p className="text-xs text-slate-400">
                        Administrator? Log in via /login to access the dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
