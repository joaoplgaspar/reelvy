import type { DiscoveryItem, MediaMetaCore, MediaType } from '../types';

const BASE = 'https://api.themoviedb.org/3';

// Token NUNCA no front — vem do Secret Manager (secrets: ['TMDB_TOKEN']).
function authHeaders(): Record<string, string> {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error('TMDB_TOKEN ausente — configure o secret (ver functions/README.md).');
  return { accept: 'application/json', Authorization: `Bearer ${token}` };
}

async function tmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`TMDB ${res.status} em ${path}`);
  return (await res.json()) as T;
}

/** Detalhe de filme/série → core do MediaMeta. */
export async function fetchTmdb(type: MediaType, id: number): Promise<MediaMetaCore> {
  const kind = type === 'tv' ? 'tv' : 'movie';
  const d = await tmdb<Record<string, any>>(`/${kind}/${id}?language=pt-BR&append_to_response=watch/providers`);
  const date: string = d.release_date ?? d.first_air_date ?? '';
  const airing = d.status === 'Returning Series' || d.in_production === true;
  const flat: Record<string, any>[] = d['watch/providers']?.results?.BR?.flatrate ?? [];
  return {
    title: d.title ?? d.name ?? '',
    poster: d.poster_path ?? '',
    overview: d.overview ?? '',
    genres: (d.genres ?? []).map((g: { name: string }) => g.name),
    year: date ? Number(date.slice(0, 4)) : 0,
    episodes: d.number_of_episodes,
    status: airing ? 'airing' : 'finished',
    ids: { tmdb: id },
    source: 'tmdb',
    ttlClass: airing ? 'airing' : 'static',
    providers: flat.slice(0, 6).map((p) => ({ name: p.provider_name, logo: `https://image.tmdb.org/t/p/w92${p.logo_path}` })),
  };
}

function toDiscovery(type: MediaType, r: Record<string, any>): DiscoveryItem {
  const date: string = r.release_date ?? r.first_air_date ?? '';
  return {
    type,
    id: r.id,
    title: r.title ?? r.name ?? '',
    poster: r.poster_path ?? '',
    year: date ? Number(date.slice(0, 4)) : 0,
  };
}

export async function fetchTmdbTrending(type: 'movie' | 'tv'): Promise<DiscoveryItem[]> {
  const d = await tmdb<{ results?: Record<string, any>[] }>(`/trending/${type}/week?language=pt-BR`);
  return (d.results ?? []).slice(0, 20).map((r) => toDiscovery(type, r));
}

export async function fetchTmdbPopular(type: 'movie' | 'tv'): Promise<DiscoveryItem[]> {
  const d = await tmdb<{ results?: Record<string, any>[] }>(`/${type}/popular?language=pt-BR&page=1`);
  return (d.results ?? []).slice(0, 20).map((r) => toDiscovery(type, r));
}

/** Busca multi (filme + série); descarta person/etc. Anime vem do AniList. */
export async function searchTmdb(q: string): Promise<DiscoveryItem[]> {
  const d = await tmdb<{ results?: Record<string, any>[] }>(
    `/search/multi?language=pt-BR&page=1&query=${encodeURIComponent(q)}`,
  );
  return (d.results ?? [])
    .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
    .slice(0, 14)
    .map((r) => toDiscovery(r.media_type === 'tv' ? 'tv' : 'movie', r));
}
