# Reelvy — Arquitetura da Fase 0

> Fundação técnica do tracker solo + card viral.
> Esquema de dados, camada de cache, Cloud Functions e regras de segurança.
> **Esta é a decisão mais cara de errar — telas e código se apoiam aqui.**

---

## 1. Escopo da Fase 0

**Entra:** auth · catálogo unificado (filme/série/anime) · descoberta · detalhe · tracking com **progresso por episódio** · biblioteca · perfil · **gerador de card compartilhável**.

**NÃO entra (Fases 1–3):** amigos, % de compatibilidade, feed social, spoiler-safe, sessão em grupo.

> ⚠️ O **progresso por episódio entra já agora**, mesmo sem uso social. É o dado que habilita o spoiler-safe na Fase 2. Não modelar isso agora = retrabalho.

---

## 2. Stack (decisão final)

| Camada | Escolha | Porquê |
|---|---|---|
| Front | React + Vite + TS, PWA | Vite > CRA (morto). Mobile-first. |
| Cache cliente | TanStack Query + persist IndexedDB | Corta leituras Firestore em 50–80% |
| Backend | Firebase Auth + Firestore + Functions (gen2) | Já decidido; esconde chaves nas Functions |
| Hosting | Cloudflare Pages / Vercel (estático) | Free tier; economiza banda |
| Catálogo | TMDB (filme/série) + AniList (anime) | Grátis no não-comercial (TMDB: US$149/mês ao monetizar — ver CUSTOS) |
| Card | `html-to-image` (client-side) | Custo zero de servidor |

---

## 3. Arquitetura em alto nível

```
                    ┌─────────────── cron diário ───────────────┐
                    ▼                                            │
  TMDB / AniList ──► Cloud Function ──► Firestore media_meta ◄── prewarmDiscovery
       ▲            (resolveMedia)          + discovery_lists
       │ cache-miss      ▲                        │
       │                 │ leitura barata         │ leitura barata
       └─────────────────┴──── Cliente (TanStack Query cache) ──┘
                                     │
                                     ▼
                          users/{uid}/library  (dados pessoais)
```

- **Imagens** vêm direto do CDN do TMDB/AniList (`image.tmdb.org`) — **nunca proxie**, você não paga essa banda.
- **Chaves de API** ficam só nas Functions (Secret Manager) — o cliente nunca vê.

---

## 4. Modelo de dados (Firestore)

### `media_meta/{type:id}` — catálogo cacheado (uma coleção só)

ID namespaced: `movie:603`, `tv:1399`, `anime:21`. Uma coleção unificada (não três) — a biblioteca referencia mídia por um id único.

```ts
media_meta/{type:id} {
  type: 'movie' | 'tv' | 'anime'
  title: string
  poster: string            // path do CDN (não URL completa)
  overview: string
  genres: string[]
  year: number
  episodes?: number         // séries e anime
  status: 'finished' | 'airing'
  ids: { tmdb?: number, anilist?: number, mal?: number }  // cross-ref p/ Fase 3
  source: 'tmdb' | 'anilist'
  ttlClass: 'static' | 'airing'
  updatedAt: number         // epoch ms
}
```

### `discovery_lists/{key}` — prateleiras pré-aquecidas

Uma prateleira inteira = **1 doc** (1 leitura serve a fileira toda).

```ts
discovery_lists/{trending_movies | popular_tv | seasonal_anime} {
  items: Array<{ type, id, title, poster, year }>   // resumido
  updatedAt: number
}
```

### `users/{uid}` + subcoleção `library` — dados pessoais

> ❌ **NÃO** guarde a biblioteca como array dentro do doc do usuário (erro do código atual: estoura o limite de 1MB e reescreve tudo a cada update).
> ✅ Use **subcoleção**: 1 doc por título. Escala e suporta progresso por episódio.

```ts
users/{uid} {
  name, avatar, email, createdAt
}

users/{uid}/library/{type:id} {
  type, mediaId: 'type:id'
  status: 'planned' | 'watching' | 'done' | 'dropped'
  rating?: number          // 0–10
  progress?: { watched: number, total: number }   // p/ séries/anime
  updatedAt: number
}
```

---

## 5. Estratégia de IDs e fonte da verdade

Anime existe no TMDB **e** no AniList. Para não duplicar:

- **Anime → AniList** é a fonte da verdade (metadados, episódios, temporada).
- **Filme / série ocidental → TMDB**.
- Sempre grave os **cross-ids** (`ids.tmdb`, `ids.anilist`, `ids.mal`). A Fase 3 (disponibilidade "está na Netflix?") precisa do `tmdb_id`.

---

## 6. Camada de cache (os 3 fluxos)

