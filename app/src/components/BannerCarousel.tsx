import { Link } from 'react-router-dom';

const SLIDES = [
  { kicker: 'Decida junto', title: 'O que vamos ver hoje?', sub: 'Cada um desliza até dar match', cta: 'Começar partida', to: '/match', hero: true },
  { kicker: 'Em grupo', title: 'Suas listas', sub: 'Casal ou grupo: decidam e avaliem juntos', cta: 'Ver listas', to: '/listas', hero: false },
  { kicker: 'Seu gosto', title: 'Seu perfil de gosto', sub: 'Veja seu arquétipo e monte seu card', cta: 'Ver perfil', to: '/perfil', hero: false },
];

export default function BannerCarousel() {
  return (
    <div className="banner-carousel">
      {SLIDES.map((s, i) => (
        <div className={`banner-slide ${s.hero ? 'hero' : ''}`} key={i}>
          <span className="banner-kicker">{s.kicker}</span>
          <h3 className="banner-title">{s.title}</h3>
          <p className="banner-sub">{s.sub}</p>
          <Link to={s.to} className="banner-cta">{s.cta}</Link>
        </div>
      ))}
    </div>
  );
}
