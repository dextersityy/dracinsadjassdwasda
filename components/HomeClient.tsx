"use client";

import { useState } from 'react';
import { Drama } from '@/types';
import { DramaCard } from '@/components/DramaCard';
import { HorizontalScrollList } from '@/components/HorizontalScrollList';
import { Search, ListMusic } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
// We would ideally use a library like 'swiper' or 'react-swipeable' for real text gestures, 
// but for now we implement a simple CSS toggler or basic state. 
// "Swipe" usually implies a library. I'll stick to simple state tabs first, 
// and maybe add a simple touch handler if requested or use standard scroll-snap.

interface HomeClientProps {
    forYouDramas: Drama[];
    trendingDramas: Drama[]; // Used in For You
    latestDramas: Drama[];   // Unified Feed
    heroDrama: Drama | null;
    playlists?: any[]; // Optional for now
}

export function HomeClient({ forYouDramas, trendingDramas, latestDramas, heroDrama, playlists = [] }: HomeClientProps) {
    const [activeTab, setActiveTab] = useState<'foryou' | 'latest'>('foryou');
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && activeTab === 'foryou') {
            setActiveTab('latest');
        }
        if (isRightSwipe && activeTab === 'latest') {
            setActiveTab('foryou');
        }
    };

    return (
        <main
            className="min-h-screen bg-[#0a0a0a] text-white pb-24 touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b-0 shadow-lg shadow-black/50 px-5 py-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-black italic tracking-tighter">
                        <span className="text-white">DracinAja</span>
                        <span className="text-amber-500">ID</span>
                    </h1>
                    <Link href="/search" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-300">
                        <Search size={20} />
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-white/10 relative">
                    <button
                        onClick={() => setActiveTab('foryou')}
                        className={clsx(
                            "pb-3 text-sm font-bold transition-all relative",
                            activeTab === 'foryou' ? "text-white" : "text-gray-500"
                        )}
                    >
                        For You
                        {activeTab === 'foryou' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full layout-id='active-tab'" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('latest')}
                        className={clsx(
                            "pb-3 text-sm font-bold transition-all relative",
                            activeTab === 'latest' ? "text-white" : "text-gray-500"
                        )}
                    >
                        Terbaru
                        {activeTab === 'latest' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full layout-id='active-tab'" />
                        )}
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="pt-4">
                {activeTab === 'foryou' ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Featured Banner */}
                        {heroDrama && (
                            <div className="relative w-full h-56 md:h-72 mb-8 overflow-hidden group">
                                <Link href={`/drama/${heroDrama.bookId}`}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 mix-blend-multiply z-10" />
                                    <img
                                        src={heroDrama.coverWap}
                                        className="w-full h-full object-cover opacity-60 transition duration-1000 group-hover:scale-105"
                                        alt="Hero"
                                    />
                                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent">
                                        <span className="px-2 py-1 bg-amber-500 text-black text-[10px] font-bold rounded w-fit mb-2">TRENDING #1</span>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
                                            {heroDrama.bookName}
                                        </h2>
                                        <p className="text-xs md:text-sm text-gray-300 mt-2 line-clamp-2 max-w-md">
                                            {heroDrama.introduction || "Experience the most captivating stories, only on DracinAja."}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Playlists / Special Collections */}
                        {playlists && playlists.length > 0 && (
                            <div className="px-5 mb-8">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                    <span className="w-1 h-5 bg-pink-500 rounded-full" />
                                    Koleksi Spesial
                                </h2>
                                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                    {playlists.map((p, idx) => (
                                        <Link
                                            key={p.id || idx}
                                            href={`/playlist/${p.id}`}
                                            className="flex-shrink-0 w-44 h-28 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-white/10 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/50 transition-all"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                                <ListMusic size={48} />
                                            </div>
                                            <div className="z-10 mt-auto">
                                                <h3 className="font-bold text-sm text-white line-clamp-2 mb-1">{p.title}</h3>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <ListMusic size={10} />
                                                    <span>{p.dramas?.length || 0} Judul</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <HorizontalScrollList title="For You" dramas={forYouDramas} />
                        <HorizontalScrollList title="Trending Now" dramas={trendingDramas} />

                        {/* Random Discovery Section (Idea) */}
                        <div className="px-5 mt-8 mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-5 bg-purple-500 rounded-full" />
                                Discover Something New
                            </h2>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {/* We can re-use some drama cards here or shuffle */}
                                {forYouDramas.slice(0, 4).reverse().map((drama, i) => (
                                    <DramaCard key={`discover-${i}`} drama={drama} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="px-5 mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                                Latest Updates
                            </h2>
                        </div>

                        <div className="px-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
                            {latestDramas.map((drama, i) => (
                                <DramaCard key={`${drama.bookId}-${i}`} drama={drama} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
