import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, Status } from '../store/useStore';
import { byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import Poster from '../components/Poster';
import Icon from '../components/Icon';

const TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'watching', label: 'Assistindo' },
  { key: 'planned', label: 'Quero ver' },
  { key: 'done', label: 'Visto' },
  { key: 'dropped', label: 'Dropei' },
];

export default function Library() {
  const library = useStore((s) => s.library);
  const [tab, setTab] = useState<Status | 'all'>('all');

  const items = Object.entries(library)
    .filter(([, e]) => tab === 'all' || e.status === tab)
    .map(([id]) => byId(id))
    .filter(Boolean) as CatalogItem[];

  return (
    <div className="page">
      <header className="page-head lib-head">
        <h1 className="page-title">Biblioteca</h1>
        <Link to="/listas" className="lib-lists-link"><Icon name="library" size={15} /> Listas</Link>
      </header>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'is-on' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="empty">Nada aqui ainda. Volte pra Home e comece a marcar o que você assiste.</p>
      ) : (
        <div className="poster-grid">{items.map((i) => <Poster key={i.id} item={i} />)}</div>
      )}
    </div>
  );
}
