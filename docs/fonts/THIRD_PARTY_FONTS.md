# Tipografías locales

El juego empaqueta sus fuentes en `src/assets/fonts/`; durante una partida o
al visitar el menú no se consulta Google Fonts ni otro servicio remoto.

| Archivo | Uso | Licencia |
| --- | --- | --- |
| `NotoSansMono-Regular.ttf` | Texto de interfaz | SIL Open Font License 1.1 |
| `NotoSansMono-Bold.ttf` | Titulares, HUD y controles destacados | SIL Open Font License 1.1 |

Los archivos proceden del paquete local `fonts-noto-mono` (Noto, Google) y se
distribuyen sin modificación. La copia íntegra de licencia y atribución está
en `src/assets/fonts/LICENSE-OFL-1.1.txt`.

Al añadir o cambiar una fuente se debe conservar su licencia junto al archivo,
referenciarla con `@font-face` y copiar ambos al paquete estático publicado.
