import { onCall } from 'firebase-functions/v2/https';
import { searchTmdb } from './providers/tmdb';
import { searchAniList } from './providers/anilist';
import type { DiscoveryItem } from './types';

/** Busca unificada (callable): anime (AniList) + filme/série (TMDB), intercalados. */
export const searchMedia = onCall(
  { secrets: ['TMDB_TOKEN'] },
  async (req): Promise<DiscoveryItem[]> => {
    const q = String((req.data as { q?: string })?.q ?? '').trim();
    if (!q) return [];
    const [anime, western] = await Promise.all([searchAniList(q), searchTmdb(q)]);
    // anime-first (a cunha do produto), depois ocidental
    return [...anime.slice(0, 10), ...western.slice(0, 14)];
  },
);
