# Arquitectura técnica

## Alcance actual

AVX Vector Field es un juego web estático de una pantalla. No usa framework ni
motor externo: HTML, CSS, módulos ES y Canvas 2D son la plataforma de
ejecución. `server.py` es opcional y agrega almacenamiento local SQLite; no es
requisito para publicar o jugar la versión estática.

```text
src/index.html
  -> estructura accesible: canvas, HUD, pantallas, botones y controles
  -> src/js/main.js
       -> GameController (src/js/game/game-controller.js)
            -> Canvas 2D: simulación y render
            -> GameAudio (src/js/audio/game-audio.js)
            -> localStorage: preferencias, récord y audio

server.py (opcional)
  -> POST /api/runs
  -> data/vector-field.sqlite3
```

## Motor de partida

`GameController` es la fuente de verdad de la misión. Recibe entradas de
teclado y controles táctiles, mantiene el estado, actualiza entidades y dibuja
el canvas. Su ciclo activo es:

```text
requestAnimationFrame -> loop(time) -> update(dt) -> render()
```

`dt` se limita a 33 ms. Si el estado no es `playing`, no se actualiza física ni
se agenda el siguiente cuadro de simulación.

`update(dt)` resuelve movimiento de nave, asteroides, dron, jefe, proyectiles,
partículas, colisiones, puntaje, combo, refuerzos, transiciones y HUD.
`render()` dibuja el campo y las entidades para el tema actualmente elegido.

## Estados

| Estado | Comportamiento |
| --- | --- |
| `ready` | Menú principal; HUD y audio de partida ocultos. |
| `intermission` | Nave centrada y protegida; cuenta `3…2…1`. |
| `playing` | Simulación, controles, HUD y audio activos. |
| `paused` | Simulación y audio continuo detenidos. |
| `upgrade` | Partida detenida hasta elegir una mejora. |
| `victory` / `over` | Partida terminada con pantalla narrativa o game over. |

La pestaña oculta invoca pausa. Entrar en pausa, mejora, intermisión, jefe,
menú, victoria o derrota detiene explícitamente el propulsor para evitar nodos
de audio residuales.

## Audio local

`GameAudio` usa Web Audio API tras una interacción explícita con **Iniciar
misión**. Sintetiza efectos, propulsor, señales de cuenta regresiva, ambiente
espacial continuo y pulsos por fase o jefe. No descarga audio, no usa servicios
remotos y persiste volumen, música y mute en `localStorage`.

Al pausar, mejorar, ganar o perder, se cierran propulsor, ambiente y secuencia
musical. Las señales finales se ejecutan sin reactivar el fondo continuo.

## Publicación estática

`src/` es canónico. Para publicar en el sitio corporativo se copia a
`avx-astro-avxinformatica/avxinformatica-site/public/vector-field/`; la salida
generada de Astro queda en `dist/vector-field/`. El juego continúa operativo
sin `/api/runs`; simplemente no registra resultados SQLite.
