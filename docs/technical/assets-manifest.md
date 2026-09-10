# AVX Informática — Manifiesto de Assets
## Documento 07: ASSETS_MANIFEST

---

### FILOSOFÍA DE ASSETS

**Todos los assets visuales del juego y del home están diseñados para ser reemplazables.**

Cada asset tiene:
1. Un nombre de archivo canónico definido en este documento
2. Un placeholder funcional que Cursor generará como fallback
3. Un comentario en el código identificándolo como reemplazable

El placeholder es funcional pero básico. El asset definitivo puede ser reemplazado después sin tocar el código.

---

### ASSET 01 — IMAGEN DE FONDO UNIVERSO

```
Archivo:         assets/images/universe-bg.webp
Fallback:        assets/images/universe-bg.jpg
Dimensiones:     Mínimo 1920×1080px, proporción 16:9
Tamaño máximo:   500KB (WebP) / 800KB (JPG)
Placeholder:     CSS gradient dark blue radial con estrellas dibujadas en Canvas
```

**Estado actual (disponible en el repo):**
```
Archivo usado en MVP: assets/images/universe.jpg
Nota: reemplaza temporalmente a universe-bg.webp/jpg. Más adelante se optimiza a WebP + JPG.
```

**Cómo obtener el asset definitivo (GRATIS):**
- **NASA Image Gallery:** https://images.nasa.gov
  - Buscar: "galaxy", "nebula", "deep space"
  - Todos los contenidos de NASA son dominio público
  - Descargar la versión de mayor resolución disponible
  - Recomendados: Hubble Deep Field, Pillars of Creation (versión oscura), cualquier nebulosa
- **Unsplash:** https://unsplash.com
  - Buscar: "space", "galaxy dark", "nebula"
  - Filtrar por orientación horizontal
  - Descarga gratuita para uso comercial (licencia Unsplash)

**Criterios de selección:**
- Tonos dominantes: azul profundo, violeta oscuro
- Sin objetos muy brillantes en el centro del encuadre (va el logo)
- Alta densidad de estrellas en los bordes
- Sin texto ni watermarks

**Comentario en código:**
```css
/* ASSET: universe-bg.webp — Reemplazar con imagen de NASA o Unsplash seleccionada
   Fuente sugerida: https://images.nasa.gov | Palabras clave: galaxy, nebula */
```

---

### ASSET 02 — LOGO SVG PRINCIPAL

```
Archivo:         assets/svg/logo-avx.svg
Variante:        assets/svg/logo-avx-animated.svg
Placeholder:     SVG generado programáticamente basado en la geometría descrita
```

**Estado actual (disponible en el repo, para uso inmediato):**
```
Logo para fondo negro: assets/images/logo.avx.white.png
Logo para fondo blanco: assets/images/logo.avx.black.png
Nota: estos PNG son temporales. El objetivo final sigue siendo SVG (logo-avx.svg y logo-avx-animated.svg).
```

**Proceso de preparación (ver `../experience/logo-animation.md`):**
1. Vectorizar el logo original (PNG entregado) en Inkscape
2. Separar en grupos nombrados
3. Exportar como SVG plano
4. Crear versión animada con SVGator o CSS

**Comentario en código:**
```html
<!-- ASSET: logo-avx.svg — Reemplazar con SVG vectorizado del logo oficial
     Proceso: Inkscape > Trace Bitmap > separar grupos > exportar SVG plano -->
```

---

### ASSET 03 — SPRITE DE NAVE (para Canvas del juego)

```
Archivo:         assets/game/ship-sprite.svg
Dimensiones:     60×60px viewBox (se escala en Canvas)
Placeholder:     Triángulo simple con colores AVX dibujado como Path2D en Canvas
```

**Descripción:**
La nave es la forma de "nave" derivada del logo (estado transformado). Ver `../experience/logo-animation.md`. Para el MVP, se puede usar un triángulo estilizado con el rombo central visible.

**Comentario en código:**
```javascript
// ASSET: ship-sprite.svg — Reemplazar con sprite SVG de la nave derivado del logo AVX
// Dimensiones recomendadas: 60×60px viewBox, alineada apuntando hacia arriba (270° = norte)
```

