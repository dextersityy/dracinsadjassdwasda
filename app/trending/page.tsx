import { getTrendingDramas } from '@/lib/public-api';
import { getTrendingDramasReelshort } from '@/lib/reelshort-api';
import { DramaCard } from '@/components/DramaCard';
import Link from 'next/link';
import clsx from 'clsx';

export default async function TrendingPage({ searchParams }: { searchParams: Promise<{ provider?: string }> }) {
    const resolvedParams = await searchParams; // Next.js 15+ request
    const provider = resolvedParams?.provider || 'dramabox';

    const dramas = provider === 'reelshort'
        ? await getTrendingDramasReelshort()
        : await getTrendingDramas();

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-5 py-4">
                <h1 className="text-xl font-black italic tracking-tighter mb-4 text-center">
                    <span className="text-white">TRENDING</span>
                    <span className="text-amber-500">NOW</span>
                </h1>

                {/* Provider Selector */}
                <div className="flex p-1 bg-white/5 rounded-xl">
                    <Link
                        href="/trending?provider=dramabox"
                        className={clsx(
                            "flex-1 py-2 text-sm font-bold text-center rounded-lg transition-all",
                            provider === 'dramabox' ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Dramabox
                    </Link>
                    <Link
                        href="/trending?provider=reelshort"
                        className={clsx(
                            "flex-1 py-2 text-sm font-bold text-center rounded-lg transition-all",
                            provider === 'reelshort' ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Reelshort
                    </Link>
                </div>
            </header>

            {/* Content Grid */}
            <div className="p-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
                {dramas.length > 0 ? (
                    dramas.map((drama, i) => (
                        <DramaCard key={`${drama.bookId}-${i}`} drama={drama} />
                    ))
                ) : (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                        <p>No trending dramas found.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
