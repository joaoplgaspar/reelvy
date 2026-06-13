---
name: add-cloud-function
description: Use ao adicionar uma nova Cloud Function (gen2, TypeScript) ao backend do Reelvy em functions/ — callable (onCall) ou agendada (onSchedule), com secret do Secret Manager se bater em API externa, e o respectivo deploy. Templates existentes: resolveMedia, searchMedia, prewarmDiscovery.
---

# Build: adicionar uma Cloud Function (gen2, TS)

> Backend em `functions/` (CommonJS, Node 22). Arquitetura: `docs/ARQUITETURA-FASE-0.md`.

## Passos
1. **Crie** `functions/src/<nome>.ts`:
   - Callable: `import { onCall, HttpsError } from 'firebase-functions/v2/https'`.
   - Agendada: `import { onSchedule } from 'firebase-functions/v2/scheduler'`.
   - Se bater em API externa com chave → declare `{ secrets: ['TMDB_TOKEN'] }` e leia `process.env.TMDB_TOKEN`. **Nunca** hardcode token.
2. **Provider** (se for fonte nova de dados) → `functions/src/providers/<fonte>.ts` (ver `tmdb.ts`/`anilist.ts`). AniList não precisa de token; TMDB usa o Bearer (Read Access Token).
3. **Exporte** em `functions/src/index.ts`: `export { <nome> } from './<nome>';`.
4. **Tipos** compartilhados em `functions/src/types.ts` (`MediaMeta`, `DiscoveryItem`…).
5. **Compile:** `cd functions && npm run build` (tsc, deve sair limpo).
6. **Deploy:** `firebase deploy --only functions` (precisa Blaze + secrets setados).

## Convenções
- **Região:** default `us-central1` (NÃO setar região custom sem motivo — o cliente usa `getFunctions(app)` que assume `us-central1`; tem que casar).
- **Admin SDK ignora as security rules** — por isso o catálogo é `write: false` nas regras e só as Functions escrevem.
- **Callable tipado:** `onCall(...): Promise<T>`; valide `req.data` e jogue `HttpsError('invalid-argument', …)`.
- **Cache read-through:** só conte hit se o doc estiver **completo** (o `prewarm` grava resumo sem `overview`) — ver `resolveMedia.ts`.

## Plugar no cliente
- Adicione a chamada em `app/src/data/remote.ts` via `httpsCallable<Req, Res>(getFns(), '<nome>')`.
- Exponha via hook em `app/src/data/useCatalog.ts` (ou afim) **com fallback local** — as páginas usam os hooks, nunca `remote.ts` direto.

## Testar
- `tsc` (functions) + `npx tsc --noEmit` (app) + `npm run build`.
- Local: `firebase emulators:start`. AniList dá pra testar ao vivo sem token; TMDB precisa do secret.

## Secret do TMDB
```bash
firebase functions:secrets:set TMDB_TOKEN   # cola o API Read Access Token (v4 Bearer)
```
> ⚠️ Gere um token NOVO no TMDB — o do código legado vazou no histórico do git.
