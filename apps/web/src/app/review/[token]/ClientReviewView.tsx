'use client';

import { useState, useRef } from 'react';
import { VideoPlayer, VideoPlayerRef } from '@/components/video/VideoPlayer';
import { CommentTimeline } from '@/components/video/CommentTimeline';
import { AIReviewSidebar } from '@/components/video/AIReviewSidebar';


interface ClientReviewViewProps {
    token: string;
    initialVideo: any; // Using any to bypass potential type mismatches if client isn't fully regenerated
}

export default function ClientReviewView({ token, initialVideo }: ClientReviewViewProps) {
    const videoRef = useRef<VideoPlayerRef>(null);
    const [comments, setComments] = useState<any[]>(initialVideo.comments || []);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        try {
            const res = await fetch('/api/public/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    content: newComment,
                    timestamp: currentTime,
                }),
            });

            if (res.ok) {
                const comment = await res.json();
                setComments(prev => [...prev, comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden font-sans">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-neutral-900 z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-lg">T</div>
                        <h1 className="font-semibold">{initialVideo.title} <span className="opacity-50 text-sm font-normal">v{initialVideo.version}</span></h1>
                    </div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium px-3 py-1 bg-white/5 rounded-full">
                        Client Review Mode
                    </div>
                </header>

                <div className="flex-1 relative bg-black flex items-center justify-center">
                    <div className="w-full h-full max-h-[calc(100vh-10rem)] aspect-video p-4">
                        <VideoPlayer
                            ref={videoRef}
                            src={initialVideo.fileUrl}
                            className="w-full h-full shadow-2xl rounded-lg border border-white/10"
                            onTimeUpdate={setCurrentTime}
                            onDurationChange={setDuration}
                        />
                    </div>
                </div>

                <div className="h-20 bg-neutral-900 border-t border-white/10 px-6 flex items-center">
                    <CommentTimeline
                        duration={duration || 1}
                        currentTime={currentTime}
                        comments={comments}
                        onSeek={(time) => videoRef.current?.seekTo(time)}
                    />
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-white/10 bg-neutral-900 flex flex-col">
                {/* AI Assistant Toggle */}
                <div className="flex-1 flex flex-col min-h-0">
                    <AIReviewSidebar
                        currentTime={currentTime}
                        onSeek={(time) => videoRef.current?.seekTo(time)}
                    />
                </div>

                {/* Quick Comment Input */}
                <div className="p-4 border-t border-white/10 bg-neutral-800">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Leave Feedback</h3>
                    <form onSubmit={handlePostComment}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm text-white resize-none h-20 mb-2 focus:ring-1 focus:ring-primary-500 outline-none"
                            placeholder="Type feedback for this frame..."
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePostComment(e))}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isPosting}
                            className="w-full bg-white text-black font-medium py-2 rounded text-sm hover:bg-neutral-200 disabled:opacity-50"
                        >
                            {isPosting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
