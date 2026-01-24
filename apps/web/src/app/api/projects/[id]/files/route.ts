import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hasPermission } from '@/lib/permissions';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check view permission
        if (!hasPermission(user, 'files.view')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const subPath = searchParams.get('path') || '';

        // Get project name to use as folder name
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const files = await storage.listFiles(project.name, subPath);
        return NextResponse.json({ files });
    } catch (error) {
        console.error('File list error:', error);
        return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check upload permission
        if (!hasPermission(user, 'files.attach')) { // Assuming 'attach' covers upload
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id: projectId } = await params;
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const subPath = formData.get('path') as string || '';

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const uploadedPaths = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            // TODO: In production, sanitize filename
            const fileName = subPath ? `${subPath}/${file.name}` : file.name;
            const path = await storage.saveFile(project.name, fileName, buffer);
            uploadedPaths.push(path);
        }

        return NextResponse.json({ success: true, paths: uploadedPaths });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
    }
}
