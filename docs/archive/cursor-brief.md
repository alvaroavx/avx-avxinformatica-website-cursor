# AVX Informática — Brief para Cursor

Documento archivado. No usar como fuente de verdad del estado actual del proyecto.

## Documento 10: CURSOR_BRIEF

> Este documento es la fuente de verdad para la implementación.
> Leer todos los documentos de `/docs/` antes de escribir código.
> Empezar siempre por la estructura de archivos, no por el código.

---

## PASO 0 — ANTES DE ESCRIBIR UNA SOLA LÍNEA DE CÓDIGO

**Cursor debe crear primero todos los archivos vacíos con la estructura definida.**
Esto establece el proyecto antes de implementar. No saltear este paso.

### 0.1 Crear la estructura de carpetas y archivos vacíos

```bash
# Estructura a crear:
avx-home/
├── index.html
├── styles/
│   ├── variables.css
│   ├── base.css
│   ├── home.css
│   ├── planets.css
│   ├── logo.css
│   ├── game.css
│   ├── fallback.css
│   └── transitions.css
├── js/
│   ├── main.js
│   ├── state-manager.js
│   ├── home/
│   │   ├── home-controller.js
│   │   ├── planets.js
│   │   └── ui-effects.js
│   ├── game/
│   │   ├── game-controller.js
│   │   ├── engine.js
│   │   ├── player.js
│   │   ├── asteroids.js
│   │   ├── projectiles.js
│   │   ├── collision.js
│   │   ├── hud.js
│   │   ├── input.js
│   │   ├── particles.js
│   │   └── scores.js
│   ├── logo/
│   │   └── logo-animator.js
│   └── utils/
│       ├── math.js
│       ├── canvas-helpers.js
│       ├── dom.js
│       └── viewport.js
└── assets/
    ├── images/    (vacío — assets por agregar manualmente)
    ├── svg/
    │   └── icons/ (vacío)
    ├── fonts/     (vacío)
    └── game/      (vacío — sprites por agregar manualmente)
```

### 0.2 Crear archivos placeholder para assets ausentes

Mientras no existen los assets definitivos, el código debe funcionar con placeholders. Cada placeholder debe tener un comentario `// ASSET:` como se define en `07_ASSETS_MANIFEST.md`.

---

## PASO 1 — ORDEN DE IMPLEMENTACIÓN

Implementar en este orden exacto. No avanzar al siguiente paso sin que el anterior funcione:

```
1. [ ] variables.css — sistema de tokens completo (colores, fuentes, espaciado, z-index)
2. [ ] base.css      — reset, body, fuentes
3. [ ] index.html    — estructura HTML de los tres estados (home, game, fallback)
4. [ ] viewport.js   — detección de viewport y función canPlayGame()
5. [ ] state-manager.js — lógica de los tres estados
6. [ ] main.js       — punto de entrada, inicialización
7. [ ] fallback.css + comportamiento visual del fallback
8. [ ] home.css      — layout del home corporativo
9. [ ] home-controller.js + planets.js — planetas con labels
10.[ ] ui-effects.js — partículas y microinteracciones del home
11.[ ] transitions.css — animaciones de transición entre estados
12.[ ] logo-animator.js — animación CSS del logo (estado logo ↔ nave)
13.[ ] input.js      — captura de WASD + Mouse
14.[ ] math.js + canvas-helpers.js — utilidades del juego
15.[ ] player.js     — nave en centro, rotación, propulsor
16.[ ] asteroids.js  — generación y movimiento de asteroides
17.[ ] projectiles.js — proyectiles y límites
18.[ ] collision.js  — detección de colisiones
19.[ ] particles.js  — explosiones y efectos
20.[ ] hud.js        — HUD del juego
21.[ ] scores.js     — sistema de puntajes en localStorage
22.[ ] engine.js     — game loop completo con delta time
23.[ ] game-controller.js — orquestación del juego
24.[ ] Integración final: pantalla de instrucciones + pantalla de resultados
```

---

## ESPECIFICACIÓN TÉCNICA COMPLETA

### STACK
- HTML5, CSS3, JavaScript ES6+ puro
- Sin frameworks, sin jQuery, sin librerías externas de juego
- Módulos ES6 nativos (`type="module"`)

### VIEWPORT MÍNIMO PARA JUEGO
```javascript
const GAME_MIN_WIDTH  = 1024; // px
const GAME_MIN_HEIGHT = 600;  // px
```