### a) Read-through (página de detalhe)
```
cliente quer X
 → TanStack Query (memória/IndexedDB)?  → usa
 → senão lê Firestore media_meta/{X}    → usa se fresco
 → senão chama Function resolveMedia()   → busca API, grava cache, retorna
```

### b) Pré-aquecimento por cron (descoberta)
Function agendada (1×/dia) popula `discovery_lists` + `media_meta`. A Home é servida do Firestore com quase zero chamada externa.

### c) Cache no cliente (TanStack Query)
Deduplica e persiste. **Maior alavanca de custo.**

### TTL por tipo
- `static` (finalizado): 90 dias.
- `airing` (no ar / temporada atual): 2 dias (episódios e nota mudam).

---

## 7. Cloud Functions (referência)

### `resolveMedia` — cache-fill sob demanda (callable, gen2)

```ts
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const DAY = 86_400_000;
const TTL = { static: 90 * DAY, airing: 2 * DAY };

export const resolveMedia = onCall({ secrets: ['TMDB_TOKEN'] }, async (req) => {
  const { type, id } = req.data as { type: string; id: number };
  const key = `${type}:${id}`;
  const ref = getFirestore().doc(`media_meta/${key}`);
  const snap = await ref.get();

  if (snap.exists) {
    const m = snap.data()!;
    const ttl = TTL[m.ttlClass as keyof typeof TTL] ?? TTL.static;
    if (Date.now() - m.updatedAt < ttl) return m;   // cache hit fresco
  }

  const meta = type === 'anime'
    ? await fetchAniList(id)
    : await fetchTmdb(type, id);

  const doc = { ...meta, type, updatedAt: Date.now() };
  await ref.set(doc, { merge: true });
  return doc;
});
```

### `prewarmDiscovery` — cron diário (scheduled, gen2)

```ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';

export const prewarmDiscovery = onSchedule(
  { schedule: 'every 24 hours', secrets: ['TMDB_TOKEN'] },
  async () => {
    const db = getFirestore();
    const shelves = {
      trending_movies: await fetchTmdbTrending('movie'),
      popular_tv:      await fetchTmdbPopular('tv'),
      seasonal_anime:  await fetchAniListSeasonal(),
    };

    const batch = db.batch();   // limite 500 ops/batch — ok p/ descoberta
    for (const [key, items] of Object.entries(shelves)) {
      batch.set(db.doc(`discovery_lists/${key}`), { items, updatedAt: Date.now() });
      for (const m of items) {
        batch.set(db.doc(`media_meta/${m.type}:${m.id}`),
                  { ...m, updatedAt: Date.now() }, { merge: true });
      }
    }
    await batch.commit();
  }
);
```

> As chaves (`TMDB_TOKEN`) ficam no Secret Manager. O cliente **nunca** as vê — corrige o token exposto do código atual.

---

## 8. Regras de segurança (Firestore)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    // Catálogo cacheado: leitura p/ autenticados; escrita só via Functions (admin)
    match /media_meta/{id} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /discovery_lists/{id} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    // Dados pessoais: só o dono
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /library/{mediaId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

> Functions usam o Admin SDK e **ignoram** as rules — por isso `write: if false` no catálogo é seguro.
> Tradeoff: hoje exige login para navegar. Para landing pública (card cai em quem não tem conta), abrir `read` do catálogo depois — custa leituras de não-logados.

---

## 9. Cache no cliente (TanStack Query)

```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: {
    staleTime: 60 * 60 * 1000,        // 1h fresco
    gcTime:    24 * 60 * 60 * 1000,   // 24h em cache
  }},
});
// + persistQueryClient com IndexedDB (sobrevive a reloads)
```

---

## 10. O que NÃO fazer (erros herdados do código atual)

1. ❌ Biblioteca como array no doc do usuário → ✅ subcoleção.
2. ❌ Token de API no front → ✅ Secret Manager nas Functions.
3. ❌ Proxiar/armazenar imagens → ✅ servir do CDN do TMDB/AniList.
4. ❌ Ler N docs por prateleira → ✅ 1 doc por prateleira.
5. ❌ Buscar API a cada visualização → ✅ read-through + pré-aquecimento.

---

## 11. Ordem de construção da Fase 0

1. Projeto Vite + TS + PWA + Firebase + TanStack Query
2. Auth (email + Google) + `users/{uid}`
3. Functions: `resolveMedia` + `prewarmDiscovery` + Secret Manager
4. `media_meta` + `discovery_lists` + regras de segurança
5. Telas: descoberta → detalhe → tracking (com progresso) → biblioteca
6. Gerador de card (`html-to-image`)
7. Polir o card até dar vontade de compartilhar (é o motor de aquisição)

Ver custos em [CUSTOS-FASE-0.md](CUSTOS-FASE-0.md).
