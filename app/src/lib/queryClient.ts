import { QueryClient } from '@tanstack/react-query';

// Cache no cliente = a MAIOR alavanca de custo (corta leituras Firestore 50-80%).
// Ver docs/ARQUITETURA-FASE-0.md §9. (persistência em IndexedDB é o próximo incremento.)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 1h fresco
      gcTime: 24 * 60 * 60 * 1000, // 24h em cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
