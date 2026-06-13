import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Worlds from '../components/Worlds';
import TapGrid from '../components/TapGrid';
import CardStudio from '../components/CardStudio';
import { CatalogItem } from '../data/catalog';
import { useStore } from '../store/useStore';
import { useAuth } from '../app/AuthContext';

type Step = 'worlds' | 'grid' | 'reveal';

export default function Onboarding() {
  const [step, setStep] = useState<Step>('worlds');
  const [worlds, setWorlds] = useState<string[]>(['movie', 'tv', 'anime']);
  const [selected, setSelected] = useState<CatalogItem[]>([]);
  const complete = useStore((s) => s.completeOnboarding);
  const { mode } = useAuth();
  const nav = useNavigate();

  function finish() {
    complete(selected, worlds);
    // signup adiado: modo Firebase salva criando conta; local entra direto.
    nav(mode === 'firebase' ? '/entrar' : '/');
  }

  return (
    <div className="app onboarding-app">
      {step === 'worlds' && (
        <Worlds worlds={worlds} setWorlds={setWorlds} onNext={() => setStep('grid')} />
      )}
      {step === 'grid' && (
        <TapGrid
          worlds={worlds}
          selected={selected}
          setSelected={setSelected}
          onNext={() => setStep('reveal')}
          onBack={() => setStep('worlds')}
        />
      )}
      {step === 'reveal' && (
        <div className="screen reveal">
          <div className="screen-head">
            <div className="brand">Reelvy</div>
            <h1 className="title">Seu card</h1>
          </div>
          <CardStudio picks={selected} formats={['identity']} />
          <button className="btn btn-primary onboarding-cta" onClick={finish}>Salvar meu perfil →</button>
          {mode === 'local' && (
            <p className="hint">Salvo <b>neste dispositivo</b>. O login real liga com o Firebase.</p>
          )}
        </div>
      )}
    </div>
  );
}
