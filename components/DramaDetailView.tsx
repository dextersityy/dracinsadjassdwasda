"use client";

import { useState, useEffect } from 'react';
import { Episode } from '@/types';
import { TikTokPlayer } from '@/components/TikTokPlayer';
import Link from 'next/link';
import { ArrowLeft, Share2, Info, Star, Play, Clock, Users, Heart, Bookmark } from 'lucide-react';
import { db, getAuthUser } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface DramaDetailViewProps {
    drama: any;
    episodes: Episode[];
    dramaId: string;
}

export default function DramaDetailView({ drama, episodes, dramaId }: DramaDetailViewProps) {
    const [isWatching, setIsWatching] = useState(false);
    const [startEpisode, setStartEpisode] = useState(0);

    // Engagement State
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [watchingCount, setWatchingCount] = useState(0);

    useEffect(() => {
        // Randomize "Watching Now" count for social proof
        setWatchingCount(Math.floor(Math.random() * (150 - 45 + 1)) + 45);

        // Check Like/Bookmark status
        checkUserInteractions();
    }, [dramaId]);

    const checkUserInteractions = async () => {
        const user = await getAuthUser();
        if (!user) return;

        // Check Like
        try {
            const likeRef = doc(db, 'drama_likes', `${dramaId}_${user.uid}`);
            const likeSnap = await getDoc(likeRef);
            if (likeSnap.exists()) setIsLiked(true);
        } catch (e) { console.error(e) }

        // Check Bookmark
        try {
            const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', dramaId);
            const bookmarkSnap = await getDoc(bookmarkRef);
            if (bookmarkSnap.exists()) setIsBookmarked(true);
        } catch (e) { console.error(e) }
    };

    const handleLike = async () => {
        const user = await getAuthUser();
        if (!user) return alert("Login dulu untuk menyukai drama!");

        const newStatus = !isLiked;
        setIsLiked(newStatus); // Optimistic update

        const likeRef = doc(db, 'drama_likes', `${dramaId}_${user.uid}`);
        if (newStatus) {
            await setDoc(likeRef, {
                userId: user.uid,
                dramaId,
                title: drama?.bookName || 'Unknown',
                createdAt: serverTimestamp()
            });
        } else {
            await deleteDoc(likeRef);
        }
    };

    const handleBookmark = async () => {
        const user = await getAuthUser();
        if (!user) return alert("Login dulu untuk menyimpan drama!");

        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus); // Optimistic update

        const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', dramaId);
        if (newStatus) {
            await setDoc(bookmarkRef, {
                dramaId,
                title: drama?.bookName || 'Unknown',
                cover: drama?.coverWap || drama?.cover || '',
                createdAt: serverTimestamp()
            });
        } else {
            await deleteDoc(bookmarkRef);
        }
    };

    const handleShare = () => {
        // Only simple share for now as requested
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: drama?.bookName,
                text: `Nonton drama seru "${drama?.bookName}" di DracinAja!`,
                url: url,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert("Link disalin ke clipboard!");
        }
    };

    // If user clicked "Watch Now", show TikTok-style player
    if (isWatching) {
        return (
            <TikTokPlayer
                episodes={episodes}
                dramaName={drama?.bookName || 'Drama'}
                initialEpisodeIndex={startEpisode}
                onClose={() => setIsWatching(false)}
            />
        );
    }

    // Default: Detail View (before watching)
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-28">
            {/* Navbar */}
            <nav className="fixed top-0 z-40 w-full glass-panel border-none px-4 py-3 flex justify-between items-center bg-transparent">
                <Link href="/" className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition">
                    <ArrowLeft size={22} className="text-white" />
                </Link>
                {/* <span className="text-sm font-semibold opacity-0">Detail</span> */}
                <div className="flex gap-2">
                    <button onClick={handleBookmark} className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition">
                        <Bookmark size={22} className={isBookmarked ? "text-amber-500 fill-amber-500" : "text-white"} />
                    </button>
                    <button onClick={handleShare} className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition">
                        <Share2 size={22} className="text-white" />
                    </button>
                </div>
            </nav>

            {/* Hero Cover */}
            <div className="relative w-full h-[65vh] overflow-hidden">
                <img
                    src={drama?.coverWap}
                    alt={drama?.bookName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

                {/* Play Button Overlay */}
                <button
                    onClick={() => { setStartEpisode(0); setIsWatching(true); }}
                    className="absolute inset-0 flex items-center justify-center group"
                >
                    <div className="h-20 w-20 rounded-full bg-amber-500/90 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform group-hover:scale-110 group-active:scale-95">
                        <Play size={36} fill="black" className="text-black ml-1" />
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="relative z-20 -mt-20 px-5 space-y-5">
                {/* Title & Meta */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        {drama?.bookName || 'Loading...'}
                    </h1>

                    {/* Engagement Bar */}
                    <div className="flex items-center gap-4 mt-4">
                        <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition active:scale-95">
                            <Heart size={18} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
                            <span className="text-sm font-medium">{isLiked ? "Disukai" : "Suka"}</span>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs animate-pulse">
                            <Users size={12} />
                            <span>{watchingCount} orang sedang menonton</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 flex-wrap text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span>4.9</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{episodes.length} Episodes</span>
                        </div>
                        <span className="text-gray-600">•</span>
                        <span>Romance</span>
                    </div>
                </div>

                {/* Watch Button */}
                <button
                    onClick={() => { setStartEpisode(0); setIsWatching(true); }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
                >
                    <Play size={20} fill="currentColor" /> Tonton Sekarang
                </button>

                {/* Cast and Tags */}
                {(drama?.protagonist || drama?.tags) && (
                    <div className="glass-card rounded-xl p-5 border border-white/5 space-y-4">
                        {drama.protagonist && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Users size={12} /> Pemeran
                                </h4>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                                    {drama.protagonist.split(/[,\/]/).map((p: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                            {p.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {drama.tags && drama.tags.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Genre</h4>
                                <div className="flex flex-wrap gap-2">
                                    {drama.tags.map((tag: string, i: number) => (
                                        <span key={i} className="text-xs font-medium px-2 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Synopsis Card */}
                <div className="glass-card rounded-xl p-5 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Info size={16} className="text-amber-500" /> Sinopsis
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-light">
                        {drama?.introduction || "Sebuah kisah menarik yang penuh dengan drama, cinta, dan pengkhianatan. Ikuti perjalanan sang protagonis dalam menghadapi berbagai cobaan hidup."}
                    </p>
                </div>

                {/* Episode Grid - Clickable */}
                <div className="glass-card rounded-xl p-4 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-3">Episode ({episodes.length})</h3>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                        {episodes.map((ep, i) => (
                            <button
                                key={ep.chapterId}
                                onClick={() => { setStartEpisode(i); setIsWatching(true); }}
                                className="h-10 flex items-center justify-center rounded-md bg-gray-800 hover:bg-amber-500/20 hover:text-amber-500 text-xs text-gray-400 transition active:scale-95"
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
