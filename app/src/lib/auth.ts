import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuthClient, getDb } from './firebase';

/** Cria users/{uid} no primeiro login (ver schema em docs/ARQUITETURA-FASE-0.md §4). */
async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(getDb(), 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName ?? '',
      avatar: user.photoURL ?? '',
      email: user.email ?? '',
      createdAt: Date.now(),
    });
  }
}

export async function signInWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(getAuthClient(), new GoogleAuthProvider());
  await ensureUserDoc(cred.user).catch((e) => console.warn('Perfil users/{uid} não gravado — Firestore configurado?', e));
  return cred.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(getAuthClient(), email, password);
  await ensureUserDoc(cred.user).catch((e) => console.warn('Perfil users/{uid} não gravado — Firestore configurado?', e));
  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(getAuthClient(), email, password);
  return cred.user;
}

export function signOutUser(): Promise<void> {
  return signOut(getAuthClient());
}

/** Observa login/logout. Retorna o unsubscribe. */
export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getAuthClient(), cb);
}
