import { getEpisodesNetshort } from '@/lib/netshort-api';
import DramaDetailView from '@/components/DramaDetailView';
import { Drama } from '@/types';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ title?: string; cover?: string }>;
}

export default async function NetshortPlayerPage(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const { id } = params;

    // Fetch episodes
    const episodes = await getEpisodesNetshort(id);

    // Construct Drama object from searchParams (fallback)
    const drama: Drama = {
        bookId: id,
        bookName: searchParams.title || "Netshort Drama",
        coverWap: searchParams.cover || "",
        introduction: "Enjoy this drama from Netshort.",
        source: 'netshort',
    };

    if (episodes.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Episode Not Found</h1>
                    <p className="text-gray-400">Content might be unavailable.</p>
                </div>
            </div>
        );
    }

    return <DramaDetailView drama={drama} episodes={episodes} dramaId={id} />;
}
