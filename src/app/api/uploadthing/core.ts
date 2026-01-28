import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth/auth"; // Better Auth
import { headers } from "next/headers";

import prisma from "@/lib/db/prisma";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    documentUploader: f({
        pdf: { maxFileSize: "4MB", maxFileCount: 4 },
        image: { maxFileSize: "4MB", maxFileCount: 4 },
    })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({
                headers: await headers()
            });
            if (!session) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            try {
                const type = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'document';

                await prisma.mediaFile.create({
                    data: {
                        url: file.url,
                        key: file.key,
                        filename: file.name,
                        size: file.size,
                        type: type,
                        uploadedBy: metadata.userId
                    }
                });
            } catch (e) {
                console.error("Failed to track upload", e);
            }
            return { uploadedBy: metadata.userId };
        }),

    newsImageUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 10 },
    })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({
                headers: await headers()
            });
            if (!session) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("News Image Upload complete for userId:", metadata.userId);
            try {
                await prisma.mediaFile.create({
                    data: {
                        url: file.url,
                        key: file.key,
                        filename: file.name,
                        size: file.size,
                        type: 'image',
                        uploadedBy: metadata.userId
                    }
                });
            } catch (e) {
                console.error("Failed to track news image", e);
            }
            return { uploadedBy: metadata.userId };
        }),

    heroMediaUploader: f({
        image: { maxFileSize: "8MB", maxFileCount: 1 },
        video: { maxFileSize: "32MB", maxFileCount: 1 },
    })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({
                headers: await headers()
            });
            if (!session) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Hero Media Upload complete for userId:", metadata.userId);
            try {
                const type = file.name.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
                await prisma.mediaFile.create({
                    data: {
                        url: file.url,
                        key: file.key,
                        filename: file.name,
                        size: file.size,
                        type: type,
                        uploadedBy: metadata.userId
                    }
                });
            } catch (e) {
                console.error("Failed to track hero media", e);
            }
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
