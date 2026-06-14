import {
  doc, setDoc, getDoc, updateDoc, onSnapshot, collection, arrayUnion, serverTimestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { getDb, getAuthClient } from '../lib/firebase';
import { CATALOG } from './catalog';

// Sessão de match em tempo real (dois+ celulares). Modelo do playbook mechanic-group-decision.
// Fase 0: deck do catálogo local. Futuro: ponderar por compatibilidade (Fase 1) + filtrar por
// disponibilidade (provedores em media_meta) via Cloud Function buildSessionDeck.

export type SessionDoc = {
  host: string;
  members: string[];
  memberNames: Record<string, string>;
  status: 'open' | 'swiping' | 'matched' | 'closed';
  deck: string[];           // mediaIds
  match?: string;           // mediaId do match
};

export type Votes = Record<string, Record<string, 'up' | 'down'>>; // uid -> mediaId -> voto

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genCode(): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

function buildDeck(worlds: string[]): string[] {
  const pool = CATALOG.filter((i) => worlds.includes(i.type));
  const a = [...pool];
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a.slice(0, 16).map((i) => i.id);
}

// Garante um uid: usa o usuário logado, ou entra anônimo (requer Anonymous auth habilitado).
async function ensureUid(): Promise<string> {
  const auth = getAuthClient();
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser!.uid;
}

export async function createSession(name: string, worlds: string[]): Promise<{ sid: string; uid: string }> {
  const uid = await ensureUid();
  const sid = genCode();
  const deck = buildDeck(worlds.length ? worlds : ['movie', 'tv', 'anime']);
  await setDoc(doc(getDb(), 'sessions', sid), {
    host: uid,
    members: [uid],
    memberNames: { [uid]: name || 'Host' },
    status: 'open',
    deck,
    createdAt: serverTimestamp(),
  });
  return { sid, uid };
}

export async function joinSession(sid: string, name: string): Promise<{ uid: string }> {
  const uid = await ensureUid();
  const ref = doc(getDb(), 'sessions', sid.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Sessão não encontrada');
  if ((snap.data() as SessionDoc).status === 'closed') throw new Error('Sessão encerrada');
  await updateDoc(ref, { members: arrayUnion(uid), [`memberNames.${uid}`]: name || 'Convidado' });
  return { uid };
}

export function subscribeSession(sid: string, cb: (s: SessionDoc | null) => void) {
  return onSnapshot(doc(getDb(), 'sessions', sid.toUpperCase()), (snap) => cb(snap.exists() ? (snap.data() as SessionDoc) : null));
}

export function subscribeVotes(sid: string, cb: (v: Votes) => void) {
  return onSnapshot(collection(getDb(), 'sessions', sid.toUpperCase(), 'votes'), (snap) => {
    const votes: Votes = {};
    snap.forEach((d) => { votes[d.id] = (d.data().swipes as Record<string, 'up' | 'down'>) || {}; });
    cb(votes);
  });
}

export async function recordSwipe(sid: string, uid: string, mediaId: string, dir: 'up' | 'down') {
  await setDoc(doc(getDb(), 'sessions', sid.toUpperCase(), 'votes', uid), { swipes: { [mediaId]: dir } }, { merge: true });
}

export async function startSession(sid: string) {
  await updateDoc(doc(getDb(), 'sessions', sid.toUpperCase()), { status: 'swiping' });
}

export async function setMatch(sid: string, mediaId: string) {
  await updateDoc(doc(getDb(), 'sessions', sid.toUpperCase()), { status: 'matched', match: mediaId });
}

export async function closeSession(sid: string) {
  try { await updateDoc(doc(getDb(), 'sessions', sid.toUpperCase()), { status: 'closed' }); } catch { /* ignore */ }
}

// Detecta o primeiro título com 'up' de TODOS os membros.
export function detectMatch(deck: string[], members: string[], votes: Votes): string | null {
  for (const mid of deck) {
    if (members.length >= 2 && members.every((u) => votes[u]?.[mid] === 'up')) return mid;
  }
  return null;
}
