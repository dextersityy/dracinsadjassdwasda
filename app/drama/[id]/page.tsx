import { getDramaDetail, getEpisodes } from '@/lib/public-api';
import { reelshortApi } from '@/lib/reelshort-api';
import DramaDetailView from '@/components/DramaDetailView';

// Correctly typing params for Next.js 15+ (PageProps)
// params is a Promise in newer Next.js versions
interface Props {
    params: Promise<{ id: string }>;
}

export default async function DramaPage(props: Props) {
    const params = await props.params;
    const { id } = params;

    // Try Dramabox first
    let drama = await getDramaDetail(id);
    let episodes = await getEpisodes(id);

    // If not found in Dramabox, try Reelshort
    if (!drama || episodes.length === 0) {
        drama = await reelshortApi.getDetail(id);
        episodes = await reelshortApi.getEpisodes(id);
    }

    if (!drama || episodes.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Drama Not Found</h1>
                    <p className="text-gray-400">Could not load drama details.</p>
                </div>
            </div>
        );
    }

    return <DramaDetailView drama={drama} episodes={episodes} dramaId={id} />;
}
