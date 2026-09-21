# Audio Lab y Área de Pruebas

## Acceso de desarrollo

El laboratorio no forma parte de `src/`, ni se copia al build estático. Para
servirlo localmente se debe ejecutar:

```bash
python3 server.py --audio-lab
```

Luego abrir `http://127.0.0.1:8080/dev/audio`. Sin `--audio-lab`, la ruta
responde 404. La publicación estática no contiene esa ruta ni los archivos de
`tools/audio-lab/`.

## Audio Lab

El catálogo semántico está centralizado en `AUDIO_CATALOG` de
`src/js/audio/game-audio.js`. La misma infraestructura `GameAudio` usa esos
IDs tanto en partida como en el laboratorio.

Selecciona un evento, ajusta volumen, pitch, playback rate y variación; prueba
un evento aislado o diez veces; guarda el estado de revisión, favorito y
presets A/B; y exporta o importa la configuración JSON. Los cambios viven en
`localStorage` bajo `avx-vector-field-audio-lab`, por lo que afectan de
inmediato al siguiente evento del juego real sin reescribir samples ni código.

El **Master Mixer** controla `MASTER`, `MUSIC`, `SFX`, `AMBIENCE`, `BOSS`,
`PLAYER`, `ASTEROIDS`, `DRONES` y `UI`. Cada canal admite 0–200 %. Así la
música puede reforzarse por sobre su mezcla base sin cambiar código; `MUSIC`
sube toda la música, `AMBIENCE` solo la cama espacial y `BOSS` únicamente la
composición final y su fanfarria de victoria. La configuración se exporta junto
a los presets.

El monitor registra los eventos que dispara el Audio Lab y el contador muestra
las voces sintéticas activas. Stop detiene el propulsor; pausa, mejora,
victoria y derrota también cierran los loops en la partida normal.

## Área de Pruebas

La sección inferior ejecuta el mismo `GameController` y renderer dentro de un
iframe de desarrollo. Puede iniciar una arena sin oleadas ni progresión, crear
las entidades existentes (`scout`, `shard`, `fortress`, `intruder` y boss),
disparar, provocar impacto de nave, limpiar, congelar/reanudar y activar o
desactivar IA. La nave tiene invulnerabilidad y 99 vidas en este modo.

Los comandos se transmiten solo a una instancia cargada con `__dev_arena`; la
partida pública no muestra controles de laboratorio ni recibe esos mensajes.

## Pasar un ajuste a producción

1. Probar un evento aislado y en la arena.
2. Marcar el preset como **APROBADO**.
3. Usar **COPIAR JSON** y guardar el resultado donde el equipo decida
   versionarlo; la primera versión deliberadamente no escribe archivos desde
   el navegador.
4. Importar el JSON en el laboratorio de otra máquina si se quiere revisar.

La persistencia actual es local y de desarrollo. No hay upload, backend nuevo
ni modificación destructiva de archivos de audio.
