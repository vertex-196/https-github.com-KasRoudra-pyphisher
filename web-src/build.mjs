// Generador estático de la web de NOVA. Uso: node web-src/build.mjs
// Escribe en /web. No borra web/assets/media (lo genera Remotion).
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, categories, services, legacyRedirects } from './data.mjs';
import { icons, logo, art } from './icons.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = join(SRC, '..', 'web');
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.url + p;
const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
const svcBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const svcPath = (s) => `/${s.cat}/${s.slug}/`;
const servicesOf = (cat) => services.filter((s) => s.cat === cat);

const write = (path, content) => {
  const file = join(OUT, path.endsWith('/') ? path + 'index.html' : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

// ── Recursos estáticos con hash para caché larga ──
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);
const css = readFileSync(join(SRC, 'styles.css'), 'utf8');
const js = readFileSync(join(SRC, 'main.js'), 'utf8');
const cssV = hash(css);
const jsV = hash(js);
mkdirSync(join(OUT, 'assets'), { recursive: true });
writeFileSync(join(OUT, 'assets/styles.css'), css);
writeFileSync(join(OUT, 'assets/main.js'), js);
writeFileSync(join(OUT, 'favicon.svg'), logo.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" style="color:#2e4a3b" ').replace(/currentColor/g, '#2e4a3b'));

const sitemap = [];

// ── Datos estructurados ──
const businessId = `${site.url}/#negocio`;
const business = {
  '@type': ['HealthAndBeautyBusiness', 'SportsActivityLocation'],
  '@id': businessId,
  name: site.name,
  alternateName: 'NOVA Móstoles',
  description: 'Centro de bienestar en Móstoles: Pilates, Yoga, Hipopresivos, Circuito Funcional, Taichí, masajes, drenaje linfático, maderoterapia, osteopatía y estética.',
  url: site.url + '/',
  telephone: site.phone.replace(/\s/g, ''),
  image: abs('/assets/media/og-nova-mostoles.jpg'),
  logo: abs('/favicon.svg'),
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.street,
    postalCode: site.postalCode,
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: site.country,
  },
  hasMap: site.mapsUrl,
  areaServed: [{ '@type': 'City', name: 'Móstoles' }, { '@type': 'City', name: 'Alcorcón' }, { '@type': 'City', name: 'Fuenlabrada' }, { '@type': 'City', name: 'Arroyomolinos' }],
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:30',
    closes: '21:30',
  }],
  founder: { '@type': 'Person', name: site.owner },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de NOVA Centro de Bienestar',
    itemListElement: categories.map((c) => ({
      '@type': 'OfferCatalog',
      name: c.name,
      itemListElement: servicesOf(c.slug).map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: abs(svcPath(s)) },
      })),
    })),
  },
  sameAs: [site.facebook, site.instagram].filter(Boolean),
};
const website = {
  '@type': 'WebSite',
  '@id': `${site.url}/#web`,
  url: site.url + '/',
  name: site.name,
  inLanguage: 'es-ES',
  publisher: { '@id': businessId },
};
const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});
const faqLd = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// ── Fragmentos ──
const waLink = (text) => `${site.whatsapp}?text=${encodeURIComponent(text)}`;
const btnWa = (text, label = 'Reservar por WhatsApp', cls = 'btn--primary') =>
  `<a class="btn ${cls}" href="${esc(waLink(text))}" target="_blank" rel="noopener">${icons.whatsapp}${label}</a>`;
const btnCall = (cls = 'btn--ghost') => `<a class="btn ${cls}" href="${site.phoneHref}">${icons.phone}Llamar al ${site.phone.replace('+34 ', '')}</a>`;

