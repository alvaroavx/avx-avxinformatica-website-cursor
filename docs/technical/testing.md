# Validación y pruebas

## Suite automatizada

Ejecutar desde la raíz:

```bash
node --test tests/*.test.mjs
```

La suite usa dobles de Web Audio API y cubre el apagado de propulsor, ambiente
y música al pausar; los tonos `3`, `2`, `1`; el cierre musical de victoria o
derrota; la delegación de pausa desde `GameController`; y la emisión completa
de la cuenta de oleada.

`tests/game-rules.test.mjs` cubre las reglas de refuerzos por dificultad, la
visibilidad del contador final, la fragmentación terminal de exploradores, el
elenco completo por nivel, la vida de blindados, los patrones de dron y la
señal de carga, descarga final repetida y alcance de los proyectiles del jefe
en Difícil, además
del aislamiento de la arena de desarrollo, la creación y limpieza de entidades
reales de laboratorio, y freeze/IA.

No reproduce audio real: valida creación, estado y cierre de nodos. La escucha
manual sigue siendo necesaria para evaluar volumen y mezcla en un navegador.

## Puertas locales

```bash
node --check src/js/main.js
node --check src/js/audio/game-audio.js
node --check src/js/game/game-controller.js
node --test tests/*.test.mjs
python3 -m py_compile server.py
```

Para la versión publicada: copiar `src/` a `public/vector-field/` del sitio
Astro, ejecutar `npm run build` allí y comparar las copias con `cmp`.

## Límites

La suite no reemplaza una partida manual, pruebas de accesibilidad del canvas,
ni validación táctil. En una publicación estática tampoco verifica SQLite,
porque `POST /api/runs` no existe por diseño.
