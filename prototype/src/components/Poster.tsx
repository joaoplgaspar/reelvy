import { Link } from 'react-router-dom';
import { CatalogItem } from '../data/catalog';

export default function Poster({ item }: { item: CatalogItem }) {
  return (
    <Link to={`/titulo/${item.type}/${item.id.split(':')[1]}`} className="poster-link">
      <img src={item.poster} alt={item.title} loading="lazy" />
    </Link>
  );
}
