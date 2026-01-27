"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronUp, Pause, Play, X } from 'lucide-react';
import { Episode } from '@/types';

interface MiniPlayerProps {
    episode: Episode | null;
    dramaName: string;
    isPlaying: boolean;
    onPlayPause: () => void;
    onExpand: () => void;
    onClose: () => void;
}

export function MiniPlayer({
    episode,
    dramaName,
    isPlaying,
    onPlayPause,
    onExpand,
    onClose
}: MiniPlayerProps) {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current || !episode) return;

        const updateProgress = () => {
            if (videoRef.current) {
                const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
                setProgress(isNaN(percent) ? 0 : percent);
            }
        };

        const video = videoRef.current;
        video.addEventListener('timeupdate', updateProgress);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
        };
    }, [episode]);

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying]);

    if (!episode) return null;

    return (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-3">
            <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden shadow-xl">
                {/* Progress bar */}
                <div className="h-1 bg-gray-800 w-full">
                    <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center gap-3 p-3">
                    {/* Thumbnail / Mini Video */}
                    <div
                        className="relative w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 cursor-pointer"
                        onClick={onExpand}
                    >
                        <video
                            ref={videoRef}
                            src={episode.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <ChevronUp size={16} className="text-white" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
                        <p className="text-white text-sm font-medium truncate">{dramaName}</p>
                        <p className="text-gray-400 text-xs truncate">
                            {episode.chapterName || 'Episode'}
                        </p>
                    </div>

                    {/* Play/Pause */}
                    <button
                        onClick={onPlayPause}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                    >
                        {isPlaying ? (
                            <Pause size={20} className="text-white" />
                        ) : (
                            <Play size={20} className="text-white ml-0.5" />
                        )}
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
