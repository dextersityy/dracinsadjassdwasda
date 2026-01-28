import { publicApi } from '@/lib/public-api';
import { reelshortApi } from '@/lib/reelshort-api';
import { HomeClient } from '@/components/HomeClient';

export default async function Home() {
  const [
    dracinLatest,
    dracinForYou,
    dracinTrending,
    reelshortLatest,
    reelshortTrending
  ] = await Promise.all([
    publicApi.getLatestDramas(),
    publicApi.getForYouDramas(),
    publicApi.getTrendingDramas(),
    reelshortApi.getLatestDramas(),
    reelshortApi.getTrendingDramas()
  ]);

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
      heroDrama={heroDrama}
    />
  );
}
