import { useState } from 'react';
import { useSearch } from '../data/useCatalog';
import { useDebounced } from '../lib/useDebounced';
import { useStore, Status } from '../store/useStore';
import type { CatalogItem } from '../data/catalog';

// Quick-log: buscar → marcar status em 1 toque, sem sair da tela (ritual <5s).
const QUICK: { key: Status; label: string }[] = [
  { key: 'planned', label: 'Quero ver' },
  { key: 'watching', label: 'Assistindo' },
  { key: 'done', label: 'Visto' },
];

function Row({ item }: { item: CatalogItem }) {
  const status = useStore((s) => s.library[item.id]?.status);
  const setStatus = useStore((s) => s.setStatus);
  return (
    <div className="log-row">
      <img className="log-poster" src={item.poster} alt="" loading="lazy" />
      <div className="log-meta">
        <div className="log-title">{item.title}</div>
        <div className="log-chips">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className={`chip ${status === q.key ? 'is-on' : ''}`}
              onClick={() => setStatus(item.id, q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuickLog() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q);
  const { data: results = [] } = useSearch(debounced);

  return (
    <div className="page">
      <header className="page-head"><h1 className="page-title">Registrar</h1></header>
      <input
        className="search-input"
        placeholder="O que você assistiu?"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {!debounced && <p className="empty">Busque um título e marque o status em um toque.</p>}
      <div className="log-list">
        {results.map((i) => <Row key={i.id} item={i} />)}
      </div>
    </div>
  );
}
