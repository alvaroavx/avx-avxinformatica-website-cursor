# Decisiones de producto

| ID | Decisión | Fecha | Estado |
| --- | --- | --- | --- |
| D-01 | La versión táctil usa una cámara de cabina sobre un campo de escala de escritorio | 2026-10-12 | vigente |

## D-01: La versión táctil usa una cámara de cabina sobre un campo de escala de escritorio

**Fecha:** 2026-10-12<br>
**Decidió:** Álvaro<br>
**Estado:** vigente

**Contexto:** En un teléfono, reducir el campo completo vuelve pequeñas a la nave y las amenazas, y deja los controles sin presencia. Se requiere sentir que la persona pilota desde dentro de la nave, sin crear una versión de reglas distinta a escritorio.

**Alternativas descartadas:**

- Escalar todo el campo para que siempre quepa en pantalla — reduce el tamaño legible de amenazas y rompe la sensación de navegación.
- Mantener cuatro botones pequeños independientes — no permite combinar con comodidad giro y propulsión con un pulgar.
- Forzar una única orientación — desaprovecha el área extra del teléfono horizontal.

**Decisión:** En dispositivos táctiles el mundo conserva un rectángulo lógico de escritorio y la cámara sigue a la nave; la nave queda visualmente centrada, el encuadre se amplía al pasar a horizontal y los peligros fuera de pantalla se señalan en sus bordes. El mando de vuelo semitransparente queda a la izquierda y el disparo a la derecha.

**Consecuencias asumidas:** El render debe separar tamaño del canvas, tamaño lógico del mundo y cámara. Los controles táctiles son una capa propia, mientras teclado y reglas de escritorio se conservan.

**Condiciones de revisión:** Reabrir si pruebas en teléfonos reales muestran que el mando impide ver amenazas, que la cámara provoca desorientación o que la orientación vertical no permite una misión completa con comodidad.
