import { Drama, Episode } from '@/types';

const API_BASE = 'https://dramabox.sansekai.my.id/api/dramabox';

export const publicApi = {
    getLatestDramas: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/latest`, { next: { revalidate: 3600 } });
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
            const res = await fetch(`${API_BASE}/foryou`, { next: { revalidate: 3600 } });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                coverWap: item.coverWap,
            }));
        } catch (error) {
            return [];
        }
    },

    getTrendingDramas: async (): Promise<Drama[]> => {
        try {
            const res = await fetch(`${API_BASE}/trending`, { next: { revalidate: 3600 } });
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
            const res = await fetch(`${API_BASE}/populersearch`, { next: { revalidate: 3600 } });
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
            const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, { cache: 'no-store' });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item: any) => ({
                bookId: item.bookId,
                bookName: item.bookName,
                coverWap: item.cover || item.coverWap,
                introduction: item.introduction,
                tags: item.tagNames || item.tags,
                protagonist: item.protagonist,
            }));
        } catch (error) {
            return [];
        }
    },

    getDramaDetail: async (bookId: string) => {
        try {
            const res = await fetch(`${API_BASE}/detail?bookId=${bookId}`, { next: { revalidate: 3600 } });
            if (!res.ok) return null;
            return await res.json();
        } catch (error) {
            return null;
        }
    },

    getEpisodes: async (bookId: string): Promise<Episode[]> => {
        try {
            const res = await fetch(`${API_BASE}/allepisode?bookId=${bookId}`, { next: { revalidate: 3600 } });
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
