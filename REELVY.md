# Reelvy — Documentação do Projeto (Decisões & Roadmap)

> **Documento-mestre de handoff.** Reúne todas as decisões tomadas e como prosseguir.
> Criado para migração de máquina — a memória do assistente **não** viaja com o repositório, então **esta é a fonte da verdade portátil**. Mantenha atualizado.
> Última atualização: junho/2026.

---

## TL;DR (o essencial)

- **O que é:** Reelvy — app social de quem assiste de **tudo** (anime + série + filme), anime-first. Não é "mais um Letterboxd": o diferencial é o **"junto"** (compatibilidade de gosto, social à prova de spoiler, decisão em grupo).
- **Nome:** **Reelvy** · domínio alvo `reelvy.tv` (livre) · tagline **"watch together"**. (Antes era "We Watch" — descartado por colisão.)
- **Carro-chefe:** o **card compartilhável** (motor de aquisição viral). Já construído (Identidade + Top N).
- **Onde está o código real:** pasta **`app/`**. É um app React + Vite navegável, com onboarding, home, busca, detalhe, biblioteca, perfil.
- **Como rodar:** `cd app && npm install && npm run dev` (Node 22).
- **Estado:** front funcional com **estado local** (sem backend ainda). Próximo grande passo: **Firebase** (contas + dados reais).
- **Legado removido:** o Create React App antigo (`src/`, `public/`, etc. na raiz) foi descartado na reestruturação de jun/2026 — o app agora vive em `app/`.

---

## 1. O produto (visão)

### A virada
A ideia original ("plataforma de rank de filmes/séries + afiliado") foi avaliada como **inviável de frente**: é oceano vermelho com incumbentes fortes — **Letterboxd** (filmes), **TV Time** (séries), **JustWatch** (onde assistir/afiliado), **MyAnimeList/AniList** (anime) e **Matinee** (concorrente direto recém-surgido, pitch quase idêntica). Clone melhorzinho morre.

### A tese nova
**"O app de quem assiste de tudo — anime, série e filme num lar só."** Anime é a cunha: público hiperengajado, jovem, viraliza, e mal servido por ferramentas de 2008 (MAL). Ninguém é dono da **união** anime+ocidental.

### Os 4 diferenciais (construídos em fases)
1. **Anime + tudo num lar só** — a cunha de entrada (audiência/cultura).
2. **Grafo de gosto / % de compatibilidade** — o moat de rede ("vocês são 87% compatíveis").
3. **Social à prova de spoiler** (por episódio) — a feature-assinatura, dor nº1 não resolvida.
4. **Decisão em grupo "o que vemos hoje"** (estilo match/Tinder) — o killer app.

> Frase-norte: *"O lar de quem assiste de tudo. Você descobre quem combina com seu gosto, acompanha tudo sem tomar spoiler, e decide com quem você ama o que ver hoje."* Nenhum concorrente consegue dizer a frase inteira.

### Sequência (NÃO construir tudo junto)
- **Fase 0** (atual): tracker solo bonito + **card viral**.
- **Fase 1:** grafo de compatibilidade.
- **Fase 2:** social à prova de spoiler.
- **Fase 3:** sessão de decisão em grupo.

O **risco real é distribuição** (o card viraliza?), não infraestrutura nem código.

---

## 2. O nome — Reelvy

- **Decisão final: Reelvy.** Domínios livres: `reelvy.tv`, `reelvy.app`, `reelvy.co` (`.com` ocupado, como quase tudo). Tagline: **"watch together"**.
- **Por que "We Watch" caiu:** já existe **WeWatch** (vários apps, incluindo um concorrente direto de decisão-em-grupo + um streaming HD). Colisão de App Store, SEO morto, risco de marca.
- **Aprendizado da sessão de nomes:** no espaço de tracking, quase todo nome *evocativo* já tem dono (Scenit, Scenly, Viewly, Watcht, Matinee, Crewd…). O que sobra é **inventado/sonoro** (estilo Spotify/Mubi/Hulu) — "abstrato" não é defeito, é o padrão de marca global; o significado vem do produto + tagline.
- **Pendências (são suas, fora do código):** registro de **marca** (INPI no Brasil / USPTO) e **handles** (@reelvy no Instagram/TikTok/X). Travar antes de divulgar.