const header = (active) => `
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="site-header" id="top">
  <div class="wrap">
    <a class="brand" href="/">${logo}<span><span class="brand-name">NOVA</span><span class="brand-sub">Centro de Bienestar</span></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">${icons.menu}</button>
    <nav class="nav" id="nav" aria-label="Principal">
      <ul>
        ${categories.map((c) => `
        <li class="nav-item${active === c.slug ? ' is-active' : ''}">
          <div class="nav-row">
            <a class="nav-link" href="/${c.slug}/"${active === c.slug ? ' aria-current="page"' : ''}>${c.name}</a>
            <button class="sub-toggle" type="button" aria-expanded="false" aria-label="Ver servicios de ${esc(c.name)}">${icons.chev}</button>
          </div>
          <ul class="dropdown">
            ${servicesOf(c.slug).map((s) => `<li><a href="${svcPath(s)}"><span class="ico">${icons[s.icon]}</span>${esc(s.name)}</a></li>`).join('')}
            <li><a class="all" href="/${c.slug}/">Ver todas las ${c.name.toLowerCase()} →</a></li>
          </ul>
        </li>`).join('')}
        <li class="nav-item"><a class="nav-link" href="/talleres/"${active === 'talleres' ? ' aria-current="page"' : ''}>Talleres</a></li>
        <li class="nav-item"><a class="nav-link" href="/sobre-nosotros/"${active === 'sobre' ? ' aria-current="page"' : ''}>Nosotros</a></li>
        <li class="nav-item"><a class="nav-link" href="/contacto/"${active === 'contacto' ? ' aria-current="page"' : ''}>Contacto</a></li>
      </ul>
      <a class="btn btn--primary nav-cta" href="${esc(waLink('Hola, me gustaría pedir cita en NOVA.'))}" target="_blank" rel="noopener">Pedir cita</a>
    </nav>
  </div>
</header>`;

const footer = () => `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/">${logo}<span><span class="brand-name">NOVA</span><span class="brand-sub">Centro de Bienestar</span></span></a>
        <p>Pilates, Yoga, terapias manuales y estética en Móstoles. Un espacio para reconectar cuerpo y mente.</p>
        <address>
          ${esc(site.street)}<br>${site.postalCode} ${site.city} (${site.region})<br>
          <a href="${site.phoneHref}">${site.phone}</a><br>
          L–V 9:30–21:30 · con cita previa
        </address>
      </div>
      ${categories.map((c) => `
      <div>
        <h2>${c.name}</h2>
        <ul>${servicesOf(c.slug).map((s) => `<li><a href="${svcPath(s)}">${esc(s.name)}${s.slug === 'clases-online' ? '' : ' en Móstoles'}</a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>${new Date().getFullYear()}</span> ${esc(site.name)} · Móstoles</span>
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

const layout = ({ path, title, description, body, ld = [], active = '', noindex = false, ogImage = '/assets/media/og-nova-mostoles.jpg', priority = '0.7', preloadPoster = false }) => {
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
<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/fraunces-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${preloadPoster ? '<link rel="preload" href="/assets/media/hero-poster.jpg" as="image" fetchpriority="high">' : ''}
<link rel="stylesheet" href="/assets/styles.css?v=${cssV}">
<script>document.documentElement.classList.remove('no-js')</script>
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
${header(active)}
<main id="contenido">
${body}
</main>
${footer()}
<script src="/assets/main.js?v=${jsV}" defer></script>
</body>
</html>
`;
};

const breadcrumbHtml = (items) => `
<nav class="breadcrumb" aria-label="Migas de pan"><ol>
  ${items.map(([name, path], i) => i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${path}">${esc(name)}</a></li>`).join('')}
</ol></nav>`;

const svcCard = (s, i = 0) => `
<a class="svc-card reveal reveal-d${i % 3 + 1}" href="${svcPath(s)}" data-cat="${s.cat}">
  <span class="ico">${icons[s.icon]}</span>
  <h3>${esc(s.name)}</h3>
  <p>${esc(s.lead)}</p>
  <span class="more">Saber más ${icons.arrow}</span>
</a>`;

const faqHtml = (faqs) => `
<div class="faq">
  ${faqs.map(([q, a], i) => `
  <details class="reveal"${i === 0 ? ' open' : ''}>
    <summary>${esc(q)}<span class="pm" aria-hidden="true"></span></summary>
    <div class="answer"><p>${esc(a)}</p></div>
  </details>`).join('')}
</div>`;

const ctaBand = (title = 'Tu momento de <em style="color:#fff">bienestar</em> empieza aquí', text = 'Escríbenos por WhatsApp o llámanos y te ayudamos a elegir la clase o el tratamiento que mejor encaja contigo.', wa = 'Hola, me gustaría pedir información sobre NOVA.') => `
<section class="section" aria-label="Pide cita">
  <div class="wrap">
    <div class="cta-band reveal">
      <h2>${title}</h2>
      <p>${esc(text)}</p>
      <div class="btn-row">${btnWa(wa, 'Escríbenos por WhatsApp', 'btn--light')}<a class="btn btn--ghost" style="border-color:#fff;color:#fff" href="${site.phoneHref}">${icons.phone}${site.phone}</a></div>
    </div>
  </div>
