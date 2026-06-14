import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CatalogItem } from '../data/catalog';
import { deriveArchetype, topGenres } from '../lib/archetypes';
import ShareCard from './ShareCard';
import TopCard from './TopCard';
import TierCard, { TIERS, type Tier } from './TierCard';

type Format = 'identity' | 'top' | 'tier';

// Tier inicial: distribui os picks em ordem por S→A→B→C→D (começa preenchido — endowed progress).
function seedTiers(picks: CatalogItem[]): Record<string, Tier> {
  const out: Record<string, Tier> = {};
  const n = picks.length;
  picks.forEach((p, i) => {
    out[p.id] = TIERS[n <= 1 ? 0 : Math.min(Math.floor((i / n) * 5), 4)];
  });
  return out;
}

function nextTier(t: Tier | undefined): Tier {
  return TIERS[(TIERS.indexOf(t ?? 'A') + 1) % TIERS.length];
}

// Estúdio de card reutilizado no Onboarding (reveal) e no Perfil.
// `formats` controla os formatos exibidos: o onboarding usa só 'identity' (Top/Tier só
// fazem sentido quando o usuário ordena/monta de propósito, no Perfil).
export default function CardStudio({
  picks,
  formats = ['identity', 'top', 'tier'],
}: {
  picks: CatalogItem[];
  formats?: Format[];
}) {
  const archetype = deriveArchetype(picks);
  const genres = topGenres(picks);
  const heroes = picks.slice(0, 6);
  const tierPicks = picks.slice(0, 25); // cap pra caber no card
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<Format>(formats[0]);
  const [tiers, setTiers] = useState<Record<string, Tier>>(() => seedTiers(tierPicks));

  const cycle = (id: string) => setTiers((t) => ({ ...t, [id]: nextTier(t[id]) }));

  async function renderPng(): Promise<string | null> {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
  }
  async function download() {
    setBusy(true);
    try {
      const url = await renderPng();
      if (url) { const a = document.createElement('a'); a.href = url; a.download = `reelvy-${format}.png`; a.click(); }
    } finally { setBusy(false); }
  }
  async function share() {
    setBusy(true);
    try {
      const url = await renderPng();
      if (!url) return;
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'reelvy.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Reelvy', text: 'Montei meu card no Reelvy 👀 monta o seu' });
      } else { const a = document.createElement('a'); a.href = url; a.download = 'reelvy.png'; a.click(); }
    } catch { /* cancelado */ } finally { setBusy(false); }
  }

  return (
    <div className="cardstudio">
      {formats.length > 1 && (
        <div className="format-switch">
          {formats.map((f) => (
            <button key={f} className={format === f ? 'is-on' : ''} onClick={() => setFormat(f)}>
              {f === 'identity' ? 'Identidade' : f === 'top' ? `Top ${Math.min(picks.length, 8)}` : 'Tier'}
            </button>
          ))}
        </div>
      )}

      {format === 'identity' && (
        <ShareCard ref={cardRef} archetype={archetype} genres={genres} heroes={heroes} count={picks.length} />
      )}
      {format === 'top' && <TopCard ref={cardRef} picks={picks} accent={archetype.accent} />}
      {format === 'tier' && <TierCard ref={cardRef} picks={tierPicks} tiers={tiers} accent={archetype.accent} onCycle={cycle} />}

      {format === 'tier' && <p className="hint">Toque num pôster pra trocar de tier.</p>}

      <div className="reveal-actions">
        <button className="btn btn-primary" onClick={share} disabled={busy}>{busy ? 'Gerando…' : 'Compartilhar'}</button>
        <button className="btn btn-ghost" onClick={download} disabled={busy}>Baixar card</button>
      </div>
    </div>
  );
}
