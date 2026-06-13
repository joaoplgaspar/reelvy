import { Link } from 'react-router-dom';
import { CatalogItem } from '../data/catalog';

const TYPE_LABEL: Record<CatalogItem['type'], string> = {
  movie: 'Filme',
  tv: 'Série',
  anime: 'Anime',
};

// Spotlight da Home — quebra a monotonia das prateleiras.
export default function Hero({ item }: { item: CatalogItem }) {
  return (
    <Link to={`/titulo/${item.type}/${item.id.split(':')[1]}`} className="hero">
      <img className="hero-img" src={item.poster} alt={item.title} />
      <div className="hero-fade" />
      <div className="hero-body">
        <span className="hero-kicker">Em destaque</span>
        <h2 className="hero-title">{item.title}</h2>
        <div className="hero-meta">
          {TYPE_LABEL[item.type]}
          {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}
        </div>
        <span className="hero-cta">Ver detalhes →</span>
      </div>
    </Link>
  );
}