</section>`;

const visitSection = (headingLevel = 'h2') => `
<section class="section section--sand" id="ubicacion" aria-labelledby="ubicacion-t">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="kicker">Dónde estamos</span>
      <${headingLevel} id="ubicacion-t">Ven a vernos en <em>Móstoles</em></${headingLevel}>
    </div>
    <div class="visit">
      <div class="visit-card reveal">
        <dl>
          <div><dt>Dirección</dt><dd>${esc(site.street)}<br>${site.postalCode} ${site.city}, ${site.region}</dd></div>
          <div><dt>Horario</dt><dd>${esc(site.hours)}</dd></div>
          <div><dt>Teléfono y WhatsApp</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
        </dl>
        <div class="btn-row">${btnWa('Hola, me gustaría pedir cita en NOVA.', 'Pedir cita', 'btn--primary')}<a class="btn btn--light" href="${site.mapsUrl}" target="_blank" rel="noopener">${icons.pin}Cómo llegar</a></div>
      </div>
      <div class="map reveal reveal-d1" data-map="${esc(site.mapsEmbed)}">
        <div>
          <div class="map-pin">${icons.pin}</div>
          <button class="btn btn--ghost" type="button" data-load-map>Mostrar mapa</button>
          <p>Al cargar el mapa, Google puede instalar cookies propias. <a href="${site.mapsUrl}" target="_blank" rel="noopener">Abrir en Google Maps</a></p>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ════════════════ PORTADA ════════════════
const homeFaqs = [
  ['¿Dónde está NOVA Centro de Bienestar?', `En ${site.street}, ${site.postalCode} Móstoles (Madrid). Pulsa “Cómo llegar” para abrir la ruta en Google Maps.`],
  ['¿Cuál es el horario?', 'Atendemos de lunes a viernes de 9:30 a 21:30, siempre con cita previa para poder dedicarte el tiempo que necesitas.'],
  ['¿Cómo reservo una clase o un tratamiento?', `La forma más rápida es escribirnos por WhatsApp o llamar al ${site.phone}. Te contamos horarios, plazas libres y tarifas.`],
  ['¿Puedo combinar clases y terapias?', 'Sí, y es lo que mejor funciona: por ejemplo, Pilates o Hipopresivos para fortalecer, y masaje o drenaje para recuperar. Te ayudamos a diseñar tu plan.'],
  ['¿Las clases son para principiantes?', 'Todas las clases trabajan en grupos reducidos y con variantes por nivel, así que puedes empezar sin experiencia previa.'],
];
const featured = ['pilates-mostoles', 'hipopresivos-mostoles', 'yoga-mostoles', 'drenaje-linfatico-mostoles', 'maderoterapia-mostoles', 'lifting-pestanas-mostoles'].map((s) => svcBySlug[s]);
const catArt = { clases: art.rings, terapias: art.waves, estetica: art.petals };

