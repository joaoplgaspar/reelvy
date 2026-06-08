# We Watch — Espec de Telas da Fase 0 (CRO + UX/UI)

> Fluxo, telas e racional de conversão do tracker solo + card viral.
> Mobile-first. Cada decisão é justificada por CRO e por uma referência de sucesso.

---

## 0. A tese de CRO em uma frase

> **O usuário precisa sentir valor (receber um card de identidade de gosto) ANTES de criar conta. A conta é o segundo passo, não o primeiro.**

Trackers morrem na **biblioteca vazia**. Resolvemos isso transformando o onboarding em **captura rápida de gosto**: em ~90 segundos o usuário "tapa" 15–30 títulos que ama, e recebe de volta um perfil de gosto + um card compartilhável. Isso resolve 4 coisas de uma vez:
1. Ativação (o "aha" imediato)
2. Cold-start do usuário (biblioteca já nasce cheia)
3. Coleta do dado de gosto (alimenta recomendação e a Fase 1 de compatibilidade)
4. O primeiro artefato viral (o card de identidade)

---

## 1. Princípios de CRO que guiam todas as telas

| Princípio | Aplicação aqui | De quem roubamos |
|---|---|---|
| **Registro adiado** (value-first) | Onboarding inteiro antes de pedir conta | Duolingo (faz a 1ª lição antes do signup) |
| **Endowed progress** | Medidor de gosto já começa parcialmente cheio | — |
| **Peak-end rule** | O "reveal" do card é o pico emocional da 1ª sessão | Spotify Wrapped |
| **Zeigarnik** (tarefa aberta) | "Up Next" / "você está 3 eps atrás" puxa retorno | TV Time |
| **Captura no pico** | Pedir a nota logo após marcar "Visto" | Letterboxd |
| **1 ação primária por tela** | Hierarquia visual brutal; 1 CTA dominante | — |
| **Atrito mínimo no ritual** | Log em <5s; auth social em 1 toque | Untappd, TV Time |
| **Loop viral instrumentado** | Todo card sai com @handle + link de volta | Spotify Wrapped, Letterboxd |

---

## 2. Referências — o que roubar de cada uma

| App | O que fizeram bem | O que levamos |
|---|---|---|
| **Letterboxd** | Estética poster-forward, identidade, "4 favoritos", listas compartilháveis | Visual; perfil como identidade; card |
| **TV Time** | Check de episódio (dopamina), "Up Next", nudges de "X atrás" | Home acionável; tracking de progresso |
| **AniList** | Charts de temporada (ritual), UI moderna de anime | Prateleira sazonal; anime de primeira classe |
| **MyAnimeList** | Cobertura/dados de anime — mas UI de 2008 | A lacuna que exploramos (ser o bonito) |
| **JustWatch** | "Onde assistir" com ícones de provedor | Chips de provedor no detalhe |
| **Spotify Wrapped** | O artefato anual compartilhável = maior evento de aquisição | O card é o motor de crescimento |
| **Co-Star** | Identidade ("você é X") como conteúdo viral | Arquétipo de gosto |
| **Duolingo** | Onboarding sem muro; gamificação do ritual | Registro adiado; streaks (depois) |
| **Tinder** | Card stack, momento "Match" (dopamina) | Estética do card; mecânica (Fase 3) |

---

## 3. O funil de conversão (e a métrica-norte)

```
   card de um amigo (canal viral)
            ▼
 [Landing] ── converte clicker curioso
            ▼
 [Onboarding: mundos → tap-grid → reveal]  ◄── ATIVAÇÃO (aha em <90s)
            ▼
 [Signup]  ── value-first, 1 toque
            ▼
 [App: Home · Detalhe · Log · Biblioteca · Perfil]  ◄── RETENÇÃO (ritual)
            ▼
 [Gerar Card → Share]  ◄── LOOP VIRAL (K-factor)
            ▲────────────────── traz o próximo usuário
```

**Métrica-norte da Fase 0:** **cards compartilhados/semana que trazem novos usuários** (o K-factor). Se o card não gera compartilhamento orgânico, a tese inteira falha — e você descobre barato.

---

## 4. Mapa de navegação

```
[Landing] → [Onboarding] → [Signup] → APP
                                        │
   Bottom tabs:  🏠 Home  ·  🔍 Buscar  ·  ➕ Log  ·  🗂 Biblioteca  ·  👤 Perfil
                                                                          └→ Gerar Card → Share
```

