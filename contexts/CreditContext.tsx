"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CreditContextType {
    credits: number;
    videosWatched: number;
    isVip: boolean;
    vipExpiry: Date | null;
    consumeVideo: () => boolean; // Returns true if allowed, false if paywall needed
    addCredits: (amount: number) => void;
    activateVip: () => void;
    resetVideosWatched: () => void;
}

const CreditContext = createContext<CreditContextType | null>(null);

export function useCredits() {
    const context = useContext(CreditContext);
    if (!context) {
        throw new Error('useCredits must be used within CreditProvider');
    }
    return context;
}

interface CreditProviderProps {
    children: ReactNode;
}

export function CreditProvider({ children }: CreditProviderProps) {
    // Load from localStorage on mount
    const [credits, setCredits] = useState(1); // Start with 1 credit (10 free videos)
    const [videosWatched, setVideosWatched] = useState(0);
    const [isVip, setIsVip] = useState(false);
    const [vipExpiry, setVipExpiry] = useState<Date | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCredits = localStorage.getItem('dramabox_credits');
            const savedVideos = localStorage.getItem('dramabox_videos_watched');
            const savedVip = localStorage.getItem('dramabox_is_vip');
            const savedVipExpiry = localStorage.getItem('dramabox_vip_expiry');

            if (savedCredits) setCredits(parseInt(savedCredits));
            if (savedVideos) setVideosWatched(parseInt(savedVideos));
            if (savedVip === 'true') {
                const expiry = savedVipExpiry ? new Date(savedVipExpiry) : null;
                if (expiry && expiry > new Date()) {
                    setIsVip(true);
                    setVipExpiry(expiry);
                } else {
                    // VIP expired
                    setIsVip(false);
                    localStorage.setItem('dramabox_is_vip', 'false');
                }
            }
            setIsLoaded(true);
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem('dramabox_credits', credits.toString());
            localStorage.setItem('dramabox_videos_watched', videosWatched.toString());
            localStorage.setItem('dramabox_is_vip', isVip.toString());
            if (vipExpiry) {
                localStorage.setItem('dramabox_vip_expiry', vipExpiry.toISOString());
            }
        }
    }, [credits, videosWatched, isVip, vipExpiry, isLoaded]);

    // Consume a video view - returns true if allowed
    const consumeVideo = (): boolean => {
        // VIP users always allowed
        if (isVip) return true;

        // Check if we have credits remaining
        const videosPerCredit = 10;
        const totalAllowedVideos = credits * videosPerCredit;

        if (videosWatched < totalAllowedVideos) {
            setVideosWatched(prev => prev + 1);
            return true;
        }

        // No credits left
        return false;
    };

    // Add credits (from watching ads)
    const addCredits = (amount: number) => {
        setCredits(prev => prev + amount);
    };

    // Activate VIP (1 month)
    const activateVip = () => {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        setIsVip(true);
        setVipExpiry(expiry);
    };

    // Reset videos watched (when buying new credits)
    const resetVideosWatched = () => {
        setVideosWatched(0);
    };

    return (
        <CreditContext.Provider value={{
            credits,
            videosWatched,
            isVip,
            vipExpiry,
            consumeVideo,
            addCredits,
            activateVip,
            resetVideosWatched,
        }}>
            {children}
        </CreditContext.Provider>
    );
}
