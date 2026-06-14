import { useMemo } from 'react';
import { CATALOG, CatalogItem } from '../data/catalog';

type Props = {
  worlds: string[];
  selected: CatalogItem[];
  setSelected: (s: CatalogItem[]) => void;
  onNext: () => void;
  onBack: () => void;
};

const MIN = 5;

export default function TapGrid({ worlds, selected, setSelected, onNext, onBack }: Props) {
  const items = useMemo(() => {
    const byType: Record<string, CatalogItem[]> = { anime: [], movie: [], tv: [] };
    for (const it of CATALOG) if (worlds.includes(it.type)) byType[it.type].push(it);
    // intercala os tipos pra grade não ficar agrupada
    const out: CatalogItem[] = [];
    for (let i = 0, added = true; added; i++) {
      added = false;
      for (const t of ['anime', 'movie', 'tv']) {
        const it = byType[t][i];
        if (it) {
          out.push(it);
          added = true;
        }
      }
    }
    return out;
  }, [worlds]);

  const isOn = (id: string) => selected.some((s) => s.id === id);
  const toggle = (it: CatalogItem) =>
    setSelected(isOn(it.id) ? selected.filter((s) => s.id !== it.id) : [...selected, it]);

  const meter = Math.min(100, 12 + selected.length * 8); // endowed progress: começa em 12%
  const enough = selected.length >= MIN;

  return (
    <div className="screen">
      <div className="grid-head">
        <button className="back" onClick={onBack} aria-label="Voltar">←</button>
        <div className="grid-head-text">
          <h2 className="title sm">Toque em tudo que você amou</h2>
          <div className="meter"><div className="meter-fill" style={{ width: `${meter}%` }} /></div>
          <p className="counter">
            {selected.length} selecionados
            {enough ? ' · mandou bem' : ` · escolha pelo menos ${MIN}`}
          </p>
        </div>
      </div>

      <div className="poster-grid">
        {items.map((it) => (
          <button
            key={it.id}
            className={`poster ${isOn(it.id) ? 'is-on' : ''}`}
            onClick={() => toggle(it)}
          >
            <img src={it.poster} alt={it.title} loading="lazy" />
            <span className="poster-check">✓</span>
            <span className="poster-title">{it.title}</span>
          </button>
        ))}
      </div>

      <div className="cta-bar">
        <button className="btn btn-primary" disabled={!enough} onClick={onNext}>
          {enough ? `Ver meu perfil (${selected.length})` : `Escolha ${MIN - selected.length} a mais`}
        </button>
      </div>
    </div>
  );
}
