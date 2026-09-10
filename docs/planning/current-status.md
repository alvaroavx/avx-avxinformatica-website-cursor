# AVX Informática — Estado Actual

Fecha de revisión: 2026-03-20

## Resumen

El proyecto está en un MVP sólido del home y fallback. El modo juego existe como base técnica, pero no cumple todavía la experiencia arcade definida en documentación.

## Implementado

- Home con fondo espacial, logo SVG inline, copy principal y CTAs.
- Planetas con labels y navegación a secciones reales.
- Canvas de partículas del home con throttling a 30fps.
- `StateManager` con estados `home`, `game` y `fallback`.
- Fallback para viewport menor a `1024x600`.
- Countdown previo al juego.
- Carga dinámica de `game-controller.js`.
- Loop de juego con canvas fullscreen, input básico y render de la nave.
- Salida del juego con `ESC`.
- Secciones reales de `nosotros`, `servicios`, `portafolio` y `contacto`.
- Navegación sticky de contenido bajo el hero.

## Pendiente para cumplir el objetivo

### Juego
- Asteroides.
- Proyectiles.
- Colisiones.
- HUD.
- Puntaje.
- Vidas y daño integrados al loop completo.
- Fin de partida por tiempo o destrucción.
- Pantalla de resultados.
- Persistencia en `localStorage`.
- Manejo correcto de viewport insuficiente durante la partida.

### Sitio corporativo
- Formulario de contacto con validación front-end.

### Activos finales
- Logo final vectorial.
- Nave derivada del logo con mejor transformación.
- Fondo optimizado WebP/JPG.
- Favicon y set de assets definitivos.

## Riesgos vigentes

1. La documentación antigua describía un producto más completo que el código real.
2. La importación dinámica del juego ocurre después del countdown y no durante la transición.
3. El canvas del juego puede ocultar el fondo espacial al usar contexto opaco.
4. Existen módulos vacíos en `avx-home/js/game/` y `avx-home/js/utils/dom.js`.
5. Existe una prueba estática básica de consistencia documental/estructural, pero no hay pruebas de navegador ni checklist manual completo.

## Regla documental

Desde esta revisión, la documentación debe diferenciar siempre:

- `estado actual`: lo que el repositorio hace hoy,
- `estado objetivo`: lo que el sitio debe llegar a hacer.
