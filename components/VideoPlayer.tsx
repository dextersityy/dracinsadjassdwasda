"use client";

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { PaywallModal } from '@/components/PaywallModal';
import { Episode } from '@/types';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    episode: Episode;
    userId: string;
    onUnlock?: () => void;
}

export function VideoPlayer({ episode, userId, onUnlock }: VideoPlayerProps) {
    const [access, setAccess] = useState<'pending' | 'granted' | 'denied'>('pending');
    const [showPaywall, setShowPaywall] = useState(false);
    const [loadingAd, setLoadingAd] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Check access when episode changes
    useEffect(() => {
        let mounted = true;
        setAccess('pending');
        setShowPaywall(false);

        // If it's free, grant access immediately (client-side optimization)
        // BUT we still verify with backend to deduct credit if logic requires it.
        // However, the prompt says "isCharge" 0 = Free. 
        // Usually "Free" eps don't deduct credits, but "Paid" (isCharge=1) do.
        // Let's assume for this "Fremium" model:
        // - Free episodes: Just play.
        // - Locked episodes: Check credits/VIP.

        const check = async () => {
            if (episode.isCharge === 0) {
                if (mounted) setAccess('granted');
                return;
            }

            try {
                const result = await apiClient.checkAccess(userId);
                if (!mounted) return;

                if (result.allowed) {
                    setAccess('granted');
                    if (onUnlock) onUnlock();
                } else {
                    setAccess('denied');
                    setShowPaywall(true);
                }
            } catch (e) {
                console.error("Access check failed", e);
                // Fail open or closed? Closed for security.
                setAccess('denied');
            }
        };

        check();

        return () => { mounted = false; };
    }, [episode, userId, onUnlock]);

    const handleWatchAd = async () => {
        setLoadingAd(true);
        // Simulate Monetag Ad Interaction
        // In real implementation: window.monetag.show() -> callback
        setTimeout(async () => {
            try {
                await apiClient.verifyAd(userId, 'mock-token');
                setLoadingAd(false);
                setShowPaywall(false);
                // Re-check access
                const result = await apiClient.checkAccess(userId);
                if (result.allowed) {
                    setAccess('granted');
                    if (onUnlock) onUnlock();
                } else {
                    alert("Something went wrong. Please try again.");
                }
            } catch (e) {
                setLoadingAd(false);
                alert("Ad verification failed.");
            }
        }, 3000); // 3 seconds mock ad
    };

    if (access === 'pending') {
        return (
            <div className="aspect-video w-full bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full bg-black overflow-hidden group">
            {access === 'granted' ? (
                <video
                    ref={videoRef}
                    src={episode.videoUrl}
                    poster="https://via.placeholder.com/640x360/000000/FFFFFF?text=DracinAja+Player"
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                    controlsList="nodownload"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                    <div className="text-center">
                        <span className="text-3xl">🔒</span>
                        <p className="text-gray-400 mt-2">Locked Episode</p>
                    </div>
                </div>
            )}

            {/* Paywall Overlay */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)} // Optional: Go back?
                onWatchAd={handleWatchAd}
                loadingAd={loadingAd}
            />
        </div>
    );
}
