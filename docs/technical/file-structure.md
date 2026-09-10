# AVX Informática — Estructura de Archivos

Última actualización: 2026-03-20

## Árbol actual

```text
.
├── README.md
├── docs/
│   ├── README.md
│   ├── archive/
│   ├── experience/
│   ├── planning/
│   ├── product/
│   └── technical/
└── avx-home/
    ├── index.html
    ├── assets/
    │   └── images/
    ├── js/
    │   ├── game/
    │   ├── home/
    │   ├── logo/
    │   ├── utils/
    │   ├── main.js
    │   └── state-manager.js
    └── styles/
```

## Responsabilidades

### `avx-home/index.html`

- Punto de entrada único.
- Contiene los tres estados del sitio.
- Hoy incluye secciones comerciales reales para `nosotros`, `servicios`, `portafolio` y `contacto`.

### `avx-home/js/main.js`

- Bootstrap de la aplicación.
- Orquesta estados, viewport, countdown y carga dinámica del juego.

### `avx-home/js/state-manager.js`

- Fuente de verdad del estado visible.
- Alterna entre `home`, `game` y `fallback`.

### `avx-home/js/home/`

- `home-controller.js`: inicia y detiene el home.
- `planets.js`: labels y setup de planetas.
- `ui-effects.js`: canvas de partículas.

### `avx-home/js/game/`

- `engine.js`, `input.js`, `player.js`, `game-controller.js`: implementados parcialmente.
- `asteroids.js`, `projectiles.js`, `collision.js`, `hud.js`, `particles.js`, `scores.js`: creados pero vacíos.

### `avx-home/js/logo/`

- `logo-animator.js`: sincroniza logo con estado general.

### `avx-home/js/utils/`

- `canvas-helpers.js`: helpers de canvas.
- `math.js`: utilidades matemáticas.
- `viewport.js`: reglas de viewport y watcher.
- `dom.js`: reservado; hoy está vacío.

## Assets reales actuales

- `assets/images/universe.jpg`
- `assets/images/logo.avx.white.png`
- `assets/images/logo.avx.black.png`
- `assets/images/favicon.png`

## Notas

- Todo el código del sitio vive dentro de `avx-home/`.
- La documentación ya no se organiza por numeración secuencial sino por dominio.
