'use server';

import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const trackSchema = z.string().min(5);

export async function trackReference(referenceNo: string) {
    try {
        const query = trackSchema.parse(referenceNo);

        // 1. Check Requests
        const request = await prisma.request.findFirst({
            where: { requestNo: { equals: query, mode: 'insensitive' } },
            select: {
                requestNo: true,
                status: true,
                createdAt: true,
                type: true,
            }
        });

        if (request) {
            return {
                success: true,
                data: {
                    type: 'REQUEST',
                    reference: request.requestNo,
                    status: request.status,
                    createdAt: request.createdAt,
                    category: request.type
                }
            };
        }

        // 2. Check Complaints
        const complaint = await prisma.complaint.findFirst({
            where: { complaintNo: { equals: query, mode: 'insensitive' } },
            select: {
                complaintNo: true,
                status: true,
                createdAt: true,
                category: true,
            }
        });

        if (complaint) {
            return {
                success: true,
                data: {
                    type: 'COMPLAINT',
                    reference: complaint.complaintNo,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                    category: complaint.category
                }
            };
        }

        return { success: false, error: 'notFound' };

    } catch (error) {
        console.error('Track error:', error);
        return { success: false, error: 'error' };
    }
}
