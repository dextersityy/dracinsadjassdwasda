import Link from 'next/link';
import { Drama } from '@/types';
import { Play } from 'lucide-react';

interface DramaCardProps {
    drama: Drama;
}

export function DramaCard({ drama }: DramaCardProps) {
    return (
        <Link href={`/drama/${drama.bookId}`} className="group relative block overflow-hidden rounded-xl bg-gray-900/50 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-amber-500/10 hover:shadow-xl">
            {/* Image Container with Aspect Ratio */}
            <div className="relative aspect-[2/3] w-full overflow-hidden">
                <img
                    src={drama.coverWap}
                    alt={drama.bookName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-75"
                    loading="lazy"
                />
                {/* Hover Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/40">
                    <div className="rounded-full bg-amber-500/90 p-3 text-black shadow-lg backdrop-blur-sm">
                        <Play size={20} fill="currentColor" />
                    </div>
                </div>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 w-full p-3">
                <h3 className="line-clamp-2 text-sm font-bold text-white drop-shadow-md group-hover:text-amber-400 transition-colors">
                    {drama.bookName}
                </h3>
                <p className="mt-1 text-[10px] text-gray-300 font-medium opacity-80">
                    DracinAja Original
                </p>
            </div>
        </Link>
    );
}
