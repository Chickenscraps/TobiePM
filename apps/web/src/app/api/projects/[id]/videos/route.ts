/**
 * Video Assets API
 * 
 * POST: Upload new video
 * GET: List videos for a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // projectId
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const version = parseInt(formData.get('version') as string || '1');

        if (!file || !title) {
            return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'Invalid file type. Must be video.' }, { status: 400 });
        }

        // Verify project access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Upload to storage
        const fileUrl = await storage.uploadFile(file, `videos/${projectId}`);

        // Create database record
        const video = await prisma.videoAsset.create({
            data: {
                projectId,
                title,
                version,
                fileUrl,
                status: 'PENDING',
                createdBy: session.user.id,
            },
        });

        return NextResponse.json(video);
    } catch (error) {
        console.error('Video upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload video' },
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

        const { id: projectId } = await params;

        const videos = await prisma.videoAsset.findMany({
            where: { projectId },
            orderBy: { version: 'desc' },
            include: {
                creator: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: { comments: true },
                },
            },
        });

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Video list error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
