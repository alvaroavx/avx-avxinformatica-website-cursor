# Estructura de archivos

```text
.
├── AGENTS.md
├── README.md
├── server.py
├── src/
│   ├── index.html
│   ├── assets/fonts/
│   ├── js/
│   │   ├── main.js
│   │   ├── audio/game-audio.js
│   │   └── game/game-controller.js
│   └── styles/
│       ├── variables.css
│       ├── base.css
│       └── game.css
├── tests/
│   └── game-audio.test.mjs
└── docs/
    ├── README.md
    ├── audio/
    ├── fonts/
    ├── technical/
    └── archive/, experience/, planning/, product/  (histórico)
```

## Responsabilidades

| Ruta | Responsabilidad |
| --- | --- |
| `src/index.html` | Canvas, HUD, pantallas, configuración y controles táctiles. |
| `src/js/main.js` | Arranque del juego y creación del controlador. |
| `src/js/game/game-controller.js` | Motor: estado, bucle, física, enemigos, reglas y render. |
| `src/js/audio/game-audio.js` | Web Audio API: efectos, ambiente y cierre de nodos. |
| `src/styles/` | Tokens, tipografía local, layout y temas. |
| `src/assets/fonts/` | Noto Sans Mono local y licencia OFL 1.1. |
| `tests/game-audio.test.mjs` | Pruebas de ciclo de audio y cuenta regresiva. |
| `server.py` | HTTP local y persistencia SQLite opcional. |

## Límites de edición

`src/` es la fuente canónica. Los archivos estáticos del sitio corporativo son
una copia de publicación y se ubican en
`avx-astro-avxinformatica/avxinformatica-site/public/vector-field/`; no deben
convertirse en una segunda fuente de desarrollo.
