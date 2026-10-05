import React from 'react';
import { C } from './theme';

// Marca provisional: tres hojas dentro de un círculo. Sustituir por el logo real del centro.
export const LogoMark: React.FC<{ size: number; color?: string; progress?: number }> = ({
  size,
  color = C.forest,
  progress = 1,
}) => {
  const len = 2 * Math.PI * 46;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle
        cx="50" cy="50" r="46" stroke={color} strokeWidth="2.2"
        strokeDasharray={len} strokeDashoffset={len * (1 - progress)}
        strokeLinecap="round" transform="rotate(-90 50 50)"
      />
      <g opacity={Math.min(1, progress * 1.4)} fill={color}>
        <path d="M50 72 C38 60 38 42 50 26 C62 42 62 60 50 72Z" />
        <path d="M48 72 C34 70 24 60 22 46 C34 48 44 56 48 72Z" opacity="0.7" />
        <path d="M52 72 C66 70 76 60 78 46 C66 48 56 56 52 72Z" opacity="0.7" />
      </g>
    </svg>
  );
};
