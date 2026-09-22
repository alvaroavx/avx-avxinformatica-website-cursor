# AVX Vector Field

Juego web arcade de una pantalla, inspirado en las mecánicas clásicas de *Asteroids*: una nave gira, se impulsa, dispara y destruye rocas que se fragmentan. No reutiliza arte, código ni contenido del juego original.

## Jugar localmente

El juego no necesita dependencias externas para jugar: audio y tipografías se
generan o sirven localmente, sin peticiones a Google Fonts ni a otros servicios.
Para conservar los resultados de cada misión en SQLite, inicia el servidor local desde la raíz:

```bash
python3 server.py
```

Abre `http://127.0.0.1:8080/`.

## Controles

- Flechas izquierda/derecha o `A`/`D`: girar.
- Flecha arriba o `W`: propulsión.
- `Espacio`: disparar.
- `Escape` o el botón circular: pausar y continuar.
- En pantallas táctiles, utiliza los cuatro controles inferiores.

## Menú y configuración

El menú principal no tiene un botón genérico para iniciar: tres opciones numeradas inician directamente la partida y definen su dificultad: **Soy un novato** (Fácil), **Ya sé lo que hago** (Normal) y **Dame un desafío** (Difícil). Desde pausa puedes continuar, reiniciar, volver al menú principal o abrir **Configuración**. Esta última concentra el tema y el audio. El selector de tema cambia en vivo toda la interfaz y la escena: líneas, nave, asteroides, disparos, HUD, menús, botones y focos entre **Verde AVX**, **Celeste**, **Rosado** y **Amarillo**. La elección queda guardada solo en el navegador mediante `localStorage`.

El audio se inicializa solamente después de elegir una misión. Incluye
efectos, tonos ascendentes para cada paso de la cuenta `3…2…1` y música
sintetizada por Web Audio API: un ambiente espacial continuo más pulsos que
cambian con la fase o jefe. No usa assets externos. Configuración permite
ajustar volumen general y de música (con tope de 70 %), y el botón inferior izquierdo silencia
todo durante una partida. Pausar, escoger una mejora, terminar la misión o
perder apaga propulsor, ambiente y secuencias continuas. Al terminar la
partida, suena además un arpegio descendente breve.

La elección inicial de dificultad aplica a la misión nueva: **Fácil** inicia con cuatro vidas y define la velocidad base; **Normal** inicia con tres vidas y cada asteroide viaja al **doble** de esa velocidad; **Difícil** inicia con dos vidas, más rocas y asigna aleatoriamente a cada asteroide un multiplicador **×3, ×4 o ×5**.

Si no destruyes un asteroide, el campo pide refuerzos: un contador aparece durante los últimos cinco segundos y agrega nuevas rocas al llegar a cero. El intervalo es de 20 s en Fácil, 14 s en Normal y 9 s en Difícil; destruir cualquier asteroide reinicia el contador.

## Actos y amenazas

Cada misión tiene tres fases. Cada una comienza con una transición: la nave vuelve al centro, recibe invulnerabilidad breve y anuncia la cuenta `3…2…1` antes de liberar el campo. Las tres dificultades pueden desplegar **Exploradores**, **Fragmentos**, **Blindados** y **Drones intrusos**. Los blindados requieren 2, 3 o 5 impactos en Fácil, Normal o Difícil, respectivamente. En Fácil, el dron se aproxima hasta una distancia segura, se detiene y se retira hacia un punto lejano antes de volver por otra ruta; en Normal dispara de forma espaciada; y en Difícil persigue directamente y alterna desplazamiento con ráfagas de tres pulsos cuyos proyectiles viajan el doble de tiempo. Cualquier proyectil enemigo se anula al tocar el borde del campo; solo los pulsos de la nave cruzan ese límite y reaparecen al lado opuesto. Fácil además muestra un tutorial contextual breve. Un explorador grande puede dividirse una sola vez: sus hijos son terminales.

Al limpiar las dos primeras fases se presentan dos mejoras de una baraja aleatoria sin repetición; se puede escoger una por etapa, por lo que nunca se acumulan las cuatro. Las opciones son **Pulso doble**, **Sobremarcha**, **Escudo reactivo** y **Disparo largo**, que duplica el alcance de los pulsos. Las bajas consecutivas acumulan un multiplicador de puntaje hasta ×5, que expira tras cuatro segundos sin destruir una amenaza. La tercera fase termina enfrentando una anomalía: primero deben destruirse sus nodos externos y luego su núcleo. En Normal, al caer el segundo nodo, el jefe vibra, brilla y emite una señal ascendente antes de lanzar una única descarga circular. En Difícil, tras una pausa vuelve a cargarla mientras el núcleo siga vivo; sus proyectiles dirigidos y circulares permanecen activos por más tiempo, y sus ráfagas dirigidas alternan entre 3, 4 o 5 pulsos.

Fácil y Normal activan un reinicio de emergencia al perder todas las vidas: restablecen las vidas, descuentan 25 % del puntaje y dejan continuar. Difícil termina la partida. Vencer al núcleo muestra el cierre `FELICITACIONES // EL SISTEMA HA SIDO PROTEGIDO`.

## Qué contiene

- `src/index.html`: interfaz, HUD, pantallas de inicio/pausa/mejoras/fin y controles táctiles.
- `src/js/game/game-controller.js`: bucle de juego, física, amenazas, mejoras, jefe, puntaje y reglas de reintento.
- `src/js/audio/game-audio.js`: síntesis local de efectos, propulsor, cuenta regresiva y música ambiental.
- `src/styles/`: tokens, base visual y presentación del juego.
- `src/assets/fonts/`: tipografías locales y su licencia OFL 1.1.
- `tests/game-audio.test.mjs`: validación automatizada de transiciones y contrato de audio.
- `server.py`: servidor HTTP local y endpoint mínimo para guardar resultados.
- `data/vector-field.sqlite3`: base SQLite creada localmente al registrar una partida; no se versiona.

El récord y las preferencias se guardan en `localStorage`. Al jugar a través de `server.py`, cada victoria o game over registra en SQLite fecha, puntaje, dificultad, resultado, amenazas, reintentos y mejoras; no hay cuentas, PII, analítica ni envío a terceros.

## Motor y validación

`GameController` es el motor de la partida. Recibe controles, mantiene el
estado de la misión, actualiza física y colisiones, resuelve oleadas y renderiza
el Canvas 2D en el ciclo `requestAnimationFrame → update(dt) → render()`.
`GameAudio` queda separado para que el estado de juego ordene sonidos, pero no
contenga implementación de Web Audio API.

Ejecuta `node --test tests/game-audio.test.mjs` para validar pausa, cierre de
audio, cuenta regresiva y transiciones de oleada. La documentación vigente está
en [`docs/technical/architecture.md`](docs/technical/architecture.md) y
[`docs/technical/testing.md`](docs/technical/testing.md).

## Oportunidades

El siguiente nivel puede incorporar accesibilidad más profunda para el canvas,
más modificadores de partida, efectos visuales, pruebas de reglas de combate y
una evaluación manual de mezcla de sonido en móvil. Cualquier agregado debe
mantener la partida como única razón de ser de la página.
