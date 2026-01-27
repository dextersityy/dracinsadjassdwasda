"use client";

import { usePlayer } from '@/contexts/PlayerContext';
import { MiniPlayer } from '@/components/MiniPlayer';
import { TikTokPlayer } from '@/components/TikTokPlayer';

export function GlobalMiniPlayer() {
    const {
        currentEpisode,
        currentDramaName,
        isPlaying,
        isExpanded,
        episodes,
        currentIndex,
        togglePlayPause,
        expand,
        minimize,
        closePlayer,
    } = usePlayer();

    // Don't render anything if no episode is playing
    if (!currentEpisode) return null;

    // Render full TikTok player when expanded
    if (isExpanded) {
        return (
            <TikTokPlayer
                episodes={episodes}
                dramaName={currentDramaName}
                initialEpisodeIndex={currentIndex}
                onClose={minimize}
            />
        );
    }

    // Render mini player when minimized
    return (
        <MiniPlayer
            episode={currentEpisode}
            dramaName={currentDramaName}
            isPlaying={isPlaying}
            onPlayPause={togglePlayPause}
            onExpand={expand}
            onClose={closePlayer}
        />
    );
}
