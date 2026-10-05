# NOVA Centro de Bienestar — nueva web (novamostoles.com)

Rediseño completo de la web de NOVA Centro de Bienestar en Móstoles, orientado a **SEO local**:
una página optimizada por cada servicio, datos estructurados, sitemap y redirecciones 301 desde las URLs antiguas.
El vídeo de cabecera, la imagen para redes (Open Graph) y un reel vertical se generan con **Remotion**.

## Estructura

```
web/            ← la web lista para subir al hosting (HTML estático)
web-src/        ← generador: contenido (data.mjs), plantillas (build.mjs), estilos y JS
remotion/       ← vídeos e imágenes de marca hechos con Remotion
redes/          ← reel vertical 1080×1920 para Instagram / TikTok
```

### Mapa de la web

| URL | Palabra clave principal |
|---|---|
| `/` | centro de bienestar Móstoles |
| `/clases/` | clases pilates yoga Móstoles |
| `/clases/pilates-mostoles/` | pilates Móstoles |
| `/clases/yoga-mostoles/` | yoga Móstoles |
| `/clases/hipopresivos-mostoles/` | hipopresivos Móstoles |
| `/clases/entrenamiento-funcional-mostoles/` | entrenamiento funcional Móstoles |
| `/clases/taichi-mostoles/` | taichí Móstoles |
| `/clases/clases-online/` | clases pilates yoga online |
| `/terapias/` | masajes y terapias Móstoles |
| `/terapias/drenaje-linfatico-mostoles/` | drenaje linfático Móstoles |
| `/terapias/maderoterapia-mostoles/` | maderoterapia Móstoles |
| `/terapias/masajes-mostoles/` | masajes Móstoles |
| `/terapias/osteopatia-mostoles/` | osteopatía Móstoles |
| `/terapias/reflexologia-mostoles/` | reflexología Móstoles |
| `/terapias/terapia-craneosacral-mostoles/` | terapia craneosacral Móstoles |
| `/estetica/` | estética Móstoles |
| `/estetica/lifting-pestanas-mostoles/` | lifting de pestañas Móstoles |
| `/estetica/microblading-mostoles/` | microblading Móstoles |
| `/estetica/spa-capilar-mostoles/` | spa capilar Móstoles |
| `/talleres/`, `/sobre-nosotros/`, `/contacto/` | marca y conversión |

## Qué incluye para SEO

- Un `<title>` y una meta description únicos por página (≤ 65 y ≤ 160 caracteres), con «Móstoles».
- Un único H1 por página, jerarquía H2/H3 limpia y migas de pan.
- Schema.org en JSON-LD: `HealthAndBeautyBusiness` (NAP, horario, zona, catálogo de servicios), `Service`,
  `FAQPage`, `BreadcrumbList`, `WebSite`, `CollectionPage`.
- `sitemap.xml`, `robots.txt` y URL canónica en cada página.
- `.htaccess` (Apache) y `_redirects` (Netlify/Cloudflare): todo a `https://novamostoles.com` sin www
  y 301 de las páginas antiguas (`circuito.html`, `lifting.html`, `capilar.html`…) a las nuevas.
- Enlazado interno: menú desplegable, servicios relacionados y pie con todos los servicios.
- Rendimiento: HTML estático, fuentes autoalojadas, vídeo de cabecera cargado después del contenido
  (360 KB), mapa de Google solo bajo demanda. Lighthouse móvil: Rendimiento 98–99, Accesibilidad 100,
  Buenas prácticas 100, SEO 100.
- Conversión: botón de WhatsApp en todas las páginas, barra fija en móvil y formulario que prepara
  el mensaje de WhatsApp (sin servidor ni base de datos).

## Comandos

```bash
# Regenerar la web después de cambiar textos en web-src/data.mjs
node web-src/build.mjs

# Vídeos e imágenes de Remotion
cd remotion && npm install
npm run studio          # editor visual en el navegador
npm run render          # genera web/assets/media/* y redes/reel-nova-mostoles.mp4
```

Para probarla en local: `python3 -m http.server -d web 8000` y abrir http://localhost:8000.

## Pendiente de completar con el centro

1. **Fotos reales** del centro, las clases y de Beatriz (ahora hay ilustraciones). Es lo que más mejora la conversión.
2. **Logotipo real** y colores de marca, si los hay: la paleta está en `:root` de `web-src/styles.css` y en `remotion/src/theme.ts`.
3. **Formación y titulaciones** de Beatriz en `/sobre-nosotros/` (señal E-E-A-T importante en temas de salud).
4. **Precios, bonos y horario de cada clase**.
5. **Datos legales** (NIF y email) en aviso legal y privacidad: buscar `[completar]`.
6. Enlaces a **Instagram/Facebook** en `site` de `web-src/data.mjs` (se añaden solos al schema `sameAs`).
7. Confirmar que el **645 265 946 tiene WhatsApp**.
8. Revisar las URLs antiguas reales en `legacyRedirects` (`data.mjs`): las marcadas con `*` se han visto indexadas en Google.
9. Tras publicar: dar de alta `sitemap.xml` en Google Search Console y actualizar la web en la ficha de Google Business Profile.
