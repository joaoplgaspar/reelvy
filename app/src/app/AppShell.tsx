import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from './AuthContext';
import BottomNav from './BottomNav';

export default function AppShell() {
  const onboarded = useStore((s) => s.onboarded);
  const { mode, user, ready } = useAuth();

  if (!onboarded) return <Navigate to="/onboarding" replace />;

  // Modo Firebase: o app exige conta (signup adiado). Modo local segue sem gate.
  if (mode === 'firebase') {
    if (!ready) return <div className="app splash"><div className="brand">Reelvy</div></div>;
    if (!user) return <Navigate to="/entrar" replace />;
  }

  return (
    <div className="app">
      <div className="app-scroll">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
