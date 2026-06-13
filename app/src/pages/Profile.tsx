import { useState } from 'react';
import { useStore } from '../store/useStore';
import { byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import { deriveArchetype } from '../lib/archetypes';
import { useAuth } from '../app/AuthContext';
import { signOutUser } from '../lib/auth';
import CardStudio from '../components/CardStudio';

function Stat({ n, l }: { n: number; l: string }) {
  return <div className="stat"><b>{n}</b><span>{l}</span></div>;
}

export default function Profile() {
  const library = useStore((s) => s.library);
  const picks = useStore((s) => s.picks);
  const reset = useStore((s) => s.reset);
  const clearUserData = useStore((s) => s.clearUserData);
  const { mode, user } = useAuth();
  const [showCard, setShowCard] = useState(false);

  const lovedItems = (picks.length ? picks : Object.keys(library))
    .map(byId)
    .filter(Boolean) as CatalogItem[];
  const arche = deriveArchetype(lovedItems);

  const counts = Object.values(library).reduce(
    (a, e) => { a[e.status] = (a[e.status] || 0) + 1; return a; },
    {} as Record<string, number>,
  );
  const total = Object.keys(library).length;

  return (
    <div className="page">
      <header className="page-head"><h1 className="page-title">Perfil</h1></header>

      <div className="profile-id" style={{ ['--accent' as string]: arche.accent } as React.CSSProperties}>
        <div className="profile-arche">{arche.name}</div>
        <div className="profile-tag">{arche.tagline}</div>
      </div>

      <div className="stats">
        <Stat n={total} l="títulos" />
        <Stat n={counts['done'] || 0} l="vistos" />
        <Stat n={counts['watching'] || 0} l="assistindo" />
        <Stat n={counts['planned'] || 0} l="quero ver" />
      </div>

      <button className="btn btn-primary" onClick={() => setShowCard((v) => !v)}>
        {showCard ? 'Fechar card' : 'Gerar card'}
      </button>

      {showCard && lovedItems.length > 0 && (
        <div className="profile-card"><CardStudio picks={lovedItems} /></div>
      )}

      {mode === 'firebase' && user && (
        <>
          <p className="muted-line">Conectado como {user.email ?? user.displayName ?? 'você'}.</p>
          <button className="btn btn-link" onClick={async () => { await signOutUser(); clearUserData(); }}>Sair</button>
        </>
      )}
      {mode === 'local' && (
        <button className="btn btn-link" onClick={reset}>Refazer onboarding (dev)</button>
      )}
    </div>
  );
}
