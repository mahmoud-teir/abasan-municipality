'use server';

import prisma from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

export async function getServiceTypes(locale: 'ar' | 'en' = 'ar') {
    try {
        const types = await prisma.serviceType.findMany({
            where: { active: true },
            orderBy: { createdAt: 'asc' },
            select: {
                slug: true,
                nameAr: true,
                nameEn: true,
            }
        });

        return {
            success: true,
            data: types.map(t => ({
                value: t.slug,
                label: locale === 'en' ? t.nameEn : t.nameAr
            }))
        };
    } catch (error) {
        console.error('Error fetching service types:', error);
        return { success: false, data: [] };
    }
}

export async function getAllServices() {
    try {
        const services = await prisma.serviceType.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: services };
    } catch (error) {
        console.error('Error fetching services:', error);
        return { success: false, error: 'Failed to fetch services' };
    }
}

export async function createService(formData: FormData) {
    try {
        const slug = formData.get('slug') as string;
        const nameAr = formData.get('nameAr') as string;
        const nameEn = formData.get('nameEn') as string;

        const service = await prisma.serviceType.create({
            data: {
                slug: slug.toUpperCase().replace(/\s+/g, '_'),
                nameAr,
                nameEn,
                active: true
            }
        });

        await logAudit({
            action: 'CREATE_SERVICE',
            details: `Created service: ${nameEn} (${nameAr})`,
            targetId: service.id
        });

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create service' };
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.serviceType.delete({
            where: { id }
        });

        await logAudit({
            action: 'DELETE_SERVICE',
            details: 'Service type deleted',
            targetId: id
        });

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete service' };
    }
}

export async function updateService(id: string, formData: FormData) {
    try {
        const slug = formData.get('slug') as string;
        const nameAr = formData.get('nameAr') as string;
        const nameEn = formData.get('nameEn') as string;
        const active = formData.get('active') === 'on';

        await prisma.serviceType.update({
            where: { id },
            data: {
                slug: slug.toUpperCase().replace(/\s+/g, '_'),
                nameAr,
                nameEn,
                active
            }
        });

        await logAudit({
            action: 'UPDATE_SERVICE',
            details: `Updated service: ${nameEn} (${nameAr})`,
            targetId: id
        });

        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update service' };
    }
}
