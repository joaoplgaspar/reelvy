# Reelvy — Material de Custos (Fase 0)

> Estimativa de infraestrutura para a Fase 0 (tracker solo + card viral).
> Última atualização: junho/2026. Valores em USD/mês.
> **Estes números são estimativas de ordem de grandeza com premissas declaradas — não são uma cotação.**

---

## Stack assumida

- **Front:** React + Vite + TypeScript, PWA, mobile-first
- **Dados no cliente:** TanStack Query (cache + persistência em IndexedDB)
- **Backend:** Firebase — Auth + Firestore + Cloud Functions
- **Hosting:** Cloudflare Pages / Vercel (estático, free tier) — fora do Firebase para economizar banda
- **Catálogo:** TMDB (filme/série) + AniList (anime) — **APIs gratuitas**

As APIs de catálogo **não custam dinheiro**. O cache no Firestore existe para (a) não tomar rate-limit e (b) velocidade — não para reduzir custo de API.

---

## Constantes de preço (confirmadas em junho/2026)

| Serviço | Preço | Free tier |
|---|---|---|
| Firestore — leituras | $0,06 / 100k | 50k/dia |
| Firestore — escritas | $0,18 / 100k | 20k/dia |
| Firestore — deletes | $0,02 / 100k | 20k/dia |
| Firestore — storage | $0,18 / GB/mês | 1 GB |
| Cloud Functions | $0,40 / milhão de invocações | 2M/mês |
| Firebase Auth (Identity Platform) | ~$0,0025–0,0055 / MAU | **50k MAU** |

---

## Premissas por usuário ativo / mês (Fase 0, com otimizações)

- ~500 leituras Firestore
- ~50 escritas Firestore
- ~0,15 MB de storage (perfil + biblioteca)

> Sem cache no cliente (TanStack Query), as leituras seriam **3–5×** maiores. O cache no cliente é a maior alavanca de custo — não é opcional.

---

## Tabela de custo por faixa de usuários

| MAU | Leituras | Escritas | Storage | Functions | Banda | **Infra-core** | Auth (Identity Platform) |
|---|---|---|---|---|---|---|---|
| **1.000** | $0¹ | $0¹ | $0 | $0 | ~$0 | **≈ $0** | $0 (grátis <50k) |
| **10.000** | ~$2 | $0¹ | ~$0 | $0 | ~$1 | **≈ $3–6** | $0 (grátis <50k) |
| **100.000** | ~$29 | ~$8 | ~$3 | ~$5 | ~$10 | **≈ $55–75** | ~$200–275 ⚠️ |
| **1.000.000** | ~$300 | ~$89 | ~$30 | ~$80 | ~$150 | **≈ $650–850** | ~$2.500–5.000 ⚠️ |

¹ Coberto pelo free tier diário.

---

## Como ler isso

- **Até ~10k usuários: praticamente de graça.** Infra não é seu problema — nem perto.
- **Em ~100k: ~$60/mês de infra-core.** Trivial perto da receita que 100k usuários geram.
- **A pegadinha é o Auth.** A partir de 50k MAU, se o projeto estiver no modelo *Firebase Auth com Identity Platform* (padrão para projetos novos), o login pode virar a **maior linha de custo** — em 1M MAU, $2,5k–5k/mês só de autenticação.
  - **Mitigação:** confirmar o modelo de cobrança do projeto. Em escala, avaliar alternativa (Supabase Auth, Clerk) ou embutir no unit-economics. **Na Fase 0 (bem abaixo de 50k MAU) é tudo grátis** — só não ser pego de surpresa depois.

## Veredito

Infraestrutura **não é risco** nesta jornada. Dá para chegar a dezenas de milhares de usuários gastando o preço de um lanche. O risco é 100% **distribuição** (fazer o card viralizar), não servidor.

---

## Fontes

- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firestore Pricing](https://firebase.google.com/docs/firestore/pricing)
- [Identity Platform Pricing](https://cloud.google.com/identity-platform/pricing)
- [Cloud Functions Quotas](https://firebase.google.com/docs/functions/quotas)
