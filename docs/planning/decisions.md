# Decisiones de producto

| ID | Decisión | Fecha | Estado |
| --- | --- | --- | --- |
| D-01 | La versión táctil usa una cámara de cabina sobre un campo de escala de escritorio | 2026-10-12 | vigente |
| D-02 | El mando táctil fija el rumbo y separa propulsión de disparo | 2026-10-12 | vigente |
| D-03 | La cabina táctil separa telemetría superior y estado de combate inferior | 2026-10-12 | vigente |

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

## D-02: El mando táctil fija el rumbo y separa propulsión de disparo

**Fecha:** 2026-10-12<br>
**Decidió:** Álvaro<br>
**Estado:** vigente

**Contexto:** El primer mando táctil usaba su inclinación como giro sostenido y propulsión simultánea. Al apuntar en diagonal, la nave continuaba girando y acelerando, en lugar de dejar la proa en el rumbo solicitado.

**Alternativas descartadas:**

- Ajustar la sensibilidad del giro sostenido — conserva el problema de no tener un punto de detención claro.
- Mantener propulsión dentro del mando de rumbo — obliga una aceleración no solicitada cada vez que se orienta la nave.

**Decisión:** El mando izquierdo define una orientación objetivo; la nave rota hasta alcanzarla y queda allí. Propulsar y disparar son dos acciones de mantener independientes en el sector derecho de la cabina.

**Consecuencias asumidas:** En móvil se puede orientar sin moverse y combinar orientación, aceleración y disparo con varios dedos. Teclado conserva su giro relativo continuo.

**Condiciones de revisión:** Reabrir si el giro hacia la orientación objetivo se percibe lento, excesivamente brusco o dificulta microajustes frente al jefe.

## D-03: La cabina táctil separa telemetría superior y estado de combate inferior

**Fecha:** 2026-10-12<br>
**Decidió:** Álvaro<br>
**Estado:** vigente

**Contexto:** La franja superior continua consume espacio útil en móvil y repite información con los controles inferiores. Puntaje y vidas son datos de combate inmediato, mientras dificultad, tiempo y oleada sirven como telemetría de misión.

**Alternativas descartadas:**

- Mantener todos los indicadores en una barra superior continua — desperdicia espacio en horizontal y aleja puntaje y vidas de las acciones táctiles.
- Conservar récord y combo en móvil — agrega densidad sin apoyar una decisión de control inmediata.

**Decisión:** La cabina móvil muestra dificultad, tiempo y oleada en una isla superior izquierda; música y pausa, en otra a la derecha. Puntaje y vidas se sitúan centrados entre los controles inferiores. En vertical las acciones se apilan y en horizontal se disponen en fila.

**Consecuencias asumidas:** El HUD táctil deja de reflejar récord y combo durante la partida, priorizando legibilidad y dedos libres. Escritorio conserva puntaje y vidas en el HUD superior.

**Condiciones de revisión:** Reabrir si los indicadores inferiores se superponen con avisos de oleada o resultan difíciles de leer bajo luz exterior.
