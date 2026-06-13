import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { CatalogItem } from '../data/catalog';
import { deriveArchetype, topGenres } from '../lib/archetypes';
import ShareCard from './ShareCard';
import TopCard from './TopCard';

type Format = 'identity' | 'top';

// Estúdio de card reutilizado no Onboarding (reveal) e no Perfil.
export default function CardStudio({ picks }: { picks: CatalogItem[] }) {
  const archetype = deriveArchetype(picks);
  const genres = topGenres(picks);
  const heroes = picks.slice(0, 6);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<Format>('identity');

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
      <div className="format-switch">
        <button className={format === 'identity' ? 'is-on' : ''} onClick={() => setFormat('identity')}>Identidade</button>
        <button className={format === 'top' ? 'is-on' : ''} onClick={() => setFormat('top')}>Top {Math.min(picks.length, 8)}</button>
      </div>

      {format === 'identity' ? (
        <ShareCard ref={cardRef} archetype={archetype} genres={genres} heroes={heroes} count={picks.length} />
      ) : (
        <TopCard ref={cardRef} picks={picks} accent={archetype.accent} />
      )}

      <div className="reveal-actions">
        <button className="btn btn-primary" onClick={share} disabled={busy}>{busy ? 'Gerando…' : 'Compartilhar'}</button>
        <button className="btn btn-ghost" onClick={download} disabled={busy}>Baixar card</button>
      </div>
    </div>
  );
}
