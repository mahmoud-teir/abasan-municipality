'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createAlert, getAlerts, deactivateAlert } from '@/actions/alert.actions';
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAlertsPage() {
    const t = useTranslations('admin');
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    const refreshAlerts = async () => {
        const res = await getAlerts();
        if (res.success && res.data) {
            setAlerts(res.data);
        }
        setFetching(false);
    };

    useEffect(() => {
        refreshAlerts();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const res = await createAlert(formData);
        if (res.success) {
            toast.success('Alert created successfully');
            (e.target as HTMLFormElement).reset();
            refreshAlerts();
        } else {
            toast.error('Failed to create alert');
        }
        setLoading(false);
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this alert?')) return;
        const res = await deactivateAlert(id);
        if (res.success) {
            toast.success('Alert deactivated');
            refreshAlerts();
        } else {
            toast.error('Failed to deactivate');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INFO': return <Info className="text-blue-500" />;
            case 'WARNING': return <AlertTriangle className="text-amber-500" />;
            case 'DANGER': return <AlertCircle className="text-red-500" />;
            case 'SUCCESS': return <CheckCircle2 className="text-green-500" />;
            default: return <Info />;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Emergency Alerts</h1>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create Alert Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title (Arabic)</Label>
                                <Input name="title" required placeholder="Example: Road Closure" />
                            </div>

                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea name="message" required placeholder="Details about the alert..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select name="type" defaultValue="INFO">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INFO">Info (Blue)</SelectItem>
                                            <SelectItem value="WARNING">Warning (Orange)</SelectItem>
                                            <SelectItem value="DANGER">Danger (Red)</SelectItem>
                                            <SelectItem value="SUCCESS">Success (Green)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Expires At (Optional)</Label>
                                    <Input type="datetime-local" name="expiresAt" />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Publish Alert
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Active Alerts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {fetching ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : alerts.length === 0 ? (
                            <p className="text-muted-foreground text-center">No alerts found</p>
                        ) : (
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-lg border flex justify-between items-start ${!alert.isActive ? 'opacity-50 bg-slate-50' : 'bg-white'}`}>
                                        <div className="flex gap-3">
                                            <div className="mt-1">{getTypeIcon(alert.type)}</div>
                                            <div>
                                                <h4 className="font-bold flex items-center gap-2">
                                                    {alert.title}
                                                    {!alert.isActive && <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Inactive</span>}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        {alert.isActive && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeactivate(alert.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
