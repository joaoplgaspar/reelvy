// Bloco de carregamento com shimmer. Use no lugar de "Carregando…".
export default function Skeleton({ style, className = '' }: { style?: React.CSSProperties; className?: string }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}
