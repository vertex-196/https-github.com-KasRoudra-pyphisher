// Renderiza todos los recursos de vídeo/imagen y los deja en web/assets/media.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const out = '../web/assets/media';
mkdirSync(out, { recursive: true });
const browser = process.env.REMOTION_BROWSER ? ['--browser-executable', process.env.REMOTION_BROWSER] : [];
const run = (...args) => execFileSync('npx', ['remotion', ...args, ...browser], { stdio: 'inherit' });

run('render', 'src/index.ts', 'HeroLoop', `${out}/hero.mp4`, '--codec=h264', '--crf=30');
run('render', 'src/index.ts', 'HeroLoop', `${out}/hero.webm`, '--codec=vp9', '--crf=40');
run('render', 'src/index.ts', 'HeroLoopMobile', `${out}/hero-mobile.mp4`, '--codec=h264', '--crf=30');
run('still', 'src/index.ts', 'HeroLoop', `${out}/hero-poster.jpg`, '--frame=0', '--image-format=jpeg', '--jpeg-quality=80');
run('still', 'src/index.ts', 'OgImage', `${out}/og-nova-mostoles.jpg`, '--image-format=jpeg', '--jpeg-quality=88');
// Reel vertical para Instagram/TikTok (no se publica en la web)
mkdirSync('../redes', { recursive: true });
run('render', 'src/index.ts', 'Reel', '../redes/reel-nova-mostoles.mp4', '--codec=h264', '--crf=23');
