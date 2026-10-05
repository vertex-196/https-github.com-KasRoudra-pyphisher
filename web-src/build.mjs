// Generador estático de la web de NOVA (v2 "Respira"). Uso: node web-src/build.mjs
// Escribe en /web. No borra web/assets/media (lo genera Remotion).
// Logo, fotos y reseñas reales se incorporan solos si existen en web-src/media y web-src/resenas.json.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, categories, services, legacyRedirects } from './data.mjs';
import { icons, logo as logoPlaceholder, art } from './icons.mjs';
import { POSES, STEPS, figurePaths } from './poses.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, '..', 'web');
const MEDIA = join(SRC, 'media');
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
const svcBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const svcPath = (s) => `/${s.cat}/${s.slug}/`;
const servicesOf = (cat) => services.filter((s) => s.cat === cat);
// Iconos que se "dibujan" al entrar en pantalla
const drawable = (svg) => svg.replace(/<(path|circle|rect|ellipse)\b/g, '<$1 pathLength="1"');

const write = (path, content) => {
  const file = join(OUT, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

// ════════════════ RECURSOS ════════════════
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);
mkdirSync(join(OUT, 'assets/vendor'), { recursive: true });
const css = readFileSync(join(SRC, 'styles.css'), 'utf8');
// main.js recibe el motor de posturas (poses.mjs) incrustado, sin "export".
const posesCode = readFileSync(join(SRC, 'poses.mjs'), 'utf8').replace(/^export /gm, '');
const js = readFileSync(join(SRC, 'main.js'), 'utf8').replace('/*@POSES@*/', posesCode);
const lenis = readFileSync(join(SRC, 'vendor/lenis.min.js'), 'utf8');
const cssV = hash(css);
const jsV = hash(js);
writeFileSync(join(OUT, 'assets/styles.css'), css);
writeFileSync(join(OUT, 'assets/main.js'), js);
writeFileSync(join(OUT, 'assets/vendor/lenis.min.js'), lenis);

// Logo real si existe; si no, marca provisional
const logoFile = ['logo.svg', 'logo.png', 'logo.webp'].find((f) => existsSync(join(MEDIA, f)));
mkdirSync(join(OUT, 'assets/img'), { recursive: true });
if (logoFile) copyFileSync(join(MEDIA, logoFile), join(OUT, 'assets/img', logoFile));
const brandMark = (cls = '') => logoFile
  ? `<a class="brand brand--img ${cls}" href="/"><img src="/assets/img/${logoFile}" alt="${esc(site.name)}" width="160" height="52"><span class="brand-name">NOVA</span></a>`
  : `<a class="brand ${cls}" href="/">${logoPlaceholder}<span><span class="brand-name">NOVA</span><span class="brand-sub">Centro de Bienestar</span></span></a>`;
writeFileSync(join(OUT, 'favicon.svg'), logoFile === 'logo.svg'
  ? readFileSync(join(MEDIA, 'logo.svg'))
  : logoPlaceholder.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/currentColor/g, '#2e4a3b'));

