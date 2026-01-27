'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Send, Clock, Facebook, Twitter, Globe } from 'lucide-react';

export default function ContactPage() {
    const t = useTranslations('public.contact');

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                    {t('title')}
                </h1>
                <p className="text-xl text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-xl h-full">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('address')}</h3>
                                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                            {t('addressDetails')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Phone className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('phone')}</h3>
                                        <p className="text-slate-300 font-mono" dir="ltr">+970 8 206 1234</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('email')}</h3>
                                        <p className="text-slate-300">info@abasan.mun.ps</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Clock className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{t('openingHours')}</h3>
                                        <p className="text-slate-300">
                                            {t('workingDays')}<br />
                                            {t('workingTime')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-700">
                                <h3 className="font-semibold text-lg mb-4">{t('socialMedia')}</h3>
                                <div className="flex gap-4">
                                    <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-sky-500 transition-colors">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-green-600 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('formTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>{t('name')}</Label>
                                        <Input placeholder={t('namePlaceholder')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('email')}</Label>
                                        <Input type="email" placeholder={t('emailPlaceholder')} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('subject')}</Label>
                                    <Input placeholder={t('subjectPlaceholder')} />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('message')}</Label>
                                    <Textarea
                                        placeholder={t('messagePlaceholder')}
                                        className="min-h-[150px]"
                                    />
                                </div>

                                <Button type="submit" className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700">
                                    <Send className="w-4 h-4 me-2" />
                                    {t('send')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
