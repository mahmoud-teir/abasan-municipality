'use server';

import prisma from "@/lib/db/prisma";

export async function checkPhoneUsage(phone: string): Promise<boolean> {
    if (!phone) return false;
    const count = await prisma.user.count({
        where: { phone }
    });
    return count > 0;
}

export async function checkNationalIdUsage(nationalId: string): Promise<boolean> {
    if (!nationalId) return false;
    const count = await prisma.user.count({
        where: { nationalId }
    });
    return count > 0;
}
