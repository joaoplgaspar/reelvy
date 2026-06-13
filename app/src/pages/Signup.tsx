import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/auth';

// Signup ADIADO (value-first): a pessoa só chega aqui depois de receber o card no onboarding.
export default function Signup() {
  const { mode } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Modo local: sem backend de auth — segue sem conta (perfil fica no dispositivo).
  if (mode === 'local') {
    return (
      <div className="app">
        <div className="screen auth">
          <div className="screen-head">
            <div className="brand">Reelvy</div>
            <h1 className="title">Quase lá</h1>
          </div>
          <p className="hint" style={{ margin: '0 0 22px' }}>
            O login real liga quando o Firebase estiver configurado. Por ora, seu perfil fica salvo <b>neste dispositivo</b>.
          </p>
          <button className="btn btn-primary" onClick={() => nav('/')}>Continuar sem conta →</button>
        </div>
      </div>
    );
  }

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      nav('/'); // AuthContext capta o login via onAuthChange e o gate libera o app
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Não rolou. Tenta de novo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app">
      <div className="screen auth">
        <div className="screen-head">
          <div className="brand">Reelvy</div>
          <h1 className="title">Salve seu perfil</h1>
        </div>
        <p className="hint" style={{ margin: '0 0 22px' }}>
          Salve sua biblioteca, acompanhe episódios e refaça seu card quando quiser.
        </p>

        <div className="auth-form">
          <button className="btn btn-ghost" disabled={busy} onClick={() => run(signInWithGoogle)}>
            Continuar com Google
          </button>

          <div className="auth-divider"><span>ou</span></div>

          <input
            className="auth-input"
            type="email"
            placeholder="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="senha"
            value={pass}
            autoComplete={isNew ? 'new-password' : 'current-password'}
            onChange={(e) => setPass(e.target.value)}
          />

          {err && <p className="auth-err">{err}</p>}

          <button
            className="btn btn-primary"
            disabled={busy || !email || !pass}
            onClick={() => run(() => (isNew ? signUpWithEmail : signInWithEmail)(email, pass))}
          >
            {busy ? '…' : isNew ? 'Criar conta' : 'Entrar'}
          </button>

          <button className="btn btn-link" onClick={() => setIsNew((v) => !v)}>
            {isNew ? 'Já tenho conta' : 'Criar uma conta'}
          </button>
        </div>
      </div>
    </div>
  );
}
