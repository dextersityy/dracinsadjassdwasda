import { Episode } from '@/types';
import clsx from 'clsx';
import { Lock, Play } from 'lucide-react';

interface EpisodeSelectorProps {
    episodes: Episode[];
    currentEpisodeId: string | null;
    onSelect: (ep: Episode) => void;
    isVip: boolean;
}

export function EpisodeSelector({ episodes, currentEpisodeId, onSelect, isVip }: EpisodeSelectorProps) {
    return (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Episodes <span className="text-xs text-gray-500 font-normal">({episodes.length})</span>
            </h3>
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {episodes.map((ep) => {
                    const isActive = currentEpisodeId === ep.chapterId;
                    const isLocked = !isVip && ep.isCharge === 1;

                    return (
                        <button
                            key={ep.chapterId}
                            onClick={() => onSelect(ep)}
                            className={clsx(
                                "relative flex h-12 items-center justify-center rounded-md text-sm font-medium transition-all active:scale-95",
                                isActive
                                    ? "bg-amber-500 text-black shadow-amber-500/20 shadow-lg"
                                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                            )}
                        >
                            {ep.chapterName.replace('EP ', '')}
                            {isActive && <Play size={10} className="absolute top-1 right-1 fill-black" />}
                            {!isActive && isLocked && <Lock size={10} className="absolute top-1 right-1 text-gray-500" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
