'use server';

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getPageSeo(routeKey: string) {
    try {
        const seo = await prisma.seoPage.findUnique({
            where: { routeKey }
        });
        return { success: true, data: seo };
    } catch (error) {
        console.error("Error fetching SEO:", error);
        return { success: false, error: "Failed to fetch SEO data" };
    }
}

export async function updatePageSeo(routeKey: string, data: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    keywordsAr?: string;
    keywordsEn?: string;
    ogImage?: string;
}) {
    try {
        const seo = await prisma.seoPage.upsert({
            where: { routeKey },
            update: { ...data },
            create: { routeKey, ...data }
        });
        revalidatePath(`/${routeKey === 'home' ? '' : routeKey}`);
        return { success: true, data: seo };
    } catch (error) {
        console.error("Error updating SEO:", error);
        return { success: false, error: "Failed to update SEO" };
    }
}
