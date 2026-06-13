import { Link } from 'react-router-dom';
import { byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import { useStore } from '../store/useStore';
import { useShelves } from '../data/useCatalog';
import { useAuth } from '../app/AuthContext';
import Poster from '../components/Poster';
import Icon from '../components/Icon';
import Skeleton from '../components/Skeleton';

const TYPE_LABEL: Record<CatalogItem['type'], string> = { movie: 'Filme', tv: 'Série', anime: 'Anime' };

function Shelf({ title, items }: { title: string; items: CatalogItem[] }) {
  return (
    <section className="shelf">
      <h2 className="shelf-title">{title}</h2>
      <div className="shelf-row">
        {items.map((i) => <Poster key={i.id} item={i} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { data: shelves = [], isPending } = useShelves();
  const library = useStore((s) => s.library);
  const setStatus = useStore((s) => s.setStatus);

  const featured = shelves[0]?.items[0];
  const inList = featured ? library[featured.id]?.status === 'planned' : false;

  if (isPending && shelves.length === 0) {
    return (
      <div className="home-nf">
        <Skeleton style={{ width: '100%', height: '72vh', minHeight: 440, borderRadius: 0 }} />
        <div className="nf-rows">
          {[0, 1].map((r) => (
            <section className="shelf" key={r}>
              <Skeleton style={{ height: 18, width: 150, marginBottom: 12 }} />
              <div className="shelf-row">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ width: 112, height: 168, flex: 'none', borderRadius: 11 }} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-nf">
      {featured ? (
        <div className="nf-hero">
          <img className="nf-hero-img" src={featured.poster} alt={featured.title} />
          <div className="nf-hero-grad" />
          <div className="nf-hero-top">
            <span className="nf-brand">REELVY</span>
            <Link to="/perfil" className="home-avatar" aria-label="Perfil">
              {user?.photoURL
                ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                : <Icon name="profile" size={20} />}
            </Link>
          </div>
          <div className="nf-hero-body">
            <span className="nf-kicker">Em destaque</span>
            <h1 className="nf-hero-title">{featured.title}</h1>
            <div className="nf-hero-tags">
              {TYPE_LABEL[featured.type]}
              {featured.rating ? `  •  ★ ${featured.rating.toFixed(1)}` : ''}
            </div>
            <div className="nf-hero-actions">
              <Link to={`/titulo/${featured.type}/${featured.id.split(':')[1]}`} className="nf-btn nf-btn-primary">
                Ver detalhes
              </Link>
              <button className="nf-btn nf-btn-ghost" onClick={() => setStatus(featured.id, 'planned')}>
                {inList ? '✓ Na lista' : '+ Minha lista'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <header className="page-head" style={{ padding: '22px 18px 0' }}><div className="brand">Reelvy</div></header>
      )}

      <div className="nf-rows">
        {shelves.map((s) => <Shelf key={s.key} title={s.title} items={s.items} />)}
      </div>
    </div>
  );
}
