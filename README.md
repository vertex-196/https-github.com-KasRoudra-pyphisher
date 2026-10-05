# NOVA Centro de Bienestar — web v2 «Respira» (novamostoles.com)

Web nueva de NOVA Centro de Bienestar (Móstoles) con un lenguaje de movimiento inspirado en el yoga:
todo se mueve al ritmo de una respiración lenta. Está construida con todo el contenido de la web antigua
(servicios, precios, horario, contacto, taller) y pensada para **posicionar en Google a nivel local**.

## Estructura

```
web/            ← la web lista para subir al hosting (HTML estático)
web-src/        ← generador: contenido (data.mjs), plantillas (build.mjs), estilos, JS y figura de yoga
  media/        ← AQUÍ van el logo, las fotos reales (ver media/LEEME.md)
  resenas.json  ← (opcional) reseñas reales de Google
remotion/       ← vídeos e imágenes de marca hechos con Remotion
redes/          ← reels verticales 1080×1920 para Instagram / TikTok
```

## Movimiento e interacción

| Efecto | Dónde |
|---|---|
| **Saludo al Sol** que se mueve con el scroll: una figura recorre las 8 posturas (con transiciones reales: paso atrás, caminar hacia las manos) mientras sale el sol y se indica *Inhala/Exhala* | Portada |
| **Respiración guiada interactiva**: 3 ritmos (Calma 4-7-8, Cuadrada, Coherente) con círculo que crece y anillo de progreso | Portada |
| Orbe que **respira** (4 s inhala / 6 s exhala), sigue al ratón y tiene servicios orbitando a su alrededor | Portada |
| Polen flotante en canvas que se aparta del cursor | Portada |
| Servicios en **scroll horizontal anclado** (en móvil, deslizar con el dedo) | Portada |
| Marquesina de disciplinas que se acelera con la velocidad del scroll | Portada |
| Manifiesto cuyas palabras se iluminan al leer | Portada |
| Scroll suave (Lenis), cursor que acompaña, botones magnéticos, tarjetas con relieve 3D | Toda la web |
| Títulos que suben palabra a palabra, iconos que se dibujan, fotos que se revelan en arco con parallax | Toda la web |
| Línea de tiempo que se rellena al leer, cifras que cuentan, FAQ con apertura suave | Fichas de servicio |
| Transiciones suaves entre páginas (View Transitions API) y menú móvil que se abre en círculo | Toda la web |

Todo se desactiva si el sistema tiene activado **«reducir movimiento»**: el contenido se ve completo y
el Saludo al Sol aparece como lista de posturas.

La figura de yoga está en `web-src/poses.mjs` (esqueleto con ángulos por postura). La usan tanto la web
como el vídeo de Remotion, así que son idénticas.

## Contenido recuperado de la web antigua

- Servicios: Pilates, Yoga, Hipopresivos, Circuito Funcional, Taichí, sesiones online, drenaje linfático,
  maderoterapia, masajes, osteopatía, reflexología, sacro-craneal, lifting de pestañas, microblading,
  spa capilar y **láser diodo** (nuevo en esta versión, con su tabla de precios por zona).
- Precios: Circuito Funcional 45/60/75 €/mes · online 25 €/mes (L y X, 17:00) · lifting 30 € ·
  spa capilar desde 45 € · láser diodo desde 10 €.
- Contacto: Paseo de Goya 26 (posterior), 28932 Móstoles · 645 265 946 · hola@novamostoles.com ·
  L–V 9:30–21:30 con cita previa.
- Taller «La Capa Transparente – Fiestas Optimistas» con El Optimista Provocador.
- Redirecciones 301 de las URLs antiguas (`circuito.html`, `online.html`, `laser.html`, `lifting.html`…).

## SEO

- Una página por servicio con «Móstoles» en URL, título, H1 y descripción.
- Schema.org: `HealthAndBeautyBusiness`, `Service` (con `offers` cuando hay precio), `FAQPage`,
  `BreadcrumbList`, `CollectionPage`, `WebSite`.
- `sitemap.xml`, `robots.txt`, canonical, `.htaccess` (Apache) y `_redirects` (Netlify/Cloudflare).
- Todo el texto está en el HTML (los efectos solo lo animan), así que Google lo lee completo.
- Lighthouse móvil: Rendimiento 94–97 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.

## Logo, fotos y reseñas

Deja los archivos en `web-src/media/` (instrucciones en `web-src/media/LEEME.md`) y las reseñas reales
de Google en `web-src/resenas.json`, y ejecuta `node web-src/build.mjs`. La web los incorpora sola:
logo en cabecera, pie y favicon; foto principal dentro del orbe; foto de Beatriz; foto por servicio;
galería del centro; carrusel de reseñas con la nota media. Las fotos se convierten a WebP.

Las reseñas nunca se inventan: si no hay archivo, se muestra una invitación a dejar reseña en Google.

## Comandos

```bash
node web-src/build.mjs                     # regenerar la web
python3 -m http.server -d web 8000         # probarla en http://localhost:8000

cd remotion && npm install
npm run studio                             # editor visual de los vídeos
npm run render                             # imagen OG + reels de redes
```

## Pendiente de completar con el centro

1. Logo, fotos reales y reseñas de Google (ver arriba).
2. Formación y titulaciones de Beatriz en `/sobre-nosotros/` (señal de confianza para Google).
3. Precios de Pilates, Yoga, Hipopresivos, Taichí, masajes y terapias (la web antigua no los mostraba).
4. NIF del titular en aviso legal y privacidad (buscar `[completar]`).
5. Enlaces a Instagram y Facebook en `site` de `web-src/data.mjs`.
6. Tras publicar: enviar `sitemap.xml` en Google Search Console y enlazar la web desde Google Business Profile.