// Fotos reales: se convierten a WebP (640 y 1280 px) con ffmpeg
const photos = {};
const fotosDir = join(MEDIA, 'fotos');
if (existsSync(fotosDir)) {
  for (const f of readdirSync(fotosDir)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const name = basename(f, extname(f)).toLowerCase();
    const out = [];
    for (const w of [640, 1280]) {
      const target = join(OUT, 'assets/img', `${name}-${w}.webp`);
      try {
        if (!existsSync(target)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(fotosDir, f), '-vf', `scale='min(${w},iw)':-2`, '-quality', '78', target]);
        out.push(`/assets/img/${name}-${w}.webp ${w}w`);
      } catch { /* sin ffmpeg: se copia el original */ }
    }
    if (!out.length) { copyFileSync(join(fotosDir, f), join(OUT, 'assets/img', f)); photos[name] = { src: `/assets/img/${f}`, srcset: '' }; }
    else photos[name] = { src: out[1].split(' ')[0], srcset: out.join(', ') };
  }
}
const photo = (name, alt, { sizes = '(max-width: 900px) 100vw, 50vw', eager = false, cls = '' } = {}) => {
  const p = photos[name];
  if (!p) return '';
  return `<img class="${cls}" src="${p.src}"${p.srcset ? ` srcset="${p.srcset}" sizes="${sizes}"` : ''} alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};
const galleryPhotos = Object.keys(photos).filter((n) => n.startsWith('centro')).sort();

// Reseñas reales de Google (nunca inventadas): web-src/resenas.json
const reviewsFile = join(SRC, 'resenas.json');
const reviews = existsSync(reviewsFile) ? JSON.parse(readFileSync(reviewsFile, 'utf8')) : null;
const hasReviews = !!(reviews && Array.isArray(reviews.reviews) && reviews.reviews.length);

const sitemap = [];

// ════════════════ DATOS ESTRUCTURADOS ════════════════
const businessId = `${site.url}/#negocio`;
const business = {
  '@type': ['HealthAndBeautyBusiness', 'SportsActivityLocation'],
  '@id': businessId,
  name: site.name,
  alternateName: 'NOVA Móstoles',
  description: 'Centro de bienestar en Móstoles: Pilates, Yoga, Hipopresivos, Circuito Funcional, Taichí, masajes, drenaje linfático, maderoterapia, osteopatía, láser diodo y estética.',
  url: site.url + '/',
  telephone: site.phone.replace(/\s/g, ''),
  email: site.email,
  image: abs('/assets/media/og-nova-mostoles.jpg'),
  logo: abs(logoFile ? `/assets/img/${logoFile}` : '/favicon.svg'),
  address: { '@type': 'PostalAddress', streetAddress: site.street, postalCode: site.postalCode, addressLocality: site.city, addressRegion: site.region, addressCountry: site.country },
  hasMap: site.mapsUrl,
  areaServed: ['Móstoles', 'Alcorcón', 'Fuenlabrada', 'Arroyomolinos'].map((name) => ({ '@type': 'City', name })),
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:30', closes: '21:30' }],
  founder: { '@type': 'Person', name: site.owner },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de NOVA Centro de Bienestar',
    itemListElement: categories.map((c) => ({
      '@type': 'OfferCatalog',
      name: c.name,
      itemListElement: servicesOf(c.slug).map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: abs(svcPath(s)) } })),
    })),
  },
  sameAs: [site.facebook, site.instagram].filter(Boolean),
};
const website = { '@type': 'WebSite', '@id': `${site.url}/#web`, url: site.url + '/', name: site.name, inLanguage: 'es-ES', publisher: { '@id': businessId } };
const breadcrumbLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })) });
const faqLd = (faqs) => ({ '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const priceToNumber = (v) => { const m = String(v).match(/(\d+(?:[.,]\d+)?)/); return m ? m[1].replace(',', '.') : null; };

// ════════════════ FRAGMENTOS ════════════════
const waLink = (text) => `${site.whatsapp}?text=${encodeURIComponent(text)}`;
const btnWa = (text, label = 'Reservar por WhatsApp', cls = 'btn--primary') =>
  `<a class="btn ${cls} magnetic" href="${esc(waLink(text))}" target="_blank" rel="noopener">${icons.whatsapp}<span>${label}</span></a>`;
const btnCall = (cls = 'btn--ghost') => `<a class="btn ${cls} magnetic" href="${site.phoneHref}">${icons.phone}<span>Llamar al ${site.phone.replace('+34 ', '')}</span></a>`;
const catArt = { clases: art.rings, terapias: art.waves, estetica: art.petals };
const firstPrice = (s) => (s.prices && s.prices.length ? (s.prices.length > 1 ? `Desde ${s.prices.map((p) => priceToNumber(p[1])).filter(Boolean).sort((a, b) => a - b)[0]} €` : s.prices[0][1]) : '');

const header = (active) => `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<div class="progress-line" aria-hidden="true"></div>
<div class="cursor" aria-hidden="true"><div class="cursor-ring"><span></span></div></div>
<header class="site-header">
  <div class="wrap">
    ${brandMark()}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">${icons.menu}</button>
    <nav class="nav" id="nav" aria-label="Principal">
      <ul>
        ${categories.map((c, ci) => `
        <li class="nav-item${active === c.slug ? ' is-active' : ''}" style="--i:${ci}">
          <div class="nav-row">
            <a class="nav-link" href="/${c.slug}/"${active === c.slug ? ' aria-current="page"' : ''}>${c.name}</a>
            <button class="sub-toggle" type="button" aria-expanded="false" aria-label="Ver servicios de ${esc(c.name)}">${icons.chev}</button>
          </div>
          <ul class="dropdown">
            ${servicesOf(c.slug).map((s, i) => `<li style="--i:${i}"><a href="${svcPath(s)}"><span class="ico">${icons[s.icon]}</span>${esc(s.name)}</a></li>`).join('')}
            <li style="--i:${servicesOf(c.slug).length}"><a class="all" href="/${c.slug}/">Ver todas las ${c.name.toLowerCase()} →</a></li>
          </ul>
        </li>`).join('')}
        <li class="nav-item" style="--i:3"><a class="nav-link" href="/talleres/"${active === 'talleres' ? ' aria-current="page"' : ''}>Talleres</a></li>
        <li class="nav-item" style="--i:4"><a class="nav-link" href="/sobre-nosotros/"${active === 'sobre' ? ' aria-current="page"' : ''}>Nosotros</a></li>
        <li class="nav-item" style="--i:5"><a class="nav-link" href="/contacto/"${active === 'contacto' ? ' aria-current="page"' : ''}>Contacto</a></li>
      </ul>
      <a class="btn btn--primary nav-cta magnetic" href="${esc(waLink('Hola, me gustaría pedir cita en NOVA.'))}" target="_blank" rel="noopener"><span>Pedir cita</span></a>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        ${brandMark()}
        <p>${esc(site.tagline)}</p>
        <address>
          ${esc(site.street)}<br>${site.postalCode} ${site.city} (${site.region})<br>
          <a href="${site.phoneHref}">${site.phone}</a> · <a href="mailto:${site.email}">${site.email}</a><br>
          L–V 9:30–21:30 · con cita previa
        </address>
      </div>
      ${categories.map((c) => `
      <div>
        <h2>${c.name}</h2>
        <ul>${servicesOf(c.slug).map((s) => `<li><a href="${svcPath(s)}">${esc(s.name)}${s.slug === 'clases-online' ? '' : ' en Móstoles'}</a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
    <div class="footer-word" aria-hidden="true"><span>N</span><span>O</span><span>V</span><span>A</span></div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(site.name)} · Móstoles</span>
      <ul>
        <li><a href="/talleres/">Talleres</a></li>
        <li><a href="/sobre-nosotros/">Sobre nosotros</a></li>
        <li><a href="/contacto/">Contacto</a></li>
        <li><a href="/aviso-legal/">Aviso legal</a></li>
        <li><a href="/privacidad/">Privacidad</a></li>
        <li><a href="/cookies/">Cookies</a></li>
      </ul>
    </div>
  </div>
</footer>
<div class="mobile-bar">
  <a href="${esc(waLink('Hola, me gustaría pedir cita en NOVA.'))}" target="_blank" rel="noopener">${icons.whatsapp}WhatsApp</a>
  <a href="${site.phoneHref}">${icons.phone}Llamar</a>
</div>`;

const layout = ({ path, title, description, body, ld = [], active = '', noindex = false, priority = '0.7', preload = '', intro = false }) => {
  if (!noindex) sitemap.push({ loc: abs(path), priority });
  const graph = { '@context': 'https://schema.org', '@graph': [website, business, ...ld] };
  return `<!doctype html>
<html lang="es-ES" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
${noindex ? '' : `<link rel="canonical" href="${abs(path)}">`}
<meta name="theme-color" content="#2e4a3b">
<meta name="geo.region" content="ES-MD">
<meta name="geo.placename" content="Móstoles">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs('/assets/media/og-nova-mostoles.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload}
<link rel="stylesheet" href="/assets/styles.css?v=${cssV}">
<script>(function(d){var r=matchMedia('(prefers-reduced-motion: reduce)').matches;d.className=d.className.replace('no-js','js')+(r?' no-motion':' motion');${intro ? "try{if(!r&&!sessionStorage.getItem('nova-intro')){d.className+=' with-intro';sessionStorage.setItem('nova-intro','1')}}catch(e){}" : ''}})(document.documentElement)</script>
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
${intro ? `<div class="intro" aria-hidden="true"><div>${logoPlaceholder.replace('stroke-width="3"', 'stroke-width="2"')}<p>inhala…</p></div></div>` : ''}
${header(active)}
<main id="contenido">
${body}
</main>
${footer()}
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/main.js?v=${jsV}" defer></script>
</body>
</html>
`;
};

const breadcrumbHtml = (items) => `
<nav class="breadcrumb" aria-label="Migas de pan" data-reveal><ol>
  ${items.map(([name, path], i) => i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${path}">${esc(name)}</a></li>`).join('')}
</ol></nav>`;

const svcCard = (s, i = 0, reveal = true) => `
<a class="svc-card tilt" href="${svcPath(s)}" data-cat="${s.cat}" data-cursor="Ver"${reveal ? ` data-reveal style="--d:${(i % 4) * 90}"` : ''}>
  <span class="svc-media">${photos[s.slug] ? photo(s.slug, `${s.name} en NOVA Móstoles`, { sizes: '320px' }) : `<span class="blob"></span><span class="ico">${icons[s.icon]}</span>`}</span>
  <span class="svc-body">
    <span class="cat">${esc(catBySlug[s.cat].name)}</span>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.lead)}</p>
    ${firstPrice(s) ? `<span class="price">${esc(firstPrice(s))}</span>` : ''}
    <span class="more">Descubrir ${icons.arrow}</span>
  </span>
</a>`;

const faqHtml = (faqs) => `
<div class="faq">
  ${faqs.map(([q, a], i) => `
  <details data-reveal style="--d:${i * 70}"${i === 0 ? ' open' : ''}>
    <summary>${esc(q)}<span class="pm" aria-hidden="true"></span></summary>
    <div class="answer"><p>${esc(a)}</p></div>
  </details>`).join('')}
</div>`;

const ctaFinal = (title = 'Tu momento de <em>bienestar</em> empieza aquí', text = 'Escríbenos por WhatsApp o llámanos y te ayudamos a elegir la clase o el tratamiento que mejor encaja contigo.', wa = 'Hola, me gustaría pedir información sobre NOVA.') => `
<section class="section" aria-label="Pide cita">
  <div class="wrap">
    <div class="cta-final" data-reveal>
      <h2 data-split>${title}</h2>
      <p>${esc(text)}</p>
      <div class="btn-row">${btnWa(wa, 'Escríbenos por WhatsApp', 'btn--light')}<a class="btn btn--on-dark magnetic" href="${site.phoneHref}">${icons.phone}<span>${site.phone}</span></a></div>
    </div>
  </div>
