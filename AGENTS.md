# AGENTS.md

## Propósito

Sitio corporativo estático AVX con home espacial y demo arcade Canvas. La documentación vigente separa explícitamente estado actual de estado objetivo.

## Antes de trabajar

Lee `README.md`, `docs/README.md`, `docs/planning/current-status.md`, `docs/technical/architecture.md`, `docs/planning/docs-implementation-audit.md` y el documento de experiencia afectado. Verifica código antes de modificarlo.

## Directorios importantes

- `avx-home/index.html`: estructura, contenido y estados DOM.
- `avx-home/js/main.js`: orquestación, transiciones y carga diferida del juego.
- `avx-home/js/state-manager.js`: contrato de estados `home`, `game`, `fallback`.
- `avx-home/js/home/`: home, planetas y efectos.
- `avx-home/js/game/`: motor y demo arcade; parte de la experiencia objetivo sigue pendiente.
- `avx-home/styles/`: tokens y estilos por área.

## Invariantes y seguridad

- El home debe cargar antes que el juego; la carga del juego es diferida.
- El canvas home solo corre en estado `home`; el juego se destruye al salir.
- No transforme objetivos documentales en comportamiento declarado como implementado.
- No agregue secretos, credenciales ni datos personales al cliente estático.

## Validación

Ejecuta `node tests/docs-implementation.test.mjs` y prueba el flujo de home, fallback y entrada/salida de juego por HTTP local. Actualiza los documentos afectados en el mismo cambio.
