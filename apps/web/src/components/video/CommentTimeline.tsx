'use client';

interface CommentMarker {
    id: string;
    timestamp: number;
    userColor?: string;
    isResolved?: boolean;
}

interface CommentTimelineProps {
    duration: number;
    currentTime: number;
    comments: CommentMarker[];
    onSeek: (time: number) => void;
}

export function CommentTimeline({
    duration,
    currentTime,
    comments,
    onSeek
}: CommentTimelineProps) {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        onSeek(percent * duration);
    };

    return (
        <div className="relative h-8 w-full group cursor-pointer" onClick={handleClick}>
            {/* Background Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 -mt-[3px] bg-white/10 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <div
                    className="h-full bg-primary-500 relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                />
            </div>

            {/* Comment Markers */}
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className={`
                        absolute top-1/2 -mt-1.5 w-3 h-3 rounded-full border border-black/50 transform -translate-x-1/2
                        transition-transform hover:scale-150 z-10
                        ${comment.isResolved ? 'bg-green-500' : 'bg-amber-500'}
                    `}
                    style={{ left: `${(comment.timestamp / duration) * 100}%` }}
                    title={`Go to ${comment.timestamp.toFixed(1)}s`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSeek(comment.timestamp);
                    }}
                />
            ))}

            {/* Scrubber Knob (visible on hover) */}
            <div
                className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transform -translate-x-1/2 transition-opacity"
                style={{ left: `${(currentTime / duration) * 100}%` }}
            />
        </div>
    );
}
