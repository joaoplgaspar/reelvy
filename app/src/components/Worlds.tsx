import { CATALOG } from '../data/catalog';

type Props = {
  worlds: string[];
  setWorlds: (w: string[]) => void;
  onNext: () => void;
};

const WORLDS = [
  { key: 'movie', label: 'Filmes' },
  { key: 'tv', label: 'Séries' },
  { key: 'anime', label: 'Animes' },
];

// Colagem de pôsteres por tipo — poster-forward, no lugar de emoji.
const collage = (type: string) => CATALOG.filter((i) => i.type === type).slice(0, 3);

export default function Worlds({ worlds, setWorlds, onNext }: Props) {
  const toggle = (k: string) =>
    setWorlds(worlds.includes(k) ? worlds.filter((x) => x !== k) : [...worlds, k]);

  return (
    <div className="screen">
      <div className="screen-head">
        <div className="brand">Reelvy</div>
        <h1 className="title">O que você curte?</h1>
        <p className="subtitle">Monte seu perfil de gosto em 1 minuto.</p>
      </div>

      <div className="worlds">
        {WORLDS.map((w) => (
          <button
            key={w.key}
            className={`world ${worlds.includes(w.key) ? 'is-on' : ''}`}
            onClick={() => toggle(w.key)}
          >
            <div className="world-collage">
              {collage(w.key).map((it) => <img key={it.id} src={it.poster} alt="" loading="lazy" />)}
            </div>
            <span className="world-label">{w.label}</span>
            <span className="world-check">✓</span>
          </button>
        ))}
      </div>

      <div className="cta-bar">
        <button className="btn btn-primary" disabled={worlds.length === 0} onClick={onNext}>
          Continuar
        </button>
      </div>
    </div>
  );
}
