# Audio de terceros

No se incorporaron assets de terceros en la primera pasada de sonidificación.

Los efectos, el propulsor, las señales de la cuenta `3…2…1`, el ambiente
espacial y los pulsos musicales se sintetizan en tiempo real con Web Audio API
mediante `src/js/audio/game-audio.js`. Por ello no hay archivos de audio
descargados, atribuciones pendientes ni licencias de terceros que registrar.

La música de fondo combina un ambiente continuo de baja frecuencia con una
secuencia discreta que cambia por fase y jefe. Ambos componentes se detienen
al pausar, entrar a mejoras, volver al menú, ganar o perder; no debe quedar un
oscilador activo al dejar `playing`.

El combate final añade un tema original de fondo en Re menor a 132 BPM:
bajo pulsante, motivo del boss, arpegio retro y percusión sintetizada. Al
aparecer comienza con bajo y motivo; tras el aviso inicial añade arpegio y
kick; y al bajar el núcleo de 30 % incorpora snare, hi-hat y acelera a 142 BPM.
No reutiliza melodías ni grabaciones de obras existentes.

Al destruir el núcleo, la música deja un vacío breve tras la explosión y da
paso a una fanfarria original de victoria en **Re mayor**, de cerca de siete
segundos. Su melodía asciende con Re–Fa♯–La–Re, bajo, acordes y destellos
sintetizados; el acorde final de Re mayor resuelve deliberadamente la tensión
en Re–Fa–La♭ del tema del boss. Todos sus timbres se crean en Web Audio API y
respetan los canales `MUSIC`, `BOSS` y `MASTER` del Audio Lab.

Antes de añadir un sample externo, registrar aquí su nombre, autor, URL,
licencia comercial verificable, archivo del proyecto, modificación y fecha de
obtención. Si la licencia no es clara o no permite uso comercial, no usarlo.
