import { useEffect } from 'react';
import { useStore, type Entry } from '../store/useStore';
import { getLibrary, setLibraryEntry, removeLibraryEntry } from './remote';
import type { LibraryEntry } from './media';

// Conversão entre o Entry local (progress = nº de eps) e o LibraryEntry remoto.
function entryToRemote(e: Entry): Partial<LibraryEntry> {
  const out: Partial<LibraryEntry> = { status: e.status };
  if (e.rating !== undefined) out.rating = e.rating;
  if (e.progress !== undefined) out.progress = { watched: e.progress, total: 0 };
  return out;
}

function remoteToEntry(r: LibraryEntry): Entry {
  const e: Entry = { status: r.status };
  if (r.rating !== undefined) e.rating = r.rating;
  if (r.progress) e.progress = r.progress.watched;
  return e;
}

/**
 * Sincroniza a biblioteca local (zustand) ↔ Firestore quando logado (modo Firebase).
 * - hydrate: puxa o remoto e mescla no local.
 * - 1º login (remoto vazio): sobe a biblioteca do onboarding.
 * - write-through: cada mudança local é gravada no remoto (UI otimista).
 * No-op em modo local / sem uid.
 */
export function useLibrarySync(uid: string | undefined) {
  const mergeLibrary = useStore((s) => s.mergeLibrary);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    let ready = false; // só escreve depois do hydrate (evita eco)

    (async () => {
      try {
        const remote = await getLibrary(uid);
        if (!active) return;
        const local = useStore.getState().library;

        const merged: Record<string, Entry> = {};
        for (const [id, r] of Object.entries(remote)) merged[id] = remoteToEntry(r);
        if (Object.keys(merged).length) mergeLibrary(merged);

        // remoto vazio = conta nova (ex.: pós-onboarding) → persiste o que está local
        if (Object.keys(remote).length === 0) {
          await Promise.all(
            Object.entries(local).map(([id, e]) => setLibraryEntry(uid, id, entryToRemote(e))),
          );
        }
      } catch (err) {
        console.warn('Sync inicial da biblioteca falhou:', err);
      } finally {
        if (active) ready = true;
      }
    })();

    // write-through: grava só o que mudou (zustand passa state + prevState)
    const unsub = useStore.subscribe((state, prev) => {
      if (!ready || state.library === prev.library) return;
      const cur = state.library;
      for (const [id, e] of Object.entries(cur)) {
        if (prev.library[id] !== e) setLibraryEntry(uid, id, entryToRemote(e)).catch(() => {});
      }
      for (const id of Object.keys(prev.library)) {
        if (!(id in cur)) removeLibraryEntry(uid, id).catch(() => {});
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, [uid, mergeLibrary]);
}
