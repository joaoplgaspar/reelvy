import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { fetchTmdbTrending, fetchTmdbPopular } from './providers/tmdb';
import { fetchAniListSeasonal } from './providers/anilist';
import type { DiscoveryItem } from './types';

/**
 * Cron diário (scheduled, gen2): popula discovery_lists + media_meta.
 * A Home é servida do Firestore com quase zero chamada externa.
 */
export const prewarmDiscovery = onSchedule(
  { schedule: 'every 24 hours', secrets: ['TMDB_TOKEN'] },
  async () => {
    const db = getFirestore();
    const shelves: Record<string, DiscoveryItem[]> = {
      trending_movies: await fetchTmdbTrending('movie'),
      popular_tv: await fetchTmdbPopular('tv'),
      seasonal_anime: await fetchAniListSeasonal(),
    };

    const batch = db.batch(); // limite 500 ops/batch — folgado p/ descoberta
    const now = Date.now();
    for (const [key, items] of Object.entries(shelves)) {
      batch.set(db.doc(`discovery_lists/${key}`), { items, updatedAt: now });
      for (const m of items) {
        batch.set(db.doc(`media_meta/${m.type}:${m.id}`), { ...m, updatedAt: now }, { merge: true });
      }
    }
    await batch.commit();
  },
);
