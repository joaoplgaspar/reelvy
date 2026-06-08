import { forwardRef } from 'react';
import { CatalogItem } from '../data/catalog';
import { Archetype } from '../lib/archetypes';

type Props = {
  archetype: Archetype;
  genres: string[];
  heroes: CatalogItem[];
  count: number;
};

const ShareCard = forwardRef<HTMLDivElement, Props>(
  ({ archetype, genres, heroes, count }, ref) => {
    const extra = count - heroes.length;
    return (
      <div className="card" ref={ref} style={{ ['--accent' as string]: archetype.accent } as React.CSSProperties}>
        <div className="card-head">
          <span className="card-brand">Reelvy</span>
          <span className="card-handle">watch together</span>
        </div>

        <div className="card-body">
          <div className="card-grid">
            {heroes.map((h, i) => (
              <div className="card-tile" key={h.id}>
                <img src={h.posterData} alt={h.title} />
                {i === heroes.length - 1 && extra > 0 && <span className="card-more">+{extra}</span>}
              </div>
            ))}
          </div>

          <div className="card-id">
            <div className="card-arche">{archetype.name}</div>
            <div className="card-tag">{archetype.tagline}</div>
            <div className="card-genres">{genres.join('  ·  ')}</div>
          </div>
        </div>

        <div className="card-foot">
          <span>{count} títulos no meu gosto</span>
          <span>monte o seu • reelvy.tv</span>
        </div>
      </div>
    );
  },
);

export default ShareCard;
