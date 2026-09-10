# AVX Informática — Home

Última actualización: 2026-03-20

## Estado actual

El hero principal está implementado con:

- fondo espacial global,
- canvas de partículas,
- logo SVG inline,
- tagline y subtítulo,
- CTAs,
- planetas con labels,
- secciones reales de contenido,
- navegación sticky bajo el hero.

El home ya no termina en placeholders; ahora conecta con secciones comerciales completas.

## Objetivo

El home debe ser la primera prueba de calidad técnica del sitio: rápido, legible, con identidad fuerte y sin depender del juego para verse completo.

La dirección visual vigente es una mezcla de:

- interfaz de consola neon verde,
- panel táctico tipo HUD,
- sensación de puente de mando o cabina,
- planetas como destinos clickeables alrededor del núcleo central.

Los rótulos de HUD superior e inferior existen como capa compartida de interfaz, pero no se muestran en el home. Deben activarse al entrar en simulación.

## Capas visuales

1. Fondo espacial.
2. Canvas de partículas.
3. Contenido central.
4. Planetas.

## Requisitos

- Mantener carga inicial rápida.
- Mantener partículas a 30fps.
- Ocultar planetas y actividad del home al entrar al juego.
- Mantener las secciones comerciales como continuidad natural del hero.

## Pendiente

- Animaciones de entrada más refinadas.
- Posible cursor custom, solo como polish posterior.
