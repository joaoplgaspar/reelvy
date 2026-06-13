import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import BottomNav from './BottomNav';

export default function AppShell() {
  const onboarded = useStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="app">
      <div className="app-scroll">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
