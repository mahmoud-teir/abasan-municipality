import type { Metadata, Viewport } from "next";

import "./globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "@/components/ui/sonner";


import { ARABIC_FONTS, ENGLISH_FONTS, ArabicFontKey, EnglishFontKey } from "@/lib/fonts";
import { getSystemSetting } from "@/actions/settings.actions";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

export const metadata: Metadata = {
  title: {
    default: "بلدية عبسان الكبيرة | Abasan Alkabera Municipality",
    template: "%s | بلدية عبسان الكبيرة",
  },
  description: "المنصة الرقمية الرسمية لبلدية عبسان الكبيرة - The official digital platform of Abasan Alkabera Municipality",
  keywords: ["بلدية", "عبسان الكبيرة", "خدمات", "تصاريح", "municipality", "abasan"],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'بلدية عبسان الكبيرة',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings
  // Fetch settings
  const [
    theme,
    fontArabicKey,
    fontEnglishKey,
  ] = await Promise.all([
    getSystemSetting('theme'),
    getSystemSetting('font_arabic'),
    getSystemSetting('font_english'),
  ]);

  const getThemeClass = (theme: string | null) => {
    if (!theme || theme === 'default') return 'theme-blue'; // Default is now explicitly blue class or variables
    if (theme === 'green') return 'theme-green';
    if (theme === 'red') return 'theme-red';
    if (theme === 'violet') return 'theme-violet';
    if (theme === 'orange') return 'theme-orange';
    return '';
  };

  const themeClass = getThemeClass(theme);

  // Resolve fonts (default to Cairo and Outfit)
  const arabicFont = ARABIC_FONTS[(fontArabicKey as ArabicFontKey) || 'cairo'] || ARABIC_FONTS.cairo;
  const englishFont = ENGLISH_FONTS[(fontEnglishKey as EnglishFontKey) || 'outfit'] || ENGLISH_FONTS.outfit;

  // Map font keys to their CSS variable names (must match fonts.ts)
  const ARABIC_FONT_VARS: Record<string, string> = {
    cairo: '--font-cairo',
    tajawal: '--font-tajawal',
    ibm_plex_sans_arabic: '--font-ibm-plex-sans-arabic',
    noto_kufi_arabic: '--font-noto-kufi-arabic',
    almarai: '--font-almarai',
    amiri: '--font-amiri',
    readex_pro: '--font-readex-pro',
  };

  const ENGLISH_FONT_VARS: Record<string, string> = {
    outfit: '--font-outfit',
    inter: '--font-inter',
    roboto: '--font-roboto',
    open_sans: '--font-open-sans',
    lato: '--font-lato',
  };

  const arabicVar = ARABIC_FONT_VARS[(fontArabicKey as string) || 'cairo'] || '--font-cairo';
  const englishVar = ENGLISH_FONT_VARS[(fontEnglishKey as string) || 'outfit'] || '--font-outfit';

  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${arabicFont.variable} ${englishFont.variable} font-sans antialiased ${themeClass}`}
        style={
          {
            '--font-arabic': `var(${arabicVar})`,
            '--font-english': `var(${englishVar})`,
          } as React.CSSProperties
        }
      >
        <ConvexClientProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ConvexClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
