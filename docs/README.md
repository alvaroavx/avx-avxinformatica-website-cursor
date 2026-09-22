# Documentación — AVX Vector Field

La ruta canónica del juego es `src/`.

- Entrada: `src/index.html`.
- Inicio JavaScript: `src/js/main.js`.
- Mecánica de la partida: `src/js/game/game-controller.js`.
- Estilos: `src/styles/`.
- Audio: `src/js/audio/game-audio.js`.
- Tipografías locales: `src/assets/fonts/`.
- Pruebas: `tests/game-audio.test.mjs`.

## Fuente de verdad actual

Los documentos técnicos vigentes son:

- [`technical/architecture.md`](technical/architecture.md): ciclo de partida,
  estados, Canvas 2D, audio y publicación estática.
- [`technical/testing.md`](technical/testing.md): suite automatizada, puertas
  locales y límites de validación.

`planning/`, `product/` y `experience/` contienen propuesta corporativa y
material anterior al juego actual. Se conservan como historial y no deben
contradecir `src/`, el README raíz ni los documentos técnicos vigentes.
Los archivos `technical/assets-manifest.md`, `technical/design-system.md` y
`technical/performance.md` también pertenecen a esa propuesta anterior; no son
especificaciones del juego actual.

## Configuración implementada

`GameController` define y persiste la personalización local del jugador:

- **Tema:** `green` (predeterminado, Verde AVX), `cyan` (Celeste), `pink` (Rosado) y `yellow` (Amarillo). El cambio actualiza Canvas y toda la interfaz de mando: HUD, paneles, botones, controles y foco.
- **Dificultad de misión:** `easy` define la velocidad base con 4 vidas; `normal` usa ×2 de esa velocidad con 3 vidas; `hard` usa ×3, ×4 o ×5 elegidos aleatoriamente por asteroide, 2 vidas y más rocas. Se escoge desde el menú inicial mediante las opciones numeradas Fácil, Normal o Difícil y al elegirla comienza la partida; no forma parte de Configuración.
- **Refuerzos por inactividad:** si el jugador no destruye un asteroide, aparecen más rocas tras 20 s en `easy`, 14 s en `normal` o 9 s en `hard`. `reinforcement-countdown` se muestra durante los cinco segundos finales; `hitRock()` reinicia ese temporizador.
- **Actos y familias:** hay tres fases. `beginWave()` devuelve la nave al centro, la protege y muestra 3–2–1. Todas las dificultades pueden desplegar `scout`, `shard`, `fortress` e `intruder`; el dron cambia su conducta por nivel, sus disparos en Difícil viven el doble de tiempo y `fortress` recibe 2, 3 o 5 impactos en Fácil, Normal o Difícil. `updateEnemyBullets()` anula todo proyectil enemigo al tocar un borde, mientras los pulsos del jugador conservan el salto espacial. Un `scout` grande se fragmenta una sola vez: sus hijos son terminales.
- **Elecciones y puntaje:** tras las fases uno y dos, `openUpgrade()` presenta dos mejoras de una baraja aleatoria sin repetición entre `twin`, `overclock`, `shield` y `long-shot`; se puede elegir una por etapa. `registerKill()` conserva un combo de hasta ×5 durante cuatro segundos.
- **Cierre:** tras la tercera fase, `beginBoss()` presenta una anomalía con dos nodos y un núcleo vulnerable solo cuando ambos nodos caen. En Normal, `updateFinalBossAttack()` ejecuta una única carga audiovisual de 1,35 s y descarga radial. En Difícil, alterna esa carga y una descarga cada cinco segundos mientras el núcleo siga vivo; sus proyectiles también tienen mayor alcance temporal y las ráfagas dirigidas tienen 3, 4 o 5 pulsos. La victoria activa la pantalla narrativa final. `easy` y `normal` reinician la nave al agotar vidas con 75 % del puntaje; `hard` llama a `gameOver()`.

Ambas preferencias viven exclusivamente en `localStorage` como `avx-vector-field-theme` y `avx-vector-field-difficulty`. Configuración se abre desde el menú principal o desde pausa y solo ofrece tema y audio; al abrirla durante una partida, esta sigue detenida.

## Audio

`GameAudio` centraliza la primera sonidificación con Web Audio API y no carga
assets externos. Se desbloquea únicamente tras pulsar **Iniciar misión**,
persiste volumen, música y mute bajo `avx-vector-field-audio`, y ofrece un
control de mute durante la partida más volumen general y de música en
Configuración. El motor responde a propulsión, disparos, daños, la cuenta
`3…2…1` y eventos de jefe. La música combina un ambiente continuo de baja
frecuencia con pulsos por fase; pausa, mejora, victoria, game over u ocultar
la pestaña detienen propulsor, ambiente y loops. Al entrar en `gameOver()`,
`playerDeath()` sintetiza un arpegio descendente breve.

`node --test tests/game-audio.test.mjs` cubre el ciclo de propulsor y ambiente
al pausar, las señales de la cuenta regresiva, el corte musical de victoria o
derrota, y la delegación de pausa desde el controlador.

La política de assets de terceros está en
[`audio/THIRD_PARTY_AUDIO.md`](audio/THIRD_PARTY_AUDIO.md).

El uso de la herramienta interna está en
[`audio/AUDIO_LAB.md`](audio/AUDIO_LAB.md).

## Tipografías locales

La interfaz usa Noto Sans Mono empaquetada como TTF local con `@font-face`.
Por tanto, no solicita Google Fonts ni otra fuente remota. Sus archivos,
licencia y procedimiento de actualización están documentados en
[`fonts/THIRD_PARTY_FONTS.md`](fonts/THIRD_PARTY_FONTS.md).

## Persistencia local

`server.py` sirve `src/` y expone `POST /api/runs`. Con `sqlite3` de la biblioteca estándar crea localmente `data/vector-field.sqlite3` y guarda solo el resultado de victoria o game over: fecha, puntaje, dificultad, resultado, amenazas destruidas, reintentos y mejoras. El navegador sigue funcionando si se sirve de forma estática, pero entonces el endpoint no existe y no se persiste el resultado. La base se excluye de Git.

Los documentos dentro de `archive/`, `planning/`, `experience/`, `product/` y `technical/` describen la antigua propuesta de sitio corporativo y se conservan solo como registro histórico. No deben utilizarse para desarrollar el juego actual ni como referencia de estructura: algunas rutas antiguas aún mencionan `avx-home/`, pero el directorio fue renombrado definitivamente a `src/`.