---

### ASSET 04 — ASTEROIDES (3 variantes)

```
Archivo 1:       assets/game/asteroid-01.svg  (grande, 70-80px)
Archivo 2:       assets/game/asteroid-02.svg  (mediano, 40-50px)
Archivo 3:       assets/game/asteroid-03.svg  (pequeño, 20-25px)
Placeholder:     Polígonos irregulares generados proceduralmente en Canvas
```

**Descripción visual objetivo:**
No piedras orgánicas. Fragmentos de datos digitales: formas angulares irregulares con:
- 6-8 vértices, no simétricos
- Color base: azul-gris oscuro (#1A2A3A)
- Borde más claro: (#3A5A6A)
- Detalle interior opcional: líneas de "circuito" muy tenues

**Para el MVP:** Los asteroides se generan proceduralmente en Canvas usando `Math.random()` para los vértices. El SVG es para la versión final con más identidad visual.

**Comentario en código:**
```javascript
// ASSET: asteroid-01/02/03.svg — Reemplazar con sprites SVG de fragmentos digitales AVX
// El placeholder actual genera polígonos aleatorios en Canvas
// Para versión definitiva: diseñar en Inkscape con estética de datos fragmentados
```

---

### ASSET 05 — FAVICON

```
Archivo:         assets/images/favicon.ico
Variante PNG:    assets/images/favicon-32.png, favicon-16.png
Placeholder:     Favicon generado a partir del logo (herramienta online)
```

**Estado actual (disponible en el repo):**
```
Archivo usado en MVP: assets/images/favicon.png
```

**Cómo generarlo gratis:**
- https://favicon.io/favicon-converter/
- Subir el logo PNG original
- Descargar el paquete completo
- Copiar los archivos a `assets/images/`

---

### ASSET 06 — ÍCONOS DE PLANETAS (opcionales en MVP)

```
Archivos:        assets/svg/icons/planet-*.svg
Estado en MVP:   NO requeridos. Los planetas son elementos CSS circulares.
Estado futuro:   SVG de texturas planetarias o iconos representativos por sección
```

---

### ASSET 07 — FUENTES

Las fuentes se cargan desde Google Fonts. No requieren descarga manual.

```html
<!-- Incluir en <head> de index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
```

Si se prefiere carga local (mejor rendimiento):
1. Descargar de https://fonts.google.com (botón "Download family")
2. Colocar en `assets/fonts/`
3. Declarar con `@font-face` en `base.css`

---

### CHECKLIST DE ASSETS ANTES DE LANZAMIENTO

```
[ ] universe-bg.webp — imagen definitiva seleccionada y optimizada
[ ] universe-bg.jpg  — fallback generado (cwebp o squoosh.app)
[ ] logo-avx.svg     — vectorizado y con grupos nombrados
[ ] logo-avx-animated.svg — animación de transformación completa
[ ] ship-sprite.svg  — nave derivada del logo, alineada hacia arriba
[ ] asteroid-01.svg  — diseño de fragmento digital grande
[ ] asteroid-02.svg  — diseño de fragmento digital mediano
[ ] asteroid-03.svg  — diseño de fragmento digital pequeño
[ ] favicon.ico      — generado desde el logo
[ ] Fuentes verificadas — JetBrains Mono y Orbitron cargando correctamente
```

---

### HERRAMIENTAS DE OPTIMIZACIÓN DE ASSETS (todas gratuitas)

| Herramienta | Para qué | URL |
|-------------|----------|-----|
| Squoosh | Optimizar imágenes WebP/JPG | squoosh.app |
| SVGO / SVG OMG | Optimizar y limpiar SVG | jakearchibald.github.io/svgomg |
| Inkscape | Vectorizar y editar SVG | inkscape.org |
| SVGator | Animar SVG | svgator.com |
| favicon.io | Generar favicon desde imagen | favicon.io |
| Google Fonts | Descargar fuentes | fonts.google.com |
| NASA Images | Imágenes de espacio (dominio público) | images.nasa.gov |