</section>`;

const visitSection = () => `
<section class="section section--sand" id="ubicacion" aria-labelledby="ubicacion-t">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker" data-reveal>Dónde estamos</span>
      <h2 id="ubicacion-t" data-split>Ven a vernos en <em>Móstoles</em></h2>
    </div>
    <div class="visit">
      <div class="visit-card on-dark" data-reveal>
        <dl>
          <div><dt>Dirección</dt><dd>${esc(site.street)}<br>${site.postalCode} ${site.city}, ${site.region}</dd></div>
          <div><dt>Horario</dt><dd>${esc(site.hours)}</dd></div>
          <div><dt>Teléfono y WhatsApp</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
        </dl>
        <div class="btn-row">${btnWa('Hola, me gustaría pedir cita en NOVA.', 'Pedir cita')}<a class="btn btn--light magnetic" href="${site.mapsUrl}" target="_blank" rel="noopener">${icons.pin}<span>Cómo llegar</span></a></div>
      </div>
      <div class="map" data-reveal style="--d:120" data-map="${esc(site.mapsEmbed)}">
        <div>
          <div class="map-pin">${icons.pin}</div>
          <button class="btn btn--ghost magnetic" type="button" data-load-map><span>Mostrar mapa</span></button>
          <p>Al cargar el mapa, Google puede instalar cookies propias. <a href="${site.mapsUrl}" target="_blank" rel="noopener">Abrir en Google Maps</a></p>
        </div>
      </div>
    </div>
  </div>
</section>`;

const reviewsSection = () => hasReviews ? `
<section class="section" aria-labelledby="resenas-t">
  <div class="wrap">
    <div class="reviews-head">
      <div class="section-head" style="margin:0">
        <span class="kicker" data-reveal>Opiniones en Google</span>
        <h2 id="resenas-t" data-split>Lo que dicen <em>de nosotros</em></h2>
      </div>
      ${reviews.rating ? `<div class="rating" data-reveal><span class="rating-num">${esc(String(reviews.rating).replace('.', ','))}</span><div><div class="stars">${icons.star.repeat(Math.round(reviews.rating))}</div><small>${reviews.total ? `${reviews.total} reseñas en Google` : 'Reseñas en Google'}</small></div></div>` : ''}
    </div>
    <div class="review-track">
      ${reviews.reviews.map((r, i) => `
      <figure class="review" data-reveal style="--d:${(i % 3) * 90}">
        <div class="stars" aria-label="${r.rating} de 5 estrellas">${icons.star.repeat(r.rating || 5)}</div>
        <blockquote>“${esc(r.text)}”</blockquote>
        <figcaption><strong>${esc(r.author)}</strong>${r.date ? esc(r.date) + ' · ' : ''}Google</figcaption>
      </figure>`).join('')}
    </div>
    ${reviews.url ? `<p style="margin-top:20px"><a class="btn btn--ghost magnetic" href="${esc(reviews.url)}" target="_blank" rel="noopener"><span>Ver todas o dejar tu reseña</span></a></p>` : ''}
  </div>
</section>` : `
<section class="section" aria-labelledby="resenas-t">
  <div class="wrap">
    <div class="reviews-cta" data-reveal>
      <div>
        <div class="stars">${icons.star.repeat(5)}</div>
        <h2 id="resenas-t" style="font-size:clamp(1.7rem,3vw,2.4rem);margin:14px 0 6px">¿Ya nos conoces?</h2>
        <p style="margin:0;color:var(--muted)">Tu opinión ayuda a otras personas de Móstoles a encontrarnos. ¡Gracias por compartirla!</p>
      </div>
      <a class="btn btn--primary magnetic" href="${site.mapsUrl}" target="_blank" rel="noopener"><span>Déjanos tu reseña en Google</span></a>
    </div>
  </div>
</section>`;

// Figura del Saludo al Sol (render inicial en servidor; main.js la anima)
const figureSvg = () => {
  const p = figurePaths(POSES[0]);
  return `<svg viewBox="0 0 420 420" role="img" aria-label="Figura que realiza el Saludo al Sol">
  <defs>
    <radialGradient id="sunG" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3d6"/><stop offset=".55" stop-color="#e8c27f"/><stop offset="1" stop-color="#d8b26e" stop-opacity="0"/></radialGradient>
  </defs>
  <circle class="sun-disc" cx="290" cy="380" r="120" fill="url(#sunG)"/>
  <g class="sun-rays" fill="none" stroke="#d8b26e" stroke-width="1" opacity=".35">
    <circle cx="290" cy="380" r="150"/><circle cx="290" cy="380" r="185"/>
  </g>
  <path d="M0 360 H420 V420 H0Z" fill="#efe2d1"/>
  <rect x="56" y="358" width="308" height="8" rx="4" fill="#c47a5a" opacity=".85"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path class="fig-back fig-legB" d="${p.legBack}" stroke-width="11"/>
    <path class="fig-back fig-armB" d="${p.armBack}" stroke-width="9"/>
    <path class="fig-main fig-torso" d="${p.torso}" stroke-width="15"/>
    <path class="fig-main fig-leg" d="${p.leg}" stroke-width="12"/>
    <path class="fig-main fig-arm" d="${p.arm}" stroke-width="10"/>
  </g>
  <circle class="fig-bun" cx="${p.bun[0].toFixed(1)}" cy="${p.bun[1].toFixed(1)}" r="8" fill="#2e4a3b"/>
  <circle class="fig-head" cx="${p.head[0].toFixed(1)}" cy="${p.head[1].toFixed(1)}" r="16" fill="#2e4a3b"/>
