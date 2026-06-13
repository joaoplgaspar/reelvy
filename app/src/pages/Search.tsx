import { useState } from 'react';
import { useSearch } from '../data/useCatalog';
import { useDebounced } from '../lib/useDebounced';
import Poster from '../components/Poster';

export default function Search() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q);
  const { data: results = [], isFetching } = useSearch(debounced);

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
      {debounced && (
        <p className="muted-line">{isFetching ? 'Buscando…' : `${results.length} resultado(s)`}</p>
      )}
      <div className="poster-grid">
        {results.map((i) => <Poster key={i.id} item={i} />)}
      </div>
    </div>
  );
}
