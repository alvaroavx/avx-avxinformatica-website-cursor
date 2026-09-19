# AVX Vector Field

Juego web arcade de una pantalla, inspirado en las mecánicas clásicas de *Asteroids*: una nave gira, se impulsa, dispara y destruye rocas que se fragmentan. No reutiliza arte, código ni contenido del juego original.

## Jugar localmente

El juego no necesita dependencias externas. Para conservar los resultados de cada misión en SQLite, inicia el servidor local desde la raíz:

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

Desde pausa puedes continuar, reiniciar, volver al menú principal o abrir **Configuración**. El selector de tema cambia en vivo toda la interfaz y la escena: líneas, nave, asteroides, disparos, HUD, menús, botones y focos entre **Verde AVX**, **Celeste**, **Rosado** y **Amarillo**. La elección queda guardada solo en el navegador mediante `localStorage` y también puede configurarse antes de iniciar una partida.

La configuración incluye dificultad: **Fácil** inicia con cuatro vidas y define la velocidad base; **Normal** inicia con tres vidas y cada asteroide viaja al **doble** de esa velocidad; **Difícil** inicia con dos vidas, más rocas y asigna aleatoriamente a cada asteroide un multiplicador **×3, ×4 o ×5**. El cambio de dificultad se aplica al iniciar una misión nueva.

Si no destruyes un asteroide, el campo pide refuerzos: un contador aparece durante los últimos cinco segundos y agrega nuevas rocas al llegar a cero. El intervalo es de 20 s en Fácil, 14 s en Normal y 9 s en Difícil; destruir cualquier asteroide reinicia el contador.

## Actos y amenazas

Cada misión tiene tres fases. Cada una comienza con una transición: la nave vuelve al centro, recibe invulnerabilidad breve y anuncia la cuenta `3…2…1` antes de liberar el campo. Fácil contiene solo **Exploradores** estándar y muestra un tutorial contextual breve. Normal suma **Fragmentos**, más pequeños y rápidos. Difícil añade **Blindados** y el **Dron intruso**, que persigue y dispara. Un explorador grande puede dividirse al destruirse.

Al limpiar las dos primeras fases se elige una mejora para esa misión: **Twin Pulse**, **Overclock** o **Reactive Shield**. Las bajas consecutivas acumulan un multiplicador de puntaje hasta ×5, que expira tras cuatro segundos sin destruir una amenaza. La tercera fase termina enfrentando una anomalía: primero deben destruirse sus nodos externos y luego su núcleo.

Fácil y Normal activan un reinicio de emergencia al perder todas las vidas: restablecen las vidas, descuentan 25 % del puntaje y dejan continuar. Difícil termina la partida. Vencer al núcleo muestra el cierre `SYSTEM RESTORED // SIMULATION COMPLETE // AVX ONLINE`.

## Qué contiene

- `src/index.html`: interfaz, HUD, pantallas de inicio/pausa/mejoras/fin y controles táctiles.
- `src/js/game/game-controller.js`: bucle de juego, física, amenazas, mejoras, jefe, puntaje y reglas de reintento.
- `src/styles/`: tokens, base visual y presentación del juego.
- `server.py`: servidor HTTP local y endpoint mínimo para guardar resultados.
- `data/vector-field.sqlite3`: base SQLite creada localmente al registrar una partida; no se versiona.

El récord y las preferencias se guardan en `localStorage`. Al jugar a través de `server.py`, cada victoria o game over registra en SQLite fecha, puntaje, dificultad, resultado, amenazas, reintentos y mejoras; no hay cuentas, PII, analítica ni envío a terceros.

## Oportunidades

El siguiente nivel puede incorporar sonido con control de volumen, accesibilidad más profunda para el canvas, más modificadores de partida, efectos visuales y pruebas automatizadas de las reglas del juego. Cualquier agregado debe mantener la partida como única razón de ser de la página.