### IDENTIDAD VISUAL

```css
/* COLORES */
--color-bg-deep:      #020B18   /* Fondo principal */
--color-neon-primary: #00FF88   /* Verde neon AVX */
--color-text-primary: #E8F4F0   /* Texto principal */
--color-danger:       #FF3D3D   /* Peligro/daño */

/* FUENTES — cargar desde Google Fonts */
--font-primary:  'JetBrains Mono', monospace    /* Interfaz y HUD */
--font-display:  'Orbitron', monospace           /* Tagline y títulos */
```

### TAGLINE Y COPY
```
Tagline:    "Construimos tu próximo nivel tecnológico"
Subtítulo:  "Software · Automatización · Arquitectura · Inteligencia Artificial"
CTA 1:      "CONTÁCTANOS"       (link a #contacto)
CTA 2:      "INICIAR SIMULACIÓN" (activa el juego)
```

---

## HOME CORPORATIVO — ESPECIFICACIÓN

### Capas visuales (de fondo a frente):
1. `div.home__bg` — imagen estática de universo como `background-image` CSS
2. `canvas#home-canvas` — partículas de estrellas titilantes a 30fps
3. `div.home__core` — logo + tagline + subtítulo + botones (centrado en viewport)
4. `nav.home__planets` — 4 planetas en posiciones absolutas

### Logo:
- SVG con id `avx-logo-svg`
- Glow verde pulsante: CSS animation, 3s, ease-in-out, infinite
- Animación de transformación a nave al activar juego

### Planetas (4):
```
NOSOTROS:   left: 15%, top: 30%
SERVICIOS:  left: 75%, top: 25%
PORTAFOLIO: left: 20%, top: 65%
CONTACTO:   left: 72%, top: 68%
```
- Label siempre visible debajo del planeta (en modo home)
- `display: none` completo en modo juego (no solo hidden)
- Hover: scale(1.1) + glow intensificado

### Canvas de partículas del home:
- Máximo 150 estrellas
- Solo cambio de opacidad (0.3 → 1.0), sin movimiento de posición
- Loop a 30fps con timestamp throttling
- `cancelAnimationFrame` al entrar al modo juego

---

## MODO JUEGO — ESPECIFICACIÓN

### Mecánica:
- Nave fija en centro exacto del canvas
- Nave rota pero no se traslada
- Efecto visual de propulsor (sin movimiento)
- 3 vidas, invulnerabilidad 1.5s tras impacto
- Duración: 60 segundos fijos
- Dificultad progresiva en 3 intervalos de 20s

### Controles (ambos activos simultáneamente):
```
TECLADO:  A/D = rotar | W = propulsor visual | Espacio = disparar | ESC = salir
MOUSE:    cursor = apuntar | clic izq = disparar | ESC = salir
```

### Asteroides:
- 3 tamaños: grande (70-80px) → se divide en 2 medianos, mediano (40-50px) → 2 pequeños, pequeño (20-25px) → desaparece
- Entrada desde bordes, trayectoria hacia zona central (no exactamente al centro)
- Polígonos irregulares (6-9 vértices), estética de "fragmento digital"
- Máximo 20 simultáneos

### Proyectiles:
- Viajan en dirección de la nave
- Velocidad constante, desaparecen en bordes
- Cooldown: 250ms entre disparos
- Máximo 6 simultáneos

### Colisión:
- Circle-circle sin `Math.sqrt` (comparar cuadrado de distancia)

### HUD layout:
```
[TIEMPO: 60]     [♦ ♦ ♦]     [SCORE: 0000]
                                   [SALIR/ESC]
         (centro: la nave)
```

### Pantalla de instrucciones:
- Timer 5 segundos, NO salteable
- Muestra controles WASD + Mouse
- Comienza automáticamente al llegar a 0

### Pantalla de resultados:
- Puntaje final
- Top 10 (desde localStorage)
- Input de iniciales (max 3 chars, auto-uppercase)
- Mensaje comercial AVX
- Botones: "JUGAR DE NUEVO" y "VOLVER AL SISTEMA"

### Rendimiento del motor:
- Delta time: todas las velocidades en unidades/segundo
- Delta máximo: 0.05s (20fps mínimo, evita spiral of death)
- Object pooling para proyectiles (max 6) y partículas (max 100)
- Page Visibility API: pausar loop cuando tab oculta
- Canvas sin alpha: `getContext('2d', { alpha: false })`
- Soporte HiDPI: escalar por `devicePixelRatio`

