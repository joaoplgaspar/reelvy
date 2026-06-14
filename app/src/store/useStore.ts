import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '../data/catalog';

export type Status = 'planned' | 'watching' | 'done' | 'dropped';

export type Entry = {
  status: Status;
  rating?: number;       // 0-10
  progress?: number;     // episódios assistidos (séries/anime)
};

// ---- Listas (modelo único: minha / casal / grupo) ----
export type Review = { rating: number; text: string };
export type ListType = 'minha' | 'casal' | 'grupo';
export type List = {
  id: string;
  name: string;
  type: ListType;
  members: string[];                                  // nomes (1 p/ minha, 2 casal, N grupo)
  items: string[];                                    // mediaIds
  reviews: Record<string, Record<string, Review>>;    // mediaId -> membro -> review (o veredito)
  progress: Record<string, Record<string, { ep: number; done: boolean }>>; // mediaId -> membro -> progresso
  createdAt: number;
};

type State = {
  onboarded: boolean;
  worlds: string[];
  picks: string[];                       // ids escolhidos no onboarding (amados)
  library: Record<string, Entry>;        // mediaId -> entry
  lists: Record<string, List>;           // listas (minha/casal/grupo)
  completeOnboarding: (picks: CatalogItem[], worlds: string[]) => void;
  setStatus: (id: string, status: Status) => void;
  setRating: (id: string, rating: number) => void;
  setProgress: (id: string, progress: number) => void;
  remove: (id: string) => void;
  createList: (name: string, type: ListType, members: string[]) => string;
  deleteList: (listId: string) => void;
  addToList: (listId: string, mediaId: string) => void;
  removeFromList: (listId: string, mediaId: string) => void;
  setReview: (listId: string, mediaId: string, member: string, review: Review) => void;
  setListProgress: (listId: string, mediaId: string, member: string, prog: { ep: number; done: boolean }) => void;
  reset: () => void;
  mergeLibrary: (entries: Record<string, Entry>) => void;
  markOnboarded: () => void;
  clearUserData: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      onboarded: false,
      worlds: ['movie', 'tv', 'anime'],
      picks: [],
      library: {},
      lists: {},

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

      createList: (name, type, members) => {
        const id = `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({
          lists: { ...s.lists, [id]: { id, name, type, members, items: [], reviews: {}, progress: {}, createdAt: Date.now() } },
        }));
        return id;
      },
      deleteList: (listId) =>
        set((s) => { const lists = { ...s.lists }; delete lists[listId]; return { lists }; }),
      addToList: (listId, mediaId) =>
        set((s) => {
          const l = s.lists[listId];
          if (!l || l.items.includes(mediaId)) return {};
          return { lists: { ...s.lists, [listId]: { ...l, items: [...l.items, mediaId] } } };
        }),
      removeFromList: (listId, mediaId) =>
        set((s) => {
          const l = s.lists[listId];
          if (!l) return {};
          const reviews = { ...l.reviews }; delete reviews[mediaId];
          const progress = { ...(l.progress || {}) }; delete progress[mediaId];
          return { lists: { ...s.lists, [listId]: { ...l, items: l.items.filter((m) => m !== mediaId), reviews, progress } } };
        }),
      setReview: (listId, mediaId, member, review) =>
        set((s) => {
          const l = s.lists[listId];
          if (!l) return {};
          const itemReviews = { ...(l.reviews[mediaId] || {}), [member]: review };
          return { lists: { ...s.lists, [listId]: { ...l, reviews: { ...l.reviews, [mediaId]: itemReviews } } } };
        }),
      setListProgress: (listId, mediaId, member, prog) =>
        set((s) => {
          const l = s.lists[listId];
          if (!l) return {};
          const prev = l.progress || {};
          const itemProg = { ...(prev[mediaId] || {}), [member]: prog };
          return { lists: { ...s.lists, [listId]: { ...l, progress: { ...prev, [mediaId]: itemProg } } } };
        }),

      reset: () => set({ onboarded: false, picks: [], library: {} }),

      // sync remoto: mescla o que veio do Firestore no estado local
      mergeLibrary: (entries) => set((s) => ({ library: { ...s.library, ...entries } })),
      // ter conta implica ter passado o onboarding (ex.: login em outro dispositivo)
      markOnboarded: () => set({ onboarded: true }),
      // signout: limpa dados pessoais do dispositivo (re-hidrata do remoto no próximo login)
      clearUserData: () => set({ library: {}, picks: [] }),
    }),
    { name: 'reelvy-store' },
  ),
);
