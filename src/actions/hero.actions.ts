'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// ==========================================
// Get Slides
// ==========================================
export async function getHeroSlides() {
    try {
        const slides = await prisma.heroSlide.findMany({
            orderBy: {
                order: 'asc',
            },
        });
        return { success: true, data: slides };
    } catch (error) {
        console.error('Error fetching slides:', error);
        return { success: false, error: 'Failed to fetch slides' };
    }
}

// ==========================================
// Get Active Slides (Public)
// ==========================================
export async function getActiveHeroSlides() {
    try {
        const slides = await prisma.heroSlide.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: 'asc',
            },
        });
        return slides;
    } catch (error) {
        console.error('Error fetching active slides:', error);
        return [];
    }
}

// ==========================================
// Create Slide
// ==========================================
export async function createHeroSlide(data: {
    titleAr?: string;
    titleEn?: string;
    imageUrl: string;
    subtitleAr?: string;
    subtitleEn?: string;
    order?: number;
}) {
    try {
        const slide = await prisma.heroSlide.create({
            data: {
                ...data,
                titleAr: data.titleAr || "",
                titleEn: data.titleEn || "",
                order: data.order || 0,
            },
        });
        revalidatePath('/');
        return { success: true, data: slide };
    } catch (error) {
        console.error('Error creating slide:', error);
        return { success: false, error: 'Failed to create slide' };
    }
}

// ==========================================
// Update Slide
// ==========================================
export async function updateHeroSlide(id: string, data: {
    titleAr?: string;
    titleEn?: string;
    imageUrl?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    isActive?: boolean;
    order?: number;
}) {
    try {
        const slide = await prisma.heroSlide.update({
            where: { id },
            data,
        });
        revalidatePath('/');
        return { success: true, data: slide };
    } catch (error) {
        console.error('Error updating slide:', error);
        return { success: false, error: 'Failed to update slide' };
    }
}

// ==========================================
// Delete Slide
// ==========================================
export async function deleteHeroSlide(id: string) {
    try {
        const slide = await prisma.heroSlide.findUnique({
            where: { id },
        });

        if (!slide) {
            return { success: false, error: 'Slide not found' };
        }

        // Delete file from UploadThing if it exists
        if (slide.imageUrl) {
            try {
                // Extract key from URL (assuming standard UploadThing URL structure)
                const key = slide.imageUrl.substring(slide.imageUrl.lastIndexOf("/") + 1);

                if (key) {
                    await utapi.deleteFiles(key);

                    // Also delete from MediaFile table if tracked there
                    await prisma.mediaFile.deleteMany({
                        where: { key: key }
                    });
                }
            } catch (fileError) {
                console.error("Error deleting file:", fileError);
                // Continue with slide deletion even if file deletion fails
            }
        }

        await prisma.heroSlide.delete({
            where: { id },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting slide:', error);
        return { success: false, error: 'Failed to delete slide' };
    }
}
