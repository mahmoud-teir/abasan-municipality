import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/news - Get published news
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit');
        const featured = searchParams.get('featured');

        const news = await prisma.news.findMany({
            where: {
                published: true,
                ...(featured === 'true' ? { featured: true } : {}),
            },
            orderBy: { publishedAt: 'desc' },
            ...(limit ? { take: parseInt(limit) } : {}),
        });

        return NextResponse.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
