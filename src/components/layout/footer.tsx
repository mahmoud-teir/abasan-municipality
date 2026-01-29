'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Facebook, Twitter, Instagram, Youtube, Globe } from "lucide-react";

type FooterProps = {
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        website?: string;
    };
};

export function Footer({ socialLinks }: FooterProps) {
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
                            <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>{useTranslations('privacy')('title')}</Link></li>
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
                            {socialLinks?.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300 group">
                                    <span className="sr-only">Facebook</span>
                                    <Facebook className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </a>
                            )}
                            {socialLinks?.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 group">
                                    <span className="sr-only">Twitter</span>
                                    <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </a>
                            )}
                            {socialLinks?.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 group">
                                    <span className="sr-only">Instagram</span>
                                    <Instagram className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </a>
                            )}
                            {socialLinks?.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-300 group">
                                    <span className="sr-only">Youtube</span>
                                    <Youtube className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </a>
                            )}
                            {socialLinks?.website && (
                                <a href={socialLinks.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-300 group">
                                    <span className="sr-only">Website</span>
                                    <Globe className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                </a>
                            )}
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
