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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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

  const themeClass = theme === 'green' ? 'theme-green' : '';

  // Resolve fonts (default to Cairo and Outfit)
  const arabicFont = ARABIC_FONTS[(fontArabicKey as ArabicFontKey) || 'cairo'] || ARABIC_FONTS.cairo;
  const englishFont = ENGLISH_FONTS[(fontEnglishKey as EnglishFontKey) || 'outfit'] || ENGLISH_FONTS.outfit;

  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${arabicFont.variable} ${englishFont.variable} font-sans antialiased ${themeClass}`}
        style={
          {
            '--font-arabic': `var(${arabicFont.variable})`,
            '--font-english': `var(${englishFont.variable})`,
          } as React.CSSProperties
        }
      >
        <ConvexClientProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
