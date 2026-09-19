# Documentación — AVX Vector Field

La ruta canónica del juego es `src/`.

- Entrada: `src/index.html`.
- Inicio JavaScript: `src/js/main.js`.
- Mecánica de la partida: `src/js/game/game-controller.js`.
- Estilos: `src/styles/`.

## Configuración implementada

`GameController` define y persiste la personalización local del jugador:

- **Tema:** `green` (predeterminado, Verde AVX), `cyan` (Celeste), `pink` (Rosado) y `yellow` (Amarillo). El cambio actualiza Canvas y toda la interfaz de mando: HUD, paneles, botones, controles y foco.
- **Dificultad:** `easy` define la velocidad base con 4 vidas; `normal` usa ×2 de esa velocidad con 3 vidas; `hard` usa ×3, ×4 o ×5 elegidos aleatoriamente por asteroide, 2 vidas y más rocas. Se aplica cuando empieza una misión nueva.
- **Refuerzos por inactividad:** si el jugador no destruye un asteroide, aparecen más rocas tras 20 s en `easy`, 14 s en `normal` o 9 s en `hard`. `reinforcement-countdown` se muestra durante los cinco segundos finales; `hitRock()` reinicia ese temporizador.
- **Actos y familias:** hay tres fases. `beginWave()` devuelve la nave al centro, la protege y muestra 3–2–1. `easy` usa `scout` y un tutorial contextual; `normal` añade `shard` (pequeño, rápido, trazo discontinuo); `hard` añade `fortress` (carcasa/anillo ámbar y dos impactos) e `intruder` (dron que persigue y dispara). Un `scout` grande se fragmenta al ser destruido.
- **Elecciones y puntaje:** tras las fases uno y dos, `openUpgrade()` presenta `twin`, `overclock` o `shield`, activos durante la misión. `registerKill()` conserva un combo de hasta ×5 durante cuatro segundos.
- **Cierre:** tras la tercera fase, `beginBoss()` presenta una anomalía con dos nodos y un núcleo vulnerable solo cuando ambos nodos caen. La victoria activa la pantalla narrativa final. `easy` y `normal` reinician la nave al agotar vidas con 75 % del puntaje; `hard` llama a `gameOver()`.

Ambas elecciones viven exclusivamente en `localStorage` como `avx-vector-field-theme` y `avx-vector-field-difficulty`. Configuración se abre desde el menú principal o desde pausa; al abrirla durante una partida, esta sigue detenida.

## Persistencia local

`server.py` sirve `src/` y expone `POST /api/runs`. Con `sqlite3` de la biblioteca estándar crea localmente `data/vector-field.sqlite3` y guarda solo el resultado de victoria o game over: fecha, puntaje, dificultad, resultado, amenazas destruidas, reintentos y mejoras. El navegador sigue funcionando si se sirve de forma estática, pero entonces el endpoint no existe y no se persiste el resultado. La base se excluye de Git.

Los documentos dentro de `archive/`, `planning/`, `experience/`, `product/` y `technical/` describen la antigua propuesta de sitio corporativo y se conservan solo como registro histórico. No deben utilizarse para desarrollar el juego actual ni como referencia de estructura: algunas rutas antiguas aún mencionan `avx-home/`, pero el directorio fue renombrado definitivamente a `src/`.