</svg>`;
};

// ════════════════ PORTADA ════════════════
const homeFaqs = [
  ['¿Dónde está NOVA Centro de Bienestar?', `En ${site.street}, ${site.postalCode} Móstoles (Madrid). Pulsa “Cómo llegar” para abrir la ruta en Google Maps.`],
  ['¿Cuál es el horario?', 'Atendemos de lunes a viernes de 9:30 a 21:30, siempre con cita previa para poder dedicarte el tiempo que necesitas.'],
  ['¿Cuánto cuestan las clases?', 'El Circuito Funcional cuesta 45 €/mes (2 días por semana), 60 €/mes (3 días) o 75 €/mes (4 días). Las sesiones online, 25 €/mes los lunes y miércoles a las 17:00. Para el resto de clases, escríbenos y te pasamos tarifas.'],
  ['¿Cómo reservo una clase o un tratamiento?', `La forma más rápida es escribirnos por WhatsApp o llamar al ${site.phone}. También puedes escribir a ${site.email}.`],
  ['¿Puedo combinar clases y terapias?', 'Sí, y es lo que mejor funciona: por ejemplo, Pilates o Hipopresivos para fortalecer, y masaje o drenaje para recuperar. Te ayudamos a diseñar tu plan.'],
];
const marqueeWords = ['Pilates', 'Yoga', 'Hipopresivos', 'Taichí', 'Circuito Funcional', 'Drenaje linfático', 'Maderoterapia', 'Masajes', 'Osteopatía', 'Reflexología', 'Lifting de pestañas', 'Microblading', 'Spa capilar', 'Láser diodo'];
const marqueeRow = (words, cls = '') => `<div class="marquee-row ${cls}" aria-hidden="true">${[0, 1].map(() => `<span>${words.map((w) => `${esc(w)}<i></i>`).join('')}</span>`).join('')}</div>`;
const breathPatterns = [
  { id: 'calma', name: 'Calma', desc: 'Inhala 4 · Mantén 7 · Exhala 8', steps: [['Inhala', 4, 1], ['Mantén', 7, 1], ['Exhala', 8, 0]] },
  { id: 'cuadrada', name: 'Cuadrada', desc: 'Inhala 4 · Mantén 4 · Exhala 4 · Pausa 4', steps: [['Inhala', 4, 1], ['Mantén', 4, 1], ['Exhala', 4, 0], ['Pausa', 4, 0]] },
  { id: 'coherente', name: 'Coherente', desc: 'Inhala 5 · Exhala 5', steps: [['Inhala', 5, 1], ['Exhala', 5, 0]] },
];
const priceHighlights = [
  { tag: 'Clases', title: 'Circuito Funcional', from: false, big: '45', unit: '€/mes', list: svcBySlug['entrenamiento-funcional-mostoles'].prices, href: svcPath(svcBySlug['entrenamiento-funcional-mostoles']) },
  { tag: 'Desde casa', title: 'Sesiones online', from: false, big: '25', unit: '€/mes', list: [['Lunes y miércoles', '17:00'], ['Modalidades', '5']], href: svcPath(svcBySlug['clases-online']) },
  { tag: 'Estética', title: 'Láser diodo', from: true, big: '10', unit: '€', list: [['Axilas o ingles', '20 €'], ['Piernas completas', '59 €'], ['Axilas, ingles y piernas', '99 €']], href: svcPath(svcBySlug['depilacion-laser-mostoles']) },
  { tag: 'Estética', title: 'Lifting y spa capilar', from: false, big: '30', unit: '€', list: [['Lifting de pestañas', '30 €'], ['Spa capilar', 'desde 45 €']], href: svcPath(svcBySlug['lifting-pestanas-mostoles']) },
];
const orbitLinks = [['Pilates', 'pilates-mostoles'], ['Yoga', 'yoga-mostoles'], ['Masajes', 'masajes-mostoles'], ['Hipopresivos', 'hipopresivos-mostoles'], ['Drenaje', 'drenaje-linfatico-mostoles'], ['Láser', 'depilacion-laser-mostoles']];

write('/', layout({
  path: '/',
  priority: '1.0',
  intro: true,
  preload: photos.hero ? `<link rel="preload" as="image" href="${photos.hero.src}" fetchpriority="high">` : '',
  title: 'Centro de Bienestar en Móstoles | Pilates, Yoga y Masajes',
  description: 'NOVA, centro de bienestar en Móstoles: Pilates, Yoga, Hipopresivos, masajes, drenaje linfático, láser diodo y estética. Grupos reducidos. Pide tu cita.',
  ld: [{ '@type': 'WebPage', '@id': `${site.url}/#portada`, url: site.url + '/', name: 'Centro de Bienestar en Móstoles', about: { '@id': businessId }, isPartOf: { '@id': `${site.url}/#web` } }, faqLd(homeFaqs)],
  body: `
<section class="hero" aria-labelledby="hero-t">
  <div class="hero-bg"></div>
  <canvas class="hero-canvas" aria-hidden="true"></canvas>
  <div class="wrap">
    <div class="hero-copy">
      <h1 id="hero-t"><span class="eyebrow" data-reveal>NOVA · Centro de bienestar en Móstoles</span><span class="display" data-split>Respira, muévete, <em>vuelve a ti</em></span></h1>
      <p class="lead" data-reveal="soft" style="--d:200">${esc(site.tagline)} Pilates, Yoga, Hipopresivos, terapias manuales y estética en grupos reducidos.</p>
      <div class="btn-row" data-reveal style="--d:650">
        ${btnWa('Hola, me gustaría pedir cita en NOVA.', 'Pide tu cita')}
        <a class="btn btn--ghost magnetic" href="#saludo-al-sol"><span>Respira con nosotros</span></a>
      </div>
      <ul class="hero-meta" data-reveal style="--d:800">
        <li>${icons.users}Grupos reducidos</li>
        <li>${icons.clock}L–V 9:30 a 21:30</li>
        <li>${icons.pin}Paseo de Goya 26</li>
      </ul>
    </div>
    <div class="breath-orb${photos.hero ? ' has-photo' : ''} parallax" data-speed="-0.08" data-reveal style="--d:300">
      <svg class="orb-rings" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="48"/></svg>
      <div class="orb-move" data-mouse="22"><div class="orb-core"><div class="orb-layer l1"></div><div class="orb-layer l2"></div><div class="orb-layer l3"></div></div></div>
      ${photos.hero ? `<div class="orb-photo" data-mouse="-10">${photo('hero', 'NOVA Centro de Bienestar en Móstoles', { eager: true, sizes: '(max-width: 900px) 80vw, 480px' })}</div>` : ''}
      <div class="orb-words" aria-hidden="true"><span class="in">inhala</span><span class="out">exhala</span></div>
      <nav class="orbit" aria-label="Servicios destacados">
        ${orbitLinks.map(([label, slug], i) => { const a = (i / orbitLinks.length) * Math.PI * 2 - Math.PI / 2; return `<a href="${svcPath(svcBySlug[slug])}" style="left:${(50 + 50 * Math.cos(a)).toFixed(1)}%;top:${(50 + 50 * Math.sin(a)).toFixed(1)}%"><span>${label}</span></a>`; }).join('')}
      </nav>
    </div>
  </div>
  <a class="scroll-cue" href="#manifiesto" aria-label="Seguir bajando"><span>Desliza</span><i></i></a>
</section>

<section class="marquee" aria-label="Disciplinas y tratamientos">
  ${marqueeRow(marqueeWords.slice(0, 7))}
  ${marqueeRow(marqueeWords.slice(7), 'outline')}
</section>

<section class="section" id="manifiesto" aria-labelledby="manifiesto-t">
  <div class="wrap manifesto">
    <span class="kicker" data-reveal id="manifiesto-t">Nuestra filosofía</span>
    <p data-scrub>En NOVA creemos que el bienestar no es un destino, sino una <em>práctica diaria</em>: moverse con conciencia, respirar con calma y cuidarse sin prisas. Por eso unimos clases, terapias y estética en un mismo espacio, con grupos reducidos y el tiempo que mereces.</p>
    <div class="manifesto-sign" data-reveal><span class="draw">${icons.signature}</span><span>${esc(site.owner)}, fundadora</span></div>
  </div>
</section>

<section class="sun" id="saludo-al-sol" aria-labelledby="sun-t">
  <div class="wrap sun-sticky">
    <div class="sun-stage" data-cursor="Desliza">${figureSvg()}</div>
    <div class="sun-copy">
      <span class="kicker">Saludo al sol · Surya Namaskar</span>
      <h2 id="sun-t">Ocho posturas, <em>una respiración</em></h2>
      <ol class="sun-steps">
        ${STEPS.map((idx) => { const p = POSES[idx]; return `<li><span class="sun-breath">${esc(p.breath)}</span><h3>${esc(p.sanskrit)}<small>${esc(p.name)}</small></h3><p>${esc(p.text)}</p></li>`; }).join('')}
      </ol>
      <div class="sun-dots" aria-hidden="true">${STEPS.map(() => '<span></span>').join('')}</div>
      <div class="sun-cta"><a class="btn btn--primary magnetic" href="${svcPath(svcBySlug['yoga-mostoles'])}"><span>Descubre nuestras clases de Yoga</span>${icons.arrow}</a></div>
    </div>
  </div>
</section>

<section class="hs" id="servicios" aria-labelledby="servicios-t">
  <div class="hs-sticky">
    <div class="wrap hs-head">
      <div class="section-head">
        <span class="kicker" data-reveal>Nuestros servicios</span>
        <h2 id="servicios-t" data-split>Tres caminos hacia tu <em>bienestar</em></h2>
      </div>
      <p class="hs-hint" aria-hidden="true"><svg viewBox="0 0 40 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 10h34M28 3l8 7-8 7"/></svg>Sigue bajando para recorrerlos</p>
    </div>
    <div class="hs-viewport">
      <div class="hs-track">
        ${categories.map((c) => `
        <a class="hs-cat hs-cat--${c.slug}" href="/${c.slug}/" data-cursor="Abrir">
          <span class="art">${catArt[c.slug]}</span>
          <span><span class="kicker">${esc(c.kicker)}</span><h3>${esc(c.name)}</h3><p>${esc(c.intro)}</p></span>
          <span class="more">Ver ${c.name.toLowerCase()} ${icons.arrow}</span>
        </a>
        ${servicesOf(c.slug).map((s) => svcCard(s, 0, false)).join('')}`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section section--forest breathe" id="respira" aria-labelledby="respira-t">
  <div class="wrap">
    <div>
      <span class="kicker" data-reveal>Pausa activa</span>
      <h2 id="respira-t" data-split>Tómate un minuto <em>para ti</em></h2>
      <p class="lead" data-reveal>Elige un ritmo y sigue al círculo: crece al inhalar y se recoge al exhalar. Es lo mismo que practicamos al empezar cada clase.</p>
      <div class="chips" role="group" aria-label="Tipo de respiración" data-reveal>
        ${breathPatterns.map((b, i) => `<button class="chip" type="button" data-pattern='${JSON.stringify(b.steps)}' aria-pressed="${i === 0}">${b.name}<small>${b.desc}</small></button>`).join('')}
      </div>
      <div class="btn-row" data-reveal><button class="btn btn--light magnetic" type="button" data-breathe-toggle><span>Empezar</span></button></div>
    </div>
    <div class="breathe-stage" data-reveal>
      <svg class="breathe-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="48"/><circle class="bar" cx="50" cy="50" r="48" pathLength="1"/></svg>
      <div class="breathe-ball"></div>
      <div class="breathe-center"><div><span class="breathe-label" aria-live="polite">Pulsa empezar</span><span class="breathe-count"></span></div></div>
    </div>
  </div>
</section>

<section class="section" id="tarifas" aria-labelledby="tarifas-t">
  <div class="wrap">
    <div class="section-head">
      <span class="kicker" data-reveal>Tarifas</span>
      <h2 id="tarifas-t" data-split>Precios claros, <em>sin sorpresas</em></h2>
      <p class="lead" data-reveal>Algunas de nuestras tarifas. Para el resto de clases y terapias, pregúntanos: te asesoramos sin compromiso.</p>
    </div>
    <div class="prices-grid">
      ${priceHighlights.map((p, i) => `
      <a class="price-card" href="${p.href}" data-reveal style="--d:${i * 90};text-decoration:none;color:inherit" data-cursor="Ver">
        <span class="halo"></span>
        <span class="tag">${esc(p.tag)}</span>
        <h3>${esc(p.title)}</h3>
        <div class="price-big">${p.from ? '<span class="from">Desde</span>' : ''}<span data-count="${p.big}">${p.big}</span><small>${esc(p.unit)}</small></div>
        <ul>${p.list.map(([k, v]) => `<li>${esc(k)}<strong>${esc(v)}</strong></li>`).join('')}</ul>
        <span class="more">Ver detalles →</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section section--sand" aria-labelledby="sobre-t">
  <div class="wrap split">
    <figure class="arch" data-reveal="clip">
      ${photos.beatriz ? photo('beatriz', `${site.owner}, fundadora de NOVA Centro de Bienestar`, { cls: 'parallax', sizes: '(max-width: 900px) 100vw, 50vw' }) : art.scene}
      <figcaption><strong>${esc(site.owner)}</strong>Fundadora de NOVA Centro de Bienestar</figcaption>
    </figure>
    <div>
      <span class="kicker" data-reveal>Quiénes somos</span>
      <h2 id="sobre-t" data-split>Un centro creado para <em>reconectar</em></h2>
      <p class="lead" data-reveal>NOVA nace de una idea sencilla: que cuidarse no debería ser complicado ni impersonal.</p>
      <p data-reveal>Al frente del centro está ${esc(site.owner)}, que ha reunido en un mismo espacio las disciplinas que mejor funcionan para devolver al cuerpo su equilibrio: el movimiento consciente, las terapias manuales y el cuidado estético.</p>
      <ul class="checklist">
        <li data-reveal style="--d:0"><span class="draw">${drawable(icons.check)}</span><span>Valoración inicial antes de empezar cualquier clase o terapia.</span></li>
        <li data-reveal style="--d:120"><span class="draw">${drawable(icons.check)}</span><span>Planes que combinan movimiento y recuperación.</span></li>
        <li data-reveal style="--d:240"><span class="draw">${drawable(icons.check)}</span><span>Sesiones presenciales en Móstoles y también online.</span></li>
      </ul>
      <a class="btn btn--ghost magnetic" href="/sobre-nosotros/" data-reveal><span>Conoce NOVA</span>${icons.arrow}</a>
    </div>
  </div>
