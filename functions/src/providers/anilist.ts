import type { DiscoveryItem, MediaMetaCore } from '../types';

// AniList é GraphQL e gratuito — sem token. Fonte da verdade p/ anime.
const ENDPOINT = 'https://graphql.anilist.co';

async function anilist<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

const MEDIA_FIELDS = `
  id
  title { romaji english }
  description(asHtml: false)
  genres
  seasonYear
  episodes
  status
  coverImage { large }
  idMal
`;

function mapMedia(m: Record<string, any>): MediaMetaCore {
  const airing = m.status === 'RELEASING';
  return {
    title: m.title?.english ?? m.title?.romaji ?? '',
    poster: m.coverImage?.large ?? '',
    overview: m.description ?? '',
    genres: m.genres ?? [],
    year: m.seasonYear ?? 0,
    episodes: m.episodes ?? undefined,
    status: airing ? 'airing' : 'finished',
    ids: { anilist: m.id, mal: m.idMal ?? undefined },
    source: 'anilist',
    ttlClass: airing ? 'airing' : 'static',
  };
}

/** Item de descoberta/busca a partir de um nó de mídia do AniList. */
function toDiscovery(m: Record<string, any>): DiscoveryItem {
  return {
    type: 'anime',
    id: m.id,
    title: m.title?.english ?? m.title?.romaji ?? '',
    poster: m.coverImage?.large ?? '',
    year: m.seasonYear ?? 0,
  };
}

export async function fetchAniList(id: number): Promise<MediaMetaCore> {
  const data = await anilist<{ Media: Record<string, any> }>(
    `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`,
    { id },
  );
  return mapMedia(data.Media);
}

export async function fetchAniListSeasonal(): Promise<DiscoveryItem[]> {
  const data = await anilist<{ Page: { media: Record<string, any>[] } }>(
    `query {
       Page(perPage: 20) {
         media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
           id title { romaji english } seasonYear coverImage { large }
         }
       }
     }`,
    {},
  );
  return (data.Page?.media ?? []).map(toDiscovery);
}

export async function searchAniList(q: string): Promise<DiscoveryItem[]> {
  const data = await anilist<{ Page: { media: Record<string, any>[] } }>(
    `query ($q: String) {
       Page(perPage: 12) {
         media(type: ANIME, search: $q, sort: SEARCH_MATCH) {
           id title { romaji english } seasonYear coverImage { large }
         }
       }
     }`,
    { q },
  );
  return (data.Page?.media ?? []).map(toDiscovery);
}
