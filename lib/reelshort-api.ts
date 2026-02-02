"use server";

import { Drama, Episode } from '@/types';

const REELSHORT_BASE = 'https://api.sansekai.my.id/api/reelshort';

const headers = {
    'Content-Type': 'application/json'
};

export async function getHomepageReelshort() {
    try {
        const res = await fetch(`${REELSHORT_BASE}/homepage`, {
            next: { revalidate: 3600 },
            headers
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.warn("[Reelshort] Error fetching homepage:", error);
        return null;
    }
}

export async function getLatestDramasReelshort(): Promise<Drama[]> {
    try {
        const data = await getHomepageReelshort();
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
}

export async function getTrendingDramasReelshort(): Promise<Drama[]> {
    try {
        const data = await getHomepageReelshort();
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
}

export async function getDetailReelshort(bookId: string) {
    try {
        const res = await fetch(`${REELSHORT_BASE}/detail?bookId=${bookId}`, {
            next: { revalidate: 3600 },
            headers
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
}

export async function getEpisodesReelshort(bookId: string): Promise<Episode[]> {
    try {
        const res = await fetch(`${REELSHORT_BASE}/allepisode?bookId=${bookId}`, {
            next: { revalidate: 3600 },
            headers
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
}

export async function searchDramasReelshort(query: string): Promise<Drama[]> {
    try {
        const res = await fetch(`${REELSHORT_BASE}/search?query=${encodeURIComponent(query)}`, {
            cache: 'no-store',
            headers
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

// Temporary backward compatibility shim NOT recommended for Server Actions.
// We will update imports.
