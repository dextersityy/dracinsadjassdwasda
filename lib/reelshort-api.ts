import { Drama, Episode } from '@/types';
import { ProxyAgent } from 'undici';

const REELSHORT_BASE = 'https://api.sansekai.my.id/api/reelshort';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.reelshort.com',
    'Referer': 'https://www.reelshort.com/',
};

const proxyUrl = process.env.PROXY_URL;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

export const reelshortApi = {
    getHomepage: async () => {
        try {
            const res = await fetch(`${REELSHORT_BASE}/homepage`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            console.warn("[Reelshort] Error fetching homepage:", error);
            return null;
        }
    },

    getLatestDramas: async (): Promise<Drama[]> => {
        try {
            const data = await reelshortApi.getHomepage();
            if (!data || !data.success || !data.data || !data.data.lists) return [];

            // Flatten all lists to get initial batch of content
            let allDramas: any[] = [];
            data.data.lists.forEach((list: any) => {
                if (list.banners) {
                    allDramas.push(...list.banners);
                }
            });

            return allDramas.map((item: any) => ({
                bookId: item.jump_param?.book_id || item.b_id,
                bookName: item.jump_param?.book_title || item.title,
                coverWap: item.jump_param?.book_pic || item.pic,
                introduction: item.jump_param?.introduction || "",
                source: 'reelshort'
            }));
        } catch (error) {
            return [];
        }
    },

    getTrendingDramas: async (): Promise<Drama[]> => {
        try {
            const data = await reelshortApi.getHomepage();
            if (!data || !data.success || !data.data || !data.data.lists) return [];

            const POPULER_TAB_ID = 42954;
            let dramas: any[] = [];

            const popularList = data.data.lists.find((l: any) => l.tab_id === POPULER_TAB_ID);
            if (popularList && popularList.banners) {
                dramas = popularList.banners;
            } else {
                // Fallback: collect from all lists if specific tab not found
                data.data.lists.forEach((list: any) => {
                    if (list.banners) dramas.push(...list.banners);
                });
            }

            return dramas.map((item: any) => ({
                bookId: item.jump_param?.book_id || item.b_id,
                bookName: item.jump_param?.book_title || item.title,
                coverWap: item.jump_param?.book_pic || item.pic,
                introduction: item.jump_param?.introduction || "",
                source: 'reelshort'
            }));
        } catch (error) {
            return [];
        }
    },

    getDetail: async (bookId: string) => {
        try {
            const res = await fetch(`${REELSHORT_BASE}/detail?bookId=${bookId}`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return null;
            const json = await res.json();
            if (!json.success) return null;

            const data = json;
            return {
                ...data,
                bookId: data.bookId,
                bookName: data.title,
                coverWap: data.cover,
                introduction: data.description,
                episodeCount: data.totalEpisodes
            };
        } catch (error) {
            return null;
        }
    },

    getEpisodes: async (bookId: string): Promise<Episode[]> => {
        try {
            const res = await fetch(`${REELSHORT_BASE}/allepisode?bookId=${bookId}`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const json = await res.json();
            if (!json.success || !json.episodes) return [];

            return json.episodes.map((ep: any) => {
                // Find H264 720p or best available
                let videoUrl = '';
                if (ep.videoList && ep.videoList.length > 0) {
                    const h264 = ep.videoList.find((v: any) => v.encode === 'H264' && v.quality === 720);
                    const anyBest = ep.videoList.find((v: any) => v.quality === 720);
                    videoUrl = (h264 || anyBest || ep.videoList[0]).url;
                }

                return {
                    chapterId: ep.chapterId,
                    chapterName: ep.title,
                    isCharge: ep.isLocked ? 1 : 0,
                    videoUrl: videoUrl
                };
            });
        } catch (error) {
            return [];
        }
    },

    searchDramas: async (query: string): Promise<Drama[]> => {
        try {
            const res = await fetch(`${REELSHORT_BASE}/search?query=${encodeURIComponent(query)}`, {
                cache: 'no-store',
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const json = await res.json();
            if (!json.success || !json.results) return [];

            return json.results.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.title,
                coverWap: item.cover,
                introduction: item.description,
                source: 'reelshort'
            }));
        } catch (error) {
            return [];
        }
    }
};
