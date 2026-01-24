import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ClientReviewView from './ClientReviewView';

export const dynamic = 'force-dynamic';

export default async function PublicReviewPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const video = await prisma.videoAsset.findUnique({
        where: { publicToken: token },
        include: {
            creator: {
                select: { name: true, avatarUrl: true }
            },
            comments: {
                include: {
                    author: {
                        select: { name: true, avatarUrl: true }
                    }
                },
                orderBy: { timestamp: 'asc' }
            }
        }
    });

    if (!video) {
        notFound();
    }

    return <ClientReviewView token={token} initialVideo={video} />;
}
