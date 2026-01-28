'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

const projectSchema = z.object({
    titleAr: z.string().min(1, 'العنوان العربي مطلوب'),
    titleEn: z.string().min(1, 'English title is required'),
    descriptionAr: z.string().min(1, 'الوصف العربي مطلوب'),
    descriptionEn: z.string().min(1, 'English description is required'),
    status: z.nativeEnum(ProjectStatus),
    budget: z.number().optional().nullable(),
    contractor: z.string().optional().nullable(),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    images: z.array(z.string()).optional(),
    completionPercentage: z.number().min(0).max(100).default(0),
    location: z.string().optional().nullable(),
});

/**
 * Get Projects (Public/Admin)
 */
export async function getProjects(page = 1, limit = 10, status?: ProjectStatus) {
    try {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.project.count({ where }),
        ]);

        return {
            success: true,
            data: {
                projects,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            },
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return { success: false, error: 'Failed to fetch projects' };
    }
}

/**
 * Get Project by Slug
 */
export async function getProjectBySlug(slug: string) {
    try {
        const project = await prisma.project.findUnique({
            where: { slug },
        });

        if (!project) return { success: false, error: 'Project not found' };

        return { success: true, data: project };
    } catch (error) {
        console.error('Error fetching project:', error);
        return { success: false, error: 'Failed to fetch project' };
    }
}

/**
 * Create Project (Admin)
 */
export async function createProject(data: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        // Validate
        // Note: Zod date validation might require transformation if data is string ISO
        // For simplicity, we assume front-end sends correct types or we cast.
        // We manually construct payload to be safe.

        const slug = data.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Ensure unique slug
        const existing = await prisma.project.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const project = await prisma.project.create({
            data: {
                slug: finalSlug,
                titleAr: data.titleAr,
                titleEn: data.titleEn,
                descriptionAr: data.descriptionAr,
                descriptionEn: data.descriptionEn,
                status: data.status || 'PLANNED',
                budget: data.budget ? Number(data.budget) : null,
                contractor: data.contractor,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                images: data.images || [],
                completionPercentage: Number(data.completionPercentage) || 0,
                location: data.location,
            }
        });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: project };
    } catch (error) {
        console.error('Error creating project:', error);
        return { success: false, error: 'Failed to create project' };
    }
}

/**
 * Update Project
 */
export async function updateProject(id: string, data: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.project.update({
            where: { id },
            data: {
                titleAr: data.titleAr,
                titleEn: data.titleEn,
                descriptionAr: data.descriptionAr,
                descriptionEn: data.descriptionEn,
                status: data.status,
                budget: data.budget ? Number(data.budget) : null,
                contractor: data.contractor,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                images: data.images || [],
                completionPercentage: Number(data.completionPercentage) || 0,
                location: data.location,
            }
        });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, error: 'Failed to update project' };
    }
}

/**
 * Delete Project
 */
export async function deleteProject(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.project.delete({ where: { id } });

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (error) {
        console.error('Error deleting project:', error);
        return { success: false, error: 'Failed to delete project' };
    }
}
