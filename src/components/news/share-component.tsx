'use client';

import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    title: string;
    url?: string;
    locale: string;
};

export function ShareComponent({ title, url, locale }: Props) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const isAr = locale === 'ar';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: title,
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success(isAr ? 'تم نسخ الرابط' : 'Link copied');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 me-2" />
                {isAr ? 'مشاركة' : 'Share'}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy} title={isAr ? 'نسخ الرابط' : 'Copy Link'}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
        </div>
    );
}
