import { createBrowserRouter } from 'react-router-dom';
import AppShell from './app/AppShell';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

export const router = createBrowserRouter([
  { path: '/onboarding', element: <Onboarding /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'buscar', element: <Search /> },
      { path: 'biblioteca', element: <Library /> },
      { path: 'perfil', element: <Profile /> },
      { path: 'titulo/:type/:id', element: <Detail /> },
    ],
  },
]);
