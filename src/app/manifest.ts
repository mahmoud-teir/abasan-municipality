import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'بلدية عبسان الكبيرة',
        short_name: 'بلدية عبسان',
        description:
            'المنصة الرقمية الرسمية لبلدية عبسان الكبيرة - The official digital platform of Abasan Alkabera Municipality',
        start_url: '/ar',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        dir: 'rtl',
        lang: 'ar',
        categories: ['government', 'public-services'],
        icons: [
            {
                src: '/favicon.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/icons/icon-192x192.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512x512.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'any',
            },
            {
                src: '/icons/icon-512x512.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
                purpose: 'maskable',
            },
        ],
    };
}
