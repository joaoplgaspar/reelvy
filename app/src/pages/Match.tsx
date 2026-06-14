import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CatalogItem } from '../data/catalog';
import { byId } from '../data/queries';
import SwipeDeck from '../components/SwipeDeck';
import Icon from '../components/Icon';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  createSession, joinSession, subscribeSession, subscribeVotes, recordSwipe,
  startSession, setMatch, closeSession, detectMatch, SessionDoc, Votes,
} from '../data/session';

const WORLDS = [
  { key: 'movie', label: 'Filmes' },
  { key: 'tv', label: 'Séries' },
  { key: 'anime', label: 'Animes' },
];

type Phase = 'home' | 'createSetup' | 'join' | 'session';

export default function Match() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<Phase>('home');
  const [name, setName] = useState('');
  const [worlds, setWorlds] = useState<string[]>(['movie', 'tv', 'anime']);
  const [joinCode, setJoinCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [sid, setSid] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [session, setSession] = useState<SessionDoc | null>(null);
  const [votes, setVotes] = useState<Votes>({});
  const [iFinished, setIFinished] = useState(false);

  useEffect(() => {
    if (!sid) return;
    const unsubS = subscribeSession(sid, setSession);
    const unsubV = subscribeVotes(sid, setVotes);
    return () => { unsubS(); unsubV(); };
  }, [sid]);

  // host detecta o match (todos deram 'up' no mesmo título)
  useEffect(() => {
    if (!isHost || !sid || !session || session.status !== 'swiping' || session.match) return;
    const m = detectMatch(session.deck, session.members, votes);
    if (m) setMatch(sid, m).catch(() => {});
  }, [isHost, sid, session, votes]);

  const toggleWorld = (k: string) => setWorlds((w) => (w.includes(k) ? w.filter((x) => x !== k) : [...w, k]));

  async function doCreate() {
    setErr(''); setBusy(true);
    try { const r = await createSession(name, worlds); setSid(r.sid); setUid(r.uid); setIsHost(true); setPhase('session'); }
    catch (e: any) { setErr(traduz(e)); } finally { setBusy(false); }
  }
  async function doJoin() {
    setErr(''); setBusy(true);
    try { const code = joinCode.trim().toUpperCase(); const r = await joinSession(code, name); setSid(code); setUid(r.uid); setIsHost(false); setPhase('session'); }
    catch (e: any) { setErr(traduz(e)); } finally { setBusy(false); }
  }
  function traduz(e: any): string {
    const c = e?.code || e?.message || '';
    if (String(c).includes('não encontrada')) return 'Sessão não encontrada. Confira o código.';
    if (String(c).includes('encerrada')) return 'Essa partida já foi encerrada.';
    if (String(c).includes('admin-restricted') || String(c).includes('operation-not-allowed')) return 'Ative o login Anônimo no Firebase (Authentication).';
    return 'Algo deu errado. Tente de novo.';
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="page">
        <header className="page-head"><h1 className="page-title">Partida</h1></header>
        <p className="empty">A partida em dois celulares precisa do Firebase configurado (<b>app/.env</b>). Veja docs/BACKEND-SETUP.md.</p>
        <button className="btn btn-ghost" onClick={() => nav('/')}>Voltar</button>
      </div>
    );
  }

  if (phase === 'home') {
    return (
      <div className="page match-setup">
        <header className="page-head"><h1 className="page-title">O que vamos ver?</h1></header>
        <p className="muted-line">Cada um no seu celular. Deslizem até dar match.</p>
        <input className="search-input" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={14} style={{ marginTop: 18 }} />
        <div className="match-home-actions">
          <button className="btn btn-primary" onClick={() => setPhase('createSetup')}>Criar partida</button>
          <button className="btn btn-ghost" onClick={() => setPhase('join')}>Entrar com código</button>
        </div>
      </div>
    );
  }

  if (phase === 'createSetup') {
    return (
      <div className="page match-setup">
        <header className="list-detail-head"><button className="back" onClick={() => setPhase('home')}><Icon name="back" size={18} /></button><h1 className="page-title">Criar partida</h1></header>
        <div className="setup-block">
          <span className="setup-label">De quê?</span>
          <div className="world-chips">{WORLDS.map((w) => (<button key={w.key} className={`chip-toggle ${worlds.includes(w.key) ? 'is-on' : ''}`} onClick={() => toggleWorld(w.key)}>{w.label}</button>))}</div>
        </div>
        {err && <p className="auth-err">{err}</p>}
        <button className="btn btn-primary match-start" onClick={doCreate} disabled={busy}>{busy ? 'Criando…' : 'Criar e convidar'}</button>
      </div>
    );
  }

  if (phase === 'join') {
    return (
      <div className="page match-setup">
        <header className="list-detail-head"><button className="back" onClick={() => setPhase('home')}><Icon name="back" size={18} /></button><h1 className="page-title">Entrar na partida</h1></header>
        <input className="search-input code-input" placeholder="CÓDIGO" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={4} style={{ marginTop: 14 }} />
        {err && <p className="auth-err">{err}</p>}
        <button className="btn btn-primary match-start" onClick={doJoin} disabled={busy || joinCode.trim().length < 4}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </div>
    );
  }

  if (!session) return <div className="page"><p className="empty">Conectando…</p></div>;

  if (session.status === 'open') {
    const members = session.members.map((u) => session.memberNames[u] || '…');
    return (
      <div className="page reveal-page">
        <span className="banner-kicker">Sua partida</span>
        <div className="session-code">{sid}</div>
        <p className="muted-line">Diga o código pro outro celular entrar.</p>
        <div className="lobby-members">
          {members.map((m, i) => (<div className="lobby-member" key={i}><Icon name="profile" size={16} /> {m}</div>))}
          {session.members.length < 2 && <div className="lobby-member waiting"><Icon name="users" size={16} /> aguardando…</div>}
        </div>
        <div className="reveal-actions">
          {isHost
            ? <button className="btn btn-primary" disabled={session.members.length < 2} onClick={() => startSession(sid!)}>{session.members.length < 2 ? 'Esperando alguém entrar' : 'Começar a deslizar'}</button>
            : <p className="muted-line">Esperando o host começar…</p>}
          <button className="btn btn-link" onClick={() => { closeSession(sid!); nav('/'); }}>Sair</button>
        </div>
      </div>
    );
  }

  if (session.status === 'swiping') {
    const items = session.deck.map(byId).filter(Boolean) as CatalogItem[];
    return (
      <div className="page swipe-page">
        <header className="swipe-head">
          <button className="back" onClick={() => { closeSession(sid!); nav('/'); }}><Icon name="back" size={18} /></button>
          <div className="swipe-turn">Deslizando <b>juntos</b></div>
        </header>
        {iFinished ? (
          <div className="deck"><p className="empty">Você já deslizou tudo. Esperando o match aparecer…</p></div>
        ) : (
          <SwipeDeck key={sid} items={items} onSwipe={(mid, dir) => recordSwipe(sid!, uid!, mid, dir)} onComplete={() => setIFinished(true)} />
        )}
      </div>
    );
  }

  if (session.status === 'matched' && session.match) {
    const it = byId(session.match);
    return (
      <div className="page reveal-page">
        <div className="match-burst">É um match! <Icon name="flame" size={22} /></div>
        <p className="muted-line">Todo mundo curtiu:</p>
        {it && (
          <button className="match-item" style={{ maxWidth: 340, width: '100%' }} onClick={() => nav(`/titulo/${it.type}/${it.id.split(':')[1]}`)}>
            <img src={it.poster} alt={it.title} /><div><b>{it.title}</b><span>{it.genres.join(' · ')}</span></div>
          </button>
        )}
        <div className="reveal-actions">
          <button className="btn btn-link" onClick={() => { closeSession(sid!); nav('/'); }}>Encerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page reveal-page">
      <p className="empty">A partida foi encerrada.</p>
      <button className="btn btn-primary" style={{ maxWidth: 280 }} onClick={() => nav('/')}>Voltar pra Home</button>
    </div>
  );
}
