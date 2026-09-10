# AVX Informática — Arquitectura Técnica

Última actualización: 2026-03-20

## Principio central

La página debe cargar primero. El juego debe cargarse después y no puede degradar el home.

## Arquitectura actual

```text
main.js
  -> state-manager.js
  -> utils/viewport.js
  -> home/home-controller.js
     -> home/planets.js
     -> home/ui-effects.js
  -> logo/logo-animator.js

game/game-controller.js
  -> game/engine.js
  -> game/input.js
  -> game/player.js
  -> utils/canvas-helpers.js
```

## Arquitectura objetivo

```text
main.js
  -> state-manager.js
  -> viewport orchestration
  -> home controller
  -> game preloader

game/game-controller.js
  -> engine.js
  -> input.js
  -> player.js
  -> asteroids.js
  -> projectiles.js
  -> collision.js
  -> particles.js
  -> hud.js
  -> scores.js
```

## Observaciones del estado actual

- La importación dinámica existe, pero ocurre demasiado tarde en el flujo.
- El contrato de eventos está solo parcialmente implementado.
- El resize durante partida aún no sigue el comportamiento objetivo.
- Hay módulos placeholder todavía no conectados.

## Eventos del sistema

- `avx:statechange`
- `avx:gamestart`
- `avx:gamebegin`
- `avx:gameend`
- `avx:gameexit`
- `avx:scoressaved`
- `avx:viewportchange`

## Reglas de lifecycle

### Home

- El canvas del home corre solo en estado `home`.
- Debe pausarse inmediatamente al entrar a `game`.

### Game

- Se crea canvas al entrar.
- Se destruye canvas al salir.
- Debe pausar si la pestaña queda oculta.
- Debe pausar si el viewport deja de cumplir mínimos.

### Fallback

- No debe correr animaciones costosas.
- Debe ser estático y liviano.
