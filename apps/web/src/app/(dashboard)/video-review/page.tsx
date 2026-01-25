import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Play, ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export default async function VideoReviewPortal() {
    const videos = await prisma.videoAsset.findMany({
        include: {
            project: {
                select: {
                    name: true,
                    status: true
                }
            },
            creator: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'UNDER_REVIEW': return <Clock className="w-5 h-5 text-amber-500" />;
            default: return <ClipboardList className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Video Review Portal</h1>
                    <p className="text-gray-400 mt-1">
                        Central hub for project feedback and creative approvals
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <Link
                        key={video.id}
                        href={`/projects/${video.projectId}/review/${video.id}`}
                        className="group card overflow-hidden hover:ring-2 hover:ring-primary-500/50 transition-all"
                    >
                        {/* Thumbnail Placeholder/Preview */}
                        <div className="aspect-video bg-black/40 relative flex items-center justify-center overflow-hidden">
                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                    <Play className="w-12 h-12 text-white/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-[10px] font-mono text-white">
                                {video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-xl">
                                    <Play className="ml-1 w-6 h-6 fill-current" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-900/50">
                            <div className="flex items-start justify-between mb-2">
                                <h2 className="font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
                                    {video.title}
                                </h2>
                                {getStatusIcon(video.status)}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-tighter text-[10px]">
                                        v{video.version}
                                    </span>
                                    <span className="truncate">{video.project.name}</span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[10px] text-gray-600">Added by {video.creator.name}</span>
                                    <span className="text-[10px] text-primary-500 font-medium group-hover:translate-x-1 transition-transform">
                                        Open Review →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {videos.length === 0 && (
                    <div className="col-span-full card py-20 text-center">
                        <Play className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-500">No videos are currently available for review</p>
                    </div>
                )}
            </div>
        </div>
    );
}
