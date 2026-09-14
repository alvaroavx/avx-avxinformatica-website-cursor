# AVX Vector Field

Juego web arcade de una pantalla, inspirado en las mecánicas clásicas de *Asteroids*: una nave gira, se impulsa, dispara y destruye rocas que se fragmentan. No reutiliza arte, código ni contenido del juego original.

## Jugar localmente

El juego es estático y no necesita dependencias. Sírvelo por HTTP desde la raíz:

```bash
cd avx-home
python3 -m http.server 8080
```

Abre `http://127.0.0.1:8080/`.

## Controles

- Flechas izquierda/derecha o `A`/`D`: girar.
- Flecha arriba o `W`: propulsión.
- `Espacio`: disparar.
- `Escape` o el botón circular: pausar y continuar.
- En pantallas táctiles, utiliza los cuatro controles inferiores.

## Qué contiene

- `avx-home/index.html`: interfaz, HUD, pantallas de inicio/pausa/fin y controles táctiles.
- `avx-home/js/game/game-controller.js`: bucle de juego, física, oleadas, colisiones, puntaje, vidas y récord local.
- `avx-home/styles/`: tokens, base visual y presentación del juego.

El récord se guarda solamente en `localStorage` del navegador. No hay backend, cuentas, analítica, contacto ni datos enviados a terceros.

## Oportunidades

El siguiente nivel puede incorporar sonido con control de volumen, accesibilidad más profunda para el canvas, selector de dificultad, efectos visuales y pruebas automatizadas de las reglas del juego. Cualquier agregado debe mantener la partida como única razón de ser de la página.
