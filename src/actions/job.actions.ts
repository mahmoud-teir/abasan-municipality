'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { JobType, ApplicationStatus } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

/**
 * Public: Get Jobs
 */
export async function getJobs(page = 1, limit = 10, department?: string) {
    try {
        const skip = (page - 1) * limit;
        const where: any = { isActive: true };

        if (department) {
            where.department = department;
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.job.count({ where }),
        ]);

        return {
            success: true,
            data: {
                jobs,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page,
                    limit,
                },
            },
        };
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return { success: false, error: 'Failed to fetch jobs' };
    }
}

/**
 * Public: Get Job by Slug
 */
export async function getJobBySlug(slug: string) {
    try {
        const job = await prisma.job.findUnique({
            where: { slug },
        });

        if (!job) return { success: false, error: 'Job not found' };

        return { success: true, data: job };
    } catch (error) {
        console.error('Error fetching job:', error);
        return { success: false, error: 'Failed to fetch job' };
    }
}

/**
 * Public: Submit Application
 */
export async function submitApplication(jobId: string, data: any) {
    try {
        // Validation could be added here

        await prisma.jobApplication.create({
            data: {
                jobId,
                applicantName: data.name,
                email: data.email,
                phone: data.phone,
                message: data.message,
                cvUrl: data.cvUrl, // Optional
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error submitting application:', error);
        return { success: false, error: 'Failed to submit application' };
    }
}

/**
 * Admin: Create Job
 */
export async function createJob(data: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const slug = data.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await prisma.job.findUnique({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const job = await prisma.job.create({
            data: {
                slug: finalSlug,
                titleAr: data.titleAr,
                titleEn: data.titleEn,
                department: data.department,
                type: data.type || 'FULL_TIME',
                descriptionAr: data.descriptionAr,
                descriptionEn: data.descriptionEn,
                requirementsAr: data.requirementsAr,
                requirementsEn: data.requirementsEn,
                deadline: new Date(data.deadline),
                isActive: data.isActive !== false,
            }
        });

        revalidatePath('/careers');
        revalidatePath('/admin/careers');
        return { success: true, data: job };
    } catch (error) {
        console.error('Error creating job:', error);
        return { success: false, error: 'Failed to create job' };
    }
}

/**
 * Admin: Update Job
 */
export async function updateJob(id: string, data: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.job.update({
            where: { id },
            data: {
                titleAr: data.titleAr,
                titleEn: data.titleEn,
                department: data.department,
                type: data.type,
                descriptionAr: data.descriptionAr,
                descriptionEn: data.descriptionEn,
                requirementsAr: data.requirementsAr,
                requirementsEn: data.requirementsEn,
                deadline: new Date(data.deadline),
                isActive: data.isActive,
            }
        });

        revalidatePath('/careers');
        revalidatePath('/admin/careers');
        return { success: true };
    } catch (error) {
        console.error('Error updating job:', error);
        return { success: false, error: 'Failed to update job' };
    }
}

/**
 * Admin: Get Applications for Job
 */
export async function getJobApplications(jobId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const applications = await prisma.jobApplication.findMany({
            where: { jobId },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: applications };

    } catch (error) {
        return { success: false, error: 'Failed to fetch applications' };
    }
}

/**
 * Admin: Get All Jobs (Admin View - Includes Inactive)
 */
export async function getAdminJobs() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { applications: true }
                }
            }
        });

        return { success: true, data: jobs };
    } catch (error) {
        console.error('Error fetching admin jobs:', error);
        return { success: false, error: 'Failed to fetch jobs' };
    }
}

export async function deleteJob(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.job.delete({ where: { id } });

        revalidatePath('/careers');
        revalidatePath('/admin/careers');
        return { success: true };
    } catch (error) {
        console.error('Error deleting job:', error);
        return { success: false, error: 'Failed to delete job' };
    }
}
