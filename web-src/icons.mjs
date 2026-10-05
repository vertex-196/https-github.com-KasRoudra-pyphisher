// Iconos SVG de línea, sin dependencias. Todos heredan currentColor.
const svg = (body, extra = '') =>
  `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;

export const icons = {
  pilates: svg('<circle cx="34" cy="13" r="4"/><path d="M6 38h36"/><path d="M10 38c3-8 8-12 14-13l8-1"/><path d="M24 25l6 13"/><path d="M32 24l6-6"/>'),
  yoga: svg('<circle cx="24" cy="9" r="4"/><path d="M24 14v13"/><path d="M12 20c4 3 8 4 12 4s8-1 12-4"/><path d="M24 27l-9 9h18l-9-9"/><path d="M8 40h32"/>'),
  breath: svg('<path d="M24 6v14"/><path d="M24 20c-6 0-14 4-14 14 0 4 2 6 5 6 5 0 9-6 9-12"/><path d="M24 20c6 0 14 4 14 14 0 4-2 6-5 6-5 0-9-6-9-12"/>'),
  circuit: svg('<path d="M6 24h4M38 24h4"/><rect x="10" y="16" width="5" height="16" rx="1.5"/><rect x="33" y="16" width="5" height="16" rx="1.5"/><path d="M15 24h18"/><circle cx="24" cy="10" r="3"/><path d="M24 38v-6"/>'),
  taichi: svg('<circle cx="24" cy="24" r="17"/><path d="M24 7a8.5 8.5 0 0 1 0 17 8.5 8.5 0 0 0 0 17"/><circle cx="24" cy="15.5" r="2"/><circle cx="24" cy="32.5" r="2"/>'),
  online: svg('<rect x="6" y="9" width="36" height="24" rx="3"/><path d="M18 40h12M24 33v7"/><path d="M21 16l8 5-8 5z"/>'),
  drop: svg('<path d="M24 6c7 9 12 15 12 22a12 12 0 0 1-24 0c0-7 5-13 12-22z"/><path d="M18 29a6 6 0 0 0 6 6"/>'),
  wood: svg('<rect x="8" y="18" width="24" height="12" rx="6"/><path d="M14 18v12M20 18v12M26 18v12"/><path d="M32 24h8"/><circle cx="41" cy="24" r="1.5"/>'),
  hands: svg('<path d="M10 30c0-6 4-10 8-12l6-3c2-1 4 1 3 3l-4 5h10c2 0 3 2 2 3"/><path d="M35 26c2 0 3 2 2 3l-6 6c-2 2-5 3-8 3H12"/><path d="M6 40h6"/>'),
  spine: svg('<path d="M24 5v38"/><rect x="18" y="8" width="12" height="5" rx="2.5"/><rect x="17" y="16" width="14" height="5" rx="2.5"/><rect x="16.5" y="24" width="15" height="5" rx="2.5"/><rect x="17" y="32" width="14" height="5" rx="2.5"/>'),
  foot: svg('<path d="M18 42c-5 0-7-4-6-9 1-6 2-12 3-17 1-4 4-6 7-5 4 1 5 5 4 9l-2 9c-1 4 2 6 2 8 0 3-3 5-8 5z"/><circle cx="31" cy="9" r="2.5"/><circle cx="36" cy="13" r="2"/><circle cx="39" cy="18" r="1.6"/>'),
  head: svg('<path d="M14 40v-6c-4-2-6-6-6-11 0-9 7-16 16-16s16 7 16 15c0 3-1 5-2 7l2 5h-4v6H26"/><path d="M20 19c2-3 6-4 9-2"/><path d="M22 26c2 1 5 1 7-1"/>'),
  lash: svg('<path d="M6 26c5-6 11-9 18-9s13 3 18 9"/><path d="M6 26c5 5 11 7 18 7s13-2 18-7"/><circle cx="24" cy="25" r="4"/><path d="M12 19l-3-5M18 16l-2-5M24 15v-5M30 16l2-5M36 19l3-5"/>'),
  brow: svg('<path d="M6 22c6-7 14-10 22-9 6 1 11 4 14 9"/><path d="M10 21l2-3M15 18l2-3M20 16l2-3M26 15l1-3M32 16l1-3M37 18l1-3"/><path d="M14 32c3-2 6-3 10-3s7 1 10 3"/><circle cx="24" cy="33" r="2.5"/>'),
  hair: svg('<path d="M10 30c0-12 6-22 14-22s14 10 14 22"/><path d="M10 30c3 6 8 10 14 10s11-4 14-10"/><path d="M17 12c-1 6 0 12 4 18M24 8v22M31 12c1 6 0 12-4 18"/>'),
  laser: svg('<path d="M30 6l-8 14h8l-8 14"/><path d="M14 40h20"/><path d="M10 33c3-2 6-2 9 0s6 2 9 0 6-2 9 0"/><circle cx="36" cy="10" r="2"/>'),
  signature: '<svg viewBox="0 0 160 50" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path pathLength="1" d="M6 34c8-20 14-26 16-20s-6 22-2 22 10-24 16-24-4 20 2 20 8-16 14-16-2 14 4 14 10-18 18-18c6 0-4 18 2 18s12-10 20-10 6 8 14 8 14-12 22-12 6 6 14 4"/></svg>',
  leaf: svg('<path d="M10 38C10 20 22 10 40 8c-2 18-12 30-30 30z"/><path d="M10 38L28 20"/>'),
  heart: svg('<path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22z"/>'),
  users: svg('<circle cx="18" cy="16" r="6"/><path d="M6 40c0-7 5-12 12-12s12 5 12 12"/><circle cx="34" cy="18" r="5"/><path d="M32 28c6 0 10 4 10 10"/>'),
  sparkle: svg('<path d="M24 6l3 12 12 3-12 3-3 12-3-12-12-3 12-3z"/><path d="M38 34l1 4 4 1-4 1-1 4-1-4-4-1 4-1z"/>'),
  clock: svg('<circle cx="24" cy="24" r="17"/><path d="M24 14v10l7 5"/>'),
  pin: svg('<path d="M24 43s-14-12-14-24a14 14 0 0 1 28 0c0 12-14 24-14 24z"/><circle cx="24" cy="19" r="5"/>'),
  calendar: svg('<rect x="7" y="10" width="34" height="31" rx="4"/><path d="M7 19h34M16 6v8M32 6v8"/>'),
  check: svg('<circle cx="24" cy="24" r="18"/><path d="M16 24.5l5.5 5.5L32 19"/>'),
  arrow: svg('<path d="M10 24h28M28 14l10 10-10 10"/>'),
  chev: svg('<path d="M12 18l12 12 12-12"/>', ' class="chev"'),
  menu: svg('<path d="M8 16h32M8 24h32M8 32h32"/>'),
  close: svg('<path d="M12 12l24 24M36 12L12 36"/>'),
  phone: svg('<path d="M14 6h-4a3 3 0 0 0-3 3c0 18 14 32 32 32a3 3 0 0 0 3-3v-4l-8-4-4 4c-6-2-11-7-13-13l4-4z"/>'),
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3 7 7.5.6-5.7 5 1.8 7.4L12 18l-6.6 4 1.8-7.4L1.5 9.6 9 9z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.6-.3z"/></svg>',
};

// Marca provisional (hojas en círculo). Sustituir por el logotipo real.
export const logo = `<svg viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="46" stroke="currentColor" stroke-width="3"/><g fill="currentColor"><path d="M50 72C38 60 38 42 50 26c12 16 12 34 0 46z"/><path d="M48 72c-14-2-24-12-26-26 12 2 22 10 26 26z" opacity=".7"/><path d="M52 72c14-2 24-12 26-26-12 2-22 10-26 26z" opacity=".7"/></g></svg>`;

// Ilustraciones grandes para las tarjetas de categoría y la sección "sobre nosotros".
export const art = {
  rings: `<svg viewBox="0 0 300 300" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="150" cy="150" r="140"/><circle cx="150" cy="150" r="105"/><circle cx="150" cy="150" r="70"/><circle cx="150" cy="150" r="35"/></svg>`,
  petals: `<svg viewBox="0 0 300 300" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="150" cy="80" rx="34" ry="72" transform="rotate(${i * 45} 150 150)"/>`).join('')}</svg>`,
  waves: `<svg viewBox="0 0 300 300" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${40 + i * 28} C 75 ${10 + i * 28}, 150 ${70 + i * 28}, 300 ${40 + i * 28}"/>`).join('')}</svg>`,
  scene: `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dce6d9"/><stop offset="1" stop-color="#f5eee4"/></linearGradient></defs>
    <rect width="400" height="500" fill="url(#g1)"/>
    <circle cx="290" cy="150" r="70" fill="#d8b26e" opacity=".55"/>
    <path d="M0 330 C 90 280 170 300 240 270 S 360 250 400 260 V500 H0Z" fill="#8fae8b" opacity=".55"/>
    <path d="M0 380 C 100 340 200 370 280 340 S 380 330 400 335 V500 H0Z" fill="#2e4a3b" opacity=".75"/>
    <g transform="translate(150 250)" fill="#c47a5a">
      <path d="M50 120C30 95 30 60 50 30c20 30 20 65 0 90z"/>
      <path d="M46 120c-26-4-44-22-48-48 22 4 40 20 48 48z" opacity=".8"/>
      <path d="M54 120c26-4 44-22 48-48-22 4-40 20-48 48z" opacity=".8"/>
    </g>
    <g fill="none" stroke="#2e4a3b" stroke-width="1.5" opacity=".35"><circle cx="200" cy="300" r="120"/><circle cx="200" cy="300" r="160"/></g>
  </svg>`,
};