---

## 3. O carro-chefe: o card viral

**Função:** motor de aquisição. Cada card compartilhado = anúncio com call-back (`reelvy.tv`). Sem viralização do card, não há negócio — por isso ele é prioridade de validação.

**Formatos:**
- ✅ **Identidade** — arquétipo de gosto derivado dos títulos escolhidos.
- ✅ **Top N** — ranking numerado das suas escolhas.
- ✅ **Tier List (S/A/B/C/D)** — builder no próprio card (toca no pôster → muda de tier); o formato que mais bomba no TikTok.

**Regras de copy dos arquétipos (IMPORTANTE):**
- Rótulos **curtos e aspiracionais**, que a pessoa QUER reivindicar (ex: *"Alma Sensível"*, *"O Sonhador"*, *"Mente Inquieta"*).
- **SEM emoji na frente. SEM jargão de nicho** (nunca "otaku", "shounen", "slow-burn"). Termo cringe mata o compartilhamento.
- Frase de impacto **enxuta** (5–7 palavras), soando como elogio.
- O lado anime aparece pelos **pôsteres e gêneros**, não no rótulo.

**Detalhe técnico crítico (não quebrar):** os pôsteres do card são **data URLs base64** embutidos no catálogo. Motivo: o CDN do TMDB **não envia header CORS** → imagem remota no `<canvas>` "tainta" e a exportação PNG (`html-to-image`) quebra. A grade de navegação usa a URL remota (crespa); só o **card** usa base64.

---

## 4. CRO / UX (princípios que guiam o design)

- **Value-first / signup adiado:** o usuário recebe valor (o card) **antes** de criar conta (estilo Duolingo).
- **Onboarding = ativação:** em ~90s a pessoa "tapa" 15–30 títulos que ama → recebe perfil + card. Resolve de uma vez: aha imediato, biblioteca-vazia (cold-start), coleta do dado de gosto e o 1º artefato viral.
- **Peak-end:** o "reveal" do card é o pico da 1ª sessão.
- **Mobile-first, thumb-zone**, 1 ação primária por tela, ritual de log em <5s.
- **Métrica-norte da Fase 0:** **K-factor** (novos usuários por card compartilhado).

**Referências (o que roubamos):** Letterboxd (estética poster-forward, identidade), TV Time (home acionável, check de episódio), AniList (prateleira de temporada), JustWatch (onde assistir), Spotify Wrapped + Co-Star (card de identidade como crescimento), Duolingo (registro adiado).

Detalhe completo em [`docs/TELAS-FASE-0.md`](docs/TELAS-FASE-0.md).

---

## 5. Estado atual do código

### Layout do repositório
```
reelvy/  (repo: github.com/joaoplgaspar/reelvy)
├── REELVY.md            ← este documento (decisões & roadmap)
├── README.md            ← visão geral + como rodar
├── docs/                ← planejamento (arquitetura, custos, telas)
└── app/                 ← O APP Reelvy (React+Vite+TS)   ⭐
```
> O legado (Create React App antigo na raiz: `src/`, `public/`, `package.json`…) foi **removido** na reestruturação de jun/2026. Quando o backend entrar, `functions/` + `firebase.json` + `firestore.rules` entram como irmãos de `app/`.

### Stack (do app em `app/`)
- **React 18 + Vite + TypeScript**, mobile-first (PWA depois)
- **react-router-dom** (rotas) · **zustand** (estado + persistência em localStorage)
- **html-to-image** (exportar card como PNG)
- **Catálogo:** 42 títulos reais (TMDB + AniList) **embutidos** em `app/src/data/catalog.ts` (com pôster base64 pro card). Placeholder até o backend.
- **Backend:** ainda **não** existe. Planejado: **Firebase** (Auth + Firestore + Functions). Hosting: Vercel/Cloudflare.

### O que está construído e funcionando (verificado)
| Rota | Página |
|---|---|
| `/onboarding` | mundos → tap-grid → card → "Entrar no Reelvy" (semeia a biblioteca) |
| `/` | Home — prateleiras de descoberta + "Continuar assistindo" (reativo) |
| `/buscar` | Busca no catálogo |
| `/titulo/:type/:id` | Detalhe — status (Quero ver/Assistindo/Visto/Dropei) + nota + onde assistir |
| `/biblioteca` | Biblioteca — abas por status |
| `/perfil` | Perfil — arquétipo + stats + **Gerar card** |

