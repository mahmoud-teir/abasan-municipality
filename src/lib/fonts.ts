import {
    Cairo,
    Tajawal,
    IBM_Plex_Sans_Arabic,
    Noto_Kufi_Arabic,
    Almarai,
    Readex_Pro,
    Outfit,
    Inter,
    Roboto,
    Poppins,
    Open_Sans
} from "next/font/google";

// Arabic Fonts
export const cairo = Cairo({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const tajawal = Tajawal({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "500", "700", "800", "900"],
    display: "swap",
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

export const notoKufiArabic = Noto_Kufi_Arabic({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "500", "700", "800", "900"], // Check available weights
    display: "swap",
});

export const almarai = Almarai({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "700", "800"],
    display: "swap",
});

export const readexPro = Readex_Pro({
    subsets: ["arabic"],
    variable: "--font-arabic",
    weight: ["300", "400", "500", "700"],
    display: "swap",
});

// English Fonts
export const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-english",
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const inter = Inter({
    subsets: ["latin"],
    variable: "--font-english",
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const roboto = Roboto({
    subsets: ["latin"],
    variable: "--font-english",
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const poppins = Poppins({
    subsets: ["latin"],
    variable: "--font-english",
    weight: ["300", "400", "500", "700", "900"],
    display: "swap",
});

export const openSans = Open_Sans({
    subsets: ["latin"],
    variable: "--font-english",
    weight: ["300", "400", "500", "700", "800"],
    display: "swap",
});

export const ARABIC_FONTS = {
    cairo,
    tajawal,
    ibmPlexSansArabic,
    notoKufiArabic,
    almarai,
    readexPro,
};

export const ENGLISH_FONTS = {
    outfit,
    inter,
    roboto,
    poppins,
    openSans,
};

export type ArabicFontKey = keyof typeof ARABIC_FONTS;
export type EnglishFontKey = keyof typeof ENGLISH_FONTS;
