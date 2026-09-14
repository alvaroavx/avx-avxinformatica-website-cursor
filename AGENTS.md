# Guía para agentes — AVX Vector Field

Este repositorio contiene únicamente un juego web estático. La entrada es `avx-home/index.html`; la lógica de juego está concentrada en `avx-home/js/game/game-controller.js`.

Antes de modificarlo, inspecciona `README.md`, ejecuta `node --check avx-home/js/main.js` y `node --check avx-home/js/game/game-controller.js`, y prueba una partida por HTTP local.

## Invariantes

- La página principal siempre debe abrir una partida, no una portada corporativa.
- La mecánica base es nave con rotación, propulsión, disparo, asteroides fragmentables, vidas, oleadas y puntaje.
- No agregues datos personales, autenticación, publicidad, rastreadores ni dependencias externas de ejecución sin una decisión explícita.
- Mantén teclado, pausa, foco visible y controles táctiles operables.
