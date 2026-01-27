import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth/auth"; // Better Auth
import { headers } from "next/headers";

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
            console.log("file url", file.url);
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
            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
