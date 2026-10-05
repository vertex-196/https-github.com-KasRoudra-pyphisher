# Fotos, logo y reseñas

Deja aquí los archivos y ejecuta `node web-src/build.mjs`: la web los incorpora sola.

- `logo.svg` o `logo.png` → sustituye al logotipo provisional (cabecera, pie y favicon si es SVG).
- `fotos/hero.jpg` → foto principal de la portada (se muestra dentro del círculo que respira).
- `fotos/beatriz.jpg` → foto de Beatriz para "Quiénes somos".
- `fotos/<slug-del-servicio>.jpg` → foto de cada servicio, por ejemplo `fotos/pilates-mostoles.jpg`,
  `fotos/drenaje-linfatico-mostoles.jpg`, `fotos/lifting-pestanas-mostoles.jpg`.
- `fotos/centro-1.jpg`, `fotos/centro-2.jpg`… → galería del centro en la portada.

Las fotos se convierten automáticamente a WebP en dos tamaños (necesita `ffmpeg`).

## Reseñas de Google

Copia las reseñas reales en `web-src/resenas.json` (nunca inventadas):

```json
{
  "rating": 4.9,
  "total": 37,
  "url": "https://g.page/r/XXXX/review",
  "reviews": [
    { "author": "Nombre", "rating": 5, "date": "hace 2 meses", "text": "Texto literal de la reseña" }
  ]
}
```
