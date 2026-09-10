# AVX Informática — Modo Juego

Última actualización: 2026-03-20

## Estado actual

Existe una base técnica del juego:

- transición desde el home,
- countdown previo,
- canvas fullscreen,
- nave fija al centro,
- rotación por teclado/mouse,
- thrust visual,
- salida con `ESC`.

## Objetivo

El modo juego debe ser una demo arcade de 60 segundos donde la nave AVX rota en el centro, destruye asteroides y deja una impresión clara de calidad técnica.

## Requisitos funcionales objetivo

- Asteroides desde bordes hacia la zona central.
- Proyectiles con cooldown de 250ms y máximo 6 activos.
- Colisiones círculo-círculo.
- 3 vidas con invulnerabilidad breve.
- HUD con tiempo, score, vidas y salida.
- Pantalla de resultados.
- Ranking en `localStorage`.
- Pausa por pestaña oculta o viewport insuficiente.

## Requisitos visuales objetivo

- Fondo espacial visible durante la partida.
- Nave derivada del logo.
- Explosiones y thrust en verde neon.
- HUD coherente con la identidad del home.

## Criterio de terminado

El juego se considera terminado cuando puede iniciarse, jugarse, ganarse o perderse, guardar resultados y regresar al home sin fugas de estado.
