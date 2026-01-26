"use client";

import { useState, useRef, useEffect } from 'react';
import { Episode } from '@/types';
import { Music2, ChevronUp, ChevronDown } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { PaywallModal } from '@/components/PaywallModal';

interface TikTokPlayerProps {
    episodes: Episode[];
    dramaName: string;
    initialEpisodeIndex?: number;
    onClose: () => void;
}

export function TikTokPlayer({ episodes, dramaName, initialEpisodeIndex = 0, onClose }: TikTokPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialEpisodeIndex);
    const [isPaused, setIsPaused] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false); // Prevents watching without credits
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { consumeVideo, isVip, credits, videosWatched } = useCredits();

    const currentEpisode = episodes[currentIndex];
    const hasNext = currentIndex < episodes.length - 1;
    const hasPrev = currentIndex > 0;

    // Check credits and block if insufficient
    const checkAndConsumeCredit = (): boolean => {
        const allowed = consumeVideo();
        if (!allowed) {
            setShowPaywall(true);
            setIsBlocked(true);
            // PAUSE the video immediately
            if (videoRef.current) {
                videoRef.current.pause();
            }
            return false;
        }
        return true;
    };

    // Check credit on initial load
    useEffect(() => {
        checkAndConsumeCredit();
    }, []);

    // Pause video when paywall is shown
    useEffect(() => {
        if (showPaywall && videoRef.current) {
            videoRef.current.pause();
            setIsPaused(true);
        }
    }, [showPaywall]);

    // Auto-play next episode when current ends
    const handleVideoEnd = () => {
        if (hasNext) {
            const allowed = checkAndConsumeCredit();
            if (allowed) {
                setCurrentIndex(prev => prev + 1);
            }
        }
    };

    // Toggle play/pause on tap - but block if no credits
    const togglePlayPause = () => {
        if (isBlocked) {
            setShowPaywall(true);
            return;
        }

        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    // Handle swipe navigation
    const [touchStart, setTouchStart] = useState(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        // Block navigation if no credits
        if (isBlocked) {
            setShowPaywall(true);
            return;
        }

        const touchEnd = e.changedTouches[0].clientY;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && hasNext) {
                // Swipe up = next - check credits first
                const allowed = checkAndConsumeCredit();
                if (allowed) {
                    setCurrentIndex(prev => prev + 1);
                }
            } else if (diff < 0 && hasPrev) {
                // Swipe down = prev (no credit needed for going back)
                setCurrentIndex(prev => prev - 1);
            }
        }
    };

    // Reset video when episode changes
    useEffect(() => {
        if (videoRef.current && !isBlocked) {
            videoRef.current.load();
            videoRef.current.play().catch(() => { });
            setIsPaused(false);
        }
    }, [currentIndex]);

    // Handle paywall success (user watched ad or bought VIP)
    const handlePaywallSuccess = () => {
        setShowPaywall(false);
        setIsBlocked(false);
        // Resume playback
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
            setIsPaused(false);
        }
    };

    // Handle paywall close - if blocked, go back to detail
    const handlePaywallClose = () => {
        if (isBlocked) {
            // User can't continue without credits - exit player
            onClose();
        } else {
            setShowPaywall(false);
        }
    };

    // Calculate remaining videos
    const remainingVideos = isVip ? '∞' : Math.max(0, (credits * 10) - videosWatched);

    return (
        <>
            <div
                ref={containerRef}
                className="fixed inset-0 z-50 bg-black"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Video */}
                <video
                    ref={videoRef}
                    src={currentEpisode?.videoUrl}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                    autoPlay={!isBlocked}
                    playsInline
                    onClick={togglePlayPause}
                    onEnded={handleVideoEnd}
                />

                {/* Blocked Overlay */}
                {isBlocked && (
                    <div
                        className="absolute inset-0 bg-black/80 flex items-center justify-center cursor-pointer"
                        onClick={() => setShowPaywall(true)}
                    >
                        <div className="text-center">
                            <div className="h-20 w-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                                <span className="text-4xl">🔒</span>
                            </div>
                            <p className="text-white font-bold">Kredit Habis</p>
                            <p className="text-gray-400 text-sm mt-1">Tap untuk melanjutkan</p>
                        </div>
                    </div>
                )}

                {/* Pause Indicator */}
                {isPaused && !isBlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-20 w-20 rounded-full bg-black/50 flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-1" />
                        </div>
                    </div>
                )}

                {/* Top Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="text-white text-2xl font-light"
                    >
                        ✕
                    </button>
                    <div className="text-center flex-1">
                        <p className="text-white text-sm font-semibold truncate max-w-[200px] mx-auto">
                            {dramaName}
                        </p>
                    </div>
                    {/* Credit Badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold">
                        {isVip ? '👑 VIP' : `🎬 ${remainingVideos}`}
                    </div>
                </div>

                {/* Bottom Overlay */}
                {!isBlocked && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        {/* Episode Info */}
                        <div className="mb-3">
                            <h3 className="text-white font-bold text-lg">
                                Episode {currentIndex + 1}
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                                {currentEpisode?.chapterName || `Episode ${currentIndex + 1} of ${episodes.length}`}
                            </p>
                        </div>

                        {/* Sound/Music Row */}
                        <div className="flex items-center gap-2 text-white/80">
                            <Music2 size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                            <p className="text-xs truncate">Original Sound - DramaBox</p>
                        </div>

                        {/* Episode Navigation Hint */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                            {hasPrev && <ChevronDown size={16} />}
                            <span>Swipe untuk episode lainnya</span>
                            {hasNext && <ChevronUp size={16} />}
                        </div>
                    </div>
                )}

                {/* Episode Progress Dots */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                    {episodes.slice(0, 10).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-amber-500 h-5' : 'bg-white/30'
                                }`}
                        />
                    ))}
                    {episodes.length > 10 && (
                        <div className="w-1 h-2 rounded-full bg-white/20" />
                    )}
                </div>
            </div>

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={handlePaywallClose}
                onSuccess={handlePaywallSuccess}
            />
        </>
    );
}
