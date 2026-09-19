# Guía para agentes — AVX Vector Field

Este repositorio contiene únicamente un juego web estático. La entrada es `src/index.html`; la lógica de juego está concentrada en `src/js/game/game-controller.js`.

Antes de modificarlo, inspecciona `README.md`, ejecuta `node --check src/js/main.js` y `node --check src/js/game/game-controller.js`, y prueba una partida por HTTP local.

## Invariantes

- La página principal siempre debe abrir una partida, no una portada corporativa.
- La mecánica base es nave con rotación, propulsión, disparo, asteroides fragmentables, vidas, oleadas y puntaje.
- `GameController` mantiene cuatro temas: `green` (predeterminado), `cyan`, `pink` y `yellow`. Un tema debe afectar tanto Canvas como HUD, menús, botones, controles y foco; se persiste en `localStorage` bajo `avx-vector-field-theme`.
- Las dificultades `easy`, `normal` y `hard` se persisten bajo `avx-vector-field-difficulty`; `easy` define velocidad base, `normal` usa ×2 y `hard` asigna ×3, ×4 o ×5 aleatoriamente por asteroide. También cambian vidas iniciales y cantidad de rocas al comenzar una misión nueva.
- Si no se elimina ningún asteroide, `GameController` suma refuerzos tras 20 s (`easy`), 14 s (`normal`) o 9 s (`hard`). `reinforcement-countdown` solo se muestra durante los últimos cinco segundos; destruir un asteroide reinicia el temporizador.
- Configuración está disponible desde menú principal y desde pausa. Abrirla durante una partida no debe reanudar, reiniciar ni perder la misión.
- No agregues datos personales, autenticación, publicidad, rastreadores ni dependencias externas de ejecución sin una decisión explícita.
- Mantén teclado, pausa, foco visible y controles táctiles operables.
