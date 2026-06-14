import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATALOG, CatalogItem } from '../data/catalog';
import SwipeDeck from '../components/SwipeDeck';
import Icon from '../components/Icon';

type Phase = 'setup' | 'swipe' | 'handoff' | 'reveal';
type Player = { name: string };

const WORLDS = [
  { key: 'movie', label: 'Filmes' },
  { key: 'tv', label: 'Séries' },
  { key: 'anime', label: 'Animes' },
];

function buildDeck(worlds: string[]): CatalogItem[] {
  const pool = CATALOG.filter((i) => worlds.includes(i.type));
  const a = [...pool];
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a.slice(0, 16);
}

export default function Match() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<Phase>('setup');
  const [players, setPlayers] = useState<Player[]>([{ name: 'Você' }, { name: 'Par' }]);
  const [worlds, setWorlds] = useState<string[]>(['movie', 'tv', 'anime']);
  const [deck, setDeck] = useState<CatalogItem[]>([]);
  const [cur, setCur] = useState(0);
  const [likes, setLikes] = useState<string[][]>([]);

  const toggleWorld = (k: string) => setWorlds((w) => (w.includes(k) ? w.filter((x) => x !== k) : [...w, k]));
  const setName = (idx: number, name: string) => setPlayers((p) => p.map((pl, i) => (i === idx ? { name } : pl)));
  const addPlayer = () => { if (players.length < 4) setPlayers((p) => [...p, { name: `Pessoa ${p.length + 1}` }]); };
  const removePlayer = (idx: number) => { if (players.length > 2) setPlayers((p) => p.filter((_, i) => i !== idx)); };

  function start() {
    setDeck(buildDeck(worlds.length ? worlds : ['movie', 'tv', 'anime']));
    setLikes([]);
    setCur(0);
    setPhase('swipe');
  }
  function onPlayerDone(likedIds: string[]) {
    const nl = [...likes];
    nl[cur] = likedIds;
    setLikes(nl);
    if (cur + 1 < players.length) { setCur(cur + 1); setPhase('handoff'); }
    else setPhase('reveal');
  }

  if (phase === 'setup') {
    return (
      <div className="page match-setup">
        <header className="page-head"><h1 className="page-title">O que vamos ver?</h1></header>
        <p className="muted-line">Cada um desliza, passa o celular, e o Reelvy acha o match.</p>

        <div className="setup-block">
          <span className="setup-label">Quem vai assistir</span>
          {players.map((p, idx) => (
            <div className="player-row" key={idx}>
              <Icon name="profile" size={18} />
              <input className="player-input" value={p.name} onChange={(e) => setName(idx, e.target.value)} maxLength={14} />
              {players.length > 2 && (
                <button className="player-x" onClick={() => removePlayer(idx)} aria-label="Remover"><Icon name="x" size={16} /></button>
              )}
            </div>
          ))}
          {players.length < 4 && (
            <button className="add-player" onClick={addPlayer}><Icon name="plus" size={16} /> adicionar pessoa</button>
          )}
        </div>

        <div className="setup-block">
          <span className="setup-label">De quê?</span>
          <div className="world-chips">
            {WORLDS.map((w) => (
              <button key={w.key} className={`chip-toggle ${worlds.includes(w.key) ? 'is-on' : ''}`} onClick={() => toggleWorld(w.key)}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cta-bar">
          <button className="btn btn-primary" onClick={start}>Começar sessão</button>
        </div>
      </div>
    );
  }

  if (phase === 'handoff') {
    return (
      <div className="page handoff">
        <div className="handoff-inner">
          <Icon name="users" size={44} />
          <h2 className="handoff-title">Passe o celular para</h2>
          <div className="handoff-name">{players[cur].name}</div>
          <p className="muted-line">Sem espiar as escolhas de quem foi antes</p>
          <button className="btn btn-primary" onClick={() => setPhase('swipe')}>Pronto, sou {players[cur].name}</button>
        </div>
      </div>
    );
  }

  if (phase === 'swipe') {
    return (
      <div className="page swipe-page">
        <header className="swipe-head">
          <button className="back" onClick={() => setPhase('setup')} aria-label="Sair"><Icon name="back" size={18} /></button>
          <div className="swipe-turn">Vez de <b>{players[cur].name}</b></div>
        </header>
        <SwipeDeck key={cur} items={deck} onComplete={onPlayerDone} />
      </div>
    );
  }

  const matches = deck.filter((it) => likes.length === players.length && likes.every((l) => l?.includes(it.id)));
  const ranked = deck
    .map((it) => ({ it, n: likes.filter((l) => l?.includes(it.id)).length }))
    .filter((x) => x.n > 0 && !matches.includes(x.it))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  return (
    <div className="page reveal-page">
      {matches.length > 0 ? (
        <>
          <div className="match-burst">É um match! <Icon name="flame" size={22} /></div>
          <p className="muted-line">Todo mundo deu like nestes:</p>
          <div className="match-list">
            {matches.map((it) => (
              <button key={it.id} className="match-item" onClick={() => nav(`/titulo/${it.type}/${it.id.split(':')[1]}`)}>
                <img src={it.poster} alt={it.title} />
                <div><b>{it.title}</b><span>{it.genres.join(' · ')}</span></div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="match-burst no">Sem match</div>
          <p className="muted-line">Ninguém concordou 100%. Os mais votados:</p>
          <div className="match-list">
            {ranked.map(({ it, n }) => (
              <button key={it.id} className="match-item" onClick={() => nav(`/titulo/${it.type}/${it.id.split(':')[1]}`)}>
                <img src={it.poster} alt={it.title} />
                <div><b>{it.title}</b><span>{n} de {players.length} curtiram</span></div>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="reveal-actions">
        <button className="btn btn-primary" onClick={start}>Deslizar de novo</button>
        <button className="btn btn-link" onClick={() => nav('/')}>Voltar pra Home</button>
      </div>
    </div>
  );
}
