import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { fetchTmdb } from './providers/tmdb';
import { fetchAniList } from './providers/anilist';
import type { MediaMeta, MediaType } from './types';

const DAY = 86_400_000;
const TTL = { static: 90 * DAY, airing: 2 * DAY } as const;

/**
 * Read-through cache de catálogo (callable, gen2).
 * Cache-hit fresco volta do Firestore; cache-miss/stale busca na fonte
 * (TMDB p/ filme+série, AniList p/ anime), grava em media_meta e retorna.
 */
export const resolveMedia = onCall(
  { secrets: ['TMDB_TOKEN'] },
  async (req): Promise<MediaMeta> => {
    const { type, id } = (req.data ?? {}) as { type?: MediaType; id?: number };
    if (!type || typeof id !== 'number') {
      throw new HttpsError('invalid-argument', 'Esperado { type, id: number }.');
    }

    const key = `${type}:${id}`;
    const ref = getFirestore().doc(`media_meta/${key}`);
    const snap = await ref.get();

    if (snap.exists) {
      const m = snap.data() as MediaMeta;
      const ttl = TTL[m.ttlClass] ?? TTL.static;
      // só é hit se for o doc COMPLETO (o prewarm grava um resumo sem overview)
      if (m.overview && Date.now() - m.updatedAt < ttl) return m;
    }

    const core = type === 'anime' ? await fetchAniList(id) : await fetchTmdb(type, id);
    const doc: MediaMeta = { ...core, type, id, updatedAt: Date.now() };
    await ref.set(doc, { merge: true });
    return doc;
  },
);
