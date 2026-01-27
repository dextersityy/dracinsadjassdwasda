import { publicApi } from '@/lib/public-api';
import { DramaCard } from '@/components/DramaCard';
import { HorizontalScrollList } from '@/components/HorizontalScrollList';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const [latestDramas, forYouDramas, trendingDramas] = await Promise.all([
    publicApi.getLatestDramas(),
    publicApi.getForYouDramas(),
    publicApi.getTrendingDramas(),
  ]);

  // Use the first trending drama as Hero, or fallback to latest
  const heroDrama = trendingDramas[0] || latestDramas[0];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      {/* Cinematic Header */}
      <header className="sticky top-0 z-50 glass-panel border-b-0 shadow-lg shadow-black/50 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black italic tracking-tighter">
            <span className="text-white">DRAMA</span>
            <span className="text-amber-500">
              BOX
            </span>
          </h1>
        </div>
        <Link href="/search" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-gray-300">
          <Search size={20} />
        </Link>
      </header>

      {/* Featured Banner (Real Data) */}
      {heroDrama && (
        <div className="relative w-full h-56 md:h-72 mb-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80 mix-blend-multiply z-10" />
          <img
            src={heroDrama.coverWap}
            className="w-full h-full object-cover opacity-60 transition duration-1000 group-hover:scale-105"
            alt="Hero"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-5 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent">
            <span className="px-2 py-1 bg-amber-500 text-black text-[10px] font-bold rounded w-fit mb-2 animate-in slide-in-from-left duration-500">TRENDING #1</span>
            <Link href={`/drama/${heroDrama.bookId}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
                {heroDrama.bookName}
              </h2>
            </Link>
            <p className="text-xs md:text-sm text-gray-300 mt-2 line-clamp-2 max-w-md">
              {heroDrama.introduction || "Experience the most captivating stories, only on DracinAja."}
            </p>
          </div>
        </div>
      )}

      {/* For You Section (Horizontal) */}
      <HorizontalScrollList title="For You" dramas={forYouDramas} />

      {/* Trending Section (Horizontal) */}
      <HorizontalScrollList title="Trending Now" dramas={trendingDramas} />

      {/* Latest Grid */}
      <div className="mt-8">
        <div className="px-5 mb-4 flex items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-500 rounded-full" />
            Latest Releases
          </h2>
        </div>

        <div className="px-4 grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {latestDramas.length > 0 ? (
            latestDramas.map((drama) => (
              <DramaCard key={drama.bookId} drama={drama} />
            ))
          ) : (
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-gray-900 animate-pulse border border-white/5" />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