write('/', layout({
  path: '/',
  priority: '1.0',
  preloadPoster: true,
  title: 'Centro de Bienestar en Móstoles | Pilates, Yoga y Masajes',
  description: 'NOVA, centro de bienestar en Móstoles: Pilates, Yoga, Hipopresivos, masajes, drenaje linfático y estética. Grupos reducidos. Pide tu cita.',
  ld: [{ '@type': 'WebPage', '@id': `${site.url}/#portada`, url: site.url + '/', name: 'Centro de Bienestar en Móstoles', about: { '@id': businessId }, isPartOf: { '@id': `${site.url}/#web` } }, faqLd(homeFaqs)],
  body: `
<section class="hero" aria-labelledby="hero-t">
  <div class="hero-media" data-hero-video>
    <img src="/assets/media/hero-poster.jpg" alt="" width="1280" height="720" fetchpriority="high">
  </div>
  <div class="wrap">
    <span class="kicker reveal">Cuerpo y mente, en equilibrio</span>
    <h1 id="hero-t" class="reveal reveal-d1">Tu centro de bienestar <em>en Móstoles</em></h1>
    <p class="lead reveal reveal-d2">Pilates, Yoga, Hipopresivos, terapias manuales y estética en un espacio tranquilo de Móstoles. Grupos reducidos y atención de verdad personalizada.</p>
    <div class="btn-row reveal reveal-d3">
      ${btnWa('Hola, me gustaría pedir cita en NOVA.', 'Pide tu cita')}
      <a class="btn btn--ghost" href="#servicios">Ver servicios</a>
    </div>
    <ul class="hero-badges reveal reveal-d3">
      <li>${icons.users}Grupos reducidos</li>
      <li>${icons.clock}L–V 9:30 a 21:30</li>
      <li>${icons.pin}Paseo de Goya 26, Móstoles</li>
    </ul>
  </div>
  <span class="scroll-cue" aria-hidden="true"></span>
</section>

<section class="section" aria-labelledby="pilares-t">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="kicker">Por qué NOVA</span>
      <h2 id="pilares-t">Un lugar para <em>cuidarte</em> sin prisas</h2>
      <p class="lead">Somos un centro pequeño a propósito: conocemos a cada persona por su nombre y adaptamos cada clase y cada sesión a cómo llegas ese día.</p>
    </div>
    <div class="pillars">
      <div class="pillar reveal">${icons.users}<h3>Grupos reducidos</h3><p>Pocas personas por clase para corregirte y acompañarte de verdad.</p></div>
      <div class="pillar reveal reveal-d1">${icons.heart}<h3>Trato personal</h3><p>Escuchamos antes de proponer. Tu historia y tus objetivos marcan el plan.</p></div>
      <div class="pillar reveal reveal-d2">${icons.leaf}<h3>Cuerpo y mente</h3><p>Movimiento, respiración y terapias manuales que trabajan juntos.</p></div>
      <div class="pillar reveal reveal-d3">${icons.sparkle}<h3>Todo en un lugar</h3><p>Clases, terapias y estética en el mismo espacio, en el centro de Móstoles.</p></div>
    </div>
  </div>
</section>

<section class="section section--sand" id="servicios" aria-labelledby="servicios-t">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="kicker">Nuestros servicios</span>
      <h2 id="servicios-t">Tres caminos hacia tu <em>bienestar</em></h2>
    </div>
    <div class="cat-grid">
      ${categories.map((c, i) => `
      <a class="cat-card cat-card--${c.color} reveal reveal-d${i + 1}" href="/${c.slug}/">
        <span class="art">${catArt[c.slug]}</span>
        <span class="kicker">${esc(c.kicker)}</span>
        <h3>${esc(c.name)}</h3>
        <ul>${servicesOf(c.slug).slice(0, 5).map((s) => `<li>${esc(s.name)}</li>`).join('')}</ul>
        <span class="more">Descubrir ${c.name.toLowerCase()} ${icons.arrow}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="destacados-t">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="kicker">Lo más pedido</span>
      <h2 id="destacados-t">Clases y tratamientos más demandados en Móstoles</h2>
    </div>
    <div class="svc-grid">${featured.map(svcCard).join('')}</div>
  </div>
</section>

<section class="section section--sand" aria-labelledby="sobre-t">
  <div class="wrap split">
    <figure class="figure-art reveal">
      ${art.scene}
      <figcaption><strong>${esc(site.owner)}</strong>Fundadora de NOVA Centro de Bienestar</figcaption>
    </figure>
    <div class="reveal reveal-d1">
      <span class="kicker">Quiénes somos</span>
      <h2 id="sobre-t">Un centro creado para <em>reconectar</em></h2>
      <p class="lead">NOVA nace de una idea sencilla: que cuidarse no debería ser complicado ni impersonal.</p>
      <p>Al frente del centro está ${esc(site.owner)}, que ha reunido en un mismo espacio las disciplinas que mejor funcionan para devolver al cuerpo su equilibrio: el movimiento consciente, las terapias manuales y el cuidado estético.</p>
      <ul class="checklist">
        <li>${icons.check}<span>Valoración inicial antes de empezar cualquier clase o terapia.</span></li>
        <li>${icons.check}<span>Planes que combinan movimiento y recuperación.</span></li>
        <li>${icons.check}<span>Sesiones presenciales en Móstoles y también online.</span></li>
      </ul>
      <a class="btn btn--ghost" href="/sobre-nosotros/">Conoce NOVA ${icons.arrow}</a>
    </div>
  </div>
</section>

<section class="section section--forest" aria-labelledby="empezar-t">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="kicker">Empezar es fácil</span>
      <h2 id="empezar-t">Tres pasos para tu primera sesión</h2>
    </div>
    <ol class="steps">
      <li class="reveal"><h3>Escríbenos</h3><p>Por WhatsApp o teléfono. Cuéntanos qué buscas y cómo te encuentras.</p></li>
      <li class="reveal reveal-d1"><h3>Te orientamos</h3><p>Te recomendamos la clase o el tratamiento adecuado y un horario que te encaje.</p></li>
      <li class="reveal reveal-d2"><h3>Primera sesión</h3><p>Hacemos una valoración y adaptamos la sesión a ti desde el primer día.</p></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="resenas-t">
  <div class="wrap">
    <div class="reviews-cta reveal">
      <div>
        <div class="stars">${icons.star.repeat(5)}</div>
        <h2 id="resenas-t" style="font-size:clamp(1.6rem,3vw,2.2rem);margin:12px 0 6px">¿Ya nos conoces?</h2>
        <p style="margin:0;color:var(--muted)">Tu opinión ayuda a otras personas de Móstoles a encontrarnos. ¡Gracias por compartirla!</p>
      </div>
      <a class="btn btn--primary" href="${site.mapsUrl}" target="_blank" rel="noopener">Déjanos tu reseña en Google</a>
    </div>
  </div>
</section>

<section class="section section--sand" aria-labelledby="faq-t">
  <div class="wrap">
    <div class="section-head section-head--center reveal">
      <span class="kicker">Preguntas frecuentes</span>
      <h2 id="faq-t">Todo lo que necesitas saber</h2>
    </div>
    ${faqHtml(homeFaqs)}
  </div>
</section>

${visitSection()}
${ctaBand()}
`,
}));

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
      {
        '@type': 'CollectionPage', url: abs(`/${c.slug}/`), name: c.h1, about: { '@id': businessId },
        mainEntity: { '@type': 'ItemList', itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(svcPath(s)), name: s.name })) },
      },
    ],
    body: `
<section class="page-hero" data-cat="${c.slug}">
  <div class="wrap">
    ${breadcrumbHtml(crumbs)}
    <span class="kicker">${esc(c.kicker)}</span>
    <h1>${esc(c.h1)}</h1>
    <p class="lead">${esc(c.intro)}</p>
    <div class="btn-row" style="margin-top:30px">${btnWa(`Hola, quiero información sobre ${c.name.toLowerCase()} en NOVA.`, 'Pedir información')}${btnCall()}</div>
  </div>
</section>
<section class="section" aria-labelledby="lista-t">
  <div class="wrap">
    <h2 id="lista-t" class="sr-only">${esc(c.name)} disponibles</h2>
    <div class="svc-grid">${list.map(svcCard).join('')}</div>
  </div>
</section>
<section class="section section--sand" aria-labelledby="otras-t">
  <div class="wrap">
    <div class="section-head reveal"><span class="kicker">Complementa tu plan</span><h2 id="otras-t">También en NOVA</h2></div>
    <div class="cat-grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      ${others.map((o, i) => `
      <a class="cat-card cat-card--${o.color} reveal reveal-d${i + 1}" href="/${o.slug}/" style="min-height:340px">
        <span class="art">${catArt[o.slug]}</span>
        <span class="kicker">${esc(o.kicker)}</span>
        <h3>${esc(o.name)}</h3>
        <ul>${servicesOf(o.slug).slice(0, 3).map((s) => `<li>${esc(s.name)}</li>`).join('')}</ul>
        <span class="more">Ver ${o.name.toLowerCase()} ${icons.arrow}</span>
      </a>`).join('')}
    </div>
  </div>
</section>
${visitSection()}
${ctaBand()}
`,
  }));
}

