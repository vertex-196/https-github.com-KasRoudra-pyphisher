import React from 'react';
import {
  AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import { C, sans, serif } from './theme';
import { HeroLoop } from './HeroLoop';
import { LogoMark } from './Logo';

const fadeUp = (frame: number, fps: number, delay = 0) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return { opacity: s, transform: `translateY(${(1 - s) * 40}px)` };
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <LogoMark size={260} progress={draw} />
      <div style={{ fontFamily: serif, fontSize: 210, color: C.forest, letterSpacing: 28, ...fadeUp(frame, fps, 18) }}>
        NOVA
      </div>
      <div style={{ fontFamily: sans, fontSize: 46, color: C.ink, letterSpacing: 10, textTransform: 'uppercase', ...fadeUp(frame, fps, 30) }}>
        Centro de Bienestar
      </div>
      <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 52, color: C.clay, ...fadeUp(frame, fps, 42) }}>
        Móstoles
      </div>
    </AbsoluteFill>
  );
};

const Category: React.FC<{ title: string; kicker: string; items: string[]; color: string }> = ({ title, kicker, items, color }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const wipe = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{
        background: color, clipPath: `circle(${wipe * 120}% at 50% 110%)`,
      }} />
      <AbsoluteFill style={{ padding: 110, justifyContent: 'center', color: C.cream }}>
        <div style={{ fontFamily: sans, fontSize: 40, letterSpacing: 8, textTransform: 'uppercase', ...fadeUp(frame, fps, 8) }}>
          <span style={{ opacity: 0.85 }}>
          {kicker}</span>
        </div>
        <div style={{ fontFamily: serif, fontSize: 170, lineHeight: 1.05, margin: '20px 0 60px', ...fadeUp(frame, fps, 12) }}>
          {title}
        </div>
        {items.map((it, i) => (
          <div key={it} style={{
            fontFamily: sans, fontSize: 62, padding: '18px 0',
            borderTop: `1.5px solid rgba(251,248,243,0.35)`, ...fadeUp(frame, fps, 20 + i * 6),
          }}>
            {it}
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 100, gap: 34 }}>
      <LogoMark size={150} />
      <div style={{ fontFamily: serif, fontSize: 120, lineHeight: 1.05, color: C.forest, ...fadeUp(frame, fps, 4) }}>
        Tu momento<br />empieza aquí
      </div>
      <div style={{
        fontFamily: sans, fontSize: 56, fontWeight: 500, color: C.cream, background: C.clay,
        padding: '30px 60px', borderRadius: 999, ...fadeUp(frame, fps, 14),
      }}>
        Pide cita · 645 265 946
      </div>
      <div style={{ fontFamily: sans, fontSize: 40, color: C.ink, lineHeight: 1.5, ...fadeUp(frame, fps, 22) }}>
        Paseo de Goya 26 · Móstoles<br />novamostoles.com
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => (
  <AbsoluteFill>
    <HeroLoop />
    <Sequence durationInFrames={95}><Intro /></Sequence>
    <Sequence from={95} durationInFrames={80}>
      <Category kicker="Moverse bien" title="Clases" color={C.forest}
        items={['Pilates suelo', 'Yoga', 'Hipopresivos', 'Circuito funcional', 'Taichí']} />
    </Sequence>
    <Sequence from={175} durationInFrames={80}>
      <Category kicker="Soltar tensión" title="Terapias" color={C.clay}
        items={['Drenaje linfático', 'Maderoterapia', 'Masaje holístico', 'Osteopatía', 'Reflexología']} />
    </Sequence>
    <Sequence from={255} durationInFrames={80}>
      <Category kicker="Cuidarse por fuera" title="Estética" color="#B48A45"
        items={['Lifting de pestañas', 'Microblading', 'Spa capilar']} />
    </Sequence>
    <Sequence from={335}><Outro /></Sequence>
  </AbsoluteFill>
);
