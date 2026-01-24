/**
 * Single Video Asset API
 * 
 * GET: Get video details
 * PATCH: Update status/title
 * DELETE: Delete video
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage'; // For future delete implementation

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // videoId
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: videoId } = await params;

        const video = await prisma.videoAsset.findUnique({
            where: { id: videoId },
            include: {
                creator: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        return NextResponse.json(video);
    } catch (error) {
        console.error('Video details error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video details' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: videoId } = await params;
        const body = await request.json();
        const { title, status } = body;

        const video = await prisma.videoAsset.update({
            where: { id: videoId },
            data: {
                title,
                status,
            },
        });

        return NextResponse.json(video);
    } catch (error) {
        console.error('Video update error:', error);
        return NextResponse.json(
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: videoId } = await params;

        // Verify ownership or permission (TODO: check permissions)
        const video = await prisma.videoAsset.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        // Delete from storage (optional for MVP but good practice)
        if (video.fileUrl) {
            await storage.deleteFile(video.fileUrl);
        }

        await prisma.videoAsset.delete({
            where: { id: videoId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Video delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}
