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
│       ├── resolveMedia.ts     callable — read-through cache
│       ├── prewarmDiscovery.ts scheduled (24h) — pré-aquece prateleiras
│       ├── providers/tmdb.ts    fetch + mapeamento TMDB (filme/série)
│       ├── providers/anilist.ts fetch + mapeamento AniList (anime)
│       └── types.ts            MediaMeta / DiscoveryItem
└── app/src/
    ├── lib/firebase.ts     init guardado (só liga se as VITE_FIREBASE_* existirem)
    ├── lib/auth.ts         Google + email/senha; cria users/{uid} no 1º login
    ├── lib/queryClient.ts  TanStack Query (cache no cliente)
    ├── data/media.ts       tipos + adaptadores media_meta → CatalogItem
    └── data/remote.ts      camada REMOTA (Firestore + Functions), espelha queries.ts
```

> ⚠️ **O esqueleto está inerte.** O app continua rodando no **catálogo local** (`data/queries.ts` + `data/catalog.ts`). Nada em `data/remote.ts`/`lib/auth.ts` está plugado nas páginas ainda — é o alvo do swap abaixo. Por isso o build passa sem um projeto Firebase.

## Ligar o backend (passo a passo)

1. **Criar o projeto Firebase** (Console) → Auth (Google + email), Firestore (modo produção).
2. **Configurar o cliente:** copiar `app/.env.example` → `app/.env` e preencher as `VITE_FIREBASE_*`.
3. **Secret do TMDB:** `firebase functions:secrets:set TMDB_TOKEN` (ver [`functions/README.md`](../functions/README.md)). AniList não precisa de token.
4. **Publicar regras + functions:**
   ```bash
   firebase deploy --only firestore:rules
   cd functions && npm install && npm run build && firebase deploy --only functions
   ```
5. **Semear a descoberta:** rodar `prewarmDiscovery` uma vez (no Console ou via emulador) pra popular `discovery_lists`.

## Swap local → remoto (onde plugar nas telas)

A costura é **assinatura igual** entre `queries.ts` (local, síncrono) e `remote.ts` (remoto, async). Trocar por página, via TanStack Query:

| Tela | Hoje (local) | Vira (remoto) |
|---|---|---|
| Home | `shelves()` | `useQuery(['shelves'], remoteShelves)` |
| Detalhe | `byId(id)` | `useQuery(['media', id], () => remoteById(id))` |
| Biblioteca/Detalhe | `useStore` (localStorage) | `getLibrary(uid)` / `setLibraryEntry` / `removeLibraryEntry` |
| Onboarding/Signup | `completeOnboarding` local | idem + persistir no Firestore após o login (signup adiado) |

Ordem sugerida (a mesma do roadmap em `REELVY.md` §9):
1. Auth real (tela de signup/login adiado) + gate no `AppShell`.
2. Migrar a biblioteca do `zustand`/localStorage → subcoleção `library` (manter o local como cache otimista).
3. Trocar `shelves()`/`byId()` pelos hooks remotos (Home e Detalhe).
4. Detalhe com metadados ricos (sinopse/episódios/elenco) vindos do `resolveMedia`.

## Decisões fixadas (não reabrir)

- **Biblioteca = subcoleção** `users/{uid}/library/{type:id}`, nunca array no doc do user (estoura 1MB).
- **Token só nas Functions** (Secret Manager) — nunca no front.
- **Imagens** direto do CDN TMDB/AniList — nunca proxiar.
- **1 doc por prateleira** (`discovery_lists/{key}`) — 1 leitura serve a fileira.
- **Progresso por episódio** entra já (habilita o spoiler-safe da Fase 2).
