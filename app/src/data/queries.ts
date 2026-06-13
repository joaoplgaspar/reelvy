import { CATALOG, CatalogItem } from './catalog';

// Camada de dados sobre o catálogo local. Costura limpa: depois troca por Firebase/TMDB
// sem mexer nas páginas (mesmas assinaturas: shelves / byId / search).

const BY_ID = new Map(CATALOG.map((i) => [i.id, i]));

export const byId = (id: string): CatalogItem | undefined => BY_ID.get(id);

export type Shelf = { key: string; title: string; items: CatalogItem[] };

export function shelves(): Shelf[] {
  const anime = CATALOG.filter((i) => i.type === 'anime');
  const movies = CATALOG.filter((i) => i.type === 'movie');
  const tv = CATALOG.filter((i) => i.type === 'tv');
  return [
    { key: 'trending', title: 'Em alta', items: CATALOG.slice(0, 12) },
    { key: 'anime', title: 'Temporada de anime', items: anime },
    { key: 'movies', title: 'Filmes populares', items: movies },
    { key: 'tv', title: 'Séries pra maratonar', items: tv },
  ];
}

export function search(q: string): CatalogItem[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return CATALOG.filter((i) => i.title.toLowerCase().includes(s));
}

export const POSTER_FALLBACK = CATALOG[0]?.poster;
