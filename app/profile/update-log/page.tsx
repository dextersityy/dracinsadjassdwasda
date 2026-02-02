import { ArrowLeft, GitCommit } from 'lucide-react';
import Link from 'next/link';

export default function UpdateLog() {
    const updates = [
        {
            version: "1.0.4",
            date: "3 Feb 2026",
            changes: [
                "New Provider: Netshort Integration",
                "Homepage: Added Netshort Collections",
                "Trending: Dual Provider Selector (Server Utama & Netshort)",
                "Search: Unified Results from multiple sources",
                "Player: Dedicated Netshort Player",
                "Bug Fixes & API Parsers Optimization"
            ]
        },
        {
            version: "1.0.3",
            date: "30 Jan 2026",
            changes: [
                "New Identity Logging & Sync",
                "Admin Panel Enhancements (Contact Buttons, ID Display)",
                "Social Features: Like, Bookmark, Watching Count",
                "Special Collections (Playlists)",
                "User Request System"
            ]
        },
        {
            version: "1.0.1",
            date: "28 Jan 2026",
            changes: [
                "New Branding: DracinAja ID",
                "Referral System Upgrade: Bank Withdrawal & Lifetime Commission",
                "New Dual Tab Home: For You & Latest",
                "Integrated Reelshort drama collection",
                "New Trending Page with Provider Selector",
                "Added Swipe Gesture for Tabs"
            ]
        },
        {
            version: "1.0.0",
            date: "26 Jan 2026",
            changes: [
                "Initial Release",
                "Dramabox API Integration",
                "Video Player with HLS support",
                "Search & Category features",
                "User Profile & Settings"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
            <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-5 py-4 flex items-center gap-4">
                <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-lg font-bold">Update Log</h1>
            </header>

            <div className="p-5 space-y-8">
                {updates.map((update, i) => (
                    <div key={i} className="relative pl-8 border-l border-white/10">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-amber-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        </div>

                        <div className="mb-2 flex items-baseline gap-3">
                            <h2 className="text-xl font-bold text-amber-500">v{update.version}</h2>
                            <span className="text-xs text-gray-500 font-mono">{update.date}</span>
                        </div>

                        <ul className="space-y-3">
                            {update.changes.map((change, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                                    <GitCommit size={16} className="mt-0.5 text-gray-600 shrink-0" />
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