</section>

${galleryPhotos.length ? `
<section class="section" aria-labelledby="galeria-t">
  <div class="wrap">
    <div class="section-head"><span class="kicker" data-reveal>El centro</span><h2 id="galeria-t" data-split>Un espacio para <em>respirar</em></h2></div>
    <div class="gallery">${galleryPhotos.map((n, i) => `<figure data-reveal="clip" style="--d:${i * 100}">${photo(n, `Instalaciones de NOVA Centro de Bienestar en Móstoles (${i + 1})`, { cls: 'parallax', sizes: '(max-width: 900px) 100vw, 40vw' })}</figure>`).join('')}</div>
  </div>
</section>` : ''}

${reviewsSection()}

<section class="section section--sand" aria-labelledby="faq-t">
  <div class="wrap">
    <div class="section-head section-head--center">
      <span class="kicker" data-reveal>Preguntas frecuentes</span>
      <h2 id="faq-t" data-split>Todo lo que <em>necesitas saber</em></h2>
    </div>
    ${faqHtml(homeFaqs)}
  </div>
</section>

${visitSection()}
${ctaFinal()}
`,
}));

// ════════════════ CABECERA INTERIOR ════════════════
const pageHero = ({ crumbs, kicker, h1, lead, cat = '', icon = '', extra = '' }) => `
<section class="page-hero" data-cat="${cat}">
  <div class="orb-core" aria-hidden="true"><div class="orb-layer l1"></div><div class="orb-layer l2"></div></div>
  ${icon ? `<span class="ico-xl draw" data-reveal>${drawable(icons[icon])}</span>` : ''}
  <div class="wrap">
    ${breadcrumbHtml(crumbs)}
    <span class="kicker" data-reveal>${kicker}</span>
    <h1 data-split>${h1}</h1>
    <p class="lead" data-reveal="soft" style="--d:150">${esc(lead)}</p>
    ${extra}
  </div>
