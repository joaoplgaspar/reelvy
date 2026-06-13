import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDb, getFns } from '../lib/firebase';
import { toCatalogItem, discoveryToCatalogItem, type MediaMeta, type DiscoveryItem, type LibraryEntry } from './media';
import type { CatalogItem } from './catalog';
import type { Shelf } from './queries';

/**
 * Camada de dados REMOTA (Firestore + Functions). Mesmas formas da camada local
 * (`queries.ts`) — é o alvo do swap quando o backend estiver de pé.
 * AINDA NÃO está plugada nas páginas: o app roda no catálogo local até a troca.
 * Plano de troca: docs/BACKEND-SKELETON.md.
 */

const DISCOVERY_KEYS = ['seasonal_anime', 'trending_movies', 'popular_tv'] as const;

const SHELF_TITLES: Record<string, string> = {
  seasonal_anime: 'Temporada de anime',
  trending_movies: 'Em alta',
  popular_tv: 'Séries pra maratonar',
};

/** Home: lê cada prateleira pré-aquecida (1 doc por fileira = 1 leitura). */
export async function remoteShelves(): Promise<Shelf[]> {
  const db = getDb();
  const out: Shelf[] = [];
  for (const key of DISCOVERY_KEYS) {
    const snap = await getDoc(doc(db, 'discovery_lists', key));
    if (!snap.exists()) continue;
    const items = (snap.data().items ?? []) as DiscoveryItem[];
    out.push({ key, title: SHELF_TITLES[key] ?? key, items: items.map(discoveryToCatalogItem) });
  }
  return out;
}

/** Detalhe: read-through — Firestore primeiro, Function resolveMedia no cache-miss. */
export async function remoteById(mediaId: string): Promise<CatalogItem | undefined> {
  const [type, idStr] = mediaId.split(':');
  const snap = await getDoc(doc(getDb(), 'media_meta', mediaId));
  if (snap.exists()) return toCatalogItem(snap.data() as MediaMeta);

  const resolve = httpsCallable<{ type: string; id: number }, MediaMeta>(getFns(), 'resolveMedia');
  const res = await resolve({ type, id: Number(idStr) });
  return toCatalogItem(res.data);
}

// ---- biblioteca pessoal: users/{uid}/library/{type:id} ----

export async function getLibrary(uid: string): Promise<Record<string, LibraryEntry>> {
  const snap = await getDocs(collection(getDb(), 'users', uid, 'library'));
  const lib: Record<string, LibraryEntry> = {};
  snap.forEach((d) => (lib[d.id] = d.data() as LibraryEntry));
  return lib;
}

export async function setLibraryEntry(uid: string, mediaId: string, entry: Partial<LibraryEntry>): Promise<void> {
  await setDoc(
    doc(getDb(), 'users', uid, 'library', mediaId),
    { ...entry, updatedAt: Date.now() },
    { merge: true },
  );
}

export async function removeLibraryEntry(uid: string, mediaId: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'users', uid, 'library', mediaId));
}
