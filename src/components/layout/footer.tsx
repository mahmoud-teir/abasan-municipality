'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
    const t = useTranslations('footer');
    const tNav = useTranslations('nav');
    const tContact = useTranslations('public.contact');

    const tMetadata = useTranslations('metadata');
    const year = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-slate-200 pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            {/* We can add a logo image here if available */}
                            <h3 className="text-2xl font-bold text-white tracking-tight">{tMetadata('title')}</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            {useTranslations('public.about')('missionText')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-white relative inline-block">
                            {t('quickLinks')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>{tNav('about')}</Link></li>
                            <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>{tNav('services')}</Link></li>
                            <li><Link href="/news" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>{tNav('news')}</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>{tNav('contact')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-white relative inline-block">
                            {t('contactUs')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <span className="text-primary font-bold">{tContact('phone')}:</span>
                                <span className="text-white">+970 8 206 1020</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary font-bold">{tContact('email')}:</span>
                                <span className="text-white">info@abasan.mun.ps</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-primary font-bold">{tContact('address')}:</span>
                                <span className="text-white">{tContact('addressValue')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social / Follow */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-white relative inline-block">
                            {t('followUs')}
                            <span className="absolute -bottom-2 right-0 w-12 h-1 bg-primary rounded-full"></span>
                        </h4>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 group">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 group">
                                <span className="sr-only">Twitter</span>
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-slate-500">
                    <p>{t('copyright', { year })}</p>
                </div>
            </div>
        </footer>
    );
}
