import { useState } from 'react';
import { useStore } from '../store/useStore';
import { byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import { deriveArchetype } from '../lib/archetypes';
import { useAuth } from '../app/AuthContext';
import { signOutUser } from '../lib/auth';
import CardStudio from '../components/CardStudio';
import Poster from '../components/Poster';

export default function Profile() {
  const library = useStore((s) => s.library);
  const picks = useStore((s) => s.picks);
  const reset = useStore((s) => s.reset);
  const clearUserData = useStore((s) => s.clearUserData);
  const { mode, user } = useAuth();
  const [showCard, setShowCard] = useState(false);

  const lovedItems = (picks.length ? picks : Object.keys(library)).map(byId).filter(Boolean) as CatalogItem[];
  const arche = deriveArchetype(lovedItems);
  const counts = Object.values(library).reduce(
    (a, e) => { a[e.status] = (a[e.status] || 0) + 1; return a; },
    {} as Record<string, number>,
  );
  const total = Object.keys(library).length;
  const name = user?.displayName ?? (user?.email ? user.email.split('@')[0] : 'Você');
  const favorites = lovedItems.slice(0, 6);

  return (
    <div className="page profile" style={{ ['--accent' as string]: arche.accent } as React.CSSProperties}>
      <header className="profile-header">
        {user?.photoURL
          ? <img className="profile-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
          : <div className="profile-avatar profile-avatar--ph">{name.charAt(0).toUpperCase()}</div>}
        <div className="profile-header-info">
          <h1 className="profile-name">{name}</h1>
          <div className="profile-handle">{arche.name}</div>
          <div className="profile-stats-inline">
            <span><b>{total}</b> títulos</span>
            <span><b>{counts['done'] || 0}</b> vistos</span>
            <span><b>{counts['watching'] || 0}</b> assistindo</span>
          </div>
        </div>
      </header>

      <p className="profile-bio">{arche.tagline}</p>

      {favorites.length > 0 && (
        <section className="profile-favs">
          <h2 className="shelf-title">Favoritos</h2>
          <div className="poster-grid">{favorites.map((i) => <Poster key={i.id} item={i} />)}</div>
        </section>
      )}

      <button className="btn btn-primary" onClick={() => setShowCard((v) => !v)}>
        {showCard ? 'Fechar card' : 'Gerar meu card'}
      </button>

      {showCard && lovedItems.length > 0 && (
        <div className="profile-card"><CardStudio picks={lovedItems} /></div>
      )}

      {mode === 'firebase' && user && (
        <button className="btn btn-link" onClick={async () => { await signOutUser(); clearUserData(); }}>Sair</button>
      )}
      {mode === 'local' && (
        <button className="btn btn-link" onClick={reset}>Refazer onboarding (dev)</button>
      )}
    </div>
  );
}
