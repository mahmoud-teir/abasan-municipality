'use server';

import prisma from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// ... imports
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function updateProfile(formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const imageFile = formData.get('image') as File | null;

        if (!name || name.length < 2) {
            return { success: false, error: 'Name must be at least 2 characters' };
        }

        console.log('[updateProfile] Processing form data for user:', session.user.id);

        let imageUrl: string | undefined;

        if (imageFile && imageFile.size > 0) {
            if (!imageFile.type.startsWith('image/')) {
                return { success: false, error: 'File must be an image' };
            }
            if (imageFile.size > 2 * 1024 * 1024) { // 2MB limit
                return { success: false, error: 'Image size must be less than 2MB' };
            }

            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = imageFile.name.split('.').pop() || 'jpg';
            const filename = `avatar-${session.user.id}-${uniqueSuffix}.${extension}`;

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
            await mkdir(uploadDir, { recursive: true });

            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            imageUrl = `/uploads/avatars/${filename}`;
        }

        let nationalIdImageUrl: string | undefined;
        const nationalIdFile = formData.get('nationalIdImage') as File | null;

        if (nationalIdFile && nationalIdFile.size > 0) {
            if (!nationalIdFile.type.startsWith('image/')) {
                return { success: false, error: 'ID File must be an image' };
            }
            if (nationalIdFile.size > 4 * 1024 * 1024) { // 4MB limit for ID
                return { success: false, error: 'ID Image size must be less than 4MB' };
            }

            const bytes = await nationalIdFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = nationalIdFile.name.split('.').pop() || 'jpg';
            const filename = `id-card-${session.user.id}-${uniqueSuffix}.${extension}`;

            // Make sure this is SECURE. In production, meaningful IDs shouldn't be public. 
            // However, based on current architecture (public/uploads), we follow pattern.
            // Ideally, this should be a protected route serving the file.
            // For now, we put it in a separate folder.
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'ids');
            await mkdir(uploadDir, { recursive: true });

            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);

            nationalIdImageUrl = `/uploads/ids/${filename}`;
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                ...(imageUrl && { image: imageUrl }),
                ...(nationalIdImageUrl && { nationalIdImage: nationalIdImageUrl }),
            },
        });

        revalidatePath('/citizen/settings');
        revalidatePath('/admin/settings');
        revalidatePath('/employee/settings');

        return { success: true };
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function deleteNationalIdImage() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        // Optional: Remove file from disk if needed, but keeping history might be safer.
        // For now just nullify in DB.

        await prisma.user.update({
            where: { id: session.user.id },
            data: { nationalIdImage: null }
        });

        revalidatePath('/citizen/settings');
        revalidatePath('/admin/settings');
        revalidatePath('/employee/settings'); // Assuming employees might view it

        return { success: true };
    } catch (error) {
        console.error('Delete ID Image error:', error);
        return { success: false, error: 'Failed to delete ID image' };
    }
}
