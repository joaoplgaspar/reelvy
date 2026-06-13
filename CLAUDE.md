# CLAUDE.md — contexto do projeto Reelvy

> Carregado automaticamente. Mantenha curto e atualizado. **Fonte da verdade completa: [`REELVY.md`](REELVY.md)** (decisões, visão, roadmap) — leia antes de mudanças de produto.

## O que é
**Reelvy** — app social anime-first de quem assiste de **tudo** (anime + série + filme). Diferencial = o **"junto"** (compatibilidade de gosto, social à prova de spoiler, decisão em grupo estilo Tinder), construído **em fases**. Fase 0 (atual): tracker solo + **card viral** (motor de aquisição; métrica-norte = K-factor).

## Estrutura
```
reelvy/  (repo: github.com/joaoplgaspar/reelvy)
├── CLAUDE.md / REELVY.md      este índice / o doc-mestre
├── app/                       o app — React 18 + Vite + TS (⭐ código aqui)
├── functions/                 Cloud Functions gen2 (TS) — resolveMedia / prewarmDiscovery / searchMedia
├── firebase.json · firestore.rules · .firebaserc
└── docs/                      planejamento (ver índice abaixo)
```

## Comandos
```bash
cd app && npm install && npm run dev      # app em http://localhost:5173 (Node 22)
cd app && npx tsc --noEmit && npm run build   # checagem antes de commitar
cd functions && npm install && npm run build  # compila as Functions
firebase deploy --only firestore:rules,functions   # deploy (precisa Blaze + secret TMDB_TOKEN)
```

## Arquitetura & convenções (must-know)
- **Modo guardado:** `isFirebaseConfigured` (envs `VITE_FIREBASE_*` em `app/.env`). Sem `.env` → roda **100% local** (zustand + catálogo embutido). Com Firebase → Auth + Firestore + catálogo real.
- **Dados nas páginas:** use os hooks de `app/src/data/useCatalog.ts` (`useShelves`/`useSearch`/`useMedia`) e `useLibrarySync.ts`. Eles tentam o **remoto** e **caem no local** em erro/vazio. **Não** chame `remote.ts` direto das telas.
- **Biblioteca:** zustand (cache otimista) ↔ Firestore via `useLibrarySync` (subcoleção `users/{uid}/library/{type:id}`).
- **Backend:** TMDB (filme/série) + AniList (anime, sem token). Catálogo cacheado em `media_meta/{type:id}`; prateleiras em `discovery_lists/{key}`.
- **Design system:** tokens + componentes + classes catalogados em [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md). Reuse antes de criar. Mobile-first, dark, acento `--accent` roxo.

## Não fazer (armadilhas)
- ❌ Pôster **remoto** dentro do `.card` → ✅ `posterData` (base64). CDN do TMDB não tem CORS → export PNG quebra.
- ❌ Token de API no front → ✅ só nas Functions (Secret Manager). *(o token do legado vazou no histórico do git — deve ser rotacionado.)*
- ❌ Biblioteca como array no doc do user → ✅ subcoleção.
- ❌ Emoji como ícone → ✅ `<Icon name>` (SVG).
- ❌ Construir Fases 1–3 antes de validar o card (K-factor). **Uma fase por vez.**

## Índice de docs
- [`REELVY.md`](REELVY.md) — doc-mestre (decisões, roadmap §9 + backlog UX §9.1).
- [`docs/ARQUITETURA-FASE-0.md`](docs/ARQUITETURA-FASE-0.md) — Firestore, cache, Functions, regras.
- [`docs/BACKEND-SKELETON.md`](docs/BACKEND-SKELETON.md) — o que está plugado + como deployar/semear.
- [`docs/TELAS-FASE-0.md`](docs/TELAS-FASE-0.md) — telas, CRO/UX, referências visuais.
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — tokens, componentes, classes, padrões.
- [`docs/MECANICAS-FASES.md`](docs/MECANICAS-FASES.md) — as mecânicas que diferenciam (Fases 1-3: compatibilidade, spoiler-safe, decisão em grupo tipo Tinder).
- [`docs/CUSTOS-FASE-0.md`](docs/CUSTOS-FASE-0.md) — custos de infra por faixa de usuários.

## Skills (playbooks sob demanda)
A **implementação** de cada mecânica das Fases 1-3 vive como skill em `.claude/skills/` — carrega **sob demanda** (só a `description` fica sempre visível; o corpo entra quando a skill é acionada). O *porquê/sequência* fica em `docs/MECANICAS-FASES.md`; o *como construir* na skill. Hoje: `mechanic-compatibility` (Fase 1).

## Git
Trabalhar em branch própria; nunca commitar `.env`, `node_modules`, `dist`, `functions/lib`. Rodar `tsc --noEmit` + `build` antes de push.
