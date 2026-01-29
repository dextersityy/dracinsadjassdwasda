"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserIdAsync, getUserData, createUser, syncUserData, UserData } from '@/lib/user-service';

interface CreditContextType {
    credits: number;
    videosWatched: number;
    isVip: boolean;
    vipExpiry: Date | null;
    userId: string | null;
    isLoading: boolean;
    consumeVideo: () => boolean;
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
    const [credits, setCredits] = useState(1);
    const [videosWatched, setVideosWatched] = useState(0);
    const [isVip, setIsVip] = useState(false);
    const [vipExpiry, setVipExpiry] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load user data from Firebase or localStorage
    useEffect(() => {
        async function loadUserData() {
            if (typeof window === 'undefined') return;

            try {
                const id = await getUserIdAsync();
                if (!id) {
                    // Auth not ready yet, will retry
                    setIsLoading(false);
                    return;
                }
                setUserId(id);

                // Try to load from Firebase first
                const firebaseData = await getUserData(id);

                if (firebaseData) {
                    // Data exists in Firebase - use it
                    setCredits(firebaseData.credits);
                    setVideosWatched(firebaseData.videosWatched);

                    // Check VIP expiry
                    if (firebaseData.isVip && firebaseData.vipExpiry) {
                        if (firebaseData.vipExpiry > new Date()) {
                            setIsVip(true);
                            setVipExpiry(firebaseData.vipExpiry);
                        } else {
                            // VIP expired
                            setIsVip(false);
                            setVipExpiry(null);
                        }
                    }

                    // Sync to localStorage as cache
                    saveToLocalStorage({
                        credits: firebaseData.credits,
                        videosWatched: firebaseData.videosWatched,
                        isVip: firebaseData.isVip,
                        vipExpiry: firebaseData.vipExpiry,
                    });
                } else {
                    // No Firebase data - check localStorage for existing data
                    const localData = loadFromLocalStorage();

                    if (localData) {
                        // Migrate localStorage data to Firebase
                        setCredits(localData.credits);
                        setVideosWatched(localData.videosWatched);
                        setIsVip(localData.isVip);
                        setVipExpiry(localData.vipExpiry);

                        await createUser(id, localData);
                    } else {
                        // Brand new user - create in Firebase
                        await createUser(id);
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                // Fallback to localStorage on error
                const localData = loadFromLocalStorage();
                if (localData) {
                    setCredits(localData.credits);
                    setVideosWatched(localData.videosWatched);
                    setIsVip(localData.isVip);
                    setVipExpiry(localData.vipExpiry);
                }
            } finally {
                setIsLoading(false);
                setIsLoaded(true);
            }
        }

        loadUserData();
    }, []);

    // Sync to Firebase and localStorage when state changes
    useEffect(() => {
        if (!isLoaded || !userId) return;

        const syncData = async () => {
            try {
                await syncUserData(userId, {
                    credits,
                    videosWatched,
                    isVip,
                    vipExpiry,
                });
            } catch (error) {
                console.error('Error syncing to Firebase:', error);
            }

            // Always save to localStorage as cache
            saveToLocalStorage({ credits, videosWatched, isVip, vipExpiry });
        };

        syncData();
    }, [credits, videosWatched, isVip, vipExpiry, userId, isLoaded]);

    // Helper: Load from localStorage
    const loadFromLocalStorage = useCallback((): UserData | null => {
        if (typeof window === 'undefined') return null;

        const savedCredits = localStorage.getItem('dracinaja_credits');
        const savedVideos = localStorage.getItem('dracinaja_videos_watched');
        const savedVip = localStorage.getItem('dracinaja_is_vip');
        const savedVipExpiry = localStorage.getItem('dracinaja_vip_expiry');

        if (!savedCredits && !savedVideos && !savedVip) return null;

        const vipExpiry = savedVipExpiry ? new Date(savedVipExpiry) : null;
        const isVipValid = savedVip === 'true' && vipExpiry && vipExpiry > new Date();

        return {
            credits: savedCredits ? parseInt(savedCredits) : 1,
            videosWatched: savedVideos ? parseInt(savedVideos) : 0,
            isVip: !!isVipValid,
            vipExpiry: isVipValid ? vipExpiry : null,
        };
    }, []);

    // Helper: Save to localStorage
    const saveToLocalStorage = (data: UserData) => {
        if (typeof window === 'undefined') return;

        localStorage.setItem('dracinaja_credits', data.credits.toString());
        localStorage.setItem('dracinaja_videos_watched', data.videosWatched.toString());
        localStorage.setItem('dracinaja_is_vip', data.isVip.toString());
        if (data.vipExpiry) {
            localStorage.setItem('dracinaja_vip_expiry', data.vipExpiry.toISOString());
        }
    };

    // Consume a video view
    // Consume a video view
    const consumeVideo = (): boolean => {
        if (isVip) return true;

        if (credits > 0) {
            setCredits(prev => Math.max(0, prev - 1));
            setVideosWatched(prev => prev + 1); // Keep tracking total watched for stats
            return true;
        }

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

    // Reset videos watched
    const resetVideosWatched = () => {
        setVideosWatched(0);
    };

    return (
        <CreditContext.Provider value={{
            credits,
            videosWatched,
            isVip,
            vipExpiry,
            userId,
            isLoading,
            consumeVideo,
            addCredits,
            activateVip,
            resetVideosWatched,
        }}>
            {children}
        </CreditContext.Provider>
    );
}
