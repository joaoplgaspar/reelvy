import { useParams, Link } from 'react-router-dom';
import { useStore, Status } from '../store/useStore';
import { useMedia } from '../data/useCatalog';
import Skeleton from '../components/Skeleton';

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
  const setProgress = useStore((s) => s.setProgress);

  if (isPending) {
    return (
      <div className="page detail">
        <Skeleton style={{ width: '100%', height: '50vh', borderRadius: 0 }} />
        <div className="detail-body">
          <Skeleton style={{ height: 30, width: '65%' }} />
          <Skeleton style={{ height: 14, width: '45%', marginTop: 12 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            {[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 38, width: 92, borderRadius: 99 }} />)}
          </div>
          <Skeleton style={{ height: 72, width: '100%', marginTop: 22 }} />
        </div>
      </div>
    );
  }
  if (!item) {
    return <div className="page"><p className="empty">Título não encontrado.</p><Link className="btn btn-ghost" to="/">Voltar</Link></div>;
  }

  const stars = Math.round((entry?.rating ?? 0) / 2);
  const watched = entry?.progress ?? 0;
  const eps = item.episodes ?? 0;

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

        {eps > 0 && (
          <div className="ep-row">
            <span className="muted-line">Progresso</span>
            <div className="ep-control">
              <button className="ep-btn" disabled={watched <= 0} onClick={() => setProgress(mediaId, Math.max(watched - 1, 0))}>−</button>
              <span className="ep-count">{watched}/{eps} ep</span>
              <button className="ep-btn" disabled={watched >= eps} onClick={() => setProgress(mediaId, Math.min(watched + 1, eps))}>+1</button>
            </div>
          </div>
        )}

        <div className="rate-row">
          <span className="muted-line">Sua nota</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} className={`star ${stars >= i ? 'on' : ''}`} onClick={() => setRating(mediaId, i * 2)}>★</button>
            ))}
          </div>
        </div>

        {item.overview && <p className="detail-overview">{item.overview}</p>}

        {item.providers && item.providers.length > 0 && (
          <div className="provider-row">
            <span className="muted-line">Onde assistir</span>
            <div className="providers">
              {item.providers.map((p) => (
                <img key={p.name} className="prov-logo" src={p.logo} alt={p.name} title={p.name} loading="lazy" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
