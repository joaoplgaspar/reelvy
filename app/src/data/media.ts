import type { CatalogItem } from './catalog';

export type MediaType = 'movie' | 'tv' | 'anime';

/** Espelha media_meta/{type:id} no Firestore (docs/ARQUITETURA-FASE-0.md §4). */
export interface MediaMeta {
  type: MediaType;
  id: number;
  title: string;
  poster: string; // path do CDN
  overview: string;
  genres: string[];
  year: number;
  episodes?: number;
  status: 'finished' | 'airing';
  ids: { tmdb?: number; anilist?: number; mal?: number };
  source: 'tmdb' | 'anilist';
  ttlClass: 'static' | 'airing';
  providers?: { name: string; logo: string }[];
  updatedAt: number;
}

/** Item resumido das prateleiras (discovery_lists). */
export interface DiscoveryItem {
  type: MediaType;
  id: number;
  title: string;
  poster: string;
  year?: number;
}

/** Status pessoal — espelha users/{uid}/library/{type:id}. */
export interface LibraryEntry {
  status: 'planned' | 'watching' | 'done' | 'dropped';
  rating?: number;
  progress?: { watched: number; total: number };
  updatedAt: number;
}

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

function posterUrl(type: MediaType, poster: string): string {
  // AniList já entrega URL completa; TMDB entrega só o path.
  if (!poster) return '';
  return type === 'anime' || poster.startsWith('http') ? poster : `${TMDB_IMG}${poster}`;
}

/** Adapta o media_meta rico → CatalogItem que as telas já consomem. */
export function toCatalogItem(m: MediaMeta): CatalogItem {
  return {
    id: `${m.type}:${m.id}`,
    type: m.type,
    title: m.title,
    poster: posterUrl(m.type, m.poster),
    posterData: '', // base64 só é gerado pro card; vazio na navegação
    genres: m.genres,
  };
}

/** Adapta um item de prateleira → CatalogItem. */
export function discoveryToCatalogItem(it: DiscoveryItem): CatalogItem {
  return {
    id: `${it.type}:${it.id}`,
    type: it.type,
    title: it.title,
    poster: posterUrl(it.type, it.poster),
    posterData: '',
    genres: [],
  };
}

/** Detalhe rico (CatalogItem + campos extras do media_meta). */
export interface MediaDetail extends CatalogItem {
  overview?: string;
  episodes?: number;
  providers?: { name: string; logo: string }[];
}

export function toMediaDetail(m: MediaMeta): MediaDetail {
  return {
    ...toCatalogItem(m),
    overview: m.overview || undefined,
    episodes: m.episodes,
    providers: m.providers,
  };
}