</section>`;

// ════════════════ CATEGORÍAS ════════════════
for (const c of categories) {
  const list = servicesOf(c.slug);
  const others = categories.filter((o) => o.slug !== c.slug);
  const crumbs = [['Inicio', '/'], [c.name, `/${c.slug}/`]];
  write(`/${c.slug}/`, layout({
    path: `/${c.slug}/`,
    priority: '0.9',
    active: c.slug,
    title: c.title,
    description: c.description,
    ld: [
      breadcrumbLd(crumbs),
      { '@type': 'CollectionPage', url: abs(`/${c.slug}/`), name: c.h1, about: { '@id': businessId }, mainEntity: { '@type': 'ItemList', itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(svcPath(s)), name: s.name })) } },
    ],
    body: `
${pageHero({ crumbs, cat: c.slug, kicker: esc(c.kicker), h1: esc(c.h1), lead: c.intro, extra: `<div class="btn-row" data-reveal style="--d:450;margin-top:34px">${btnWa(`Hola, quiero información sobre ${c.name.toLowerCase()} en NOVA.`, 'Pedir información')}${btnCall()}</div>` })}
<section class="section" aria-labelledby="lista-t">
  <div class="wrap">
    <h2 id="lista-t" class="sr-only">${esc(c.name)} disponibles</h2>
    <div class="svc-grid">${list.map((s, i) => svcCard(s, i)).join('')}</div>
  </div>
</section>
<section class="section section--sand" aria-labelledby="otras-t">
  <div class="wrap">
    <div class="section-head"><span class="kicker" data-reveal>Complementa tu plan</span><h2 id="otras-t" data-split>También en <em>NOVA</em></h2></div>
    <div class="svc-grid">
      ${others.map((o, i) => `
      <a class="hs-cat hs-cat--${o.slug}" href="/${o.slug}/" style="width:auto;min-height:360px;--d:${i * 100}" data-reveal data-cursor="Abrir">
        <span class="art">${catArt[o.slug]}</span>
        <span><span class="kicker">${esc(o.kicker)}</span><h3>${esc(o.name)}</h3><p>${esc(o.intro)}</p></span>
        <span class="more">Ver ${o.name.toLowerCase()} ${icons.arrow}</span>
      </a>`).join('')}
    </div>
  </div>
</section>
${visitSection()}
${ctaFinal()}
`,
  }));
}

// ════════════════ SERVICIOS ════════════════
for (const s of services) {
  const c = catBySlug[s.cat];
  const path = svcPath(s);
  const crumbs = [['Inicio', '/'], [c.name, `/${c.slug}/`], [s.name, path]];
  const wa = `Hola, me gustaría información sobre ${s.name} en NOVA.`;
  const offers = (s.prices || []).map(([name, v]) => ({ '@type': 'Offer', name, price: priceToNumber(v), priceCurrency: 'EUR' })).filter((o) => o.price);
  write(path, layout({
    path,
    priority: '0.8',
    active: s.cat,
    title: s.title,
    description: s.description,
    ld: [
      breadcrumbLd(crumbs),
      {
        '@type': 'Service', '@id': abs(path) + '#servicio', name: `${s.name} en Móstoles`, serviceType: s.name, description: s.description, url: abs(path),
        provider: { '@id': businessId }, areaServed: { '@type': 'City', name: 'Móstoles' }, category: c.name,
        ...(offers.length ? { offers } : {}),
      },
      faqLd(s.faqs),
    ],
    body: `
${pageHero({
  crumbs, cat: s.cat, icon: s.icon, kicker: `${esc(c.name)} · Móstoles`, h1: esc(s.h1), lead: s.lead,
  extra: `<ul class="facts" data-reveal style="--d:420">${s.details.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul><div class="btn-row" data-reveal style="--d:520">${btnWa(wa)}${btnCall()}</div>`,
})}
${photos[s.slug] ? `<div class="wrap page-photo" style="margin-top:40px"><div class="ph" data-reveal="clip">${photo(s.slug, `${s.name} en NOVA Centro de Bienestar, Móstoles`, { cls: 'parallax', sizes: '100vw' })}</div></div>` : ''}
<section class="section">
  <div class="wrap svc-layout">
    <article class="prose">
      <h2 data-split>${esc(s.name)}: qué es y cómo te ayuda</h2>
      ${s.intro.map((p) => `<p data-reveal>${esc(p)}</p>`).join('')}

      ${s.prices ? `<h2 data-split>Precios</h2>
      <ul class="price-list" data-reveal>${s.prices.map(([k, v]) => `<li><span>${esc(k)}</span><strong>${esc(v)}</strong></li>`).join('')}</ul>` : ''}

      <h2 data-split>Beneficios</h2>
      <ul class="benefits">${s.benefits.map((b, i) => `<li data-reveal style="--d:${i * 80}"><span class="draw">${drawable(icons.check)}</span><span>${esc(b)}</span></li>`).join('')}</ul>

      <h2 data-split>¿Para quién es?</h2>
      <ul class="who">${s.forWho.map((w, i) => `<li data-reveal style="--d:${i * 80}">${esc(w)}</li>`).join('')}</ul>

      <h2 data-split>Cómo es una sesión en NOVA</h2>
      <ol class="timeline" data-timeline>${s.steps.map(([t, d], i) => `<li data-reveal style="--d:${i * 100}"><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
      ${s.cat === 'terapias' ? '<p class="note" data-reveal>Las terapias manuales son tratamientos de bienestar complementarios y no sustituyen el diagnóstico ni el tratamiento médico. Si tienes una patología, consulta con tu médico.</p>' : ''}
    </article>

    <aside class="aside-card" aria-labelledby="reserva-t" data-reveal>
      <h2 id="reserva-t">Pide tu cita</h2>
      <p>¿Te interesa ${esc(s.name)}? Escríbenos y te contamos horarios disponibles${s.prices ? '' : ' y tarifas'}.</p>
      ${btnWa(wa, 'Reservar por WhatsApp')}
      ${btnCall()}
      <dl>
        <dt>Dirección</dt><dd>${esc(site.street)}, ${site.city}</dd>
        <dt>Horario</dt><dd>L–V 9:30 a 21:30 (cita previa)</dd>
        ${s.details.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}
      </dl>
    </aside>
  </div>
</section>

<section class="section section--sand" aria-labelledby="faq-t">
  <div class="wrap">
    <div class="section-head section-head--center">
      <span class="kicker" data-reveal>Preguntas frecuentes</span>
      <h2 id="faq-t" data-split>${esc(s.name)} en Móstoles: <em>dudas habituales</em></h2>
    </div>
    ${faqHtml(s.faqs)}
  </div>
</section>

<section class="section" aria-labelledby="rel-t">
  <div class="wrap">
    <div class="section-head"><span class="kicker" data-reveal>Combínalo con</span><h2 id="rel-t" data-split>Servicios <em>relacionados</em></h2></div>
    <div class="svc-grid">${s.related.map((r, i) => svcCard(svcBySlug[r], i)).join('')}</div>
  </div>
</section>
${ctaFinal(`¿Te apetece probar <em>${esc(s.name)}</em>?`, 'Pregúntanos sin compromiso: te orientamos y buscamos el horario que mejor te encaja.', wa)}
`,
  }));
}

