import { Link } from 'react-router-dom';
import { byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import { useStore } from '../store/useStore';
import { useShelves } from '../data/useCatalog';
import { useAuth } from '../app/AuthContext';
import Poster from '../components/Poster';
import Icon from '../components/Icon';

function greet(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

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

// Tile rápido estilo Spotify (atalho horizontal: capa + título).
function QuickTile({ item }: { item: CatalogItem }) {
  return (
    <Link to={`/titulo/${item.type}/${item.id.split(':')[1]}`} className="quick-tile">
      <img src={item.poster} alt="" loading="lazy" />
      <span className="quick-tile-title">{item.title}</span>
    </Link>
  );
}

export default function Home() {
  const library = useStore((s) => s.library);
  const { user } = useAuth();
  const { data: shelves = [], isPending } = useShelves();

  // Atalhos: o que a pessoa está vendo / quer ver; se vazio (novo), cai no topo da 1ª prateleira.
  const active = Object.entries(library)
    .filter(([, e]) => e.status === 'watching' || e.status === 'planned')
    .map(([id]) => byId(id))
    .filter(Boolean) as CatalogItem[];
  const quick = (active.length ? active : shelves[0]?.items ?? []).slice(0, 6);

  return (
    <div className="page home">
      <header className="home-top">
        <h1 className="home-greet">{greet()}</h1>
        <Link to="/perfil" className="home-avatar" aria-label="Perfil">
          {user?.photoURL
            ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            : <Icon name="profile" size={20} />}
        </Link>
      </header>

      {quick.length > 0 && (
        <div className="quick-grid">
          {quick.map((i) => <QuickTile key={i.id} item={i} />)}
        </div>
      )}

      {shelves.map((s) => <Shelf key={s.key} title={s.title} items={s.items} />)}
      {isPending && shelves.length === 0 && <p className="muted-line">Carregando catálogo…</p>}
    </div>
  );
}
