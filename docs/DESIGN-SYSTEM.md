# Reelvy — Design System & Componentes

> Catálogo do que é **reutilizável** (tokens, componentes, classes, padrões). Consulte/atualize
> antes de criar algo novo — reusar > recriar. Direção visual em [`TELAS-FASE-0.md`](TELAS-FASE-0.md) §8.
> O CSS vive todo em `app/src/styles.css` (um arquivo, sem framework). Mobile-first.

---

## 1. Tokens (CSS vars em `:root`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0a0f` | fundo base (dark) |
| `--surface` | `#15151d` | cards/inputs/chips |
| `--surface2` | `#20202b` | superfície elevada / disabled |
| `--line` | `#2a2a37` | bordas |
| `--text` | `#f4f4f8` | texto principal |
| `--muted` | `#9696a6` | texto secundário |
| `--accent` | `#7c5cff` | **cor de marca** (roxo — NÃO clonar vermelho-Netflix) |
| `--radius` | `18px` | raio padrão |

> A `--accent` é setada **por card** inline (`style={{ '--accent': archetype.accent }}`) pra variar por arquétipo.

---

## 2. Componentes (React)

### Estruturais (`app/src/app/`)
| Componente | Papel |
|---|---|
| `AppShell` | Layout do app logado: gate (onboarded/auth), monta `useLibrarySync`, renderiza `<Outlet/>` + `BottomNav`. |
| `AuthContext` / `useAuth()` | Estado de auth: `{ mode: 'local'|'firebase', user, ready }`. |
| `BottomNav` | Nav inferior (thumb-zone): Home · Buscar · ＋(quick-log) · Biblioteca · Perfil. |

### Reutilizáveis (`app/src/components/`)
| Componente | Props | Notas |
|---|---|---|
| `Icon` | `name`, `size?` | Ícones SVG de traço (`home/search/library/profile/plus`). `stroke=currentColor`. **Use no lugar de emoji.** |
| `Poster` | `item: CatalogItem` | Pôster → link pro Detalhe. Usa `item.poster` (URL remota). |
| `CardStudio` | `picks: CatalogItem[]` | Orquestra os 3 formatos de card + export/share (`html-to-image`). |
| `ShareCard` | `archetype, genres, heroes, count` | Card **Identidade**. `forwardRef`. |
| `TopCard` | `picks, accent` | Card **Top N**. `forwardRef`. |
| `TierCard` | `picks, tiers, accent, onCycle?` | Card **Tier list** S/A/B/C/D. Builder = toca no pôster (`onCycle`). `forwardRef`. |
| `TapGrid` | `worlds, selected, setSelected, onNext, onBack` | Grade de captura de gosto (onboarding). |
| `Worlds` | `worlds, setWorlds, onNext` | Seletor de mundos (filme/série/anime). |

> ⚠️ **Regra dos cards (não quebrar):** os pôsteres dentro de `.card` usam **`item.posterData` (base64)**, nunca `item.poster` (URL remota). O CDN do TMDB não envia CORS → `<img>` remota "tainta" o canvas e o export PNG quebra. Cards exportáveis usam `forwardRef` (o `CardStudio` passa o ref pro `toPng`).

---

## 3. Classes CSS reutilizáveis (padrões)

### Shell / layout
- `.app` — shell mobile (max-width **460px**, centrado, gradiente de accent no topo). *(desktop responsivo = pendente, ver `REELVY.md` §9.1)*
- `.page` / `.page-head` / `.page-title` — páginas internas (com nav).
- `.screen` / `.screen-head` — telas full (onboarding, auth, landing).
- `.splash` — tela de espera (auth resolvendo).

### Ações
- `.btn` (sempre `width:100%`) + `.btn-primary` (accent) / `.btn-ghost` (surface+borda) / `.btn-link` (texto muted).
- `.chip` + `.chip.is-on` — pílulas tocáveis (quick-log). `.status-chip` (detalhe). `.tabs`/`.tab` (filtros).

### Entrada
- `.search-input` — campo de busca. `.auth-input` — campos de login. `.auth-form` (coluna gap).

### Navegação
- `.bottomnav` / `.navtab` (+`.is-on`) / `.navicon` (svg 22px) / `.navtab-plus` (FAB accent central).

### Pôsteres
- `.poster-grid` — grade 3 colunas. `.shelf` / `.shelf-row` (scroll horizontal) / `.shelf-title` — prateleiras da Home.

### Card compartilhável (carro-chefe)
- `.card` — base 326px, aspect 9/16, barra de accent no topo. `.card-head` / `.card-foot` / `.card-brand` / `.card-handle`.
- Identidade: `.card-grid` / `.card-tile` / `.card-id`. Top: `.top-list` / `.top-row` / `.top-rank`. Tier: `.tier-rows` / `.tier-row` / `.tier-label` / `.tier-poster`.
- `.format-switch` (alternador) · `.cardstudio` (wrapper) · `.reveal-actions` (botões).

### Detalhe
- `.detail-hero` / `.detail-body` / `.detail-title` / `.detail-genres` / `.detail-overview`.
- `.status-row` · `.rate-row`/`.stars`/`.star` · `.ep-row`/`.ep-control`/`.ep-btn` (progresso/ep) · `.provider-row`/`.providers`/`.prov-logo`.

### Onboarding
- `.worlds`/`.world` · `.meter`/`.meter-fill` (medidor de gosto) · `.counter` · `.poster-check`.

### Utilitários
- `.hint` (dica centrada) · `.muted-line` (label secundária) · `.empty` (estado vazio — **sempre** guiar, nunca tela em branco) · `.brand` · `.title`.

---

## 4. Padrões & convenções

- **Mobile-first, thumb-zone.** 1 ação primária por tela (`.btn-primary`). Nav inferior fixa.
- **Dark, poster-forward.** As capas carregam a cor; UI é o palco. Acento único (`--accent`).
- **`.is-on`** = modificador de estado ativo/selecionado (convenção em chips/nav/tabs/posters).
- **Ícones = `<Icon>` SVG**, nunca emoji.
- **Empty states** sempre presentes (`.empty`) — anti-padrão nº1 é tela em branco.
- **Card = `forwardRef` + `posterData` base64** (ver regra acima).
- **Micro-interações** (coração que preenche, `+1 ep`, reveal do card) = o que faz parecer premium (pendente refinar no pass de layout).

---

## 5. Onde mexer

| Quero… | Vá em |
|---|---|
| Novo ícone | `components/Icon.tsx` (adicione ao `ICONS`) |
| Novo formato de card | `components/*Card.tsx` + registre no `CardStudio` |
| Estilo novo | `app/src/styles.css` (reuse token/classe antes de criar) |
| Nova tela | `pages/` + rota em `router.tsx` (+ nav se aplicável) |
| Dado (catálogo/biblioteca) | `data/useCatalog.ts` / `data/useLibrarySync.ts` (não chame `remote.ts` direto nas páginas) |

> Pendência de design conhecida (não é dívida escondida): **pass de layout** (visual + desktop responsivo) — `REELVY.md` §9.1.