// ════════════════ TALLERES ════════════════
write('/talleres/', layout({
  path: '/talleres/',
  active: 'talleres',
  title: 'Talleres de Bienestar en Móstoles | NOVA',
  description: 'Talleres y encuentros de bienestar en Móstoles: movimiento, respiración y crecimiento personal en NOVA, en colaboración con otras entidades.',
  ld: [breadcrumbLd([['Inicio', '/'], ['Talleres', '/talleres/']]), { '@type': 'CollectionPage', url: abs('/talleres/'), name: 'Talleres de bienestar en Móstoles', about: { '@id': businessId } }],
  body: `
${pageHero({ crumbs: [['Inicio', '/'], ['Talleres', '/talleres/']], kicker: 'Encuentros', h1: 'Talleres de bienestar <em>en Móstoles</em>', lead: 'Experiencias en grupo, organizadas en colaboración con otras entidades, para moverse, respirar, reflexionar y compartir.', extra: `<div class="btn-row" data-reveal style="--d:450;margin-top:34px">${btnWa('Hola, quiero información sobre los próximos talleres de NOVA.', 'Próximas fechas')}</div>` })}
<section class="section">
  <div class="wrap split">
    <div>
      <span class="kicker" data-reveal>Taller destacado</span>
      <h2 data-split>La Capa Transparente: <em>Fiestas Optimistas</em></h2>
      <p class="lead" data-reveal>Una mezcla de alegría, movimiento y reflexión, en colaboración con El Optimista Provocador.</p>
      <p data-reveal>Un encuentro pensado para soltar el piloto automático, mirar hacia dentro con humor y llevarte herramientas prácticas para tu día a día.</p>
      <ul class="checklist">
        <li data-reveal><span class="draw">${drawable(icons.check)}</span><span>Dinámicas de movimiento y respiración.</span></li>
        <li data-reveal style="--d:120"><span class="draw">${drawable(icons.check)}</span><span>Espacios de reflexión individual y en grupo.</span></li>
        <li data-reveal style="--d:240"><span class="draw">${drawable(icons.check)}</span><span>Plazas limitadas para cuidar el ambiente.</span></li>
      </ul>
      <div data-reveal>${btnWa('Hola, quiero apuntarme al taller La Capa Transparente.', 'Quiero apuntarme')}</div>
    </div>
    <figure class="arch" data-reveal="clip">${photos.talleres ? photo('talleres', 'Taller en NOVA Centro de Bienestar', { cls: 'parallax' }) : art.scene}<figcaption><strong>Plazas limitadas</strong>Pregúntanos por la próxima edición</figcaption></figure>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    <div class="section-head"><span class="kicker" data-reveal>¿Organizas algo?</span><h2 data-split>Talleres <em>a medida</em></h2>
    <p class="lead" data-reveal>Organizamos sesiones para grupos, empresas y celebraciones: Yoga, Pilates, respiración o relajación adaptados a tu grupo. Escríbenos y lo preparamos juntos.</p></div>
  </div>
</section>
${ctaFinal()}
`,
}));

// ════════════════ SOBRE NOSOTROS ════════════════
write('/sobre-nosotros/', layout({
  path: '/sobre-nosotros/',
  active: 'sobre',
  title: `Sobre NOVA Centro de Bienestar en Móstoles | ${site.owner}`,
  description: `Conoce NOVA Centro de Bienestar en Móstoles y a ${site.owner}, su fundadora. Nuestra forma de entender el bienestar: cercana, personal y global.`,
  ld: [
    breadcrumbLd([['Inicio', '/'], ['Sobre nosotros', '/sobre-nosotros/']]),
    { '@type': 'AboutPage', url: abs('/sobre-nosotros/'), about: { '@id': businessId } },
    { '@type': 'Person', name: site.owner, worksFor: { '@id': businessId }, jobTitle: 'Fundadora de NOVA Centro de Bienestar' },
  ],
  body: `
${pageHero({ crumbs: [['Inicio', '/'], ['Sobre nosotros', '/sobre-nosotros/']], kicker: 'Quiénes somos', h1: 'Bienestar cercano, <em>en el corazón de Móstoles</em>', lead: site.tagline + ' Clases, terapias y estética en un espacio pequeño y cuidado.' })}
<section class="section">
  <div class="wrap split">
    <figure class="arch" data-reveal="clip">${photos.beatriz ? photo('beatriz', `${site.owner}, fundadora de NOVA`, { cls: 'parallax' }) : art.scene}<figcaption><strong>${esc(site.owner)}</strong>Fundadora de NOVA</figcaption></figure>
    <div>
      <span class="kicker" data-reveal>La fundadora</span>
      <h2 data-split>${esc(site.owner)}</h2>
      <!-- Completar con la formación, titulaciones y años de experiencia de Beatriz (señal E-E-A-T para Google). -->
      <p data-reveal>Beatriz creó NOVA con la convicción de que el bienestar se construye combinando movimiento, descanso y cuidado. Por eso en el centro conviven disciplinas que se complementan entre sí.</p>
      <p data-reveal>Su forma de trabajar parte siempre de la escucha: entender cómo llega cada persona, qué necesita y a qué ritmo puede avanzar.</p>
      <div data-reveal>${btnWa('Hola Beatriz, me gustaría saber más sobre NOVA.', 'Habla con nosotros')}</div>
    </div>
  </div>
</section>
<section class="section section--forest">
  <div class="wrap">
    <div class="section-head"><span class="kicker" data-reveal>Nuestros valores</span><h2 data-split>Lo que <em>nos mueve</em></h2></div>
    <div class="prices-grid">
      ${[['Escucha', 'Cada persona es distinta. Empezamos siempre preguntando.'], ['Calma', 'Un espacio sin prisas, con grupos reducidos y sesiones sin interrupciones.'], ['Visión global', 'Cuerpo y mente van juntos: combinamos movimiento, terapia y cuidado.'], ['Constancia', 'Te acompañamos para que el bienestar se convierta en hábito.']].map(([t, d], i) => `
      <div class="price-card" data-reveal style="--d:${i * 100};background:rgba(255,255,255,.06);border-color:rgba(251,248,243,.18)"><span class="tag" style="color:var(--gold)">0${i + 1}</span><h3 style="color:var(--cream)">${t}</h3><p style="margin:0;color:rgba(251,248,243,.78)">${d}</p></div>`).join('')}
    </div>
  </div>
</section>
${visitSection()}
${ctaFinal()}
`,
}));

