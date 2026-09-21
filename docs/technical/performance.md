# Histórico — Estrategia de rendimiento del sitio corporativo anterior

> No corresponde a AVX Vector Field. Para la implementación actual consultar
> `architecture.md`, `testing.md` y el código canónico en `src/`.

# AVX Informática — Estrategia de Rendimiento
## Documento 08: PERFORMANCE_SPEC

---

### PRINCIPIO: LA VELOCIDAD ES PARTE DEL PRODUCTO

Un sitio lento enviado a un CTO o director de tecnología comunica exactamente lo opuesto de lo que AVX quiere comunicar. La performance no es optimización posterior — es parte del argumento comercial.

**Target de rendimiento:**
- First Contentful Paint (FCP): < 1.2 segundos
- Largest Contentful Paint (LCP): < 2.0 segundos
- Time to Interactive (TTI): < 2.5 segundos
- Google Lighthouse Performance Score: > 90

---

### ESTRATEGIA DE CARGA EN DOS FASES

#### Fase 1: Home visible y funcional (crítico)
Lo que debe estar disponible antes de que el usuario vea la pantalla:

```
1. CSS crítico (variables, base, home)
2. Estructura HTML del home
3. Fuentes declaradas (con font-display: swap)
4. Imagen de fondo en proceso de carga (mostrar placeholder mientras)
```

#### Fase 2: Enhancements y juego (diferido)
Lo que puede cargar después de que el home ya es visible:

```
1. Módulos JS del juego (import() dinámico, solo si usuario activa)
2. Assets del juego (sprites SVG)
3. Canvas de partículas del home (empieza ~300ms después del load)
4. Animaciones de entrada del home
```

---

### IMAGEN DE FONDO — ESTRATEGIA DE CARGA

```html
<!-- En <head>: precargar la imagen de fondo como mayor prioridad -->
<link rel="preload" as="image" href="assets/images/universe-bg.webp"
      type="image/webp"
      media="(min-width: 1024px)">
<!-- Solo precargar en desktop, no en móvil donde se muestra fallback -->
```

```css
/* Mientras la imagen carga, mostrar un gradiente que se asemeje al universo */
.home__bg {
  background:
    radial-gradient(ellipse at 70% 30%, rgba(20, 30, 80, 0.8) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 70%, rgba(40, 10, 60, 0.6) 0%, transparent 50%),
    #020B18;

  /* La imagen real se aplica encima cuando carga */
  background-image: url('assets/images/universe-bg.webp');
  background-size: cover;
  background-position: center;
}
```

El gradiente de fallback es visualmente coherente con el universo. El visitante ve una pantalla oscura con degradado antes de que la imagen cargue — no una pantalla en blanco.

**Formato WebP con fallback JPG:**
```html
<!-- En HTML para soporte universal -->
<picture>
  <source srcset="assets/images/universe-bg.webp" type="image/webp">
  <img src="assets/images/universe-bg.jpg" alt="" class="home__bg-img" loading="eager" fetchpriority="high">
</picture>
```

O alternativamente via CSS con `@supports`:
```css
.home__bg {
  background-image: url('assets/images/universe-bg.jpg'); /* fallback */
}
@supports (background-image: url('x.webp')) {
  .home__bg {
    background-image: url('assets/images/universe-bg.webp');
  }
}
```

---

### FUENTES — ESTRATEGIA

```html
<!-- Preconnect para reducir latencia de DNS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Cargar fuentes con display=swap para no bloquear render -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap"
      rel="stylesheet">
```

`font-display: swap` significa que el texto se muestra inmediatamente con la fuente del sistema, y se reemplaza con la fuente custom cuando carga. Sin flash de contenido invisible (FOIT).

**Alternativa para máximo rendimiento:** Descargar y servir las fuentes localmente desde `assets/fonts/`. Elimina el request externo a Google y la latencia de DNS.

---

### CSS — ESTRATEGIA DE CARGA

```html
<!-- CSS crítico: bloquea render pero es pequeño y necesario -->
<link rel="stylesheet" href="styles/variables.css">
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/home.css">

<!-- CSS no crítico: carga sin bloquear render -->
<link rel="stylesheet" href="styles/planets.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/transitions.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/game.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="styles/fallback.css" media="print" onload="this.media='all'">
```

El truco `media="print" onload="this.media='all'"` carga el CSS sin bloquear el render inicial. Cuando termina de cargar, se aplica al documento.

---

### JAVASCRIPT — ESTRATEGIA DE CARGA

```html
<!-- Solo main.js en el HTML. Carga como módulo (diferido automáticamente) -->
<script type="module" src="js/main.js"></script>
```

Los módulos ES6 con `type="module"` son diferidos por defecto — no bloquean el render. main.js importa dinámicamente los módulos del juego solo cuando se necesitan:

