import { Navigate, useOutlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthContext';
import { useLibrarySync } from '../data/useLibrarySync';
import BottomNav from './BottomNav';

// Transição de rota (entrada + saída) entre as telas do app.
function AnimatedOutlet() {
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppShell() {
  const onboarded = useStore((s) => s.onboarded);
  const { mode, user, ready } = useAuth();
  useLibrarySync(mode === 'firebase' ? user?.uid : undefined);

  // Modo Firebase: espera o Auth resolver antes de decidir a rota (evita flicker).
  if (mode === 'firebase' && !ready) {
    return <div className="app splash"><div className="brand">Reelvy</div></div>;
  }

  // Conta logada implica onboarding feito (cobre login em dispositivo novo).
  const isOnboarded = onboarded || (mode === 'firebase' && !!user);
  if (!isOnboarded) return <Navigate to="/comecar" replace />;

  // Modo Firebase exige conta (signup adiado). Modo local segue sem gate.
  if (mode === 'firebase' && !user) return <Navigate to="/entrar" replace />;

  return (
    <div className="app">
      <div className="app-scroll">
        <AnimatedOutlet />
      </div>
      <BottomNav />
    </div>
  );
}
