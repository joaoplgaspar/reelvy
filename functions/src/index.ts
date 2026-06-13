import { initializeApp } from 'firebase-admin/app';

// Admin SDK uma vez por instância — ignora as security rules (por isso o catálogo é write-only via Functions).
initializeApp();

export { resolveMedia } from './resolveMedia';
export { prewarmDiscovery } from './prewarmDiscovery';
