import { useState } from 'react';
import { search } from '../data/queries';
import Poster from '../components/Poster';

export default function Search() {
  const [q, setQ] = useState('');
  const results = search(q);
  return (
    <div className="page">
      <header className="page-head"><h1 className="page-title">Buscar</h1></header>
      <input
        className="search-input"
        placeholder="Filme, série, anime…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {q && <p className="muted-line">{results.length} resultado(s)</p>}
      <div className="poster-grid">
        {results.map((i) => <Poster key={i.id} item={i} />)}
      </div>
    </div>
  );
}
