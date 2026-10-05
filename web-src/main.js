// NOVA v2 — motor de movimiento. Sin dependencias salvo Lenis (scroll suave).
// Todo efecto se apaga si el sistema pide "reducir movimiento" (clase .no-motion).
(() => {
  /*@POSES@*/

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const root = document.documentElement;
  const motion = root.classList.contains('motion');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let vw = innerWidth;
  let vh = innerHeight;

  // ── Scroll suave ──
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.25, smoothWheel: true, anchors: { offset: -70 } });
  }
  let scrollY = window.scrollY;
  let velocity = 0;
  if (lenis) lenis.on('scroll', (e) => { scrollY = e.scroll; velocity = e.velocity; });
  else addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // ── Intro de bienvenida ──
  const withIntro = root.classList.contains('with-intro');
  if (withIntro) setTimeout(() => { $('.intro')?.remove(); root.classList.remove('with-intro'); }, 2900);

  // ── Texto que sube palabra a palabra ──
  const splitInto = (el, wrap) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            frag.appendChild(wrap(part, i++));
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return i;
  };
  $$('[data-split]').forEach((el) => splitInto(el, (word, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.innerHTML = `<span class="wi" style="--i:${i}"></span>`;
    w.firstChild.textContent = word;
    return w;
  }));
  const scrubs = $$('[data-scrub]').map((el) => {
    splitInto(el, (word) => { const s = document.createElement('span'); s.className = 'sw'; s.textContent = word; return s; });
    return { el, words: $$('.sw', el), on: -1 };
  });

  // ── Revelado al entrar en pantalla ──
  const reveal = $$('[data-reveal], [data-split], .draw, [data-count]');
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target.dataset.count) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    const start = () => reveal.forEach((el) => io.observe(el));
    withIntro ? setTimeout(start, 1700) : start();
  } else {
    reveal.forEach((el) => el.classList.add('is-in'));
  }
  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    const t0 = performance.now();
    const tick = (t) => {
      const p = clamp((t - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Cabecera, barra de progreso ──
  const header = $('.site-header');
  const progress = $('.progress-line');
  let lastY = scrollY;
  const updateHeader = (y) => {
    header.classList.toggle('is-scrolled', y > 30);
    if (!document.body.classList.contains('menu-open')) {
      if (y > lastY + 6 && y > 300) header.classList.add('is-hidden');
      else if (y < lastY - 6) header.classList.remove('is-hidden');
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - vh;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };

  // ── Menú móvil y submenús ──
  const toggle = $('.menu-toggle');
  const nav = $('#nav');
  if (toggle && nav) {
    const openIcon = toggle.innerHTML;
    const closeIcon = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 12l24 24M36 12L12 36"/></svg>';
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      toggle.innerHTML = open ? closeIcon : openIcon;
      header.classList.remove('is-hidden');
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }
  $$('.sub-toggle').forEach((btn) => btn.addEventListener('click', () => {
    const item = btn.closest('.nav-item');
    const open = !item.classList.contains('is-open');
    $$('.nav-item.is-open').forEach((i) => { i.classList.remove('is-open'); $('.sub-toggle', i)?.setAttribute('aria-expanded', 'false'); });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) $$('.nav-item.is-open').forEach((i) => i.classList.remove('is-open'));
  });

  // ── Saludo al Sol: la figura sigue el scroll ──
  const sun = $('.sun');
  const sunFig = sun && {
    legB: $('.fig-legB', sun), armB: $('.fig-armB', sun), torso: $('.fig-torso', sun),
    leg: $('.fig-leg', sun), arm: $('.fig-arm', sun), head: $('.fig-head', sun), bun: $('.fig-bun', sun),
    disc: $('.sun-disc', sun), rays: $('.sun-rays', sun), steps: $$('.sun-steps li', sun), dots: $$('.sun-dots span', sun),
  };
  let sunLast = -1;
  const drawPose = (pose) => {
    const p = figurePaths(pose);
    sunFig.legB.setAttribute('d', p.legBack);
    sunFig.armB.setAttribute('d', p.armBack);
    sunFig.torso.setAttribute('d', p.torso);
    sunFig.leg.setAttribute('d', p.leg);
    sunFig.arm.setAttribute('d', p.arm);
    sunFig.head.setAttribute('cx', p.head[0].toFixed(1)); sunFig.head.setAttribute('cy', p.head[1].toFixed(1));
    sunFig.bun.setAttribute('cx', p.bun[0].toFixed(1)); sunFig.bun.setAttribute('cy', p.bun[1].toFixed(1));
  };
  const updateSun = () => {
    if (!sunFig) return;
    const r = sun.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = motion ? clamp(-r.top / (r.height - vh)) : 0;
    if (Math.abs(p - sunLast) < 0.0005) return;
    sunLast = p;
    const step = clamp(p / 0.94) * (STEPS.length - 1);
    drawPose(poseAt(stepToKey(step)));
    const cy = lerp(390, 120, p);
    sunFig.disc.setAttribute('cy', cy.toFixed(1));
    sunFig.rays.setAttribute('transform', `translate(0 ${(cy - 380).toFixed(1)})`);
    sunFig.rays.style.opacity = (0.15 + p * 0.4).toFixed(2);
    const active = Math.round(step);
    sunFig.steps.forEach((li, i) => li.classList.toggle('is-active', i === active));
    sunFig.dots.forEach((d, i) => d.style.setProperty('--p', clamp(step - i + 1).toFixed(3)));
  };
  if (sunFig && motion) sunFig.steps[0].classList.add('is-active');

  // ── Servicios: scroll horizontal anclado ──
  const hs = $('.hs');
  const track = hs && $('.hs-track', hs);
  let hsDist = 0;
  const setupHs = () => {
    if (!hs) return;
    const pin = motion && vw >= 900;
    root.classList.toggle('hs-pin', pin);
    if (!pin) { track.style.transform = ''; hs.style.removeProperty('--hs-h'); return; }
    const vp = $('.hs-viewport', hs);
    const padL = parseFloat(getComputedStyle(vp).paddingLeft) || 0;
    hsDist = Math.max(0, track.scrollWidth + padL * 2 - vw);
    hs.style.setProperty('--hs-h', `${vh + hsDist}px`);
  };
  const updateHs = () => {
    if (!hs || !root.classList.contains('hs-pin')) return;
    const r = hs.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp(-r.top / (r.height - vh));
    track.style.transform = `translate3d(${(-p * hsDist).toFixed(1)}px,0,0)`;
  };

  // ── Manifiesto que se ilumina al leer ──
  const updateScrubs = () => scrubs.forEach((s) => {
    const r = s.el.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const on = Math.round(p * s.words.length);
    if (on === s.on) return;
    s.on = on;
    s.words.forEach((w, i) => w.classList.toggle('on', i < on));
  });

  // ── Línea de tiempo que se rellena ──
  const timelines = $$('[data-timeline]');
  const updateTimelines = () => timelines.forEach((t) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--tl', clamp((vh * 0.7 - r.top) / r.height).toFixed(3));
  });

  // ── Parallax de fotos ──
  const parallaxImgs = $$('img.parallax');
  const updateParallax = () => parallaxImgs.forEach((img) => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const off = (r.top + r.height / 2 - vh / 2) * -0.08;
    img.style.transform = `translate3d(0,${off.toFixed(1)}px,0) scale(1.18)`;
  });

  // ── Marquesina que reacciona a la velocidad del scroll ──
  const rows = $$('.marquee-row').map((el, i) => ({ el, x: 0, dir: i % 2 ? 1 : -1 }));
  const updateMarquee = (dt) => rows.forEach((r) => {
    const w = r.el.scrollWidth / 2;
    if (!w) return;
    r.x += r.dir * (0.035 * dt + Math.abs(velocity) * 0.6);
    r.x = ((r.x % w) + w) % w;
    r.el.style.transform = `translate3d(${(-r.x).toFixed(1)}px,0,0)`;
  });

  // ── Ratón: cursor, parallax, magnético, relieve 3D ──
  let mx = vw / 2;
  let my = vh / 2;
  let cx = mx;
  let cy = my;
  const cursor = $('.cursor');
  const mouseEls = $$('[data-mouse]').map((el) => ({ el, k: parseFloat(el.dataset.mouse), x: 0, y: 0 }));
  if (fine && motion) {
    root.classList.add('has-cursor');
    const label = $('.cursor-ring span', cursor);
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const lab = t.closest('[data-cursor]');
      cursor.classList.toggle('is-label', !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
      cursor.classList.toggle('is-link', !lab && !!t.closest('a, button, summary, select, input, textarea'));
      cursor.classList.toggle('on-dark', !!t.closest('.section--forest, .site-footer, .marquee, .cta-final, .visit-card'));
    });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('pointerenter', () => { cursor.style.opacity = '1'; });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transition = 'transform .25s ease-out';
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
      });
    });

    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * 10).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }
  const updateMouse = () => {
    cx = lerp(cx, mx, 0.18);
    cy = lerp(cy, my, 0.18);
    if (cursor) cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    mouseEls.forEach((m) => {
      m.x = lerp(m.x, ((mx / vw) - 0.5) * m.k, 0.06);
      m.y = lerp(m.y, ((my / vh) - 0.5) * m.k, 0.06);
      m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,${m.y.toFixed(2)}px,0)`;
    });
  };

  // ── Partículas en el hero (polen que flota) ──
  const canvas = $('.hero-canvas');
  let ctx = null;
  let parts = [];
  let heroVisible = true;
  const setupCanvas = () => {
    if (!canvas || !motion) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = vw < 700 ? 22 : 46;
    const cols = ['216,178,110', '143,174,139', '196,122,90', '255,255,255'];
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.offsetWidth, y: Math.random() * canvas.offsetHeight,
      r: 1.5 + Math.random() * 3.5, vy: 0.12 + Math.random() * 0.35, ph: Math.random() * 6.28,
      c: cols[Math.floor(Math.random() * cols.length)], a: 0.25 + Math.random() * 0.45, ox: 0, oy: 0,
    }));
  };
  if (canvas && motion && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(canvas);
  }
  const drawParticles = (t) => {
    if (!ctx || !heroVisible || document.hidden) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const rect = canvas.getBoundingClientRect();
    const lx = mx - rect.left;
    const ly = my - rect.top;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.vy;
      p.x += Math.sin(t * 0.0006 + p.ph) * 0.25;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      const dx = p.x - lx;
      const dy = p.y - ly;
      const d = Math.hypot(dx, dy);
      if (d < 130) { p.ox += (dx / d) * (130 - d) * 0.02; p.oy += (dy / d) * (130 - d) * 0.02; }
      p.ox *= 0.94; p.oy *= 0.94;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, 6.283);
      ctx.fill();
    }
  };

  // ── Ejercicio de respiración guiada ──
  const breathe = $('.breathe');
  if (breathe) {
    const ball = $('.breathe-ball', breathe);
    const label = $('.breathe-label', breathe);
    const count = $('.breathe-count', breathe);
    const bar = $('.breathe-ring .bar', breathe);
    const btn = $('[data-breathe-toggle]', breathe);
    const chips = $$('.chip', breathe);
    let pattern = JSON.parse(chips[0].dataset.pattern);
    let running = false;
    let raf = 0;
    let timer = 0;
    const total = () => pattern.reduce((s, p) => s + p[1], 0);
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf); clearTimeout(timer);
      ball.style.transitionDuration = '1.2s';
      ball.style.transform = 'scale(.55)';
      bar.style.strokeDashoffset = '1';
      label.textContent = 'Pulsa empezar';
      count.textContent = '';
      btn.querySelector('span').textContent = 'Empezar';
    };
    const run = () => {
      running = true;
      btn.querySelector('span').textContent = 'Parar';
      let cycle = 1;
      let phase = 0;
      let phaseStart = performance.now();
      let cycleStart = phaseStart;
      const startPhase = () => {
        const [name, secs, expand] = pattern[phase];
        label.textContent = name;
        const grows = name === 'Inhala' || name === 'Exhala';
        ball.style.transitionDuration = grows ? `${secs}s` : '0s';
        if (grows) ball.style.transform = `scale(${expand ? 1 : 0.55})`;
        phaseStart = performance.now();
        timer = setTimeout(() => {
          phase = (phase + 1) % pattern.length;
          if (phase === 0) { cycle += 1; cycleStart = performance.now(); }
          if (running) startPhase();
        }, secs * 1000);
      };
      const tick = (t) => {
        const [, secs] = pattern[phase];
        const left = Math.max(1, Math.ceil(secs - (t - phaseStart) / 1000));
        count.textContent = `${left} · ciclo ${cycle}`;
        bar.style.strokeDashoffset = (1 - clamp((t - cycleStart) / (total() * 1000))).toFixed(4);
        if (running) raf = requestAnimationFrame(tick);
      };
      startPhase();
      raf = requestAnimationFrame(tick);
    };
    btn.addEventListener('click', () => (running ? stop() : run()));
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((o) => o.setAttribute('aria-pressed', String(o === c)));
      pattern = JSON.parse(c.dataset.pattern);
      if (running) { stop(); run(); }
    }));
  }

  // ── Mapa bajo demanda ──
  $$('[data-load-map]').forEach((btn) => btn.addEventListener('click', () => {
    const box = btn.closest('[data-map]');
    const f = document.createElement('iframe');
    f.src = box.dataset.map;
    f.title = 'Mapa de ubicación de NOVA Centro de Bienestar en Móstoles';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.innerHTML = '';
    box.appendChild(f);
  }));

  // ── Formulario → WhatsApp ──
  const form = $('[data-wa-form]');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = String(d.get('nombre') || '').trim();
    if (!name) { form.nombre.focus(); form.nombre.setAttribute('aria-invalid', 'true'); return; }
    const text = `Hola, soy ${name}. Me interesa: ${d.get('servicio')}. Me viene mejor por las ${String(d.get('cuando')).toLowerCase()}.${d.get('mensaje') ? ' ' + d.get('mensaje') : ''}`;
    window.open('https://wa.me/34645265946?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // ── Bucle principal ──
  const onResize = () => {
    vw = innerWidth; vh = innerHeight;
    setupHs(); setupCanvas(); sunLast = -1;
    if (lenis) lenis.resize();
  };
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(onResize, 150); });
  setupHs();
  setupCanvas();
  if (!motion && sunFig) updateSun();

  let prev = performance.now();
  const frame = (t) => {
    const dt = Math.min(64, t - prev);
    prev = t;
    if (lenis) lenis.raf(t);
    updateHeader(scrollY);
    if (motion) {
      updateSun();
      updateHs();
      updateScrubs();
      updateTimelines();
      updateParallax();
      updateMarquee(dt);
      updateMouse();
      drawParticles(t);
    }
    if (!lenis) velocity *= 0.9;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // Si las fuentes cambian el tamaño del texto, recalcula medidas
  document.fonts?.ready.then(onResize);
})();
