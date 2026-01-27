'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { trackReference } from '@/actions/public.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Loader2, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TrackPage() {
    const t = useTranslations();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await trackReference(query.trim());
            if (res.success) {
                setResult(res.data);
            } else {
                setError(res.error || 'error');
            }
        } catch (err) {
            setError('error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('APPROVED') || s.includes('RESOLVED') || s.includes('COMPLETED')) return 'bg-green-100 text-green-700 border-green-200';
        if (s.includes('REJECTED') || s.includes('CANCELLED')) return 'bg-red-100 text-red-700 border-red-200';
        if (s.includes('PENDING') || s.includes('OPEN')) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const getStatusIcon = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('APPROVED') || s.includes('RESOLVED') || s.includes('COMPLETED')) return CheckCircle2;
        if (s.includes('REJECTED') || s.includes('CANCELLED')) return XCircle;
        if (s.includes('PENDING') || s.includes('OPEN')) return Clock;
        return AlertCircle;
    };

    return (
        <div className="container px-4 py-16 md:py-24 mx-auto max-w-2xl min-h-[60vh]">
            <div className="text-center space-y-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                    {t('public.track.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                    {t('public.track.subtitle')}
                </p>
            </div>

            <Card className="shadow-lg border-muted">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <Input
                            placeholder={t('public.track.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="text-lg py-6"
                            autoFocus
                        />
                        <Button type="submit" size="lg" disabled={loading} className="py-6 text-lg min-w-[140px]">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Search className="w-5 h-5 me-2" />
                                    {t('public.track.check')}
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div className="mt-8 p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center animate-in fade-in slide-in-from-bottom-4">
                    <p className="font-medium">
                        {error === 'notFound' ? t('public.track.result.notFound') : t('common.error')}
                    </p>
                </div>
            )}

            {result && (
                <Card className="mt-8 border-none shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <div className="h-2 bg-primary/80" />
                    <CardHeader className="bg-slate-50/50 pb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-6 h-6 text-primary" />
                            <CardTitle className="text-xl">{t('public.track.result.found')}</CardTitle>
                        </div>
                        <CardDescription className="font-mono text-lg font-medium text-slate-700">
                            #{result.reference}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">{t('public.track.result.status')}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`px-3 py-1 text-sm font-medium ${getStatusColor(result.status)}`}>
                                        {t(`requests.status.${result.status}`)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">{t('public.track.result.date')}</span>
                                <p className="font-medium">
                                    {format(new Date(result.createdAt), 'dd MMMM yyyy, HH:mm')}
                                </p>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <span className="text-sm text-muted-foreground">{t('public.track.result.type')}</span>
                                <p className="font-medium text-lg">
                                    {result.type === 'REQUEST'
                                        ? t(`requests.types.${result.category.toLowerCase().split('_')[0]}`) || result.category
                                        : result.category // Translating complaint categories if needed
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
