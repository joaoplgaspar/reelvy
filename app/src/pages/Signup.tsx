import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/auth';

// "G" do Google (4 cores) — padrão reconhecível de botão social.
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.63z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

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
      <div className="app auth-screen">
        <div className="auth-box">
          <div className="auth-logo">Reelvy</div>
          <h1 className="auth-headline">Quase lá</h1>
          <p className="auth-sub">O login real liga quando o Firebase estiver configurado. Por ora, seu perfil fica salvo neste dispositivo.</p>
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
    <div className="app auth-screen">
      <div className="auth-box">
        <div className="auth-logo">Reelvy</div>
        <h1 className="auth-headline">{isNew ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1>
        <p className="auth-sub">Salve sua biblioteca, acompanhe episódios e refaça seu card quando quiser.</p>

        <button className="btn btn-google" disabled={busy} onClick={() => run(signInWithGoogle)}>
          <GoogleG /> Continuar com Google
        </button>

        <div className="auth-divider"><span>ou</span></div>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Senha"
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

        <p className="auth-toggle">
          {isNew ? 'Já tem conta?' : 'Novo por aqui?'}{' '}
          <button className="auth-link" onClick={() => setIsNew((v) => !v)}>
            {isNew ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  );
}
