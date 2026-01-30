import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { publicApi } from '@/lib/public-api';
import { reelshortApi } from '@/lib/reelshort-api';
import { notFound } from 'next/navigation';
import { DramaCard } from '@/components/DramaCard';
import { ArrowLeft, ListMusic } from 'lucide-react';
import Link from 'next/link';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PlaylistPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    // 1. Fetch Playlist Metadata
    const playlistRef = doc(db, 'playlists', id);
    const playlistSnap = await getDoc(playlistRef);

    if (!playlistSnap.exists()) {
        notFound();
    }

    const playlist = playlistSnap.data();
    const dramaItems = playlist.dramas || [];

    // 2. Fetch Details for each drama
    // We try publicApi first, then ReelShort if needed (though playlist items should ideally have provider info, we only stored ID for now)
    // To speed up, we can run them in parallel.
    const dramaDetailsPromises = dramaItems.map(async (item: any) => {
        const bookId = item.bookId;

        // Try Dramabox
        let detail = await publicApi.getDramaDetail(bookId);

        // If not found, try Reelshort
        if (!detail) {
            detail = await reelshortApi.getDetail(bookId);
        }

        return detail;
    });

    const dramas = (await Promise.all(dramaDetailsPromises)).filter(d => d !== null);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10 py-2">
                <Link href="/" className="p-2 rounded-full hover:bg-white/10">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <ListMusic className="text-pink-500" />
                    {playlist.title}
                </h1>
            </div>

            {/* Description */}
            {playlist.description && (
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5 text-gray-300 text-sm">
                    {playlist.description}
                </div>
            )}

            {/* Content Grid */}
            {dramas.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {dramas.map((drama: any) => (
                        <DramaCard key={drama.bookId} drama={drama} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p>Playlist ini belum memiliki drama atau drama tidak ditemukan.</p>
                </div>
            )}
        </div>
    );
}
