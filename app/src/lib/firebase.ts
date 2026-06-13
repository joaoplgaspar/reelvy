import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';

// Config do Firebase Web SDK — vem das envs VITE_FIREBASE_* (ver app/.env.example).
// O Web config NÃO é segredo (chaves de API ficam nas Functions/Secret Manager).
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** true quando as VITE_FIREBASE_* estão preenchidas. Sem isso, o app roda no estado local. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;
function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado — defina as VITE_FIREBASE_* (ver app/.env.example).');
  }
  if (!app) app = getApps().length ? getApp() : initializeApp(config);
  return app;
}

// Getters preguiçosos: nada inicializa até a primeira chamada (não quebra o app local).
export const getAuthClient = (): Auth => getAuth(ensureApp());
export const getDb = (): Firestore => getFirestore(ensureApp());
export const getFns = (): Functions => getFunctions(ensureApp());
