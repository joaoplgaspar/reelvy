---
name: mechanic-compatibility
description: Use ao projetar ou implementar a mecânica de % de compatibilidade de gosto do Reelvy (Fase 1) — grafo de amigos/seguir, cálculo de similaridade entre usuários, a função computeCompat e a UI de compatibilidade no perfil. NÃO construir antes de a Fase 0 validar o card (K-factor).
---

# Mecânica: % de compatibilidade (Fase 1)

> O *porquê / sequência* está em `docs/MECANICAS-FASES.md`. Aqui é o **como construir**.
> ⛔ **Gate:** só comece depois de o card viralizar (métrica-norte da Fase 0). Uma fase por vez.

## O que é
*"Vocês são **87% compatíveis**."* Vira identidade social e gancho de convite. É o moat de rede.

## Dados que já temos (Fase 0) — não coletar nada novo
- `users/{uid}/library/{type:id}` → `status`, `rating` (0–10), `progress`.
- `picks` (amados do onboarding).
- gêneros via `media_meta.genres`.

## Algoritmo (proposta)
1. **Vetor de gosto** por usuário = pesos por gênero: para cada título com `rating ≥ 7` (ou em `picks`), some os gêneros ponderados pela nota; normalize (L2).
2. **Compatibilidade** = `round(100 * (0.6*cos + 0.4*jaccard))`, onde:
   - `cos` = cosseno entre os vetores de gênero (afinidade ampla),
   - `jaccard` = overlap dos títulos amados (`rating ≥ 8`).
3. **Confiança:** se algum dos dois tem < ~8 títulos avaliados → "ainda calculando" (cold-start), não mostre número fraco.

## Onde mora
- **Grafo de amigos:** `users/{uid}/follows/{otherUid}` (`{ createdAt }`). Decidir: seguir assimétrico (Letterboxd) vs. mútuo.
- **Vetor cacheado e PÚBLICO:** `users/{uid}/public/taste` (vetor de gênero + set de amados) — legível por autenticados, pra **nunca** ler a `library` privada do outro. Recalcular no write-through (estende `useLibrarySync`).
- **Cálculo no cliente:** com o `taste` público dos dois, é barato → `app/src/lib/compat.ts` (função pura, testável) + hook `useCompatibility(otherUid)`. Só vire Cloud Function se for ranquear muita gente de uma vez.

## Regras (Firestore)
```
match /users/{uid}/public/{doc} { allow read: if request.auth != null; allow write: if request.auth.uid == uid; }
match /users/{uid}/follows/{id}  { allow read, write: if request.auth.uid == uid; }
```

## UI
- No perfil do outro: badge de compat + "X em comum" + "ele ama, você não viu" (gancho de descoberta). Reuse `.stat`/`.chip`/`.poster-grid` (ver `docs/DESIGN-SYSTEM.md`).

## Gotchas
- **Privacidade:** calcule só com o `taste` público derivado, nunca com a biblioteca privada.
- **Cold-start:** esconda o número com poucos dados.
- **Custo:** cliente + `taste` público = ~1 leitura por usuário; sem Functions.

## Próxima
Fase 2 (`mechanic-spoiler-safe`) reusa o grafo de amigos + o `progress` por episódio.
