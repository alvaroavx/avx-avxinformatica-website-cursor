# AVX Informática — Documentación

Última actualización: 2026-03-20

## Cómo leer esta carpeta

La documentación vigente está organizada por dominio. `product/`, `experience/`, `technical/` y `planning/` son referencia activa. `archive/` conserva prompts históricos y no debe usarse como fuente de verdad del estado actual.

## Regla de mantenimiento

Cada cambio relevante en comportamiento, alcance, decisiones de producto, dirección visual o arquitectura debe actualizar los documentos correspondientes dentro de `docs/` en la misma línea de trabajo.

## Estructura

- `product/overview.md`: visión de producto, objetivos y restricciones.
- `product/content-spec.md`: contenido comercial del sitio.
- `experience/home.md`: objetivo y estado del home.
- `experience/game.md`: objetivo y estado del modo juego.
- `experience/fallback.md`: objetivo y estado del fallback.
- `experience/logo-animation.md`: lineamientos de logo -> nave.
- `technical/file-structure.md`: estructura real del repositorio.
- `technical/architecture.md`: arquitectura actual y objetivo técnico.
- `technical/design-system.md`: sistema visual.
- `technical/assets-manifest.md`: assets requeridos y temporales.
- `technical/performance.md`: estrategia de rendimiento.
- `planning/current-status.md`: estado real del proyecto a la fecha.
- `planning/implementation-plan.md`: roadmap priorizado para cumplir la experiencia objetivo.
- `planning/docs-implementation-audit.md`: cruce entre documentación vigente e implementación real.

## Orden recomendado

1. `planning/current-status.md`
2. `planning/implementation-plan.md`
3. `product/overview.md`
4. `experience/`
5. `technical/`

## Verificación

Prueba estática disponible:

```bash
node tests/docs-implementation.test.mjs
```