```javascript
// main.js — pseudocódigo de importación dinámica
async function activateGameMode() {
  const { GameController } = await import('./game/game-controller.js');
  // El juego solo se descarga cuando el usuario lo activa
}
```

---

### CANVAS DE PARTÍCULAS — RENDIMIENTO

**Técnica de throttling a 30fps:**
```javascript
// No usar setInterval — usar requestAnimationFrame con timestamp check
let lastFrameTime = 0;
const PARTICLE_TARGET_FPS = 30;
const PARTICLE_FRAME_INTERVAL = 1000 / PARTICLE_TARGET_FPS; // 33.3ms

function particleLoop(timestamp) {
  if (!isHomeActive) return; // Parar si no estamos en home

  const delta = timestamp - lastFrameTime;
  if (delta >= PARTICLE_FRAME_INTERVAL) {
    lastFrameTime = timestamp - (delta % PARTICLE_FRAME_INTERVAL);
    updateAndRenderParticles();
  }

  particleAnimationId = requestAnimationFrame(particleLoop);
}
```

**Partículas sin movimiento:**
Las estrellas solo cambian opacidad, no posición. Esto elimina el cálculo de nuevas coordenadas y reduce dramáticamente el trabajo por frame.

**Cantidad controlada:**
Máximo 150 partículas. Con solo cambio de opacidad, esto es trivial para el GPU.

**Evitar `will-change` excesivo:**
Solo aplicar `will-change: opacity` al canvas de partículas, no a elementos individuales.

---

### MOTOR DEL JUEGO — RENDIMIENTO

**Delta time para frame-rate independence:**
```javascript
function gameLoop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.05); // segundos, max 50ms
  lastTime = timestamp;

  update(delta); // Todo en unidades/segundo
  render();

  animationId = requestAnimationFrame(gameLoop);
}
```

**Object Pooling para entidades frecuentes:**
```javascript
class ObjectPool {
  constructor(factory, size) {
    this.pool = Array.from({ length: size }, factory);
    this.active = [];
  }

  get() { return this.pool.pop() || this.factory(); }
  release(obj) { this.pool.push(obj); }
}

// Pools:
const projectilePool = new ObjectPool(() => new Projectile(), 6);
const particlePool   = new ObjectPool(() => new Particle(), 100);
```

**Límites de entidades:**
- Asteroides simultáneos: 20
- Proyectiles simultáneos: 6
- Partículas de explosión: 100

**Detección de colisiones optimizada:**
Circle-circle collision (radio al cuadrado, sin sqrt):
```javascript
function circlesCollide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const radiiSum = a.radius + b.radius;
  return distSq <= radiiSum * radiiSum; // Sin Math.sqrt
}
```

**Page Visibility API:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else if (gameIsActive) {
    lastTime = performance.now(); // Reset delta para evitar spike
    animationId = requestAnimationFrame(gameLoop);
  }
});
```

---

### CANVAS — CONFIGURACIONES DE RENDIMIENTO

```javascript
// Al crear el canvas del juego
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', {
  alpha: false,         // Sin canal alpha = más rápido en compositing
  desynchronized: true  // Reduce latencia en hardware que lo soporta
});

// Escalar para pantallas HiDPI (Retina) sin blur
const dpr = window.devicePixelRatio || 1;
canvas.width  = window.innerWidth  * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width  = window.innerWidth  + 'px';
canvas.style.height = window.innerHeight + 'px';
ctx.scale(dpr, dpr);
```

**`alpha: false` en el contexto 2D:**
Cuando el canvas no necesita ser transparente (el juego cubre toda la pantalla), esta flag mejora significativamente el rendimiento de compositing en algunos navegadores.

---

### LAZY LOADING DE ASSETS DEL JUEGO

Los sprites SVG del juego no se cargan hasta que el modo juego se activa:

```javascript
// game-controller.js
async function loadGameAssets() {
  const [shipSvg, asteroid1, asteroid2, asteroid3] = await Promise.all([
    loadSVG('assets/game/ship-sprite.svg'),
    loadSVG('assets/game/asteroid-01.svg'),
    loadSVG('assets/game/asteroid-02.svg'),
    loadSVG('assets/game/asteroid-03.svg'),
  ]);
  return { shipSvg, asteroid1, asteroid2, asteroid3 };
}

function loadSVG(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = path;
  });
}
```

---

### MÉTRICAS A MEDIR (con Chrome DevTools)

Antes de lanzamiento, verificar en Chrome DevTools > Performance:

1. **Network tab:** Verificar que JS del juego NO se descarga en el load inicial
2. **Performance tab:** Confirmar FCP < 1.2s, LCP < 2.0s
3. **Rendering tab > Frame rendering stats:** Confirmar 60fps estables en el juego
4. **Memory tab:** Confirmar que al salir del juego, la memoria se libera (no memory leak)
5. **Lighthouse:** Score de Performance > 90 en modo escritorio
