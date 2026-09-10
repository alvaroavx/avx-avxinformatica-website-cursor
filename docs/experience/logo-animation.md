# AVX Informática — Logo y Nave

Última actualización: 2026-03-20

---

### ANÁLISIS DEL LOGO

El logo de AVX tiene esta estructura geométrica:

```
         ▲
        /|\
       / | \
      /  ●  \
 ◄───/  AVX  \───►
      \       /
       \  ▼  /
        \ | /
         \|/
```

**Partes identificadas:**
1. **Punta superior** — triángulo apuntando arriba (morro natural de nave)
2. **Punta inferior** — triángulo apuntando abajo (propulsor natural)
3. **Ala izquierda** — flecha/chevron apuntando izquierda (ala natural)
4. **Ala derecha** — flecha/chevron apuntando derecha (ala natural)
5. **Rombo central** — cuerpo principal
6. **Texto `<AVX>`** — identidad interna

**La transformación es natural:** La geometría del logo ya es una nave. Solo necesita:
- Alargar/elevar la punta superior (morro más pronunciado)
- Encoger la punta inferior y añadir efecto de propulsor
- Girar 90° o ajustar orientación para que la nave apunte arriba
- El texto `<AVX>` puede desvanecerse o mantenerse como insignia

---

### ENFOQUE TÉCNICO RECOMENDADO: SVG + CSS ANIMATION

**Por qué este enfoque:**
- Sin dependencias externas
- Vectorial y escalable sin pérdida
- Controlable desde JavaScript para sincronizar con estados del juego
- El CSS `@keyframes` puede interpolar `transform` de grupos SVG individuales
- Compatible con todos los navegadores modernos

**Lo que NO usar:**
- GIF: paleta limitada, no escala, no controlable
- Lottie: dependencia externa innecesaria para una animación simple
- Canvas para la animación del logo: innecesariamente complejo para morfing de formas

---

### HERRAMIENTA GRATUITA RECOMENDADA

