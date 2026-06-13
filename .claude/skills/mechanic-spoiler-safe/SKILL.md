---
name: mechanic-spoiler-safe
description: Use ao projetar ou implementar a mecânica social à prova de spoiler do Reelvy (Fase 2) — atividade dos amigos travada pelo SEU progresso de episódio, eventos por episódio e o filtro de visibilidade. Depende da Fase 1 (grafo de amigos). NÃO construir antes de validar o card e a Fase 1.
---

# Mecânica: social à prova de spoiler (Fase 2)

> *Porquê/sequência* em `docs/MECANICAS-FASES.md`. Aqui é o **como construir**.
> ⛔ **Gate:** depois da Fase 1 (precisa do grafo de amigos). Uma fase por vez.

## O que é
Ver reação/atividade dos amigos **travada pelo SEU progresso** — nunca aparece nada além do episódio onde você está. É a dor nº1 não resolvida do nicho → feature-assinatura.

## Dado-chave que já temos (Fase 0)
- `users/{uid}/library/{type:id}.progress` = `{ watched, total }` (por episódio). **É por isso que o progresso entrou já na Fase 0** — sem ele, retrabalho aqui.

## Modelo
- **Evento carimbado por episódio:** `media/{type:id}/activity/{eventId}` = `{ uid, episode, kind: 'reaction'|'comment'|'rating', payload, createdAt }`.
  - Filme = unidade única (`episode: 0`); gate por `status === 'done'`.
- O feed lê eventos dos amigos e **filtra**: mostra `evento` só se `evento.episode <= meuProgresso[mediaId]`.

## Regra de ouro do filtro
- **Conservador por padrão:** na dúvida, esconde. O filtro roda no cliente (você tem o seu progresso) e/ou numa query por `episode`.
- Cuidado com numeração entre temporadas (use índice absoluto de episódio, alinhado ao `total`).

## UX
- Feed de atividade que só revela o seguro; reações que **destravam** conforme você avança; nudge "3 amigos já passaram desse ep" (Zeigarnik, puxa retorno).
- Reuse `.shelf`/`.poster`/`.chip` (ver `docs/DESIGN-SYSTEM.md`).

## Regras (Firestore)
```
match /media/{id}/activity/{eventId} {
  allow read: if request.auth != null;                 // o spoiler-filter é no app, não na regra
  allow create: if request.auth.uid == request.resource.data.uid;
}
```
> A visibilidade fina (por progresso) é do app — a regra só garante autenticação e dono.

## Gotchas
- **Filme/curta sem episódios** → trata como done/not-done.
- **Custo:** o feed lê atividade dos amigos; pagine e cacheie (TanStack Query).
- Não vaze o número/nota média de um ep além do progresso do leitor.

## Próxima
Fase 3 (`mechanic-group-decision`) usa o grafo de amigos + disponibilidade pra montar o deck.
