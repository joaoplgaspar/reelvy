import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useStore } from '../store/useStore';
import { byId, search } from '../data/queries';
import Icon from '../components/Icon';
import VerdictCard from '../components/VerdictCard';

export default function ListDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const list = useStore((s) => (id ? s.lists[id] : undefined));
  const addToList = useStore((s) => s.addToList);
  const removeFromList = useStore((s) => s.removeFromList);
  const setReview = useStore((s) => s.setReview);
  const setListProgress = useStore((s) => s.setListProgress);
  const deleteList = useStore((s) => s.deleteList);

  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [hs, setHs] = useState<{ mediaId: string; idx: number } | null>(null);
  const [draft, setDraft] = useState<{ rating: number; text: string }>({ rating: 6, text: '' });
  const [cardId, setCardId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  if (!list) {
    return <div className="page"><p className="empty">Lista não encontrada.</p><Link className="btn btn-ghost" to="/listas">Voltar</Link></div>;
  }

  const results = search(query).filter((r) => !list.items.includes(r.id)).slice(0, 12);

  function startVerdict(mediaId: string) {
    const ex = list!.reviews[mediaId]?.[list!.members[0]];
    setDraft(ex ? { ...ex } : { rating: 6, text: '' });
    setHs({ mediaId, idx: 0 });
  }
  function saveAndNext() {
    if (!hs) return;
    setReview(list!.id, hs.mediaId, list!.members[hs.idx], draft);
    if (hs.idx + 1 < list!.members.length) {
      const nextM = list!.members[hs.idx + 1];
      const ex = list!.reviews[hs.mediaId]?.[nextM];
      setDraft(ex ? { ...ex } : { rating: 6, text: '' });
      setHs({ mediaId: hs.mediaId, idx: hs.idx + 1 });
    } else {
      setOpenId(hs.mediaId);
      setHs(null);
    }
  }
  async function exportCard() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'reelvy-veredito.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Nosso veredito', text: 'O veredito do nosso grupo no Reelvy' });
      } else {
        const a = document.createElement('a'); a.href = url; a.download = 'reelvy-veredito.png'; a.click();
      }
    } catch { /* cancelado */ } finally { setBusy(false); }
  }

  const cardItem = cardId ? byId(cardId) : null;

  return (
    <div className="page list-detail">
      <header className="list-detail-head">
        <button className="back" onClick={() => nav('/listas')} aria-label="Voltar"><Icon name="back" size={18} /></button>
        <div>
          <h1 className="page-title">{list.name}</h1>
          <span className="list-card-meta">{list.members.join(' · ')}</span>
        </div>
      </header>

      {!adding ? (
        <button className="btn btn-ghost add-title-btn" onClick={() => setAdding(true)}><Icon name="plus" size={16} /> Adicionar título</button>
      ) : (
        <div className="add-title">
          <input className="search-input" placeholder="Buscar título…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          <div className="add-results">
            {results.map((r) => (
              <button key={r.id} className="add-result" onClick={() => { addToList(list.id, r.id); setQuery(''); }}>
                <img src={r.poster} alt="" /><span>{r.title}</span><Icon name="plus" size={16} />
              </button>
            ))}
          </div>
          <button className="btn btn-link" onClick={() => { setAdding(false); setQuery(''); }}>Fechar</button>
        </div>
      )}

      <div className="list-items">
        {list.items.length === 0 && <p className="empty">Lista vazia. Adicione o que vocês querem ver.</p>}
        {list.items.map((mid) => {
          const it = byId(mid);
          if (!it) return null;
          const rv = list.reviews[mid] || {};
          const given = list.members.filter((m) => rv[m]);
          const avg = given.length ? given.reduce((a, m) => a + rv[m].rating, 0) / given.length : null;
          const prog = list.progress?.[mid] || {};
          const doneCount = list.members.filter((m) => prog[m]?.done).length;
          const open = openId === mid;
          return (
            <div className={`list-item ${open ? 'open' : ''}`} key={mid}>
              <button className="list-item-row" onClick={() => setOpenId(open ? null : mid)}>
                <img src={it.poster} alt="" />
                <div className="list-item-info">
                  <b>{it.title}</b>
                  <span>{doneCount}/{list.members.length} viram{avg !== null ? ` · média ${avg.toFixed(1)}` : ''}</span>
                </div>
                <span className="chev"><Icon name="chevron" size={16} /></span>
              </button>
              {open && (
                <div className="verdict-panel">
                  <div className="vp-section-label">Progresso</div>
                  {list.members.map((m) => {
                    const p = prog[m] || { ep: 0, done: false };
                    return (
                      <div className="prog-member" key={`p-${m}`}>
                        <b>{m}</b>
                        <div className="prog-controls">
                          <button className="prog-btn" onClick={() => setListProgress(list.id, mid, m, { ep: Math.max(0, p.ep - 1), done: false })} aria-label="menos um">−</button>
                          <span className="prog-state">{p.done ? 'visto' : p.ep > 0 ? `ep ${p.ep}` : '—'}</span>
                          <button className="prog-btn ep" onClick={() => setListProgress(list.id, mid, m, { ep: p.ep + 1, done: false })}>+1 ep</button>
                          <button className={`prog-done ${p.done ? 'on' : ''}`} onClick={() => setListProgress(list.id, mid, m, { ep: p.ep, done: !p.done })} aria-label="Marcar visto"><Icon name="check" size={15} /></button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="vp-section-label">Veredito</div>
                  {list.members.map((m) => (
                    <div className="vp-member" key={`v-${m}`}>
                      <b>{m}</b>
                      {rv[m] ? (
                        <span className="vp-review"><span className="vr-stars">{'★'.repeat(Math.max(1, Math.round(rv[m].rating / 2)))}</span> {rv[m].text || '—'}</span>
                      ) : (
                        <span className="vp-none">ainda não</span>
                      )}
                    </div>
                  ))}
                  <div className="vp-actions">
                    <button className="btn btn-primary" onClick={() => startVerdict(mid)}>{given.length ? 'Editar veredito' : 'Deixar veredito'}</button>
                    {given.length > 0 && <button className="btn btn-ghost" onClick={() => setCardId(mid)}>Gerar card</button>}
                    <button className="btn btn-link danger" onClick={() => { removeFromList(list.id, mid); setOpenId(null); }}>Remover</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {list.items.length > 0 && (
        <button className="btn btn-link danger del-list" onClick={() => { deleteList(list.id); nav('/listas'); }}>Apagar lista</button>
      )}

      {hs && (() => {
        const it = byId(hs.mediaId);
        const member = list.members[hs.idx];
        const stars = Math.round(draft.rating / 2);
        return (
          <div className="overlay">
            <div className="verdict-sheet">
              <div className="vs-head">{it?.title}</div>
              <div className="vs-member">Veredito de <b>{member}</b></div>
              <div className="stars big">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} className={`star ${stars >= i ? 'on' : ''}`} onClick={() => setDraft({ ...draft, rating: i * 2 })}>★</button>
                ))}
              </div>
              <textarea className="vs-text" placeholder="O que você achou? (uma linha)" maxLength={120} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
              <button className="btn btn-primary" onClick={saveAndNext}>{hs.idx + 1 < list.members.length ? `Próximo: ${list.members[hs.idx + 1]}` : 'Salvar veredito'}</button>
              <button className="btn btn-link" onClick={() => setHs(null)}>Cancelar</button>
            </div>
          </div>
        );
      })()}

      {cardItem && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setCardId(null); }}>
          <div className="card-overlay-inner">
            <VerdictCard ref={cardRef} item={cardItem} listName={list.name} members={list.members} reviews={list.reviews[cardItem.id] || {}} />
            <div className="reveal-actions">
              <button className="btn btn-primary" onClick={exportCard} disabled={busy}>{busy ? 'Gerando…' : 'Compartilhar'}</button>
              <button className="btn btn-link" onClick={() => setCardId(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
