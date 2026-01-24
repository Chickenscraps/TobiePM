import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const publicCommentSchema = z.object({
    token: z.string(),
    content: z.string().min(1),
    timestamp: z.number().min(0),
    authorName: z.string().optional().default('Client Guest'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = publicCommentSchema.parse(body);

        // Verify token and get video
        const video = await prisma.videoAsset.findUnique({
            where: { publicToken: validated.token },
            include: { creator: true }
        });

        if (!video) {
            return NextResponse.json({ error: 'Invalid review link' }, { status: 404 });
        }

        // Create comment as a guest
        // We need a way to represent guest users. 
        // For MVP, we might need a "Guest" user in DB or make authorId optional.
        // Looking at schema: author User @relation(...) -> authorId String. It's required.
        // So we need a "Guest" user or similar.
        // Alternatively, create a shadow user or use a system user.
        // Let's check schema again. VideoComment require authorId.

        // Strategy: Find or create a temporary guest user account? No, that's messy.
        // Better: Check if we can make authorId optional? It involves migration.
        // Given the constraints and time, I'll assign it to the video creator for now but prepend "Guest: " to content,
        // OR better, I will find the first admin user to assign as "system" actor if needed.
        // Actually, the best quick fix for MVP without altering schema too much:
        // Use the video creator as the author but mark checking "isGuest" if I had that field. 
        // I'll update the content to say "[Client] ..." 

        const comment = await prisma.videoComment.create({
            data: {
                videoId: video.id,
                content: `[Client] ${validated.content}`,
                timestamp: validated.timestamp,
                authorId: video.createdBy, // temporary fallback: assign to creator
                isOutOfScope: false,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        return NextResponse.json(comment);

    } catch (error) {
        console.error('Public comment error:', error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