**SVGator** (https://www.svgator.com)

- Plan gratuito disponible
- Permite importar el SVG del logo
- Interfaz visual tipo timeline para animar cada elemento
- Exporta CSS `@keyframes` o un SVG autocontenido con la animación
- No requiere instalación (funciona en el navegador)
- Permite animar: transform, opacity, path morphing básico

**Flujo de trabajo:**
1. Exportar el logo como SVG con grupos nombrados (uno por cada parte: `#tip-top`, `#tip-bottom`, `#wing-left`, `#wing-right`, `#body-center`, `#text-avx`)
2. Importar en SVGator
3. Crear dos keyframes: estado LOGO (posición inicial) y estado NAVE (posición transformada)
4. Animar la transición entre ambos estados
5. Exportar como SVG con CSS embebido

---

### ESPECIFICACIÓN DE LA ANIMACIÓN

#### Estado inicial: LOGO (home)
```
Todas las partes en su posición original del logotipo
Orientación: vertical, punta arriba
Texto <AVX> visible
Glow verde pulsante suave (CSS animation separada, no parte de SVGator)
```

#### Estado final: NAVE (modo juego)
```
Punta superior: se alarga y agudiza → morro de nave
Punta inferior: se comprime y se convierte en boca de propulsor
Alas laterales: se abren levemente hacia atrás → perfil aerodinámico
Cuerpo central: se aplana horizontalmente
Texto <AVX>: se desvanece (opacity 0) o permanece como insignia pequeña
```

#### Transición HOME → NAVE
```
Duración: 800ms
Timing: ease-in-out
Trigger: cuando el usuario presiona "INICIAR SIMULACIÓN"
Secuencia:
  0ms:    Comienza la transición de estado
  0-200ms: Texto <AVX> hace fade out
  100-800ms: Las partes del logo se transforman a la forma de nave
  800ms:  La nave aparece en el canvas del juego (mismo SVG ahora en Canvas)
```

#### Transición NAVE → HOME (al terminar el juego)
```
Duración: 600ms
Trigger: después de que el usuario cierra la pantalla de resultados
Secuencia:
  0-600ms: Las partes de la nave vuelven a la posición del logo
  400-600ms: Texto <AVX> hace fade in
  600ms:  Logo en reposo, home restaurado completamente
```

---

### ESTRUCTURA SVG REQUERIDA

Para que la animación funcione, el SVG del logo debe tener esta estructura de grupos:

```svg
<svg id="avx-logo-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">

  <g id="logo-container">

    <!-- Partes transformables -->
    <g id="tip-top">     <!-- Punta superior → morro -->
      <path d="..." fill="#CCCCCC"/>
    </g>

    <g id="tip-bottom">  <!-- Punta inferior → propulsor -->
      <path d="..." fill="#CCCCCC"/>
    </g>

    <g id="wing-left">   <!-- Ala izquierda -->
      <path d="..." fill="#CCCCCC"/>
    </g>

    <g id="wing-right">  <!-- Ala derecha -->
      <path d="..." fill="#CCCCCC"/>
    </g>

    <g id="body-center"> <!-- Rombo central -->
      <path d="..." fill="#1A1A1A"/>
    </g>

    <g id="text-avx">    <!-- Texto <AVX> -->
      <text>&#60;AVX&#62;</text>
      <!-- o paths del texto si está vectorizado -->
    </g>

  </g>

</svg>
```

**Importante:** Si el logo original no tiene esta estructura, habrá que vectorizarlo y separar las partes manualmente. Esto se puede hacer en Inkscape (gratuito) o en SVGator.

---

### ESTADO DE LA NAVE EN EL CANVAS DEL JUEGO

Una vez activo el modo juego, la nave en el Canvas es un **redibujado del SVG** usando la Canvas 2D API. No es el elemento SVG del DOM — ese se oculta. El engine.js dibuja la forma de la nave usando `drawImage()` con el SVG o reproduciéndola con `Path2D`.

Opción A (más simple): `drawImage(svgElement, x, y, w, h)` — renderiza el SVG directamente en Canvas.
Opción B (más control): Recrear la forma de la nave como `Path2D` con las coordenadas del SVG transformado.

**Recomendación:** Opción A para el MVP. Opción B si se necesita mayor control de glow o efectos.

---

### USO DE INKSCAPE (GRATUITO) PARA PREPARAR EL SVG

Si necesitas separar las partes del logo en grupos antes de usar SVGator:

1. Descargar Inkscape (inkscape.org)
2. Abrir el logo PNG y vectorizarlo: `Path > Trace Bitmap` (umbral alto para el blanco/negro)
3. Desagrupar el resultado: `Object > Ungroup` (varias veces hasta tener paths individuales)
4. Nombrar cada grupo en el panel XML: `id="tip-top"`, etc.
5. Guardar como SVG plano (no SVG de Inkscape)
6. Importar en SVGator para la animación

---

### ALTERNATIVA SI SVGator NO ES SUFICIENTE

Si la animación requiere morfing de paths (cambiar la forma del polígono, no solo moverlo), SVGator lo soporta en plan gratuito de forma limitada. En ese caso:

**Alternativa CSS pura con transform:**
En lugar de morfing de path, animar solo `transform: translate()`, `rotate()`, y `scale()` de cada grupo. Esto no cambia la forma, pero crea una ilusión convincente de transformación. Es suficiente para el MVP.

```css
/* Ejemplo: CSS para la transición al estado nave */
#avx-logo-svg.state--ship #tip-top {
  transform: scaleY(1.4) translateY(-10%);
  transition: transform 0.8s ease-in-out;
}

#avx-logo-svg.state--ship #wing-left {
  transform: rotate(-15deg) translateX(-5%);
  transition: transform 0.8s ease-in-out 0.1s;
}
/* etc. */
```

Esta técnica no requiere SVGator y puede implementarse directamente en `logo.css` con control total desde `logo-animator.js`.
