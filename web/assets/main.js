// NOVA — interacciones ligeras, sin dependencias.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cabecera con borde al hacer scroll
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Menú móvil
  const toggle = $('.menu-toggle');
  const nav = $('#nav');
  if (toggle && nav) {
    const closeIcon = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 12l24 24M36 12L12 36"/></svg>';
    const openIcon = toggle.innerHTML;
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      toggle.innerHTML = open ? closeIcon : openIcon;
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Submenús (botón de despliegue: táctil y teclado)
  $$('.sub-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.nav-item');
      const open = !item.classList.contains('is-open');
      $$('.nav-item.is-open').forEach((i) => { i.classList.remove('is-open'); $('.sub-toggle', i)?.setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) $$('.nav-item.is-open').forEach((i) => i.classList.remove('is-open'));
  });

  // Animaciones de entrada
  const items = $$('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Vídeo del hero (generado con Remotion): se carga después del contenido para no penalizar el LCP
  const hero = $('[data-hero-video]');
  const saveData = navigator.connection && navigator.connection.saveData;
  if (hero && !reduced && !saveData) {
    addEventListener('load', () => {
      const mobile = matchMedia('(max-width: 760px)').matches;
      const v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, poster: '/assets/media/hero-poster.jpg' });
      v.setAttribute('aria-hidden', 'true');
      v.setAttribute('muted', '');
      const sources = mobile
        ? [['/assets/media/hero-mobile.mp4', 'video/mp4']]
        : [['/assets/media/hero.webm', 'video/webm'], ['/assets/media/hero.mp4', 'video/mp4']];
      sources.forEach(([src, type]) => { const s = document.createElement('source'); s.src = src; s.type = type; v.appendChild(s); });
      v.style.cssText = 'position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease';
      v.addEventListener('playing', () => { v.style.opacity = '1'; }, { once: true });
      hero.appendChild(v);
      v.play().catch(() => {});
    });
  }

  // Mapa de Google solo bajo demanda (privacidad + rendimiento)
  $$('[data-load-map]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('[data-map]');
      const f = document.createElement('iframe');
      f.src = box.dataset.map;
      f.title = 'Mapa de ubicación de NOVA Centro de Bienestar en Móstoles';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.innerHTML = '';
      box.appendChild(f);
    });
  });

  // Formulario de contacto → mensaje de WhatsApp (sin servidor ni datos almacenados)
  const form = $('[data-wa-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const name = String(d.get('nombre') || '').trim();
      if (!name) { form.nombre.focus(); form.nombre.setAttribute('aria-invalid', 'true'); return; }
      const text = `Hola, soy ${name}. Me interesa: ${d.get('servicio')}. Me viene mejor por las ${String(d.get('cuando')).toLowerCase()}.${d.get('mensaje') ? ' ' + d.get('mensaje') : ''}`;
      window.open('https://wa.me/34645265946?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
