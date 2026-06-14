import { createBrowserRouter } from 'react-router-dom';
import AppShell from './app/AppShell';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import QuickLog from './pages/QuickLog';
import Match from './pages/Match';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';

export const router = createBrowserRouter([
  { path: '/comecar', element: <Landing /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/entrar', element: <Signup /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'buscar', element: <Search /> },
      { path: 'biblioteca', element: <Library /> },
      { path: 'log', element: <QuickLog /> },
      { path: 'match', element: <Match /> },
      { path: 'listas', element: <Lists /> },
      { path: 'listas/:id', element: <ListDetail /> },
      { path: 'perfil', element: <Profile /> },
      { path: 'titulo/:type/:id', element: <Detail /> },
    ],
  },
]);
