import type { ReactElement } from 'react';

export type IconName = 'home' | 'search' | 'library' | 'profile' | 'plus';

// Ícones SÓLIDOS (fill=currentColor) — leitura mais "app", herdam a cor do .navtab.
const ICONS: Record<IconName, ReactElement> = {
  home: <path d="M11.3 3.3a1 1 0 0 1 1.4 0l8.3 7.6c.7.6.2 1.8-.7 1.8H20v7.3a1 1 0 0 1-1 1h-4.2v-5.5a2.8 2.8 0 0 0-5.6 0V21H5a1 1 0 0 1-1-1v-7.3h-.3c-.9 0-1.4-1.2-.7-1.8z" />,
  search: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.24 4.25a1.25 1.25 0 0 0 1.77-1.77l-4.25-4.24A7.5 7.5 0 0 0 10.5 3m0 3a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9"
    />
  ),
  library: <path d="M6 2.5h12a1.5 1.5 0 0 1 1.5 1.5v17a.8.8 0 0 1-1.2.68L12 19l-6.3 2.68A.8.8 0 0 1 4.5 21V4A1.5 1.5 0 0 1 6 2.5" />,
  profile: <path d="M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2M4 20.5C4 16.9 7.6 14 12 14s8 2.9 8 6.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1" />,
  plus: <path d="M11 4.5a1 1 0 0 1 2 0V11h6.5a1 1 0 0 1 0 2H13v6.5a1 1 0 0 1-2 0V13H4.5a1 1 0 0 1 0-2H11z" />,
};

export default function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
