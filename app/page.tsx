import { getLatestDramas, getForYouDramas, getTrendingDramas } from '@/lib/public-api';
import { getLatestDramasReelshort, getTrendingDramasReelshort } from '@/lib/reelshort-api';
import { getNetshortHomeSections } from '@/lib/netshort-api';
import { HomeClient } from '@/components/HomeClient';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default async function Home() {
  const [
    dracinLatest,
    dracinForYou,
    dracinTrending,
    reelshortLatest,
    reelshortTrending,
    netshortSections,
    playlistsSnapshot
  ] = await Promise.all([
    getLatestDramas(),
    getForYouDramas(),
    getTrendingDramas(),
    getLatestDramasReelshort(),
    getTrendingDramasReelshort(),
    getNetshortHomeSections(),
    // Safe Playlist Fetch
    getDocs(query(collection(db, 'playlists'), orderBy('createdAt', 'desc'))).catch((err) => {
      console.error("Failed to load playlists (check firestore rules):", err);
      return { docs: [] };
    })
  ]);

  const playlists = playlistsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Unified Latest Feed (Simple concatenation for now)
  const unifiedLatest = [...dracinLatest, ...reelshortLatest].sort(() => Math.random() - 0.5); // Simple shuffle as "newest" sort isn't reliable yet

  // Mix trending for hero
  const allTrending = [...dracinTrending, ...reelshortTrending];
  const heroDrama = allTrending.length > 0 ? allTrending[0] : unifiedLatest[0];

  return (
    <HomeClient
      forYouDramas={[...dracinForYou, ...reelshortLatest.slice(0, 5)].sort(() => Math.random() - 0.5)}
      trendingDramas={allTrending}
      latestDramas={unifiedLatest}
      netshortSections={netshortSections}
      heroDrama={heroDrama}
      playlists={playlists}
    />
  );
}
