import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
// Mismo motor de posturas que la web: la figura del vídeo y la de novamostoles.com son idénticas.
// @ts-expect-error módulo JS compartido sin tipos
import { POSES, STEPS, poseAt, stepToKey, figurePaths } from '../../web-src/poses.mjs';
import { C, sans, serif } from './theme';
import { LogoMark } from './Logo';

const START = 30;
const PER_STEP = 66;
const END_FLOW = START + PER_STEP * (STEPS.length - 1);

export const SUNFLOW_FRAMES = END_FLOW + 150;

const Figure: React.FC<{ step: number; sunY: number }> = ({ step, sunY }) => {
  const p = figurePaths(poseAt(stepToKey(step)));
  return (
    <svg viewBox="0 0 420 420" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset=".55" stopColor="#e8c27f" />
          <stop offset="1" stopColor="#d8b26e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="290" cy={sunY} r="120" fill="url(#sun)" />
      <g fill="none" stroke={C.gold} strokeWidth="1" opacity=".35">
        <circle cx="290" cy={sunY} r="150" />
        <circle cx="290" cy={sunY} r="185" />
      </g>
      <path d="M0 360 H420 V420 H0Z" fill="#efe2d1" />
      <rect x="56" y="358" width="308" height="8" rx="4" fill={C.clay} opacity=".85" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={p.legBack} stroke={C.sage} strokeWidth="11" />
        <path d={p.armBack} stroke={C.sage} strokeWidth="9" />
        <path d={p.torso} stroke={C.forest} strokeWidth="15" />
        <path d={p.leg} stroke={C.forest} strokeWidth="12" />
        <path d={p.arm} stroke={C.forest} strokeWidth="10" />
      </g>
      <circle cx={p.bun[0]} cy={p.bun[1]} r="8" fill={C.forest} />
      <circle cx={p.head[0]} cy={p.head[1]} r="16" fill={C.forest} />
    </svg>
  );
};

export const SunFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = interpolate(frame, [START, END_FLOW], [0, STEPS.length - 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sunY = interpolate(frame, [0, END_FLOW], [400, 120], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const active = Math.round(step);
  const pose = POSES[STEPS[active]];
  // Fundido de la palabra de respiración al cambiar de postura
  const local = (frame - START) - active * PER_STEP;
  const wordIn = interpolate(local, [-PER_STEP / 2, -PER_STEP / 2 + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const intro = spring({ frame, fps, config: { damping: 200 } });
  const outro = interpolate(frame, [END_FLOW + 30, END_FLOW + 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const breath = 0.94 + 0.06 * Math.sin((frame / fps) * (Math.PI * 2 / 10));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream} 0%, ${C.sand} 100%)`, fontFamily: sans }}>
      <AbsoluteFill style={{ padding: '120px 80px', alignItems: 'center' }}>
        <div style={{ opacity: intro, transform: `translateY(${(1 - intro) * 30}px)`, textAlign: 'center' }}>
          <div style={{ fontSize: 30, letterSpacing: 10, textTransform: 'uppercase', color: C.clay, marginBottom: 18 }}>Saludo al sol</div>
          <div style={{ fontFamily: serif, fontSize: 86, lineHeight: 1.05, color: C.ink }}>
            Ocho posturas,<br /><span style={{ fontStyle: 'italic', color: C.clay }}>una respiración</span>
          </div>
        </div>
        <div style={{ width: 900, height: 900, marginTop: 70, borderRadius: 60, overflow: 'hidden', background: 'linear-gradient(180deg,#f1e4d6,#f8efe4)', boxShadow: 'inset 0 0 0 2px rgba(30,42,35,.08)', transform: `scale(${0.96 + intro * 0.04})` }}>
          <Figure step={step} sunY={sunY} />
        </div>
        <div style={{ marginTop: 60, textAlign: 'center', opacity: (1 - outro) * wordIn }}>
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 130, lineHeight: 1, color: C.clay }}>{pose.breath}</div>
          <div style={{ fontFamily: serif, fontSize: 52, color: C.ink, marginTop: 20 }}>{pose.sanskrit}</div>
          <div style={{ fontSize: 34, color: '#56645b', marginTop: 8 }}>{pose.name}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.forest, opacity: outro, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 40 }}>
        <div style={{ transform: `scale(${breath})` }}><LogoMark size={200} color={C.cream} progress={outro} /></div>
        <div style={{ fontFamily: serif, fontSize: 150, letterSpacing: 24, color: C.cream }}>NOVA</div>
        <div style={{ fontSize: 38, letterSpacing: 10, textTransform: 'uppercase', color: C.gold }}>Yoga en Móstoles</div>
        <div style={{ marginTop: 30, fontSize: 52, fontWeight: 500, color: '#fff', background: '#a65a3a', padding: '30px 64px', borderRadius: 999 }}>Pide cita · 645 265 946</div>
        <div style={{ fontSize: 38, color: 'rgba(251,248,243,.8)' }}>novamostoles.com</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
