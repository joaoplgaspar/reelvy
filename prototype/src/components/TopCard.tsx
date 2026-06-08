import { forwardRef } from 'react';
import { CatalogItem } from '../data/catalog';

type Props = {
  picks: CatalogItem[];
  accent: string;
};

const TopCard = forwardRef<HTMLDivElement, Props>(({ picks, accent }, ref) => {
  const list = picks.slice(0, 8);
  return (
    <div className="card topcard" ref={ref} style={{ ['--accent' as string]: accent } as React.CSSProperties}>
      <div className="card-head">
        <span className="card-brand">Reelvy</span>
        <span className="card-handle">watch together</span>
      </div>

      <div className="top-title">Meu Top {list.length}</div>

      <div className="top-list">
        {list.map((it, i) => (
          <div className="top-row" key={it.id}>
            <span className="top-rank">{i + 1}</span>
            <img className="top-poster" src={it.posterData} alt={it.title} />
            <span className="top-name">{it.title}</span>
          </div>
        ))}
      </div>

      <div className="card-foot">
        <span>meu ranking</span>
        <span>monte o seu • reelvy.tv</span>
      </div>
    </div>
  );
});

export default TopCard;
