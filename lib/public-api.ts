"use server";

import { Drama, Episode } from '@/types';

const API_BASE = 'https://api.sansekai.my.id/api/dramabox';

// Minimal headers - sometimes API needs User-Agent even if not proxy spoofing
// But user requested "REMOVE ALL ANTI BAN CARA", so I will use minimal headers or none if possible.
// Standard fetch usually sends a default UA.
const headers = {
    'Content-Type': 'application/json'
};

export async function getLatestDramas(): Promise<Drama[]> {
    try {
        const res = await fetch(`${API_BASE}/latest`, {
            next: { revalidate: 3600 },
            headers
        });
        if (!res.ok) {
            console.error(`[API] Failed to fetch latest: ${res.status} ${res.statusText}`);
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
        console.error("[API] Error fetching latest dramas:", error);
        return [];
    }
}

export async function getForYouDramas(): Promise<Drama[]> {
    try {
        const res = await fetch(`${API_BASE}/foryou`, {
            next: { revalidate: 3600 },
            headers
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((item: any) => ({
            bookId: item.bookId || item.book_id,
            bookName: item.bookName || item.book_name || item.title,
            coverWap: item.coverWap || item.cover,
        }));
    } catch (error) {
        console.error("[API] Error fetching ForYou:", error);
        return [];
    }
}

export async function getTrendingDramas(): Promise<Drama[]> {
    try {
        const res = await fetch(`${API_BASE}/trending`, {
            next: { revalidate: 3600 },
            headers
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
}

export async function getPopularSearch(): Promise<Drama[]> {
    try {
        const res = await fetch(`${API_BASE}/populersearch`, {
            next: { revalidate: 3600 },
            headers
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
}

export async function searchDramas(query: string): Promise<Drama[]> {
    try {
        const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
            cache: 'no-store',
            headers
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
        console.error("[API] Search Error:", error);
        return [];
    }
}

export async function getDramaDetail(bookId: string) {
    if (!bookId) {
        console.error("[API] getDramaDetail called with empty bookId");
        return null;
    }
    try {
        console.log(`[API] Fetching Detail for: ${bookId}`);
        const res = await fetch(`${API_BASE}/detail?bookId=${bookId}`, {
            next: { revalidate: 3600 },
            headers
        });

        if (!res.ok) {
            console.error(`[API] Fetch Detail Failed: ${res.status} for ${bookId}`);
            return null;
        }

        const text = await res.text();
        if (!text) {
            console.warn(`[API] Detail returned empty body for ${bookId}`);
            return null;
        }
        const json = JSON.parse(text);
        // Check if json is valid or has minimal fields
        if (!json || (!json.bookId && !json.bookName)) {
            console.warn(`[API] Detail returned empty/invalid for ${bookId}:`, json);
            // Don't return null yet if it might be valid but unusual
        }
        return json;
    } catch (error) {
        console.error(`[API] Error fetching detail ${bookId}:`, error);
        return null;
    }
}

export async function getEpisodes(bookId: string): Promise<Episode[]> {
    if (!bookId) return [];
    try {
        const res = await fetch(`${API_BASE}/allepisode?bookId=${bookId}`, {
            next: { revalidate: 3600 },
            headers
        });
        if (!res.ok) {
            console.error(`[API] Fetch Episodes Failed: ${res.status} for ${bookId}`);
            return [];
        }
        const text = await res.text();
        if (!text) return [];
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            console.warn(`[API] Episodes response is not array for ${bookId}:`, data);
            return [];
        }

        return data.map((ep: any) => {
            let videoUrl = '';
            // Try explicit videoUrl first if available (some APIs differ)
            if (ep.videoUrl) {
                videoUrl = ep.videoUrl;
            } else if (ep.url) {
                videoUrl = ep.url;
            } else if (ep.cdnList && ep.cdnList.length > 0) {
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
        console.error(`[API] Error fetching episodes ${bookId}:`, error);
        return [];
    }
}
