import {
    Cairo,
    Tajawal,
    IBM_Plex_Sans_Arabic,
    Noto_Kufi_Arabic,
    Almarai,
    Amiri,
    Readex_Pro,
    Outfit,
    Inter,
    Roboto,
    Open_Sans,
    Lato,
} from "next/font/google";

// Arabic Fonts
const cairo = Cairo({
    subsets: ["arabic"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-cairo",
});

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["200", "300", "400", "500", "700", "800", "900"],
    variable: "--font-tajawal",
});

/*
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    weight: ["100", "200", "300", "400", "500", "600", "700"],
    variable: "--font-ibm-plex-sans-arabic",
});
*/

const notoKufiArabic = Noto_Kufi_Arabic({
    subsets: ["arabic"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-noto-kufi-arabic",
});

const almarai = Almarai({
    subsets: ["arabic"],
    weight: ["300", "400", "700", "800"],
    variable: "--font-almarai",
});

const amiri = Amiri({
    subsets: ["arabic"],
    weight: ["400", "700"],
    variable: "--font-amiri",
});

const readexPro = Readex_Pro({
    subsets: ["arabic"],
    weight: ["200", "300", "400", "500", "600", "700"],
    variable: "--font-readex-pro",
});

// English Fonts
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["100", "300", "400", "500", "700", "900"],
    variable: "--font-roboto",
});

const openSans = Open_Sans({
    subsets: ["latin"],
    variable: "--font-open-sans",
});

const lato = Lato({
    subsets: ["latin"],
    weight: ["100", "300", "400", "700", "900"],
    variable: "--font-lato",
});

// Reduced to essentials for build stability
export const ARABIC_FONTS = {
    cairo,
    tajawal: cairo, // Fallback to avoid fetching
    //    ibm_plex_sans_arabic: ibmPlexSansArabic,
    noto_kufi_arabic: cairo,
    almarai: cairo,
    amiri: cairo,
    readex_pro: cairo,
} as const;

export const ENGLISH_FONTS = {
    outfit,
    inter: outfit,
    roboto: outfit,
    open_sans: outfit,
    lato: outfit,
} as const;

export type ArabicFontKey = keyof typeof ARABIC_FONTS;
export type EnglishFontKey = keyof typeof ENGLISH_FONTS;