Nav inferior fixa (thumb-zone). O **➕ Log central** é a ação mais proeminente do app — logar é o ritual.

---

## 5. Tela a tela

### 🅰 Landing (primeiro toque — web)
- 🎯 **Funil:** converter quem clicou no card de um amigo.
- 🧱 **Layout:** acima da dobra — proposta de valor (1 linha), o card do referenciador como prova viva, 1 CTA. Espelha o contexto: *"João é um Melancólico de Slow-Burn. E você?"*
- ⭐ **Ação primária:** `Descobrir meu perfil` → onboarding. **Sem muro de signup.**
- 📈 **CRO:** mirror-the-referrer (relevância), 1 CTA, zero distração, prova social (o card).

---

### 🅱 Onboarding — captura de gosto (a tela mais importante do produto)

**B1 — Escolha seus mundos**
- 🧱 3 cards grandes: `Filmes` · `Séries` · `Animes` (multi-seleção, todos pré-selecionados — *endowed progress*).
- 📈 **CRO:** personaliza o deck → menos irrelevância → mais toques.

**B2 — O tap-grid (o coração)**
```
┌──────────────────────────────┐
│  Toque em tudo que você amou  │
│  ▓▓▓▓▓▓░░░░  12 selecionados  │ ← medidor de gosto (já começa em ~20%)
├──────────────────────────────┤
│  [poster][poster][poster]     │
│  [poster][poster][poster]     │ ← grade rolável de populares
│  [poster][poster][poster]     │   (mix dos mundos escolhidos)
└──────────────────────────────┘
        [ Continuar (12) ]
```
- ⭐ **Ação primária:** tocar pôsteres (toque = coração preenche, micro-animação). 2–3 rodadas: populares → aprofunda por gênero conforme os toques.
- 🎯 **Meta:** 15–30 toques em <90s. **Nunca um beco sem saída** — sempre há "mais".
- 📈 **CRO:** custo por item mínimo (1 toque), momentum visível (medidor), feedback instantâneo. Aqui mora a ativação.
- 📚 **Ref:** apps de música ("escolha 3+ artistas"); Letterboxd não tem isso — é a fraqueza que exploramos.

**B3 — O reveal (o pico)**
```
┌──────────────────────────────┐
│   SEU PERFIL DE GOSTO         │
│   "Otaku Nostálgico de        │
│    Shounen + Sci-fi Cerebral" │
│   [poster][poster][poster]    │ ← seus heróis
│   Top gêneros: Ação, Sci-fi…  │
└──────────────────────────────┘
   [ Salvar meu perfil ]  ← primária (→ signup)
   [ Compartilhar ]       ← secundária (viral mesmo pré-conta)
```
- 🎯 O "aha" + 1º artefato compartilhável (o card de identidade).
- 📈 **CRO:** *peak-end* — esse é o pico; o valor é sentido ANTES do pedido de conta. O share secundário já viraliza antes do signup.
- 📚 **Ref:** Spotify Wrapped + Co-Star (identidade como conteúdo).

---

### 🅲 Signup (adiado, baixo atrito)
- 🧱 `Continuar com Google` (1 toque) · `Apple` · email como fallback. Username auto-sugerido (sem ginástica).
- ⭐ **Ação primária:** Google one-tap.
- 📈 **CRO:** social-first reduz atrito ~10x; copy de benefício: *"salve sua biblioteca, acompanhe episódios e refaça seu card quando quiser."* Não peça nada que não usa agora.

---

### 🅳 Home / Descoberta
```
┌──────────────────────────────┐
│  Continuar assistindo  →      │ ← Up Next (só se houver) — acionável
│  [ep 4/12][ep 7/24]           │
│  Temporada de Anime  →        │ ← ritual sazonal (AniList)
│  [poster][poster][poster]     │
│  Em alta  →                   │
│  Pra seu gosto  →             │ ← recomendação (do dado do onboarding)
└──────────────────────────────┘
🏠   🔍   ➕   🗂   👤
```
- 🎯 Dar motivo de retorno + caminho pro próximo log.
- ⭐ **Ação primária:** "Continuar assistindo" (Zeigarnik) no topo quando existir.
- 📈 **CRO:** home acionável (TV Time), não um catálogo frio. Toda capa leva ao detalhe.

---

