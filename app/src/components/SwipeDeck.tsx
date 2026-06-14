import { useRef, useState } from 'react';
import { CatalogItem } from '../data/catalog';
import Icon from './Icon';

type Props = {
  items: CatalogItem[];
  onComplete: (likedIds: string[]) => void;
  onSwipe?: (mediaId: string, dir: 'up' | 'down') => void;   // por-swipe (sessão em tempo real)
};

const THRESHOLD = 110;

export default function SwipeDeck({ items, onComplete, onSwipe }: Props) {
  const [i, setI] = useState(0);
  const liked = useRef<string[]>([]);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState<null | 'like' | 'pass'>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  const current = items[i];
  const next = items[i + 1];

  function decide(dir: 'like' | 'pass') {
    if (leaving) return;
    if (current) onSwipe?.(current.id, dir === 'like' ? 'up' : 'down');
    if (dir === 'like' && current) liked.current.push(current.id);
    setLeaving(dir);
    window.setTimeout(() => {
      const ni = i + 1;
      setLeaving(null);
      setDrag({ x: 0, y: 0 });
      setI(ni);
      if (ni >= items.length) onComplete(liked.current);
    }, 280);
  }

  function onDown(e: React.PointerEvent) {
    if (leaving) return;
    start.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  }
  function onUp() {
    if (!start.current) return;
    const dx = drag.x;
    start.current = null;
    if (dx > THRESHOLD) decide('like');
    else if (dx < -THRESHOLD) decide('pass');
    else setDrag({ x: 0, y: 0 });
  }

  if (!current) return null;

  const dragging = !!start.current;
  const rot = drag.x / 18;
  const topStyle: React.CSSProperties = leaving
    ? {
        transform: `translate(${leaving === 'like' ? 520 : -520}px, ${drag.y}px) rotate(${leaving === 'like' ? 24 : -24}deg)`,
        transition: 'transform 0.28s ease',
        opacity: 0,
      }
    : {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`,
        transition: dragging ? 'none' : 'transform 0.2s ease',
      };

  return (
    <div className="deck">
      <div className="deck-stack">
        {next && (
          <div className="swipe-card behind">
            <img src={next.poster} alt="" />
          </div>
        )}
        <div
          className="swipe-card top"
          style={topStyle}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <img src={current.poster} alt={current.title} draggable={false} />
          <span className="stamp like" style={{ opacity: Math.max(0, Math.min(1, drag.x / 90)) }}>QUERO</span>
          <span className="stamp pass" style={{ opacity: Math.max(0, Math.min(1, -drag.x / 90)) }}>PASSO</span>
          <div className="swipe-info">
            <b>{current.title}</b>
            <span>{current.genres.join(' · ')}</span>
          </div>
        </div>
      </div>

      <div className="swipe-buttons">
        <button className="swipe-btn pass" onClick={() => decide('pass')} aria-label="Passar"><Icon name="x" size={28} /></button>
        <button className="swipe-btn like" onClick={() => decide('like')} aria-label="Quero ver"><Icon name="heart" size={28} /></button>
      </div>
      <div className="swipe-progress">{i + 1} / {items.length}</div>
    </div>
  );
}
