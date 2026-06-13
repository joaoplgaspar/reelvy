import { useQuery } from '@tanstack/react-query';
import { isFirebaseConfigured } from '../lib/firebase';
import { shelves as localShelves, byId as localById, search as localSearch, type Shelf } from './queries';
import { remoteShelves, remoteSearch, remoteById } from './remote';
import type { CatalogItem } from './catalog';
import type { MediaDetail } from './media';

// Liga o remoto quando o Firebase está configurado; senão, catálogo local.
// Em erro/vazio o remoto cai no local — o app nunca fica em branco antes do deploy/seed.
const REMOTE = isFirebaseConfigured;

/** Prateleiras da Home. */
export function useShelves() {
  return useQuery<Shelf[]>({
    queryKey: ['shelves', REMOTE],
    queryFn: async () => {
      if (!REMOTE) return localShelves();
      try {
        const r = await remoteShelves();
        return r.length ? r : localShelves(); // ainda não semeado → local
      } catch {
        return localShelves();
      }
    },
  });
}

/** Busca (Function searchMedia) com fallback local. */
export function useSearch(q: string) {
  const term = q.trim();
  return useQuery<CatalogItem[]>({
    queryKey: ['search', term, REMOTE],
    enabled: term.length > 0,
    queryFn: async () => {
      if (!REMOTE) return localSearch(term);
      try {
        return await remoteSearch(term);
      } catch {
        return localSearch(term); // Functions não deployadas → local
      }
    },
  });
}

/** Detalhe (read-through Firestore + resolveMedia) com fallback local. */
export function useMedia(mediaId: string) {
  return useQuery<MediaDetail | undefined>({
    queryKey: ['media', mediaId, REMOTE],
    queryFn: async () => {
      const local = localById(mediaId);
      if (!REMOTE) return local;
      try {
        return (await remoteById(mediaId)) ?? local;
      } catch {
        return local;
      }
    },
  });
}
