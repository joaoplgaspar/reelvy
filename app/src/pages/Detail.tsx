import { useParams, Link } from 'react-router-dom';
import { byId } from '../data/queries';
import { useStore, Status } from '../store/useStore';

const STATUSES: { key: Status; label: string }[] = [
  { key: 'planned', label: 'Quero ver' },
  { key: 'watching', label: 'Assistindo' },
  { key: 'done', label: 'Visto' },
  { key: 'dropped', label: 'Dropei' },
];

export default function Detail() {
  const { type, id } = useParams();
  const item = byId(`${type}:${id}`);
  const entry = useStore((s) => (item ? s.library[item.id] : undefined));
  const setStatus = useStore((s) => s.setStatus);
  const setRating = useStore((s) => s.setRating);

  if (!item) {
    return <div className="page"><p className="empty">Título não encontrado.</p><Link className="btn btn-ghost" to="/">Voltar</Link></div>;
  }

  const stars = Math.round((entry?.rating ?? 0) / 2);

  return (
    <div className="page detail">
      <div className="detail-hero">
        <img src={item.poster} alt={item.title} />
        <div className="detail-hero-fade" />
      </div>
      <div className="detail-body">
        <h1 className="detail-title">{item.title}</h1>
        <div className="detail-genres">{item.genres.join(' · ') || '—'}</div>

        <div className="status-row">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              className={`status-chip ${entry?.status === s.key ? 'is-on' : ''}`}
              onClick={() => setStatus(item.id, s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="rate-row">
          <span className="muted-line">Sua nota</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} className={`star ${stars >= i ? 'on' : ''}`} onClick={() => setRating(item.id, i * 2)}>★</button>
            ))}
          </div>
        </div>

        <div className="provider-row">
          <span className="muted-line">Onde assistir</span>
          <div className="providers">{['N', 'P', 'D', 'M'].map((p) => <span key={p} className="prov">{p}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
