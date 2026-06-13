# Reelvy

App social de quem assiste de **tudo** — anime + série + filme num lar só. Anime-first, mobile-first. O diferencial não é "mais um tracker": é o **"junto"** — compatibilidade de gosto, social à prova de spoiler e decisão em grupo (construídos em fases).

> 📄 **Documento-mestre** (visão, decisões e roadmap): [`REELVY.md`](REELVY.md).
> A memória do assistente não viaja com o repositório — o `REELVY.md` é a **fonte da verdade portátil**. Mantenha-o atualizado.

## Estrutura do repositório

```
reelvy/  (repo: github.com/joaoplgaspar/we_watch)
├── REELVY.md          ← documento-mestre (decisões & roadmap)
├── README.md          ← este arquivo
├── docs/              ← planejamento da Fase 0 (arquitetura, telas, custos)
└── app/               ← o app Reelvy — React + Vite + TS  ⭐
```

Quando o backend entrar (próximo grande passo), `functions/` + `firebase.json` + `firestore.rules` ficam como irmãos de `app/`.

## Rodar o app

```bash
cd app
npm install
npm run dev          # http://localhost:5173
# no celular (mesma rede):
npm run dev -- --host
```

Node 22+. Na primeira vez o app abre o **onboarding**; ao terminar, entra no app. O estado é local (zustand + localStorage); o backend (Firebase Auth + Firestore + Functions) é o próximo passo — ver roadmap no [`REELVY.md`](REELVY.md).

## Fase 0 (atual)

Tracker solo bonito + **card viral** (o motor de aquisição; métrica-norte = K-factor). Especificações:

- [`docs/ARQUITETURA-FASE-0.md`](docs/ARQUITETURA-FASE-0.md) — schema Firestore, cache, Cloud Functions, regras de segurança.
- [`docs/TELAS-FASE-0.md`](docs/TELAS-FASE-0.md) — telas com racional de CRO/UX e referências.
- [`docs/CUSTOS-FASE-0.md`](docs/CUSTOS-FASE-0.md) — custos de infraestrutura por faixa de usuários.
