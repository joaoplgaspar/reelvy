import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { isFirebaseConfigured } from '../lib/firebase';
import { onAuthChange } from '../lib/auth';

type AuthMode = 'local' | 'firebase';

interface AuthState {
  /** 'local' = sem backend (estado no dispositivo). 'firebase' = Auth real ligado. */
  mode: AuthMode;
  user: User | null;
  /** false enquanto o Firebase resolve o estado inicial de login (evita flicker no gate). */
  ready: boolean;
}

const MODE: AuthMode = isFirebaseConfigured ? 'firebase' : 'local';

const Ctx = createContext<AuthState>({ mode: MODE, user: null, ready: MODE === 'local' });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(MODE === 'local');

  useEffect(() => {
    if (MODE === 'local') return; // modo local: nada a observar
    return onAuthChange((u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  return <Ctx.Provider value={{ mode: MODE, user, ready }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
