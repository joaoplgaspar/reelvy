import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Worlds from '../components/Worlds';
import TapGrid from '../components/TapGrid';
import CardStudio from '../components/CardStudio';
import { CatalogItem } from '../data/catalog';
import { useStore } from '../store/useStore';
import { useAuth } from '../app/AuthContext';

type Step = 'worlds' | 'grid' | 'reveal';
const STEPS: Step[] = ['worlds', 'grid', 'reveal'];

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
      <div className="ob-progress">
        {STEPS.map((s) => (
          <span key={s} className={`ob-dot ${STEPS.indexOf(step) >= STEPS.indexOf(s) ? 'is-on' : ''}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="ob-step"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
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
              <motion.div
                className="screen-head"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <div className="brand">Reelvy</div>
                <h1 className="title">Esse é o seu gosto</h1>
              </motion.div>

              <motion.div
                className="reveal-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.16, type: 'spring', stiffness: 200, damping: 18 }}
              >
                <CardStudio picks={selected} formats={['identity']} />
              </motion.div>

              <button className="btn btn-primary onboarding-cta" onClick={finish}>Salvar meu perfil →</button>
              {mode === 'local' && (
                <p className="hint">Salvo <b>neste dispositivo</b>. O login real liga com o Firebase.</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
