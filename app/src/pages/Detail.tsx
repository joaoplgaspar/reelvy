import { useParams, Link } from 'react-router-dom';
import { useStore, Status } from '../store/useStore';
import { useMedia } from '../data/useCatalog';

const STATUSES: { key: Status; label: string }[] = [
  { key: 'planned', label: 'Quero ver' },
  { key: 'watching', label: 'Assistindo' },
  { key: 'done', label: 'Visto' },
  { key: 'dropped', label: 'Dropei' },
];

export default function Detail() {
  const { type, id } = useParams();
  const mediaId = `${type}:${id}`;
  const { data: item, isPending } = useMedia(mediaId);
  const entry = useStore((s) => s.library[mediaId]);
  const setStatus = useStore((s) => s.setStatus);
  const setRating = useStore((s) => s.setRating);

  if (isPending) {
    return <div className="page"><p className="muted-line">Carregando…</p></div>;
  }
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
              onClick={() => setStatus(mediaId, s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="rate-row">
          <span className="muted-line">Sua nota</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} className={`star ${stars >= i ? 'on' : ''}`} onClick={() => setRating(mediaId, i * 2)}>★</button>
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
