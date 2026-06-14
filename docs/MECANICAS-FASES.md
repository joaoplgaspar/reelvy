# Reelvy — Mecânicas & Fases (o "junto")

> As mecânicas que diferenciam o Reelvy no mercado, em fases. O carro-chefe da Fase 0
> (tracker + card viral) existe pra **ganhar audiência**; estas fases são o **moat**.
> Regra de ouro (não reabrir): **uma fase por vez**, e só depois de a Fase 0 validar o
> card (K-factor). Construir tudo junto mata o foco — ver `REELVY.md` §1.

---

## Visão: a frase que ninguém mais consegue dizer inteira

> *"O lar de quem assiste de tudo. Você descobre **quem combina com seu gosto**, acompanha tudo **sem tomar spoiler**, e **decide com quem você ama o que ver hoje**."*

Cada oração é uma fase. Cada incumbente cobre no máximo uma; ninguém cobre a união.

---

## Fundação já pronta na Fase 0 (o que habilita o resto)

| Dado coletado agora | Habilita |
|---|---|
| `picks` + `library` + `rating` (onboarding + tracking) | **Fase 1** (grafo de gosto / compatibilidade) |
| `progress` por episódio (`library.progress`) | **Fase 2** (social à prova de spoiler por episódio) |
| `media_meta.ids` (tmdb/anilist/mal) + provedores | **Fase 3** (disponibilidade "tá na Netflix?") |

> Por isso o progresso por episódio entra **já** na Fase 0, mesmo sem uso social: não modelar agora = retrabalho.

---

## Fase 1 — Grafo de gosto / % de compatibilidade

**Mecânica:** *"Vocês são 87% compatíveis."* O número vira identidade social e gancho de convite.

- **Como calcula:** similaridade sobre os dados que já temos — sobreposição de títulos amados/bem-avaliados + vetor de gêneros (cosseno). Roda no cliente (barato) ou numa Function `computeCompat(uidA, uidB)`.
- **Precisa de:** sistema de **amigos/seguir** (grafo `users/{uid}/follows`), e o número exposto no perfil do outro.
- **UX:** ao abrir o perfil de alguém → badge de compatibilidade + "títulos em comum" + "ele ama, você não viu".
- **Moat:** efeito de rede — cada novo usuário aumenta o valor pra todos. É o que clones não copiam.
- **Métrica:** convites enviados/aceitos; % de perfis com ≥1 conexão.

## Fase 2 — Social à prova de spoiler (por episódio)

**Mecânica:** ver a reação/atividade dos amigos **travada pelo SEU progresso** — nunca aparece nada além do episódio onde você está. A dor nº1 não resolvida do nicho.

- **Como funciona:** cada evento social (reação, comentário, nota) é carimbado com o episódio. A visibilidade filtra por `min(progressoDoLeitor)`.
- **Precisa de:** coleção de **eventos por episódio** (`media/{id}/activity` com `episode`), e um filtro de visibilidade no cliente/Function.
- **UX:** feed de atividade dos amigos que só revela o que é seguro; "reações" que destravam conforme você avança; aviso "3 amigos já passaram desse ep".
- **Assinatura:** é a feature que define o produto — nenhum tracker resolve isso.
- **Métrica:** retenção D7/D30; reações por usuário; "voltar pra não tomar spoiler".

## Fase 3 — Decisão em grupo "o que vemos hoje" (estilo Tinder) — o **"We Watch"**

**Mecânica (o killer app):** uma **sessão em grupo** onde cada um **desliza (swipe) estilo Tinder** num deck de títulos candidatos; quando o grupo dá **"Match"** num título, é esse que vocês veem hoje. Resolve a briga do controle remoto.

- **Como funciona:**
  1. Alguém cria uma **sessão** e convida amigos.
  2. O **deck é gerado** pela interseção dos gostos (Fase 1) **filtrada por onde cada um pode assistir** (provedores via `media_meta` — Fase 0 já guarda os cross-ids).
  3. Todos **swipam** em tempo real (👍/👎).
  4. **Match** quando o quórum curte o mesmo título → **reveal** (dopamina, estilo Tinder) → abre direto "onde assistir".
- **Precisa de:** modelo de **sessão** (`sessions/{id}` com membros, deck, votos), **realtime** (listeners do Firestore), geração de deck (gosto ∩ disponibilidade), detecção de match.
- **Por que ganha:** Matinee/WeWatch tentam decidir-em-grupo, mas **sem o grafo de gosto nem o anime-first por trás**. O nosso deck é *personalizado pela compatibilidade real* — não é uma lista genérica.
- **Métrica:** sessões/semana; match-rate; "vimos o que deu match?".

---

## Sequência de construção (não pular)

```
Fase 0  tracker solo + CARD VIRAL  ← valida distribuição (K-factor). estamos aqui.
   │    (se o card não viraliza, a tese falha — descobre barato)
   ▼
Fase 1  amigos + % de compatibilidade            (o moat de rede)
   ▼
Fase 2  social à prova de spoiler (por episódio) (a feature-assinatura)
   ▼
Fase 3  "We Watch" — decisão em grupo tipo Tinder (o killer app)
```

> **Gatilho pra começar a Fase 1:** o card estar gerando aquisição orgânica (K-factor > 0 sustentado).
> Antes disso, todo esforço vai pra polir o card + onboarding. Disciplina de foco é o ativo aqui.

Referências de mecânica em [`TELAS-FASE-0.md`](TELAS-FASE-0.md) (§2 Tinder, §6 card) e visão em [`../REELVY.md`](../REELVY.md) §1.