// ════════════════ SERVICIOS ════════════════
for (const s of services) {
  const c = catBySlug[s.cat];
  const path = svcPath(s);
  const crumbs = [['Inicio', '/'], [c.name, `/${c.slug}/`], [s.name, path]];
  const wa = `Hola, me gustaría información sobre ${s.name} en NOVA.`;
  const isTherapy = s.cat === 'terapias';
  write(path, layout({
    path,
    priority: '0.8',
    active: s.cat,
    title: s.title,
    description: s.description,
    ld: [
      breadcrumbLd(crumbs),
      {
        '@type': 'Service',
        '@id': abs(path) + '#servicio',
        name: `${s.name} en Móstoles`,
        serviceType: s.name,
        description: s.description,
        url: abs(path),
        provider: { '@id': businessId },
        areaServed: { '@type': 'City', name: 'Móstoles' },
        category: c.name,
      },
      faqLd(s.faqs),
    ],
    body: `
<section class="page-hero" data-cat="${s.cat}">
  <span class="ico-xl">${icons[s.icon]}</span>
  <div class="wrap">
    ${breadcrumbHtml(crumbs)}
    <span class="kicker">${esc(c.name)} · Móstoles</span>
    <h1>${esc(s.h1)}</h1>
    <p class="lead">${esc(s.lead)}</p>
    <ul class="facts">${s.details.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul>
    <div class="btn-row">${btnWa(wa)}${btnCall()}</div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-layout">
    <article class="prose">
      <h2>${esc(s.name)}: qué es y cómo te ayuda</h2>
      ${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}

      <h2>Beneficios</h2>
      <ul class="benefits">${s.benefits.map((b) => `<li>${icons.check}<span>${esc(b)}</span></li>`).join('')}</ul>

      <h2>¿Para quién es?</h2>
      <ul class="who">${s.forWho.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>

      <h2>Cómo es una sesión en NOVA</h2>
      <ol class="timeline">${s.steps.map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
      ${isTherapy ? '<p class="note">Las terapias manuales son tratamientos de bienestar complementarios y no sustituyen el diagnóstico ni el tratamiento médico. Si tienes una patología, consulta con tu médico.</p>' : ''}
    </article>

    <aside class="aside-card" aria-labelledby="reserva-t">
      <h2 id="reserva-t">Pide tu cita</h2>
      <p>¿Te interesa ${esc(s.name)}? Escríbenos y te contamos horarios disponibles y tarifas.</p>
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
    <div class="section-head section-head--center reveal">
      <span class="kicker">Preguntas frecuentes</span>
      <h2 id="faq-t">${esc(s.name)} en Móstoles: dudas habituales</h2>
    </div>
    ${faqHtml(s.faqs)}
  </div>
</section>

<section class="section" aria-labelledby="rel-t">
  <div class="wrap">
    <div class="section-head reveal"><span class="kicker">Combínalo con</span><h2 id="rel-t">Servicios relacionados</h2></div>
    <div class="svc-grid">${s.related.map((r) => svcCard(svcBySlug[r])).join('')}</div>
  </div>
</section>
${ctaBand(`¿Te apetece probar <em style="color:#fff">${esc(s.name)}</em>?`, 'Pregúntanos sin compromiso: te orientamos y buscamos el horario que mejor te encaja.', wa)}
`,
  }));
}

