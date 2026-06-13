import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const cls = ({ isActive }: { isActive: boolean }) => `navtab ${isActive ? 'is-on' : ''}`;

export default function BottomNav() {
  const nav = useNavigate();
  return (
    <nav className="bottomnav">
      <NavLink to="/" end className={cls}><span className="navicon"><Icon name="home" /></span><b>Home</b></NavLink>
      <NavLink to="/buscar" className={cls}><span className="navicon"><Icon name="search" /></span><b>Buscar</b></NavLink>
      <button className="navtab navtab-plus" onClick={() => nav('/log')} aria-label="Registrar">
        <Icon name="plus" size={26} />
      </button>
      <NavLink to="/biblioteca" className={cls}><span className="navicon"><Icon name="library" /></span><b>Biblioteca</b></NavLink>
      <NavLink to="/perfil" className={cls}><span className="navicon"><Icon name="profile" /></span><b>Perfil</b></NavLink>
    </nav>
  );
}
