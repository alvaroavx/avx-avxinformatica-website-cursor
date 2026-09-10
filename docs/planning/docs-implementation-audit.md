# AVX Informática — Auditoría Docs vs Implementación

Fecha: 2026-03-20

## Propósito

Este documento cruza la documentación vigente con la implementación real del repositorio. Sirve para distinguir qué está cumplido, qué está parcial y qué sigue siendo objetivo.

## Resultado general

- Home: parcial alto.
- Fallback: parcial alto.
- Juego: parcial bajo.
- Contenido corporativo: pendiente.
- Documentación base: alineada con el estado actual y el objetivo.

## Matriz de cumplimiento

### `product/overview.md`

- Estado: correcto.
- Observación: describe alcance vigente sin inflar la implementación.

### `experience/home.md`

- Estado: correcto con cumplimiento parcial alto.
- Implementado:
  - hero principal,
  - fondo espacial,
  - partículas,
  - planetas clickeables,
  - panel central tipo HUD,
  - HUD superior/inferior oculto por defecto y visible en simulación,
  - navegación sticky,
  - secciones reales de contenido.
- Pendiente:
  - refinamiento de animaciones.

### `experience/fallback.md`

- Estado: correcto con cumplimiento parcial alto.
- Implementado:
  - activación por viewport insuficiente,
  - pantalla estática con CTA.
- Pendiente:
  - manejo específico de viewport insuficiente durante partida.

### `experience/game.md`

- Estado: correcto como documento objetivo.
- Implementado hoy:
  - countdown,
  - canvas,
  - nave,
  - input básico,
  - salida con `ESC`.
- No implementado:
  - asteroides,
  - proyectiles,
  - HUD jugable,
  - score,
  - resultados,
  - ranking.

### `technical/architecture.md`

- Estado: correcto.
- Observación: separa arquitectura actual de arquitectura objetivo.

### `technical/file-structure.md`

- Estado: correcto.
- Observación: refleja bien la estructura real y módulos vacíos.

### `technical/design-system.md`

- Estado: correcto.
- Implementado parcialmente:
  - paleta neon verde,
  - tipografías,
  - paneles oscuros,
  - sensación de consola.
- Pendiente:
  - aplicación consistente en secciones de contenido y HUD final del juego.

### `technical/performance.md`

- Estado: documento objetivo/técnico, no de cumplimiento actual.
- Observación: los principios siguen siendo válidos, pero no deben leerse como verificación de métricas ya medidas.

## Conclusiones

1. La documentación vigente ya no sobrevende el estado actual del sitio.
2. El mayor gap sigue concentrado en el modo juego y en el contenido real del sitio.
3. Existe una base suficiente para crear pruebas estáticas sobre estructura, estados y consistencia documental.