Nav inferior: **Home · Buscar · ＋ · Biblioteca · Perfil**. `AppShell` redireciona pra `/onboarding` na 1ª vez. Estado persiste por máquina (localStorage).

### O que é mock/local (a trocar pelo backend)
- Estado do usuário (biblioteca, gosto) → hoje `zustand`+localStorage; vira **Firestore**.
- Catálogo → hoje 42 títulos embutidos; vira **TMDB/AniList via cache `media_meta`**.
- Sem login real, sem sincronização entre dispositivos, sem metadados ricos no Detalhe (sinopse/episódios/elenco).
- Costura limpa pra trocar: `app/src/data/queries.ts` (mesmas assinaturas `shelves/byId/search`).

---

## 6. Arquitetura (resumo + ponteiros)

- **Modelo de dados (Firestore):** coleção única `media_meta/{type:id}` (cache de catálogo), `discovery_lists/{key}` (prateleiras), `users/{uid}` + **subcoleção** `users/{uid}/library/{type:id}` (⚠️ NUNCA array no doc do user — estoura 1MB).
- **Cache:** read-through (`resolveMedia` em cache-miss) + cron de pré-aquecimento (`prewarmDiscovery`) + cache no cliente (TanStack Query). TTL: 90 dias finalizado, 2 dias no ar.
- **Progresso por episódio** entra desde a Fase 0 (habilita o spoiler-safe da Fase 2).
- **Custos:** ~grátis até 10k usuários; a única pegadinha é o **Firebase Auth/Identity Platform** acima de 50k MAU. Tabela completa em [`docs/CUSTOS-FASE-0.md`](docs/CUSTOS-FASE-0.md).

Detalhe completo (schema, functions, regras de segurança) em [`docs/ARQUITETURA-FASE-0.md`](docs/ARQUITETURA-FASE-0.md).

---

## 7. Como rodar e migrar pra outro PC

### Pré-requisitos
- **Node 22** (testado em v22.22.3) + npm.
- Git.

### Migração via Git (recomendado)
Tudo já está versionado (app, docs, handoff). Para rodar em outra máquina:

```bash
git clone https://github.com/joaoplgaspar/reelvy.git
cd reelvy/app
npm install
npm run dev               # abre em http://localhost:5173
```

### Notas de migração
- **`node_modules` não vai pelo git** (tem `.gitignore`) — rode `npm install` na máquina nova.
- **localStorage não migra** — o app vai começar do onboarding na máquina nova (esperado; é estado local).
- **A memória do assistente (Claude) não migra.** Este `REELVY.md` é o substituto portátil — por isso ele existe.
- Para regenerar/expandir o catálogo embutido: era um script que busca TMDB (token) + AniList; foi removido após gerar `catalog.ts`. O catálogo atual já está commitado e funciona sem token.

---

## 8. Armadilhas / o que NÃO fazer (lições)

1. ❌ Guardar a biblioteca como **array no doc do usuário** → ✅ subcoleção `library`.
2. ❌ **Token de API no front** (o CRA legado tem o token TMDB exposto em `src/services/getApi.ts` — não reutilizar) → ✅ Secret Manager nas Functions.
3. ❌ Pôster remoto no card (CORS taint) → ✅ base64 no card.
4. ❌ Proxiar/armazenar imagens → ✅ servir do CDN do TMDB/AniList.
5. ❌ Rótulo de arquétipo com emoji/jargão ("otaku") → ✅ curto e aspiracional.
6. ❌ Construir os 4 diferenciais juntos → ✅ uma fase por vez.
7. ❌ Divulgar antes de travar marca/handles do nome.

---

## 9. Roadmap (próximos passos, em ordem)

