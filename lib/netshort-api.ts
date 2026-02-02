"use server";

import { Drama, Episode } from '@/types';

const NETSHORT_BASE = 'https://api.sansekai.my.id/api/netshort';

const headers = {
    'Content-Type': 'application/json'
};

export async function getHomepageNetshort() {
    try {
        const res = await fetch(`${NETSHORT_BASE}/theaters`, {
            next: { revalidate: 3600 },
            headers
        });
        if (!res.ok) return null;
        const text = await res.text();
        if (!text) return null;
        const json = JSON.parse(text);
        return json;
    } catch (error) {
        console.warn("[Netshort] Error fetching homepage:", error);
        return null;
    }
}

export interface NetshortSection {
    title: string;
    dramas: Drama[];
}

export async function getNetshortHomeSections(): Promise<NetshortSection[]> {
    try {
        const data = await getHomepageNetshort();
        if (!data || !Array.isArray(data)) return [];

        return data.map((section: any) => ({
            title: section.contentName || "Netshort Section",
            dramas: (section.contentInfos || []).map((item: any) => ({
                bookId: item.shortPlayId,
                bookName: item.shortPlayName?.replace(/<\/?em>/g, '') || "",
                coverWap: item.shortPlayCover,
                introduction: "",
                source: 'netshort' as const,
                heatScore: item.heatScoreShow
            }))
        })).filter(section => section.dramas.length > 0);
    } catch (error) {
        console.error("[Netshort] Error parsing home sections:", error);
        return [];
    }
}

export async function getTrendingNetshort(): Promise<Drama[]> {
    try {
        const data = await getHomepageNetshort();
        if (!data || !Array.isArray(data)) return [];

        // Try to find specific trending/ranking section
        const trendingSection = data.find((section: any) =>
            section.contentType === 5 ||
            section.contentName?.toLowerCase().includes('rankings') ||
            section.contentName?.toLowerCase().includes('daftar peringkat')
        );

        // If found, use its contentInfos. If not, use the first section's contentInfos as fallback
        const targetList = trendingSection?.contentInfos || data[0]?.contentInfos;

        if (!targetList) return [];

        return targetList.map((item: any) => ({
            bookId: item.shortPlayId,
            bookName: item.shortPlayName?.replace(/<\/?em>/g, '') || "",
            coverWap: item.shortPlayCover,
            introduction: "",
            source: 'netshort',
            heatScore: item.heatScoreShow
        }));

    } catch (error) {
        console.warn("[Netshort] Error fetching trending:", error);
        return [];
    }
}

export async function searchDramasNetshort(query: string): Promise<Drama[]> {
    try {
        const res = await fetch(`${NETSHORT_BASE}/search?query=${encodeURIComponent(query)}`, {
            cache: 'no-store',
            headers
        });
        if (!res.ok) return [];
        const text = await res.text();
        if (!text) return [];
        const json = JSON.parse(text);

        // Fix: API returns searchCodeSearchResult
        const results = json.searchCodeSearchResult || json.data || json.results || [];

        return results.map((item: any) => ({
            bookId: item.shortPlayId,
            bookName: item.shortPlayName?.replace(/<\/?em>/g, '') || "",
            coverWap: item.shortPlayCover,
            introduction: "",
            source: 'netshort'
        }));
    } catch (error) {
        console.error("[Netshort] Search Error:", error);
        return [];
    }
}

export async function getEpisodesNetshort(bookId: string): Promise<Episode[]> {
    console.log(`[Netshort] Fetching episodes for bookId: ${bookId}`);
    try {
        const url = `${NETSHORT_BASE}/allepisode?shortPlayId=${bookId}`;
        console.log(`[Netshort] Request URL: ${url}`);

        const res = await fetch(url, {
            cache: 'no-store',
            headers
        });

        console.log(`[Netshort] Response Status: ${res.status}`);

        if (!res.ok) {
            console.error(`[Netshort] Response not OK: ${res.statusText}`);
            return [];
        }

        const text = await res.text();
        if (!text) {
            console.error("[Netshort] Empty response body");
            return [];
        }

        const json = JSON.parse(text);
        // console.log(`[Netshort] Response JSON keys: ${Object.keys(json).join(', ')}`);

        const list = json.shortPlayEpisodeInfos || [];
        console.log(`[Netshort] Found ${list.length} episodes`);

        return list.map((item: any) => ({
            chapterId: item.episodeId,
            chapterName: `Episode ${item.episodeNo}`,
            isCharge: item.isLock ? 1 : 0,
            videoUrl: item.playVoucher
        }));
    } catch (error) {
        console.error("[Netshort] Episode Error:", error);
        return [];
    }
}
