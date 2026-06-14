# Reelvy — App (Fase 0)

App social de quem assiste de tudo (anime + série + filme). Front em React + Vite + TS.

> 📄 **Leia primeiro** o documento-mestre de decisões e roadmap: [`../REELVY.md`](../REELVY.md).

## Rodar

```bash
npm install
npm run dev          # http://localhost:5173
# no celular (mesma rede):
npm run dev -- --host
```

Node 22+. Na primeira vez o app abre o **onboarding**; ao terminar, entra no app.

## Estrutura

```
src/
├── app/            AppShell (layout + nav inferior) + BottomNav
├── pages/          Onboarding, Home, Search, Detail, Library, Profile
├── components/     Worlds, TapGrid (onboarding) · ShareCard, TopCard, CardStudio (card) · Poster
├── store/          useStore.ts (zustand + localStorage)
├── data/           catalog.ts (42 títulos reais, pôster base64) · queries.ts (costura p/ backend)
├── lib/            archetypes.ts (deriva o arquétipo de gosto)
└── router.tsx      rotas
```

## Estado

- **Backend plugado (modo guardado):** sem `.env` roda 100% local (zustand + catálogo embutido); com Firebase configurado, usa Auth + Firestore + catálogo real (TMDB/AniList) com fallback local. Ver [`../docs/BACKEND-SKELETON.md`](../docs/BACKEND-SKELETON.md).
- O **card** (carro-chefe) vive no Perfil e no fim do onboarding. Formatos: Identidade, Top N, Tier List.
- Detalhe técnico: pôsteres do card são **base64** (TMDB não envia CORS → exportação PNG quebraria com URL remota).

## Próximo passo

Backend real (Firebase Auth + Firestore + Functions). Ver roadmap em [`../REELVY.md`](../REELVY.md) e arquitetura em [`../docs/ARQUITETURA-FASE-0.md`](../docs/ARQUITETURA-FASE-0.md).
