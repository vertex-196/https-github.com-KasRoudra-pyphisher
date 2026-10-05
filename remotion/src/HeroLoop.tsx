import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C } from './theme';

// Fondo abstracto en bucle perfecto: todo es periódico respecto a durationInFrames.
const blobs = [
  { color: C.sage, r: 0.42, x: 0.22, y: 0.35, ax: 0.08, ay: 0.06, k: 1, ph: 0 },
  { color: C.clay, r: 0.30, x: 0.78, y: 0.28, ax: 0.07, ay: 0.08, k: 1, ph: 2 },
  { color: C.gold, r: 0.26, x: 0.62, y: 0.78, ax: 0.09, ay: 0.05, k: 2, ph: 4 },
  { color: C.mist, r: 0.38, x: 0.35, y: 0.85, ax: 0.06, ay: 0.07, k: 1, ph: 1 },
  { color: C.sage, r: 0.22, x: 0.92, y: 0.70, ax: 0.05, ay: 0.09, k: 2, ph: 3 },
];

const particles = Array.from({ length: 34 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  const r = s - Math.floor(s);
  const s2 = Math.sin(i * 78.233) * 12345.678;
  const r2 = s2 - Math.floor(s2);
  return { x: r, offset: r2, size: 3 + r2 * 7, speed: 1 + (i % 2) };
});

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const t = (frame / durationInFrames) * Math.PI * 2;
  const m = Math.min(width, height);
  const breath = 0.5 + 0.5 * Math.sin(t * 2 - Math.PI / 2);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.cream} 0%, ${C.sand} 55%, #EFE4D6 100%)` }}>
      <AbsoluteFill style={{ filter: `blur(${Math.round(m * 0.085)}px)`, opacity: 0.75 }}>
        {blobs.map((b, i) => {
          const cx = (b.x + b.ax * Math.sin(t * b.k + b.ph)) * width;
          const cy = (b.y + b.ay * Math.cos(t * b.k + b.ph)) * height;
          const r = b.r * m * (1 + 0.08 * Math.sin(t * b.k + b.ph * 2));
          return (
            <div key={i} style={{
              position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2,
              borderRadius: '50%', background: b.color,
            }} />
          );
        })}
      </AbsoluteFill>

      {/* Círculo que "respira" al ritmo de una respiración lenta */}
      <svg width={width} height={height} style={{ position: 'absolute' }}>
        {[0, 1, 2].map((i) => (
          <circle key={i}
            cx={width * 0.74} cy={height * 0.5}
            r={m * (0.26 + i * 0.07) * (0.94 + 0.06 * breath)}
            fill="none" stroke={C.forest} strokeWidth={1.4}
            opacity={0.16 - i * 0.04}
          />
        ))}
      </svg>

      {particles.map((p, i) => {
        const prog = (p.offset + (frame / durationInFrames) * p.speed) % 1;
        const y = height * (1.05 - prog * 1.15);
        const x = p.x * width + Math.sin(t * p.speed + i) * 30;
        const op = Math.sin(prog * Math.PI) * 0.55;
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, width: p.size, height: p.size,
            borderRadius: '50%', background: i % 3 === 0 ? C.gold : C.cream,
            opacity: op, boxShadow: `0 0 ${p.size * 2}px ${C.cream}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
