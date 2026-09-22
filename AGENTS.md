# Guía para agentes — AVX Vector Field

Este repositorio contiene únicamente un juego web estático. La entrada es `src/index.html`; la lógica de juego está concentrada en `src/js/game/game-controller.js`.

Antes de modificarlo, inspecciona `README.md`, ejecuta `node --check src/js/main.js`, `node --check src/js/audio/game-audio.js`, `node --check src/js/game/game-controller.js`, `node --test tests/*.test.mjs`, `python3 -m py_compile server.py` y prueba una partida con `python3 server.py`.

## Invariantes

- La página principal siempre debe abrir una partida, no una portada corporativa.
- La mecánica base es nave con rotación, propulsión, disparo, asteroides fragmentables, vidas, oleadas y puntaje.
- `GameController` mantiene cuatro temas: `green` (predeterminado), `cyan`, `pink` y `yellow`. Un tema debe afectar tanto Canvas como HUD, menús, botones, controles y foco; se persiste en `localStorage` bajo `avx-vector-field-theme`.
- Las dificultades `easy`, `normal` y `hard` se persisten bajo `avx-vector-field-difficulty`; `easy` define velocidad base, `normal` usa ×2 y `hard` asigna ×3, ×4 o ×5 aleatoriamente por asteroide. También cambian vidas iniciales y cantidad de rocas al comenzar una misión nueva. Se escogen desde las tres opciones de misión del menú inicial, que comienzan la partida directamente; no pertenecen a Configuración.
- Si no se elimina ningún asteroide, `GameController` suma refuerzos tras 20 s (`easy`), 14 s (`normal`) o 9 s (`hard`). `reinforcement-countdown` solo se muestra durante los últimos cinco segundos; destruir un asteroide reinicia el temporizador.
- Cada oleada se inicia mediante `beginWave()`: centra y protege brevemente la nave, muestra un conteo 3–2–1 y solo entonces entra en `playing`. Las familias actuales son `scout`, `shard`, `fortress` e `intruder`; existen en todas las dificultades, con comportamiento de dron y vida de blindado escalados por nivel.
- Los pulsos de la nave cruzan los bordes mediante salto espacial; ningún proyectil enemigo puede hacerlo: `updateEnemyBullets()` debe anularlo al tocar un borde. En `hard`, los disparos del dron duran el doble que en los demás niveles.
- La misión contiene tres fases. Tras las fases uno y dos, `openUpgrade()` ofrece dos mejoras de una baraja aleatoria sin repetición; solo se puede escoger una en cada etapa. Al vaciar la tercera fase, `beginBoss()` inicia el jefe. El jefe requiere destruir nodos antes de dañar el núcleo. En `normal`, al caer ambos nodos debe advertir visual y sonoramente antes de una sola descarga radial. En `hard`, debe repetir esa descarga periódicamente mientras el núcleo siga vivo; sus proyectiles conservan mayor alcance temporal y las ráfagas dirigidas alternan 3, 4 o 5 pulsos.
- El tutorial contextual se limita a `easy`. El combo llega a ×5 y vence tras cuatro segundos sin una baja. `easy` y `normal` tienen reinicio de emergencia, mientras `hard` termina en game over.
- `server.py` usa solo biblioteca estándar y acepta exclusivamente resultados de partida validados en `POST /api/runs`. La base `data/*.sqlite3` es local e ignorada por Git. No introduzcas cuentas, PII ni telemetría externa.
- Configuración está disponible desde menú principal y desde pausa para tema y audio. Abrirla durante una partida no debe reanudar, reiniciar ni perder la misión.
- No agregues datos personales, autenticación, publicidad, rastreadores ni dependencias externas de ejecución sin una decisión explícita.
- Mantén teclado, pausa, foco visible y controles táctiles operables.
- Todo texto visible para quien juega debe estar en español; los nombres propios de AVX pueden conservarse.
