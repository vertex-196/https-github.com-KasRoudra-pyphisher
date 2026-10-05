import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Misma paleta que la web (web-src/styles.css).
export const C = {
  forest: '#2E4A3B',
  sage: '#8FAE8B',
  mist: '#DCE6D9',
  sand: '#F5EEE4',
  cream: '#FBF8F3',
  clay: '#C47A5A',
  gold: '#D8B26E',
  ink: '#1E2A23',
};

// Fuentes autoalojadas (las mismas woff2 que usa la web).
export const serif = 'Fraunces';
export const sans = 'DM Sans';
loadFont({ family: serif, url: staticFile('fonts/fraunces-latin-wght-normal.woff2'), weight: '300 900' });
loadFont({ family: serif, url: staticFile('fonts/fraunces-latin-wght-italic.woff2'), weight: '300 900', style: 'italic' });
loadFont({ family: sans, url: staticFile('fonts/dm-sans-latin-wght-normal.woff2'), weight: '100 1000' });