// ════════════════ TALLERES ════════════════
write('/talleres/', layout({
  path: '/talleres/',
  active: 'talleres',
  title: 'Talleres de Bienestar en Móstoles | NOVA',
  description: 'Talleres y encuentros de bienestar en Móstoles: movimiento, respiración, reflexión y crecimiento personal en NOVA Centro de Bienestar. Consulta próximas fechas.',
  ld: [breadcrumbLd([['Inicio', '/'], ['Talleres', '/talleres/']])],
  body: `
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbHtml([['Inicio', '/'], ['Talleres', '/talleres/']])}
    <span class="kicker">Encuentros</span>
    <h1>Talleres de bienestar en Móstoles</h1>
    <p class="lead">Experiencias en grupo para moverse, respirar, reflexionar y compartir. Una forma distinta de cuidarte y de conocer gente con tus mismas inquietudes.</p>
    <div class="btn-row" style="margin-top:30px">${btnWa('Hola, quiero información sobre los próximos talleres de NOVA.', 'Próximas fechas')}</div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">Taller destacado</span>
      <h2>La Capa Transparente</h2>
      <p class="lead">Una mezcla de alegría, movimiento y reflexión, en colaboración con El Optimista Provocador.</p>
      <p>Un encuentro pensado para soltar el piloto automático, mirar hacia dentro con humor y llevarte herramientas prácticas para tu día a día.</p>
      <ul class="checklist">
        <li>${icons.check}<span>Dinámicas de movimiento y respiración.</span></li>
        <li>${icons.check}<span>Espacios de reflexión individual y en grupo.</span></li>
        <li>${icons.check}<span>Plazas limitadas para cuidar el ambiente.</span></li>
      </ul>
      ${btnWa('Hola, quiero apuntarme al taller La Capa Transparente.', 'Quiero apuntarme')}
    </div>
    <figure class="figure-art reveal reveal-d1">${art.scene}<figcaption><strong>Plazas limitadas</strong>Pregúntanos por la próxima edición</figcaption></figure>
  </div>
</section>
<section class="section section--sand">
  <div class="wrap">
    <div class="section-head reveal"><span class="kicker">¿Organizas algo?</span><h2>Talleres a medida</h2>
    <p class="lead">Organizamos sesiones para grupos, empresas y celebraciones: Yoga, Pilates, respiración o relajación adaptados a tu grupo. Escríbenos y lo preparamos juntos.</p></div>
  </div>
</section>
${ctaBand()}
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
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbHtml([['Inicio', '/'], ['Sobre nosotros', '/sobre-nosotros/']])}
    <span class="kicker">Quiénes somos</span>
    <h1>Bienestar cercano, <em>en el corazón de Móstoles</em></h1>
    <p class="lead">NOVA es un centro de bienestar pequeño y cuidado, donde clases, terapias y estética se unen para ayudarte a sentirte mejor por dentro y por fuera.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <figure class="figure-art reveal">${art.scene}<figcaption><strong>${esc(site.owner)}</strong>Fundadora de NOVA</figcaption></figure>
    <div class="reveal reveal-d1">
      <span class="kicker">La fundadora</span>
      <h2>${esc(site.owner)}</h2>
      <!-- Completar con la formación, titulaciones y años de experiencia de Beatriz: es una señal de confianza (E-E-A-T) muy importante para Google en temas de salud y bienestar. -->
      <p>Beatriz creó NOVA con la convicción de que el bienestar se construye combinando movimiento, descanso y cuidado. Por eso en el centro conviven disciplinas que se complementan entre sí.</p>
      <p>Su forma de trabajar parte siempre de la escucha: entender cómo llega cada persona, qué necesita y a qué ritmo puede avanzar.</p>
      ${btnWa('Hola Beatriz, me gustaría saber más sobre NOVA.', 'Habla con nosotros')}
    </div>
  </div>
</section>
<section class="section section--forest">
  <div class="wrap">
    <div class="section-head reveal"><span class="kicker">Nuestros valores</span><h2>Lo que nos mueve</h2></div>
    <ol class="steps">
      <li class="reveal"><h3>Escucha</h3><p>Cada persona es distinta. Empezamos siempre preguntando.</p></li>
      <li class="reveal reveal-d1"><h3>Calma</h3><p>Un espacio sin prisas, con grupos reducidos y sesiones sin interrupciones.</p></li>
      <li class="reveal reveal-d2"><h3>Visión global</h3><p>Cuerpo y mente van juntos: combinamos movimiento, terapia y cuidado.</p></li>
      <li class="reveal reveal-d3"><h3>Constancia</h3><p>Te acompañamos para que el bienestar se convierta en hábito.</p></li>
    </ol>
  </div>
</section>
${visitSection()}
${ctaBand()}
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
<section class="page-hero">
  <div class="wrap">
    ${breadcrumbHtml([['Inicio', '/'], ['Contacto', '/contacto/']])}
    <span class="kicker">Cita previa</span>
    <h1>Contacto y cita previa</h1>
    <p class="lead">Cuéntanos qué te interesa y te respondemos con horarios y disponibilidad. También puedes llamarnos directamente.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split" style="align-items:start">
    <div class="reveal">
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
        <button class="btn btn--primary" type="submit">${icons.whatsapp}Enviar por WhatsApp</button>
        <small>Se abrirá WhatsApp con tu mensaje preparado. No guardamos ningún dato en esta web. Consulta nuestra <a href="/privacidad/">política de privacidad</a>.</small>
      </form>
    </div>
    <div class="visit-card reveal reveal-d1">
      <h2>NOVA Centro de Bienestar</h2>
      <dl>
        <div><dt>Dirección</dt><dd>${esc(site.street)}<br>${site.postalCode} ${site.city}, ${site.region}</dd></div>
        <div><dt>Horario</dt><dd>${esc(site.hours)}</dd></div>
        <div><dt>Teléfono y WhatsApp</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div>
      </dl>
      <div class="btn-row"><a class="btn btn--light" href="${site.phoneHref}">${icons.phone}Llamar</a><a class="btn btn--light" href="${site.mapsUrl}" target="_blank" rel="noopener">${icons.pin}Cómo llegar</a></div>
    </div>
  </div>
</section>
${visitSection()}
`,
}));

