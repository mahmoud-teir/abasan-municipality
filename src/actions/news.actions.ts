'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

/**
 * Get published news
 */
export async function getPublishedNews(limit?: number) {
    try {
        const news = await prisma.news.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            take: limit,
        });
        return { success: true, data: news };
    } catch (error) {
        console.error('Error fetching news:', error);
        return { success: false, error: 'حدث خطأ أثناء جلب الأخبار' };
    }
}

/**
 * Get featured news
 */
export async function getFeaturedNews() {
    try {
        const news = await prisma.news.findMany({
            where: { published: true, featured: true },
            orderBy: { publishedAt: 'desc' },
            take: 5,
        });
        return { success: true, data: news };
    } catch (error) {
        console.error('Error fetching featured news:', error);
        return { success: false, error: 'حدث خطأ' };
    }
}

/**
 * Get single news by slug
 */
export async function getNewsBySlug(slug: string) {
    try {
        const news = await prisma.news.findUnique({
            where: { slug, published: true },
        });

        if (!news) {
            return { success: false, error: 'الخبر غير موجود' };
        }

        return { success: true, data: news };
    } catch (error) {
        console.error('Error fetching news:', error);
        return { success: false, error: 'حدث خطأ' };
    }
}

/**
 * Get single news by ID (admin)
 */
export async function getNewsById(id: string) {
    try {
        const news = await prisma.news.findUnique({
            where: { id },
        });

        if (!news) {
            return { success: false, error: 'الخبر غير موجود' };
        }

        return { success: true, data: news };
    } catch (error) {
        console.error('Error fetching news:', error);
        return { success: false, error: 'حدث خطأ' };
    }
}

/**
 * Create news (admin only)
 */
export async function createNews(data: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    excerpt?: string;
    images?: string[];
    category?: string;
    tags?: string[];
    published?: boolean;
    featured?: boolean;
}) {
    try {
        // Generate slug from English title
        const slug = data.titleEn
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const news = await prisma.news.create({
            data: {
                ...data,
                slug,
                publishedAt: data.published ? new Date() : null,
            },
        });

        revalidatePath('/news');
        revalidatePath('/admin/news');

        return { success: true, data: news };
    } catch (error) {
        console.error('Error creating news:', error);
        return { success: false, error: 'حدث خطأ أثناء إنشاء الخبر' };
    }
}

/**
 * Update news (admin only)
 */
export async function updateNews(
    id: string,
    data: Partial<{
        titleAr: string;
        titleEn: string;
        contentAr: string;
        contentEn: string;
        excerpt: string;
        images: string[];
        category: string;
        tags: string[];
        published: boolean;
        featured: boolean;
    }>
) {
    try {
        const news = await prisma.news.update({
            where: { id },
            data: {
                publishedAt: data.published ? new Date() : undefined,
            },
        });

        revalidatePath('/news');
        revalidatePath('/admin/news');

        return { success: true, data: news };
    } catch (error) {
        console.error('Error updating news:', error);
        return { success: false, error: 'حدث خطأ أثناء تحديث الخبر' };
    }
}

/**
 * Delete news (admin only)
 */
export async function deleteNews(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        const user = session?.user as any;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.news.delete({
            where: { id },
        });

        revalidatePath('/news');
        revalidatePath('/admin/news');

        return { success: true, data: null };
    } catch (error) {
        console.error('Error deleting news:', error);
        return { success: false, error: 'حدث خطأ أثناء حذف الخبر' };
    }
}

/**
 * Get ALL news for admin
 */
export async function getAllNews() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: news };
    } catch (error) {
        console.error('Error fetching all news:', error);
        return { success: false, error: 'Failed to fetch news' };
    }
}
