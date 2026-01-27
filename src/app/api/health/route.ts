import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Abasan Municipality Platform',
        version: '1.0.0',
    });
}
