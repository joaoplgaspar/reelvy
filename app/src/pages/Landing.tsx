import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';

// Porta de entrada (web). Estrutura primeiro — o visual entra no pass de layout.
export default function Landing() {
  const nav = useNavigate();
  const { mode } = useAuth();
  return (
    <div className="app">
      <div className="screen landing">
        <div className="landing-top">
          <div className="brand">Reelvy</div>
          <h1 className="title">O lar de quem assiste de tudo.</h1>
          <p className="landing-sub">
            Anime, série e filme num só lugar. Descubra seu perfil de gosto em ~90 segundos — e leve um card pra compartilhar.
          </p>
        </div>
        <div className="landing-cta">
          <button className="btn btn-primary" onClick={() => nav('/onboarding')}>Descobrir meu perfil →</button>
          {mode === 'firebase' && (
            <button className="btn btn-link" onClick={() => nav('/entrar')}>Já tenho conta</button>
          )}
        </div>
      </div>
    </div>
  );
}
