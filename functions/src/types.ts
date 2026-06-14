export type MediaType = 'movie' | 'tv' | 'anime';

/** media_meta/{type:id} — catálogo cacheado (ver docs/ARQUITETURA-FASE-0.md §4). */
export interface MediaMeta {
  type: MediaType;
  id: number; // id na fonte (TMDB ou AniList)
  title: string;
  poster: string; // path do CDN (não URL completa)
  overview: string;
  genres: string[];
  year: number;
  episodes?: number;
  status: 'finished' | 'airing';
  ids: { tmdb?: number; anilist?: number; mal?: number };
  source: 'tmdb' | 'anilist';
  ttlClass: 'static' | 'airing';
  providers?: { name: string; logo: string }[];
  rating?: number; // nota da comunidade, 0-10
  updatedAt: number; // epoch ms
}

/** Item resumido das prateleiras de descoberta. */
export interface DiscoveryItem {
  type: MediaType;
  id: number;
  title: string;
  poster: string;
  year: number;
  rating?: number;
}

/** Os campos que os providers resolvem (o caller completa type/id/updatedAt). */
export type MediaMetaCore = Omit<MediaMeta, 'type' | 'id' | 'updatedAt'>;
