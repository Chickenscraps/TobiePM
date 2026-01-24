'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoPlayer, VideoPlayerRef } from '@/components/video/VideoPlayer';
import { CommentTimeline } from '@/components/video/CommentTimeline';
import { Loader2 } from 'lucide-react';
import { use } from 'react';

interface VideoData {
    id: string;
    title: string;
    fileUrl: string;
    version: number;
    duration: number | null;
    creator: {
        name: string;
        avatarUrl: string | null;
    };
}

interface Comment {
    id: string;
    timestamp: number;
    content: string;
    isResolved: boolean;
    author: {
        name: string;
        image: string | null;
    };
    createdAt: string;
}

export default function ReviewPage({ params }: { params: Promise<{ id: string; videoId: string }> }) {
    const { videoId } = use(params);
    const videoRef = useRef<VideoPlayerRef>(null);

    const [video, setVideo] = useState<VideoData | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [videoRes, commentsRes] = await Promise.all([
                fetch(`/api/videos/${videoId}`),
                fetch(`/api/videos/${videoId}/comments`),
            ]);

            if (!videoRes.ok || !commentsRes.ok) throw new Error('Failed to fetch data');

            const videoData = await videoRes.json();
            const commentsData = await commentsRes.json();

            setVideo(videoData);
            setComments(commentsData);
        } catch (error) {
            console.error('Error loading review page:', error);
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        try {
            const res = await fetch(`/api/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    timestamp: currentTime,
                }),
            });

            if (res.ok) {
                setNewComment('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsPosting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
                    <p className="text-neutral-400">The requested video could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center px-6 border-b border-white/10 bg-neutral-900/50 backdrop-blur-sm z-10">
                    <h1 className="text-lg font-semibold truncate flex-1">{video.title} <span className="text-neutral-500 ml-2 text-sm font-normal">v{video.version}</span></h1>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <span>Uploaded by {video.creator.name}</span>
                    </div>
                </header>

                <div className="flex-1 relative flex flex-col justify-center bg-black">
                    <div className="max-w-5xl mx-auto w-full px-4 aspect-video max-h-[calc(100vh-12rem)]">
                        <VideoPlayer
                            ref={videoRef}
                            src={video.fileUrl}
                            className="w-full h-full shadow-2xl rounded-lg border border-white/10"
                            onTimeUpdate={setCurrentTime}
                            onDurationChange={setDuration}
                        />
                    </div>
                </div>

                <div className="h-24 bg-neutral-900 border-t border-white/10 px-6 flex items-center">
                    <CommentTimeline
                        duration={duration || 1}
                        currentTime={currentTime}
                        comments={comments}
                        onSeek={(time) => {
                            videoRef.current?.seekTo(time);
                        }}
                    />
                </div>
            </div>

            <div className="w-96 border-l border-white/10 bg-neutral-900 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-400">Comments</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={`p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors ${Math.abs(comment.timestamp - currentTime) < 2 ? 'bg-white/5 ring-1 ring-primary-500/50' : 'bg-transparent'
                                }`}
                            onClick={() => videoRef.current?.seekTo(comment.timestamp)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm text-primary-400 font-mono">
                                    {Math.floor(comment.timestamp / 60)}:{Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="text-xs text-neutral-500">{comment.author.name}</span>
                            </div>
                            <p className="text-sm text-neutral-200">{comment.content}</p>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center py-10 text-neutral-600 italic">
                            No comments yet. Be the first to leave feedback!
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-neutral-900">
                    <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                        <span>Current Time: <span className="text-white font-mono">{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span></span>
                    </div>
                    <form onSubmit={handlePostComment}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type your feedback here..."
                            className="w-full bg-black/50 border border-white/10 rounded-md p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isPosting}
                            className="mt-2 w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isPosting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
