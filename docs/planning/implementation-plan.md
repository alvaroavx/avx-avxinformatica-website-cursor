# AVX Informática — Plan de Implementación

Fecha: 2026-03-20

## Objetivo

Llevar el proyecto desde el MVP actual a la experiencia definida en la documentación, priorizando primero consistencia funcional, luego juego completo, luego contenido corporativo y finalmente polish.

## Fase 1 — Alinear la base técnica

- Mover la importación dinámica del juego al inicio de la transición a `game`.
- Clarificar el contrato de eventos: `avx:gamestart`, `avx:gamebegin`, `avx:gameend`, `avx:gameexit`.
- Resolver el fondo del canvas del juego para no perder el universo.
- Implementar pausa y aviso cuando el viewport deja de cumplir mínimos durante la partida.
- Corregir el contrato real de disparo en `InputManager`.
- Completar o eliminar `utils/dom.js`.

Entregable:
- Flujo estable `home -> countdown -> game -> pause/resume -> exit -> home`.

## Fase 2 — Construir el juego mínimo jugable

- Implementar `asteroids.js`.
- Implementar `projectiles.js`.
- Implementar `collision.js`.
- Implementar `particles.js`.
- Integrar vidas, daño e invulnerabilidad en el loop.
- Integrar timer de misión de 60 segundos.
- Ajustar progresión de dificultad por tramos.

Entregable:
- Partida funcional con riesgo, score y condiciones reales de fin.

## Fase 3 — Cerrar el loop del producto juego

- Implementar `hud.js`.
- Implementar `scores.js` con `localStorage`.
- Crear overlay de resultados.
- Permitir guardar iniciales y rejugar.
- Emitir eventos de cierre y guardado.

Entregable:
- Modo juego completo según `experience/game.md`.

## Fase 4 — Implementar contenido corporativo real

- Integrar `product/content-spec.md`.
- Construir navegación sticky para scroll.
- Implementar formulario de contacto con validación front-end.

Entregable:
- Sitio corporativo completo además del juego, con contenido ya conectado al hero.

## Fase 5 — Assets y polish visual

- Sustituir assets temporales por definitivos.
- Mejorar logo -> nave.
- Afinar hover, motion y focus states.
- Optimizar imagen de fondo final.
- Revisar accesibilidad y contraste.

## Fase 6 — Validación y release

- Definir checklist manual.
- Correr revisión con Lighthouse.
- Probar repeticiones de entrada/salida del juego.
- Verificar viewport mínimo `1024x600`.
- Actualizar `planning/current-status.md` con el estado alcanzado.

## Orden sugerido de trabajo en código

1. `avx-home/js/main.js`
2. `avx-home/js/game/game-controller.js`
3. `avx-home/js/game/input.js`
4. `avx-home/js/game/asteroids.js`
5. `avx-home/js/game/projectiles.js`
6. `avx-home/js/game/collision.js`
7. `avx-home/js/game/particles.js`
8. `avx-home/js/game/hud.js`
9. `avx-home/js/game/scores.js`
10. `avx-home/index.html`
11. CSS de contenido y polish
