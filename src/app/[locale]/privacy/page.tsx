'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, FileText, Share2, Mail, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
    const t = useTranslations('privacy');

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                        <Shield className="w-10 h-10" />
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t('lastUpdated')}
                    </p>
                </div>

                {/* Introduction */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                            {t('intro')}
                        </p>
                    </CardContent>
                </Card>

                {/* Content Sections */}
                <div className="grid gap-6">
                    {/* Collection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-6 h-6 text-blue-500" />
                                {t('collection.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {t('collection.text')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Shield className="w-6 h-6 text-green-500" />
                                {t('usage.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {t('usage.text')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sharing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Share2 className="w-6 h-6 text-purple-500" />
                                {t('sharing.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {t('sharing.text')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Lock className="w-6 h-6 text-red-500" />
                                {t('security.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {t('security.text')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Cookies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Cookie className="w-6 h-6 text-orange-500" />
                                {t('cookies.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed text-muted-foreground">
                                {t('cookies.text')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card className="bg-slate-900 text-white border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-white">
                                <Mail className="w-6 h-6 text-primary" />
                                {t('contact.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="leading-relaxed opacity-90">
                                {t('contact.text')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
