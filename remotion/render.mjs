// Renderiza la imagen para compartir (web/assets/media) y los reels para redes (redes/).
// HeroLoop sigue disponible en el Studio como fondo animado para redes.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const out = '../web/assets/media';
mkdirSync(out, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? ['--browser-executable', process.env.REMOTION_BROWSER] : [];
const run = (...args) => execFileSync('npx', ['remotion', ...args, ...browser], { stdio: 'inherit' });

run('still', 'src/index.ts', 'OgImage', `${out}/og-nova-mostoles.jpg`, '--image-format=jpeg', '--jpeg-quality=88');
// Reel vertical para Instagram/TikTok (no se publica en la web)
mkdirSync('../redes', { recursive: true });
run('render', 'src/index.ts', 'Reel', '../redes/reel-nova-mostoles.mp4', '--codec=h264', '--crf=23');
run('render', 'src/index.ts', 'SunFlow', '../redes/reel-saludo-al-sol.mp4', '--codec=h264', '--crf=23');
