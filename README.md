# AVX Vector Field

Juego web arcade de una pantalla, inspirado en las mecánicas clásicas de *Asteroids*: una nave gira, se impulsa, dispara y destruye rocas que se fragmentan. No reutiliza arte, código ni contenido del juego original.

## Jugar localmente

El juego es estático y no necesita dependencias. Sírvelo por HTTP desde la raíz:

```bash
cd src
python3 -m http.server 8080
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

## Qué contiene

- `src/index.html`: interfaz, HUD, pantallas de inicio/pausa/fin y controles táctiles.
- `src/js/game/game-controller.js`: bucle de juego, física, oleadas, colisiones, puntaje, vidas y récord local.
- `src/styles/`: tokens, base visual y presentación del juego.

El récord se guarda solamente en `localStorage` del navegador. No hay backend, cuentas, analítica, contacto ni datos enviados a terceros.

## Oportunidades

El siguiente nivel puede incorporar sonido con control de volumen, accesibilidad más profunda para el canvas, más modificadores de partida, efectos visuales y pruebas automatizadas de las reglas del juego. Cualquier agregado debe mantener la partida como única razón de ser de la página.