// ════════════════ CONTACTO ════════════════
write('/contacto/', layout({
  path: '/contacto/',
  active: 'contacto',
  title: 'Contacto y Cita Previa | NOVA Centro de Bienestar Móstoles',
  description: `Pide cita en NOVA Centro de Bienestar, ${site.street}, Móstoles. Teléfono y WhatsApp ${site.phone}. Lunes a viernes de 9:30 a 21:30.`,
  ld: [breadcrumbLd([['Inicio', '/'], ['Contacto', '/contacto/']]), { '@type': 'ContactPage', url: abs('/contacto/'), about: { '@id': businessId } }],
  body: `
${pageHero({ crumbs: [['Inicio', '/'], ['Contacto', '/contacto/']], kicker: 'Cita previa', h1: 'Contacto y <em>cita previa</em>', lead: 'Cuéntanos qué te interesa y te respondemos con horarios y disponibilidad. También puedes llamarnos o escribirnos un email.' })}
<section class="section">
  <div class="wrap split" style="align-items:start">
    <div data-reveal>
      <h2>Escríbenos</h2>
      <form class="form" data-wa-form novalidate>
        <div class="form-row">
          <div class="field"><label for="f-name">Nombre</label><input id="f-name" name="nombre" autocomplete="given-name" required></div>
          <div class="field"><label for="f-service">Me interesa</label>
            <select id="f-service" name="servicio">
              <option>Información general</option>
              ${categories.map((c) => `<optgroup label="${esc(c.name)}">${servicesOf(c.slug).map((s) => `<option>${esc(s.name)}</option>`).join('')}</optgroup>`).join('')}
              <option>Talleres</option>
            </select>
          </div>
        </div>
        <div class="field"><label for="f-when">¿Cuándo te viene mejor?</label>
          <select id="f-when" name="cuando"><option>Mañanas</option><option>Mediodía</option><option>Tardes</option><option>Me da igual</option></select>
        </div>
        <div class="field"><label for="f-msg">Mensaje (opcional)</label><textarea id="f-msg" name="mensaje" placeholder="Cuéntanos si tienes alguna lesión, tu nivel o cualquier duda."></textarea></div>
        <button class="btn btn--primary magnetic" type="submit">${icons.whatsapp}<span>Enviar por WhatsApp</span></button>
        <small>Se abrirá WhatsApp con tu mensaje preparado. No guardamos ningún dato en esta web. Consulta nuestra <a href="/privacidad/">política de privacidad</a>.</small>
      </form>
    </div>
    <div class="visit-card on-dark" data-reveal style="--d:150">
      <h2>NOVA Centro de Bienestar</h2>
      <dl>
        <div><dt>Dirección</dt><dd>${esc(site.street)}<br>${site.postalCode} ${site.city}, ${site.region}</dd></div>
        <div><dt>Horario</dt><dd>${esc(site.hours)}</dd></div>
        <div><dt>Teléfono y WhatsApp</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
        <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
      </dl>
      <div class="btn-row"><a class="btn btn--light magnetic" href="${site.phoneHref}">${icons.phone}<span>Llamar</span></a><a class="btn btn--light magnetic" href="${site.mapsUrl}" target="_blank" rel="noopener">${icons.pin}<span>Cómo llegar</span></a></div>
    </div>
  </div>
</section>
${visitSection()}
`,
}));

// ════════════════ LEGALES (noindex) ════════════════
const legal = (path, h1, html) => write(path, layout({
  path, noindex: true, title: `${h1} | ${site.name}`, description: `${h1} de ${site.name}.`,
  body: `${pageHero({ crumbs: [['Inicio', '/'], [h1, path]], kicker: 'Información legal', h1, lead: site.name })}
<section class="section"><div class="wrap prose" style="max-width:820px">${html}</div></section>`,
}));
const owner = `<p><strong>Titular:</strong> ${esc(site.owner)} — <strong>NIF:</strong> [completar]<br><strong>Domicilio:</strong> ${esc(site.street)}, ${site.postalCode} ${site.city} (${site.region})<br><strong>Teléfono:</strong> ${site.phone} — <strong>Email:</strong> <a href="mailto:${site.email}">${site.email}</a></p>`;
legal('/aviso-legal/', 'Aviso legal', `
<p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web:</p>${owner}
<h2>Condiciones de uso</h2><p>El acceso a este sitio web es gratuito y atribuye la condición de usuario, que acepta estas condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos.</p>
<h2>Propiedad intelectual</h2><p>Los contenidos de esta web son propiedad de NOVA Centro de Bienestar o de terceros que han autorizado su uso. Queda prohibida su reproducción sin permiso.</p>
<h2>Responsabilidad</h2><p>La información de esta web tiene carácter divulgativo. Los servicios de bienestar ofrecidos no sustituyen el diagnóstico ni el tratamiento médico.</p>`);
legal('/privacidad/', 'Política de privacidad', `
${owner}
<h2>Qué datos tratamos</h2><p>Esta web no dispone de formularios que almacenen datos. Si nos contactas por WhatsApp, teléfono o email, trataremos los datos que nos facilites (nombre, teléfono y mensaje) únicamente para responder a tu consulta y gestionar tus citas.</p>
<h2>Base legal y conservación</h2><p>La base legal es tu consentimiento y, en su caso, la relación contractual. Conservaremos los datos mientras dure la relación y los plazos legales aplicables.</p>
<h2>Tus derechos</h2><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:${site.email}">${site.email}</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>`);
legal('/cookies/', 'Política de cookies', `
<p>Esta web no utiliza cookies propias de analítica ni de publicidad. Solo guarda en tu navegador (sessionStorage) si ya has visto la animación de bienvenida, para no repetirla.</p>
<h2>Contenidos de terceros</h2><p>El mapa de ubicación de Google Maps solo se carga si pulsas «Mostrar mapa». A partir de ese momento Google puede instalar sus propias cookies, según su política de privacidad.</p>
<p>Si en el futuro se añade analítica (por ejemplo Google Analytics 4), deberá incorporarse un banner de consentimiento antes de activarla.</p>`);

// ════════════════ 404 ════════════════
writeFileSync(join(OUT, '404.html'), layout({
  path: '/404.html', noindex: true,
  title: 'Página no encontrada | NOVA Centro de Bienestar', description: 'La página que buscas no existe.',
  body: `${pageHero({ crumbs: [['Inicio', '/'], ['404', '/404.html']], kicker: 'Error 404', h1: 'Esta página se ha ido a <em>relajarse</em>', lead: 'No encontramos lo que buscas, pero seguro que alguno de estos enlaces te ayuda.', extra: `<div class="btn-row" data-reveal style="--d:400;margin-top:30px"><a class="btn btn--primary magnetic" href="/"><span>Ir al inicio</span></a>${categories.map((c) => `<a class="btn btn--ghost magnetic" href="/${c.slug}/"><span>${c.name}</span></a>`).join('')}</div>` })}`,
}));

// ════════════════ SITEMAP, ROBOTS, REDIRECCIONES ════════════════
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${TODAY}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);
writeFileSync(join(OUT, '.htaccess'), `# NOVA — Apache
Options -Indexes
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
# 1) Una sola versión del dominio: https y sin www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^(.*)$ https://${site.url.replace('https://', '')}/$1 [R=301,L]
</IfModule>

# 2) URLs antiguas → nuevas (conserva el posicionamiento ya ganado)
${Object.entries(legacyRedirects).map(([from, to]) => `Redirect 301 ${from} ${to}`).join('\n')}

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Strict-Transport-Security "max-age=31536000"
  <FilesMatch "\\.(woff2|mp4|webm|jpg|webp|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/xml text/plain
</IfModule>
`);
writeFileSync(join(OUT, '_redirects'), `https://www.novamostoles.com/* https://novamostoles.com/:splat 301!
http://www.novamostoles.com/* https://novamostoles.com/:splat 301!
${Object.entries(legacyRedirects).map(([from, to]) => `${from} ${to} 301`).join('\n')}
`);

console.log(`OK: ${sitemap.length} páginas indexables · logo: ${logoFile || 'provisional'} · fotos: ${Object.keys(photos).length} · reseñas: ${hasReviews ? reviews.reviews.length : 0}`);
