import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, sans, serif } from './theme';
import { HeroLoop } from './HeroLoop';
import { LogoMark } from './Logo';

export const OgImage: React.FC = () => (
  <AbsoluteFill>
    <HeroLoop />
    <AbsoluteFill style={{ padding: '70px 80px', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <LogoMark size={74} />
        <div style={{ fontFamily: serif, fontSize: 46, letterSpacing: 8, color: C.forest }}>NOVA</div>
      </div>
      <div>
        <div style={{ fontFamily: serif, fontSize: 78, lineHeight: 1.05, color: C.ink, maxWidth: 820 }}>
          Centro de Bienestar <span style={{ color: C.clay, fontStyle: 'italic' }}>en Móstoles</span>
        </div>
        <div style={{ fontFamily: sans, fontSize: 30, color: C.forest, marginTop: 22 }}>
          Pilates · Yoga · Hipopresivos · Masajes · Drenaje · Estética
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
