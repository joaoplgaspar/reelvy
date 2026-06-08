import { shelves, byId } from '../data/queries';
import { CatalogItem } from '../data/catalog';
import { useStore } from '../store/useStore';
import Poster from '../components/Poster';

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
  const library = useStore((s) => s.library);
  const watching = Object.entries(library)
    .filter(([, e]) => e.status === 'watching')
    .map(([id]) => byId(id))
    .filter(Boolean) as CatalogItem[];

  return (
    <div className="page">
      <header className="page-head">
        <div className="brand">Reelvy</div>
      </header>
      {watching.length > 0 && <Shelf title="Continuar assistindo" items={watching} />}
      {shelves().map((s) => <Shelf key={s.key} title={s.title} items={s.items} />)}
    </div>
  );
}
