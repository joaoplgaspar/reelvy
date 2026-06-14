import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Admin SDK uma vez por instância — ignora as security rules (por isso o catálogo é write-only via Functions).
initializeApp();
// Evita 500 ao gravar docs com campos undefined (ex.: filme sem 'episodes'/'rating').
getFirestore().settings({ ignoreUndefinedProperties: true });

export { resolveMedia } from './resolveMedia';
export { prewarmDiscovery } from './prewarmDiscovery';
export { searchMedia } from './searchMedia';
