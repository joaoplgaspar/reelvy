import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthContext';
import { useLibrarySync } from '../data/useLibrarySync';
import BottomNav from './BottomNav';

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
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
