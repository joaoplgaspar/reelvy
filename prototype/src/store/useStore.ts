import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '../data/catalog';

export type Status = 'planned' | 'watching' | 'done' | 'dropped';

export type Entry = {
  status: Status;
  rating?: number;       // 0-10
  progress?: number;     // episódios assistidos (séries/anime)
};

type State = {
  onboarded: boolean;
  worlds: string[];
  picks: string[];                       // ids escolhidos no onboarding (amados)
  library: Record<string, Entry>;        // mediaId -> entry
  completeOnboarding: (picks: CatalogItem[], worlds: string[]) => void;
  setStatus: (id: string, status: Status) => void;
  setRating: (id: string, rating: number) => void;
  setProgress: (id: string, progress: number) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      onboarded: false,
      worlds: ['movie', 'tv', 'anime'],
      picks: [],
      library: {},

      completeOnboarding: (picks, worlds) =>
        set(() => {
          const library: Record<string, Entry> = {};
          for (const p of picks) library[p.id] = { status: 'done', rating: 9 };
          return { onboarded: true, worlds, picks: picks.map((p) => p.id), library };
        }),

      setStatus: (id, status) =>
        set((s) => ({ library: { ...s.library, [id]: { ...s.library[id], status } } })),

      setRating: (id, rating) =>
        set((s) => ({
          library: { ...s.library, [id]: { ...(s.library[id] ?? { status: 'done' }), rating } },
        })),

      setProgress: (id, progress) =>
        set((s) => ({
          library: { ...s.library, [id]: { ...(s.library[id] ?? { status: 'watching' }), progress } },
        })),

      remove: (id) =>
        set((s) => {
          const library = { ...s.library };
          delete library[id];
          return { library };
        }),

      reset: () => set({ onboarded: false, picks: [], library: {} }),
    }),
    { name: 'reelvy-store' },
  ),
);
