'use client';

import { getActiveAlert } from '@/actions/alert.actions';
import { AlertCircle, X, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function AlertBanner() {
    const [alert, setAlert] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Build an async function to fetch and check
        const fetchAlert = async () => {
            // Don't show on admin pages usually, but maybe useful to see what's live
            // defaulting to show everywhere for now.

            const result = await getActiveAlert();
            if (result.success && result.data) {
                const storedDismissals = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
                if (!storedDismissals.includes(result.data.id)) {
                    setAlert(result.data);
                    setIsVisible(true);
                }
            }
        };

        fetchAlert();
    }, [pathname]);

    if (!isVisible || !alert) return null;

    const handleDismiss = () => {
        setIsVisible(false);
        const storedDismissals = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
        storedDismissals.push(alert.id);
        localStorage.setItem('dismissedAlerts', JSON.stringify(storedDismissals));
    };

    const styles = {
        INFO: 'bg-blue-600 text-white',
        WARNING: 'bg-amber-500 text-white',
        DANGER: 'bg-red-600 text-white',
        SUCCESS: 'bg-green-600 text-white',
    };

    const icons = {
        INFO: Info,
        WARNING: AlertTriangle,
        DANGER: AlertCircle,
        SUCCESS: CheckCircle2,
    };

    const Icon = icons[alert.type as keyof typeof icons] || Info;

    return (
        <div className={`${styles[alert.type as keyof typeof styles]} px-4 py-3 shadow-md relative z-50 transition-all duration-300`}>
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                        <span className="font-bold text-sm md:text-base">{alert.title}</span>
                        <span className="hidden md:inline text-white/60">|</span>
                        <span className="text-sm opacity-90">{alert.message}</span>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
