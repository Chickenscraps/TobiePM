/**
 * PATCH /api/tasks/[id]/status
 * 
 * Update task status (for swipe-to-complete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Check task exists
        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Update task
        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                status,
                completedAt: status === 'DONE' ? new Date() : null,
            },
        });

        return NextResponse.json({ task: updatedTask });
    } catch (error) {
        console.error('Task status update error:', error);
        return NextResponse.json(
            { error: 'Failed to update task status' },
            { status: 500 }
        );
    }
}
