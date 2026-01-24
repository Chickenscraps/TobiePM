/**
 * Video Comments API
 * 
 * POST: Add comment
 * GET: List comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // videoId
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: videoId } = await params;
        const body = await request.json();
        const { content, timestamp, isOutOfScope } = body;

        if (!content || timestamp === undefined) {
            return NextResponse.json({ error: 'Missing content or timestamp' }, { status: 400 });
        }

        const comment = await prisma.videoComment.create({
            data: {
                videoId,
                content,
                timestamp,
                authorId: session.user.id,
                isOutOfScope: isOutOfScope || false,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Add comment error:', error);
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        );
    }
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: videoId } = await params;

        const comments = await prisma.videoComment.findMany({
            where: { videoId },
            orderBy: { timestamp: 'asc' },
            include: {
                author: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Fetch comments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}
