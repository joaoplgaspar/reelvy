import { forwardRef } from 'react';
import { CatalogItem } from '../data/catalog';
import { Review } from '../store/useStore';

type Props = {
  item: CatalogItem;
  listName: string;
  members: string[];
  reviews: Record<string, Review>;
};

const VerdictCard = forwardRef<HTMLDivElement, Props>(({ item, listName, members, reviews }, ref) => {
  const given = members.filter((m) => reviews[m]);
  const avg = given.length ? given.reduce((a, m) => a + reviews[m].rating, 0) / given.length : 0;

  return (
    <div className="card verdictcard" ref={ref}>
      <div className="card-head">
        <span className="card-brand">Reelvy</span>
        <span className="card-handle">{listName}</span>
      </div>

      <div className="verdict-hero">
        <img src={item.posterData} alt={item.title} />
        <div className="verdict-hero-text">
          <b>{item.title}</b>
          <span>o veredito do grupo</span>
          <div className="verdict-avg">{avg.toFixed(1)}<small> / 10</small></div>
        </div>
      </div>

      <div className="verdict-reviews">
        {given.map((m) => (
          <div className="verdict-r" key={m}>
            <div className="vr-top"><b>{m}</b><span className="vr-stars">{'★'.repeat(Math.max(1, Math.round(reviews[m].rating / 2)))}</span></div>
            {reviews[m].text && <p>“{reviews[m].text}”</p>}
          </div>
        ))}
      </div>

      <div className="card-foot">
        <span>nosso veredito</span>
        <span>monte o seu • reelvy.tv</span>
      </div>
    </div>
  );
});

export default VerdictCard;
