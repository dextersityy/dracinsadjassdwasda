import Link from 'next/link';
import { Drama } from '@/types';
import { Play } from 'lucide-react';

interface HorizontalScrollListProps {
    title: string;
    dramas: Drama[];
}

export function HorizontalScrollList({ title, dramas }: HorizontalScrollListProps) {
    if (!dramas || dramas.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="px-5 mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-amber-500 rounded-full" />
                    {title}
                </h2>
            </div>

            <div className="flex overflow-x-auto gap-3 px-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                {dramas.map((drama) => {
                    const href = drama.source === 'netshort'
                        ? `/play/netshort/${drama.bookId}?title=${encodeURIComponent(drama.bookName)}&cover=${encodeURIComponent(drama.coverWap)}`
                        : `/drama/${drama.bookId}`;

                    return (
                        <Link
                            key={drama.bookId}
                            href={href}
                            className="flex-none w-[110px] md:w-[140px] snap-start group relative block overflow-hidden rounded-xl bg-gray-900/50 shadow-md"
                        >
                            <div className="relative aspect-[2/3] w-full overflow-hidden">
                                <img
                                    src={drama.coverWap}
                                    alt={drama.bookName}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition">
                                    <Play size={16} className="text-white fill-white" />
                                </div>
                            </div>
                            <div className="p-2">
                                <h3 className="line-clamp-2 text-xs font-bold text-gray-200 group-hover:text-amber-400">
                                    {drama.bookName}
                                </h3>
                                {/* Source Badge */}
                                {drama.source === 'netshort' && (
                                    <span className="absolute top-1 right-1 bg-red-600 text-[8px] text-white px-1.5 py-0.5 rounded-sm font-bold shadow-sm">
                                        NS
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
