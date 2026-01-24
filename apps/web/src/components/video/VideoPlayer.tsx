'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

export interface VideoPlayerRef {
    seekTo: (time: number) => void;
}

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onTimeUpdate?: (currentTime: number) => void;
    onDurationChange?: (duration: number) => void;
    className?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
    src,
    poster,
    onTimeUpdate,
    onDurationChange,
    className = ''
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = Math.max(0, Math.min(time, videoRef.current.duration || 0));
            }
        }
    }));

    // Sync media events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onTimeUpdate?.(video.currentTime);
        };

        const handleDurationChange = () => {
            setDuration(video.duration);
            onDurationChange?.(video.duration);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', () => setIsPlaying(true));
            video.removeEventListener('pause', () => setIsPlaying(false));
        };
    }, [onTimeUpdate, onDurationChange]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    };

    const stepFrame = (frames: number) => {
        // Assume 30fps for now
        const frameTime = 1 / 30;
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(currentTime + (frames * frameTime), duration));
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (newVolume: number) => {
        if (!videoRef.current) return;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            videoRef.current.muted = false;
            setIsMuted(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`relative group bg-black rounded-lg overflow-hidden ${className}`}>
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
            />

            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 mt-2">
                    <button onClick={togglePlay} className="text-white hover:text-primary-400" title={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <div className="flex items-center gap-1 text-white/70 text-xs font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-2 border-l border-white/20 pl-4 ml-2">
                        <button onClick={() => stepFrame(-1)} className="text-white/70 hover:text-white" title="Prev Frame">
                            <SkipBack size={16} />
                        </button>
                        <button onClick={() => stepFrame(1)} className="text-white/70 hover:text-white" title="Next Frame">
                            <SkipForward size={16} />
                        </button>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-white hover:text-primary-400" title={isMuted ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-0 overflow-hidden group-hover/vol:w-20 transition-all accent-primary-500 h-1"
                                title="Volume"
                            />
                        </div>
                        <button
                            onClick={() => videoRef.current?.requestFullscreen()}
                            className="text-white hover:text-primary-400"
                            title="Fullscreen"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';