---

## SISTEMA DE PUNTAJES

```javascript
// localStorage key: 'avx_scores'
// Estructura: JSON array de máximo 10 objetos
// { score: number, initials: string (max 3 chars), date: string (ISO) }
// Ordenado descendente por score
// Al agregar: si score > mínimo del top10 o hay menos de 10 → insertar
// Si score <= mínimo con 10 entradas → no insertar
```

---

## ESTADO FALLBACK

Activo cuando: `window.innerWidth < 1024 || window.innerHeight < 600`

Contenido:
- Logo AVX
- Tagline
- Mensaje: "La experiencia completa de AVX está optimizada para pantallas de escritorio"
- Servicios en una línea
- Botón CONTÁCTANOS
- Email de contacto

Sin Canvas, sin animaciones, completamente estático. Máximo rendimiento en móvil.

**Decisiones actuales del proyecto (actualizar si cambia):**
- Dominio final: `avx.cl`
- Correo de contacto: `alvaro@avx.cl`
- Assets ya disponibles en `assets/images/`:
  - `universe.jpg` (background temporal)
  - `logo.avx.white.png` (usar sobre fondo oscuro)
  - `logo.avx.black.png` (usar sobre fondo claro)
  - `favicon.png` (favicon temporal)

---

## GESTIÓN DE ASSETS

**Todos los assets reemplazables tienen comentario `// ASSET:` en el código.**

Mientras no existen los assets definitivos, usar estos placeholders:
- Fondo universo → CSS radial-gradient oscuro
- Logo → SVG generado con la geometría descrita
- Nave → triángulo estilizado como Path2D
- Asteroides → polígonos irregulares generados proceduralmente con Math.random()

Ver `07_ASSETS_MANIFEST.md` para instrucciones de obtención de assets definitivos.

---

## CARGA DE RECURSOS

```html
<!-- En <head> de index.html -->

<!-- Preload de imagen crítica (solo desktop) -->
<link rel="preload" as="image" href="assets/images/universe-bg.webp"
      type="image/webp" media="(min-width: 1024px)">

<!-- Fuentes — preconnect para reducir latencia -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">

<!-- CSS crítico -->
<link rel="stylesheet" href="styles/variables.css">
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/home.css">

<!-- CSS no crítico — carga sin bloquear render -->
<link rel="stylesheet" href="styles/planets.css"     media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/logo.css"         media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/transitions.css"  media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/game.css"         media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/fallback.css"     media="print" onload="this.media='all'">
```

```html
<!-- Al final del body -->
<script type="module" src="js/main.js"></script>
```

Los módulos de `js/game/` se importan dinámicamente desde `state-manager.js` solo cuando el usuario activa el juego.

---

## EVENTOS CUSTOM

```javascript
// Todos los módulos se comunican via eventos del DOM
'avx:statechange'   // { detail: { from, to } }
'avx:gamestart'
'avx:gameend'       // { detail: { score, survived } }
'avx:gameexit'
'avx:scoressaved'
'avx:viewportchange'
```

---

## CONVENCIONES

- Archivos: kebab-case
- Variables JS: camelCase
- Constantes: UPPER_SNAKE_CASE
- Clases CSS: BEM simplificado
- Assets reemplazables: comentario `// ASSET: nombre — descripción`
- Sin `console.log` en producción (usar flag `DEBUG_MODE = false`)
- Sin `var`, solo `const` y `let`
- Funciones puras donde sea posible
- Cada módulo tiene una sola responsabilidad

---

## REFERENCIA A DOCUMENTOS DE ESPECIFICACIÓN

Para cada área de implementación, consultar el documento correspondiente:

| Implementando | Leer |
|---------------|------|
| Estructura de archivos | `01_FILE_STRUCTURE.md` |
| Arquitectura JS y módulos | `02_ARCHITECTURE.md` |
| Colores, fuentes, variables CSS | `03_DESIGN_SYSTEM.md` |
| Home corporativo | `04_HOME_SPEC.md` |
| Motor del juego | `05_GAME_SPEC.md` |
| Animación del logo | `06_LOGO_ANIMATION_SPEC.md` |
| Assets y placeholders | `07_ASSETS_MANIFEST.md` |
| Rendimiento y Canvas | `08_PERFORMANCE_SPEC.md` |
| Estado fallback | `09_FALLBACK_SPEC.md` |
