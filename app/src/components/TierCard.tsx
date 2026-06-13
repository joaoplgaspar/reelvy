import { forwardRef } from 'react';
import { CatalogItem } from '../data/catalog';

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';
export const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D'];

const TIER_COLOR: Record<Tier, string> = {
  S: '#ff5470',
  A: '#ff9f45',
  B: '#ffd24a',
  C: '#5bd1a6',
  D: '#7a8aa0',
};

type Props = {
  picks: CatalogItem[];
  tiers: Record<string, Tier>;
  accent: string;
  onCycle?: (id: string) => void; // toca no pôster → próximo tier (builder)
};

const TierCard = forwardRef<HTMLDivElement, Props>(({ picks, tiers, accent, onCycle }, ref) => {
  return (
    <div className="card tiercard" ref={ref} style={{ ['--accent' as string]: accent } as React.CSSProperties}>
      <div className="card-head">
        <span className="card-brand">Reelvy</span>
        <span className="card-handle">watch together</span>
      </div>

      <div className="tier-title">Minha tier list</div>

      <div className="tier-rows">
        {TIERS.map((t) => (
          <div className="tier-row" key={t}>
            <span className="tier-label" style={{ background: TIER_COLOR[t] }}>{t}</span>
            <div className="tier-items">
              {picks
                .filter((p) => tiers[p.id] === t)
                .map((it) => (
                  <img
                    key={it.id}
                    className="tier-poster"
                    src={it.posterData}
                    alt={it.title}
                    onClick={onCycle ? () => onCycle(it.id) : undefined}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card-foot">
        <span>minha tier list</span>
        <span>monte o seu • reelvy.tv</span>
      </div>
    </div>
  );
});

export default TierCard;
