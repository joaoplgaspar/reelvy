---
name: mechanic-group-decision
description: Use ao projetar ou implementar a mecânica "We Watch" do Reelvy (Fase 3) — a decisão em grupo estilo Tinder (sessão, swipe num deck, match → o que ver hoje). É o killer app. Depende das Fases 1 (gosto/compatibilidade) e idealmente 2. NÃO construir antes de validar o card e as fases anteriores.
---

# Mecânica: decisão em grupo tipo Tinder — o "We Watch" (Fase 3)

> *Porquê/sequência* em `docs/MECANICAS-FASES.md`. Aqui é o **como construir**.
> ⛔ **Gate:** é a culminância — só depois da Fase 1 (gosto/compat) e do card validado.

## O que é (o killer app)
Sessão em grupo onde cada um **desliza (swipe) estilo Tinder** num deck de candidatos; quando o grupo dá **Match**, é esse que vocês veem hoje. Resolve a briga do controle remoto.

## Por que NÓS ganhamos
O deck é **personalizado pela compatibilidade real (Fase 1)** e **filtrado por onde cada um pode assistir** — concorrentes (Matinee/WeWatch) decidem em grupo sem o grafo de gosto nem anime-first por trás.

## Modelo (Firestore)
- `sessions/{sid}` = `{ host, members: uid[], status: 'open'|'matched'|'closed', deck: mediaId[], match?: mediaId, createdAt }`.
- `sessions/{sid}/votes/{uid}` = `{ swipes: Record<mediaId, 'up'|'down'> }` (ou subcoleção 1 doc/swipe pra realtime fino).

## Geração do deck
1. Candidatos = união dos gostos dos membros, **ponderada pela compatibilidade** (reusa `lib/compat.ts` da Fase 1) + "quero ver" de cada um.
2. **Filtra por disponibilidade:** só títulos que **todos** (ou a maioria) conseguem assistir — usa `media_meta` (provedores; cross-ids já guardados na Fase 0).
3. Embaralha, ~20–30 cards. Gera numa Cloud Function `buildSessionDeck(sid)` (ver skill `add-cloud-function`).

## Realtime + match
- `onSnapshot` na sessão + votos. **Match** quando o quórum (definir: todos? maioria?) dá `up` no mesmo `mediaId` → grava `match`, dispara o **reveal** (dopamina estilo Tinder) → abre "onde assistir".

## UX
- Criar sessão → convidar (deep-link) → todos swipam o stack → **reveal do match**. Estética: card stack do Tinder (ver `TELAS-FASE-0.md` §2). Reuse `.card`/`.poster` (`docs/DESIGN-SYSTEM.md`).

## Regras (Firestore)
```
match /sessions/{sid} {
  allow read, update: if request.auth.uid in resource.data.members;
  allow create: if request.auth.uid == request.resource.data.host;
  match /votes/{uid} { allow read, write: if request.auth.uid == uid; }
}
```

## Gotchas
- **Disponibilidade por membro** difere (cada um tem provedores diferentes) — interseção pode esvaziar; tenha fallback (maioria).
- **Custo de realtime:** listeners por membro × swipes; limite o tamanho do deck e feche sessões ociosas.
- **Quórum/empate:** defina a regra de match e o desempate antes de codar.
- **Dedup** do deck; não repetir o que alguém já viu/dropou.