1. **Backend real** — 🟢 *plugado no código*: Auth (signup adiado + gate), catálogo (Home/Busca/Detalhe via `useCatalog.ts`, com fallback local) e biblioteca (`useLibrarySync`, sync local ↔ Firestore). Falta só o **deploy/seed** (seu): criar o projeto Firebase, preencher `app/.env`, setar o secret `TMDB_TOKEN`, `firebase deploy` e rodar `prewarmDiscovery`. Passo a passo em [`docs/BACKEND-SKELETON.md`](docs/BACKEND-SKELETON.md).
2. **Catálogo real** (TMDB + AniList) via o cache `media_meta`.
3. **Detalhe com metadados ricos** — 🟢 sinopse + progresso por episódio + provedores reais (TMDB watch/providers); falta elenco/similares.
4. ~~**Card Tier List** (S/A/B/C/D)~~ ✅ **feito** — trio de formatos virais completo (Identidade · Top N · Tier).
5. ~~Renomear a pasta `prototype/` → `app/`~~ ✅ **feito** (reestruturação jun/2026; legado CRA removido).
6. **Deploy** (Vercel/Cloudflare) + travar **marca/handles** do nome.
7. **Validar viralização** do card (a métrica-norte) — postar nos nichos de anime/cinema.
8. **Fase 1+** (compatibilidade → spoiler-safe → decisão em grupo tipo Tinder) — speccado em [`docs/MECANICAS-FASES.md`](docs/MECANICAS-FASES.md).

### 9.1 Backlog de UX / produto (levantado jun/2026)

A maioria já tem spec em `docs/TELAS-FASE-0.md` — falta **construir**:

- **Landing** (`TELAS §5🅰`) — porta de entrada antes do onboarding (hoje o app pula direto pro `/onboarding`).
- **Entry de usuário recorrente** — logar direto pra quem já tem conta (além do signup adiado).
- **Catálogo/busca reais** — busca e Home hoje usam os 42 títulos embutidos; ligar via `resolveMedia`/`prewarmDiscovery` (= itens #1–2 acima).
- **Pass de polish visual** contra a direção visual (`TELAS §8`): Home (Up Next com progresso, "pra seu gosto"), telas em geral, e **trocar os ícones emoji da nav por um set real**.
- **＋ Quick-log de verdade** (`TELAS §5🅵`, log <5s) — hoje o ＋ só navega pra busca.
- 🆕 **Desktop / responsivo (escopo NOVO)** — os docs eram mobile-only. Manter **mobile-first** (thumb-zone; o card é compartilhado pra celular), mas adicionar layout adaptativo pra desktop (hoje o app é uma coluna travada em `460px`). **Única observação que não estava no plano.**

---

## 10. Decisões registradas (resumo cronológico)

1. Original (rank + afiliado) **inviável de frente** → pivô.
2. Tese: app social anime-first de "tudo que você assiste", 4 diferenciais em fases.
3. Fase 0 = tracker solo + card viral.
4. Stack: React+Vite+TS+PWA, TanStack Query, Firebase, TMDB+AniList.
5. Arquitetura: `media_meta` cache, `library` subcoleção, cron de pré-aquecimento, custos mapeados.
6. CRO: value-first, onboarding = ativação, card = motor de crescimento.
7. Card redesenhado **pegada Letterboxd** (pôster-forward); arquétipos **sem emoji/jargão**; base64 pro CORS; formato **Top N** adicionado.
8. Nome **"We Watch" → Reelvy** (colisão + sessão de nomes com checagem de domínio).
9. **Estrutura do app construída** (router + zustand + páginas + nav) — o produto não é só o card.
10. Backend ainda pendente (próximo grande passo).

---

## Ponteiros (outros documentos)

- [`docs/ARQUITETURA-FASE-0.md`](docs/ARQUITETURA-FASE-0.md) — schema Firestore, cache, Cloud Functions, regras de segurança.
- [`docs/BACKEND-SKELETON.md`](docs/BACKEND-SKELETON.md) — o que já está scaffoldado e como ligar o backend (swap local → remoto).
- [`functions/README.md`](functions/README.md) — como configurar secret, emular e deployar as Functions.
- [`docs/CUSTOS-FASE-0.md`](docs/CUSTOS-FASE-0.md) — custos de infra por faixa de usuários.
- [`docs/TELAS-FASE-0.md`](docs/TELAS-FASE-0.md) — espec de telas com CRO/UX e referências.
- [`docs/MECANICAS-FASES.md`](docs/MECANICAS-FASES.md) — as mecânicas que diferenciam (Fases 1-3: compatibilidade, spoiler-safe, decisão em grupo tipo Tinder).
- [`app/README.md`](app/README.md) — como rodar o app.
