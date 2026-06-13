import { useEffect, useState } from 'react';
import { useSearch } from '../data/useCatalog';
import Poster from '../components/Poster';

// Debounce: não dispara a Function de busca a cada tecla.
function useDebounced(value: string, ms = 300): string {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

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
