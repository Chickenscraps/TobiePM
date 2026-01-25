import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Testing DB connectivity...');
        const userCount = await prisma.user.count();
        const admin = await prisma.user.findUnique({
            where: { email: 'josh@tobie.team' },
            select: { id: true, email: true, passwordHash: true }
        });

        return NextResponse.json({
            status: 'success',
            connection: 'OK',
            userCount,
            adminExists: !!admin,
            // Safe partial hash check to verify if the SQL update actually applied
            adminHashPrefix: admin?.passwordHash?.substring(0, 15) + '...',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('DB Connection Failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            name: error.name,
            // Check if it's a Prisma init/connection error
            isPrismaError: error.name?.includes('Prisma')
        }, { status: 500 });
    }
}
