'use server';

import prisma from "@/lib/db/prisma";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function listMedia(page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit;
        const [files, total] = await Promise.all([
            prisma.mediaFile.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.mediaFile.count()
        ]);

        return {
            success: true,
            data: files,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        };
    } catch (error) {
        console.error("Error listing media:", error);
        return { success: false, error: "Failed to fetch media" };
    }
}

export async function deleteMedia(id: string, key: string) {
    try {
        // Delete from UploadThing
        await utapi.deleteFiles(key);

        // Delete from DB
        await prisma.mediaFile.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting media:", error);
        return { success: false, error: "Failed to delete file" };
    }
}

export async function deleteMediaByKeys(keys: string[]) {
    try {
        if (!keys.length) return { success: true };

        // Delete from UploadThing
        await utapi.deleteFiles(keys);

        // Delete from DB
        await prisma.mediaFile.deleteMany({
            where: {
                key: { in: keys }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting media by keys:", error);
        return { success: false, error: "Failed to delete files" };
    }
}

export async function trackUpload(data: {
    url: string;
    key: string;
    filename: string;
    size: number;
    type: string;
    uploadedBy: string;
}) {
    try {
        const file = await prisma.mediaFile.create({
            data
        });
        return { success: true, data: file };
    } catch (error) {
        console.error("Error tracking upload:", error);
        return { success: false, error: "Failed to track upload" };
    }
}
