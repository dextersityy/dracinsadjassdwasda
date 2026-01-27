"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Episode } from '@/types';

interface PlayerContextType {
    // Current playing state
    currentEpisode: Episode | null;
    currentDramaName: string;
    isPlaying: boolean;
    isExpanded: boolean;
    episodes: Episode[];
    currentIndex: number;

    // Actions
    playEpisode: (episode: Episode, dramaName: string, allEpisodes: Episode[], index: number) => void;
    togglePlayPause: () => void;
    expand: () => void;
    minimize: () => void;
    closePlayer: () => void;
    nextEpisode: () => void;
    prevEpisode: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [currentDramaName, setCurrentDramaName] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const playEpisode = useCallback((episode: Episode, dramaName: string, allEpisodes: Episode[], index: number) => {
        setCurrentEpisode(episode);
        setCurrentDramaName(dramaName);
        setEpisodes(allEpisodes);
        setCurrentIndex(index);
        setIsPlaying(true);
        setIsExpanded(true);
    }, []);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const expand = useCallback(() => {
        setIsExpanded(true);
    }, []);

    const minimize = useCallback(() => {
        setIsExpanded(false);
    }, []);

    const closePlayer = useCallback(() => {
        setCurrentEpisode(null);
        setIsPlaying(false);
        setIsExpanded(false);
    }, []);

    const nextEpisode = useCallback(() => {
        if (currentIndex < episodes.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setCurrentEpisode(episodes[newIndex]);
        }
    }, [currentIndex, episodes]);

    const prevEpisode = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            setCurrentEpisode(episodes[newIndex]);
        }
    }, [currentIndex, episodes]);

    return (
        <PlayerContext.Provider value={{
            currentEpisode,
            currentDramaName,
            isPlaying,
            isExpanded,
            episodes,
            currentIndex,
            playEpisode,
            togglePlayPause,
            expand,
            minimize,
            closePlayer,
            nextEpisode,
            prevEpisode,
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
