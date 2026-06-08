import { CatalogItem } from '../data/catalog';

export type Archetype = {
  key: string;
  name: string;
  tagline: string;
  accent: string;
};

// Rótulos curtos, aspiracionais e sem jargão de nicho — pensados pra pessoa QUERER reivindicar.
// O lado anime/série aparece pelos pôsteres e gêneros, não por um termo "esquisito".
const A: Record<string, Archetype> = {
  dreamer:     { key: 'dreamer',     name: 'O Sonhador',     tagline: 'Mundos impossíveis são o seu lar.',      accent: '#ff6a3d' },
  restless:    { key: 'restless',    name: 'Mente Inquieta', tagline: 'Quanto mais te faz pensar, melhor.',     accent: '#3b82f6' },
  sensitive:   { key: 'sensitive',   name: 'Alma Sensível',  tagline: 'Você sente cada entrelinha.',            accent: '#a855f7' },
  coldblood:   { key: 'coldblood',   name: 'Sangue Frio',    tagline: 'O escuro te atrai, não te assusta.',     accent: '#10b981' },
  light:       { key: 'light',       name: 'Espírito Leve',  tagline: 'Você sabe a hora de só rir.',            accent: '#f59e0b' },
  openheart:   { key: 'openheart',   name: 'Coração Aberto', tagline: 'Você ainda acredita no final feliz.',    accent: '#ec4899' },
  frontline:   { key: 'frontline',   name: 'Linha de Frente', tagline: 'Você vive cada cena na pele.',          accent: '#ef4444' },
  unlabeled:   { key: 'unlabeled',   name: 'Sem Etiqueta',   tagline: 'Seu gosto não cabe num rótulo.',         accent: '#14b8a6' },
};

const GENRE_PT: Record<string, string> = {
  action: 'Ação', adventure: 'Aventura', animation: 'Animação', comedy: 'Comédia', crime: 'Crime',
  drama: 'Drama', fantasy: 'Fantasia', horror: 'Terror', mystery: 'Mistério', romance: 'Romance',
  scifi: 'Sci-Fi', thriller: 'Suspense', sliceoflife: 'Slice of Life', sports: 'Esporte', music: 'Música',
  doc: 'Documentário', family: 'Família', history: 'História', war: 'Guerra', western: 'Faroeste',
};

function tally(selected: CatalogItem[]) {
  const t: Record<string, number> = {};
  for (const it of selected) for (const g of it.genres) t[g] = (t[g] || 0) + 1;
  return Object.entries(t).sort((a, b) => b[1] - a[1]);
}

export function topGenres(selected: CatalogItem[]): string[] {
  return tally(selected).slice(0, 4).map(([g]) => GENRE_PT[g] || g);
}

export function deriveArchetype(selected: CatalogItem[]): Archetype {
  if (selected.length === 0) return A.unlabeled;
  const top = tally(selected);
  const animeShare = selected.filter((s) => s.type === 'anime').length / selected.length;
  const lead = top[0]?.[0];

  // gosto muito espalhado => sem etiqueta
  if (top.length >= 6 && top[0][1] <= Math.ceil(selected.length * 0.35)) return A.unlabeled;

  if (animeShare >= 0.5 && (lead === 'action' || lead === 'adventure' || lead === 'fantasy')) return A.dreamer;

  switch (lead) {
    case 'scifi': return A.restless;
    case 'drama': return A.sensitive;
    case 'horror': return A.coldblood;
    case 'comedy':
    case 'sliceoflife': return A.light;
    case 'romance': return A.openheart;
    case 'action':
    case 'adventure': return A.frontline;
    case 'fantasy': return A.dreamer;
    default: return A.unlabeled;
  }
}
