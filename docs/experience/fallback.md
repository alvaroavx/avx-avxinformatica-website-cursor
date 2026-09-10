# AVX Informática — Fallback

Última actualización: 2026-03-20

## Estado actual

El fallback está implementado como pantalla estática para viewport menor a `1024x600`. Se activa correctamente al cargar y al redimensionar desde `home`.

## Objetivo

El fallback no debe sentirse como error. Debe comunicar que la experiencia completa está pensada para escritorio, manteniendo tono técnico y CTA de contacto.

## Requisitos

- Pantalla liviana y estática.
- Sin canvas ni animaciones costosas.
- Mensaje claro de limitación intencional.
- CTA de contacto visible.

## Pendiente

- Comportamiento específico cuando el viewport cae bajo mínimo durante el juego.
- Eventual versión mobile completa del sitio.
