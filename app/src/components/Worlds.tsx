type Props = {
  worlds: string[];
  setWorlds: (w: string[]) => void;
  onNext: () => void;
};

const WORLDS = [
  { key: 'movie', label: 'Filmes', emoji: '🎬' },
  { key: 'tv', label: 'Séries', emoji: '📺' },
  { key: 'anime', label: 'Animes', emoji: '🌸' },
];

export default function Worlds({ worlds, setWorlds, onNext }: Props) {
  const toggle = (k: string) =>
    setWorlds(worlds.includes(k) ? worlds.filter((x) => x !== k) : [...worlds, k]);

  return (
    <div className="screen">
      <div className="screen-head">
        <div className="brand">Reelvy</div>
        <h1 className="title">O que você curte?</h1>
        <p className="subtitle">Vamos montar seu perfil de gosto em 1 minuto.</p>
      </div>

      <div className="worlds">
        {WORLDS.map((w) => (
          <button
            key={w.key}
            className={`world ${worlds.includes(w.key) ? 'is-on' : ''}`}
            onClick={() => toggle(w.key)}
          >
            <span className="world-emoji">{w.emoji}</span>
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
