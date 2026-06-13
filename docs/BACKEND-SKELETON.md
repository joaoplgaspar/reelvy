# Reelvy — Esqueleto do Backend (Fase 0)

> O que já está scaffoldado e os passos exatos pra sair do estado local → backend real.
> Arquitetura completa (schema, cache, custos): [`ARQUITETURA-FASE-0.md`](ARQUITETURA-FASE-0.md).

## O que já existe no repo

```
reelvy/
├── firebase.json          config (functions + firestore + emuladores; hosting fica no Vercel/Cloudflare)
├── .firebaserc            alias do projeto (placeholder "reelvy" — trocar pelo real)
├── firestore.rules        regras de segurança da Fase 0 (catálogo read-only; biblioteca só do dono)
├── firestore.indexes.json (vazio por enquanto)
├── functions/             Cloud Functions gen2 (TypeScript)
│   └── src/
│       ├── index.ts           init do Admin SDK + exports
│       ├── resolveMedia.ts     callable — read-through cache (detalhe por id)
│       ├── searchMedia.ts      callable — busca unificada (TMDB multi + AniList)
│       ├── prewarmDiscovery.ts scheduled (24h) — pré-aquece prateleiras
│       ├── providers/tmdb.ts    fetch/busca/mapeamento TMDB (filme/série)
│       ├── providers/anilist.ts fetch/busca/mapeamento AniList (anime)
│       └── types.ts            MediaMeta / DiscoveryItem
└── app/src/
    ├── app/AuthContext.tsx ligação do Auth (modo firebase vs local)
    ├── lib/firebase.ts     init guardado (só liga se as VITE_FIREBASE_* existirem)
    ├── lib/auth.ts         Google + email/senha; cria users/{uid} no 1º login
    ├── lib/queryClient.ts  TanStack Query (cache no cliente)
    ├── data/media.ts       tipos + adaptadores media_meta → CatalogItem
    ├── data/remote.ts      camada REMOTA (Firestore + Functions), espelha queries.ts
    └── data/useCatalog.ts  hooks (useShelves/useSearch/useMedia) c/ fallback local
```

> ✅ **Já plugado:** Auth (login + gate) e a **leitura de catálogo** (Home/Busca/Detalhe via `useCatalog.ts`). Os hooks tentam o remoto e **caem no catálogo local** em erro/vazio — então o app funciona sem projeto Firebase (modo local) e **acende com dado real** assim que você deploya + semeia.
> ⏳ **Falta plugar:** a **biblioteca** pessoal (`useStore`/localStorage → subcoleção `library`) — é o último swap.

## Ligar o backend (passo a passo)

1. **Criar o projeto Firebase** (Console) → Auth (Google + email), Firestore (modo produção).
2. **Configurar o cliente:** copiar `app/.env.example` → `app/.env` e preencher as `VITE_FIREBASE_*`.
3. **Secret do TMDB:** `firebase functions:secrets:set TMDB_TOKEN` (ver [`functions/README.md`](../functions/README.md)). AniList não precisa de token.
4. **Publicar regras + functions:**
   ```bash
   firebase deploy --only firestore:rules
   cd functions && npm install && npm run build && firebase deploy --only functions
   ```
5. **Semear a descoberta:** disparar `prewarmDiscovery` uma vez pra popular `discovery_lists` (Console → Cloud Scheduler → job do `prewarmDiscovery` → **Run now**; ou `gcloud scheduler jobs run firebase-schedule-prewarmDiscovery-<região>`). Sem o seed, a Home cai no catálogo local.

## Swap local → remoto (status)

A costura é **assinatura igual** entre `queries.ts` (local) e `remote.ts` (remoto), unificada nos hooks de `useCatalog.ts`.

| Tela / dado | Status | Como |
|---|---|---|
| Auth + gate | ✅ feito | `AuthContext` + `/entrar` + gate no `AppShell` |
| Home (prateleiras) | ✅ feito | `useShelves()` → `remoteShelves()` (fallback local) |
| Busca | ✅ feito | `useSearch()` → Function `searchMedia` (fallback local) |
| Detalhe | ✅ feito | `useMedia()` → `remoteById()`/`resolveMedia` (fallback local) |
| Biblioteca pessoal | ⏳ falta | `useStore`/localStorage → subcoleção `library` (`getLibrary`/`setLibraryEntry`/`removeLibraryEntry` já existem em `remote.ts`) |

> Os hooks só chamam o remoto quando `isFirebaseConfigured` é true; em erro/vazio caem no local. Ou seja: **sem deploy, tudo roda local; com deploy + seed, vira dado real** sem tocar nas telas.

## Decisões fixadas (não reabrir)

- **Biblioteca = subcoleção** `users/{uid}/library/{type:id}`, nunca array no doc do user (estoura 1MB).
- **Token só nas Functions** (Secret Manager) — nunca no front.
- **Imagens** direto do CDN TMDB/AniList — nunca proxiar.
- **1 doc por prateleira** (`discovery_lists/{key}`) — 1 leitura serve a fileira.
- **Progresso por episódio** entra já (habilita o spoiler-safe da Fase 2).
