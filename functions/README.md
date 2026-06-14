# Reelvy — Cloud Functions (Fase 0)

Backend gen2 (TypeScript) do catálogo cacheado. Ver `docs/ARQUITETURA-FASE-0.md`.

| Function | Tipo | O que faz |
|---|---|---|
| `resolveMedia` | callable | Read-through: Firestore → cache-miss busca TMDB/AniList, grava `media_meta`, retorna |
| `prewarmDiscovery` | scheduled (24h) | Popula `discovery_lists` + `media_meta` (a Home sai do Firestore) |

## Pré-requisitos

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # associa um projeto Firebase real (substitui o "reelvy" placeholder no .firebaserc)
cd functions && npm install
```

## Secret do TMDB (nunca no front)

```bash
firebase functions:secrets:set TMDB_TOKEN     # cola o Bearer token (v4) do TMDB
```

AniList é gratuito e sem token.

## Rodar local (emuladores)

```bash
npm run build
firebase emulators:start      # functions + firestore + auth + UI
```

## Deploy

```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
```

> ⚠️ O token TMDB que vazou no código legado (`getApi.ts`) está no histórico do git — **revogue/rotacione no TMDB** e use só via Secret Manager aqui.
