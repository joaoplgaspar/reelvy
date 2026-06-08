import { NavLink, useNavigate } from 'react-router-dom';

const cls = ({ isActive }: { isActive: boolean }) => `navtab ${isActive ? 'is-on' : ''}`;

export default function BottomNav() {
  const nav = useNavigate();
  return (
    <nav className="bottomnav">
      <NavLink to="/" end className={cls}><span className="navicon">🏠</span><b>Home</b></NavLink>
      <NavLink to="/buscar" className={cls}><span className="navicon">🔍</span><b>Buscar</b></NavLink>
      <button className="navtab navtab-plus" onClick={() => nav('/buscar')} aria-label="Adicionar">
        <span>＋</span>
      </button>
      <NavLink to="/biblioteca" className={cls}><span className="navicon">🗂️</span><b>Biblioteca</b></NavLink>
      <NavLink to="/perfil" className={cls}><span className="navicon">👤</span><b>Perfil</b></NavLink>
    </nav>
  );
}
