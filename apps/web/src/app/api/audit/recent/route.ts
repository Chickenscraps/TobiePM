import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/permissions';

export async function GET(_request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch recent audit logs
        // Join with User table to get names
        const logs = await prisma.auditLog.findMany({
            take: 20,
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Format for frontend
        const formattedLogs = logs.map(log => ({
            id: log.id,
            timestamp: log.timestamp.toISOString(),
            eventType: log.eventType,
            details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
            user: log.user
        }));

        return NextResponse.json({ logs: formattedLogs });
    } catch (error) {
        console.error('Audit API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