// ════════════════ LEGALES (noindex) ════════════════
const legal = (path, h1, html) => write(path, layout({
  path, noindex: true, title: `${h1} | ${site.name}`, description: `${h1} de ${site.name}.`,
  body: `<section class="page-hero"><div class="wrap">${breadcrumbHtml([['Inicio', '/'], [h1, path]])}<h1>${h1}</h1></div></section>
<section class="section"><div class="wrap prose" style="max-width:820px">${html}</div></section>`,
}));
const owner = `<p><strong>Titular:</strong> ${esc(site.owner)} — <strong>NIF:</strong> [completar]<br><strong>Domicilio:</strong> ${esc(site.street)}, ${site.postalCode} ${site.city} (${site.region})<br><strong>Teléfono:</strong> ${site.phone} — <strong>Email:</strong> [completar]</p>`;
legal('/aviso-legal/', 'Aviso legal', `
<p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web:</p>${owner}
<h2>Condiciones de uso</h2><p>El acceso a este sitio web es gratuito y atribuye la condición de usuario, que acepta estas condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos.</p>
<h2>Propiedad intelectual</h2><p>Los textos, imágenes, logotipos y diseño de esta web son propiedad del titular o se usan con autorización. Queda prohibida su reproducción sin permiso.</p>
<h2>Responsabilidad</h2><p>La información de esta web tiene carácter divulgativo. Los servicios de bienestar ofrecidos no sustituyen el diagnóstico ni el tratamiento médico.</p>`);
legal('/privacidad/', 'Política de privacidad', `
${owner}
<h2>Qué datos tratamos</h2><p>Esta web no dispone de formularios que almacenen datos. Si nos contactas por WhatsApp, teléfono o email, trataremos los datos que nos facilites (nombre, teléfono y mensaje) únicamente para responder a tu consulta y gestionar tus citas.</p>
<h2>Base legal y conservación</h2><p>La base legal es tu consentimiento y, en su caso, la relación contractual. Conservaremos los datos mientras dure la relación y los plazos legales aplicables.</p>
<h2>Tus derechos</h2><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a [completar email]. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>`);
legal('/cookies/', 'Política de cookies', `
<p>Esta web no utiliza cookies propias de analítica ni de publicidad.</p>
<h2>Contenidos de terceros</h2><p>El mapa de ubicación de Google Maps solo se carga si pulsas «Mostrar mapa». A partir de ese momento Google puede instalar sus propias cookies, según su política de privacidad.</p>
<p>Si en el futuro se añade analítica (por ejemplo Google Analytics 4), deberá incorporarse un banner de consentimiento antes de activarla.</p>`);

