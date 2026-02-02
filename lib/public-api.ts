import { Drama, Episode } from '@/types';
import { ProxyAgent } from 'undici';

const API_BASE = 'https://api.sansekai.my.id/api/dramabox';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.dramaboxdb.com',
    'Referer': 'https://www.dramaboxdb.com/',
};

const proxyUrl = process.env.PROXY_URL;
const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

export const publicApi = {
    getLatestDramas: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/latest`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore - native fetch types don't officially support dispatcher yet but it works in Node env
                dispatcher
            });
            if (!res.ok) {
                console.warn(`[API] Failed to fetch latest: ${res.status}`);
                return [];
            }
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                coverWap: item.coverWap,
                introduction: item.introduction,
            }));
        } catch (error) {
            console.warn("[API] Error fetching latest dramas:", error);
            return [];
        }
    },

    getForYouDramas: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/foryou`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId || item.book_id,
                bookName: item.bookName || item.book_name || item.title,
                coverWap: item.coverWap || item.cover,
            }));
        } catch (error) {
            return [];
        }
    },

    getTrendingDramas: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/trending`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                coverWap: item.coverWap,
                introduction: item.introduction,
            }));
        } catch (error) {
            return [];
        }
    },

    getPopularSearch: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/populersearch`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                coverWap: item.coverWap,
                introduction: item.introduction,
                tags: item.tags,
                protagonist: item.protagonist,
            }));
        } catch (error) {
            return [];
        }
    },

    searchDramas: async (query: string): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
                cache: 'no-store',
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId || item.book_id || item.id || item.jump_param?.book_id || item.params?.bookId,
                bookName: item.bookName || item.book_name || item.title || item.jump_param?.book_title,
                coverWap: item.cover || item.coverWap || item.jump_param?.book_pic,
                introduction: item.introduction || item.description,
                tags: item.tagNames || item.tags,
                protagonist: item.protagonist,
            }));
        } catch (error) {
            return [];
        }
    },

    getDramaDetail: async (bookId: string) => {
        try {
            const res = await fetch(`${API_BASE}/detail?bookId=${bookId}`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            return null;
        }
    },

    getEpisodes: async (bookId: string): Promise<Episode[]> => {
        try {
            const res = await fetch(`${API_BASE}/allepisode?bookId=${bookId}`, {
                next: { revalidate: 3600 },
                headers,
                // @ts-ignore
                dispatcher
            });
            if (!res.ok) return [];
            const data = await res.json();

            return data.map((ep: any) => {
                let videoUrl = '';
                if (ep.cdnList && ep.cdnList.length > 0) {
                    const defaultCdn = ep.cdnList.find((c: any) => c.isDefault) || ep.cdnList[0];
                    if (defaultCdn && defaultCdn.videoPathList && defaultCdn.videoPathList.length > 0) {
                        const bestQuality = defaultCdn.videoPathList.find((v: any) => v.quality === 720 || v.quality === 1080) || defaultCdn.videoPathList[0];
                        videoUrl = bestQuality.videoPath;
                    }
                } else if (ep.videoUrl) {
                    videoUrl = ep.videoUrl;
                } else if (ep.url) {
                    videoUrl = ep.url;
                }

                return {
                    chapterId: ep.chapterId,
                    chapterName: ep.chapterName,
                    isCharge: ep.isCharge,
                    videoUrl: videoUrl
                };
            });
        } catch (error) {
            return [];
        }
    }
};