### 🅴 Detalhe da mídia
```
┌──────────────────────────────┐
│  [ backdrop ]                 │
│  Título (Ano)                 │
│  ┌────────────────────────┐   │
│  │ Quero ver │Assistindo│✓ │  │ ← AÇÃO PRIMÁRIA (thumb-zone)
│  └────────────────────────┘   │
│  Progresso: ▓▓▓░░ ep 7/24 +1  │ ← séries/anime
│  ★ Avalie                     │
│  Onde assistir: [N][P][D]     │ ← chips JustWatch-style
│  Sinopse · Elenco · Similares │
└──────────────────────────────┘
```
- ⭐ **Ação primária:** o controle de status, acima da dobra, grande. Para séries/anime: `+1 ep` satisfatório.
- 📈 **CRO:** pedir a **nota logo após marcar "Visto"** (captura no pico emocional). "Onde assistir" já entra na Fase 0 (só exibe, sem afiliado ainda).
- 📚 **Ref:** o "check" grande do TV Time; provedores do JustWatch.

---

### 🅵 Quick-log (o botão ➕)
- 🧱 Busca-enquanto-digita → toca resultado → chips de status → pronto.
- 🎯 O ritual central precisa ser **<5 segundos**.
- 📈 **CRO:** atrito zero = frequência de log = retenção. (Untappd/TV Time.)

---

### 🅶 Biblioteca
- 🧱 Filtros por status (Assistindo/Quero ver/Visto/Dropei) e tipo (Filme/Série/Anime). Grade de pôsteres = parede de identidade.
- ⭐ A aba "Assistindo" funciona como fila acionável.
- 📈 **CRO/retenção:** *empty states* que guiam (nunca uma tela em branco). A grade é o que a pessoa printa.

---

### 🅷 Perfil (a base de lançamento do share)
- 🧱 Avatar, arquétipo de gosto, stats (contagens, top gêneros, horas), **grade de favoritos** (4 favoritos do Letterboxd) e CTA proeminente **`Gerar card`**.
- 📈 **CRO:** o perfil é a vitrine; o `Gerar card` é o gatilho do loop viral.

---

## 6. 🔁 O gerador de card (o motor viral — detalhe)

- **Templates:** Identidade de Gosto · Top 10 do ano · **Tier list** (builder S/A/B/C/D) · Assistindo agora · Wrapped (sazonal/anual).
- **Customização ("a pessoa no comando"):** tema/cor, título, capa. *Mas sempre com a cara do We Watch* — consistência de marca = todo card compartilhado vira anúncio reconhecível.
- **Saída:** PNG em alta + **URL com deep-link e OG preview** (o share mostra a imagem E linka de volta).
- **Atribuição obrigatória:** `@handle` + logo + link no card. **Sem isso, a tese viral inteira falha** — o card é a propaganda.
- **Enquadramento de desafio:** *"Monte seu top — desafie seus amigos"* (gatilho social).
- 📚 **Ref:** Wrapped (a estética do compartilhável) + TierMaker (cultura de tier list no TikTok).

---

## 7. Métricas pra instrumentar (CRO precisa de medição)

| Etapa | Métrica |
|---|---|
| Ativação | % que completa onboarding (≥ N toques) · tempo até o 1º card |
| Conversão | signup pós-reveal (%) |
| Retenção | D1 / D7 / D30 · logs por usuário/semana |
| Viral | cards gerados · cards compartilhados · **K-factor** (novos usuários por share) |

---

## 8. Direção visual

- **Dark, poster-forward** (Letterboxd/AniList) — as capas carregam a cor.
- **Expressivo, não corporativo** — cor de acento própria (NÃO clonar vermelho-Netflix); gradientes; tipografia com personalidade. Estética anime-first = vibrante e moderna.
- **Mobile-first, thumb-zone** — nav inferior, ações primárias ao alcance do polegar.
- **Micro-interações** — coração que preenche, `+1 ep` satisfatório, animação de reveal do card. O detalhe é o que faz parecer premium.

---

## 9. Anti-padrões (o que mata trackers — não faça)

1. ❌ Muro de signup antes do valor → ✅ value-first.
2. ❌ Biblioteca vazia no primeiro uso → ✅ onboarding que enche em 90s.
3. ❌ Home como catálogo frio → ✅ home acionável (Up Next).
4. ❌ Card sem atribuição/link → ✅ todo card é propaganda rastreável.
5. ❌ Logar em muitos passos → ✅ ritual em <5s.
6. ❌ Tela em branco em qualquer estado → ✅ empty states que guiam.

Ver também [ARQUITETURA-FASE-0.md](ARQUITETURA-FASE-0.md) e [CUSTOS-FASE-0.md](CUSTOS-FASE-0.md).