// ════════════════ 404 ════════════════
writeFileSync(join(OUT, '404.html'), layout({
  path: '/404.html', noindex: true,
  title: 'Página no encontrada | NOVA Centro de Bienestar', description: 'La página que buscas no existe.',
  body: `<section class="page-hero"><div class="wrap"><span class="kicker">Error 404</span><h1>Esta página se ha ido a <em>relajarse</em></h1>
<p class="lead">No encontramos lo que buscas, pero seguro que alguno de estos enlaces te ayuda.</p>
<div class="btn-row" style="margin-top:28px"><a class="btn btn--primary" href="/">Ir al inicio</a>${categories.map((c) => `<a class="btn btn--ghost" href="/${c.slug}/">${c.name}</a>`).join('')}</div></div></section>`,
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
  <FilesMatch "\\.(woff2|mp4|webm|jpg|svg)$">
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
// Equivalente para Netlify / Cloudflare Pages
writeFileSync(join(OUT, '_redirects'), `https://www.novamostoles.com/* https://novamostoles.com/:splat 301!
http://www.novamostoles.com/* https://novamostoles.com/:splat 301!
${Object.entries(legacyRedirects).map(([from, to]) => `${from} ${to} 301`).join('\n')}
`);

console.log(`OK: ${sitemap.length} páginas indexables + legales y 404 en ${OUT}`);
