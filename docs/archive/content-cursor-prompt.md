# AVX Informática — Prompt para Cursor: Secciones de Contenido

Documento archivado. No usar como fuente de verdad del estado actual del proyecto.

## Documento 12: CONTENT_CURSOR_PROMPT

---

## INSTRUCCIONES PARA USAR ESTE DOCUMENTO

Copiar el contenido de la sección "PROMPT COMPLETO PARA CURSOR" y pegarlo directamente en Cursor.
Cursor debe leer el archivo `11_CONTENT_SPEC.md` antes de construir cualquier sección.

---

## PROMPT COMPLETO PARA CURSOR

---

Lee el archivo `docs/11_CONTENT_SPEC.md` completo antes de continuar. Ese archivo contiene todo el contenido real de la empresa que debes usar. No inventes ni resumas — usa el texto tal como está en ese documento.

Ahora debes desarrollar las cuatro secciones de contenido del sitio AVX Informática, integradas en el `index.html` existente, respetando el sistema de diseño definido en `docs/03_DESIGN_SYSTEM.md`.

---

### CONTEXTO DEL PROYECTO

Este es el sitio corporativo de AVX Informática. La estética es espacial/futurista con fondo de universo, neon verde (#00FF88), tipografía monoespacio (JetBrains Mono) y display (Orbitron). El home ya existe. Ahora construyes las cuatro secciones que los planetas del home enlazan como destinos.

El sitio debe impresionar a CTOs, directores de tecnología y dueños de empresa que evalúan contratar servicios tecnológicos. Cada sección debe demostrar capacidad antes de describirla.

---

### LO QUE DEBES CONSTRUIR

Cuatro secciones HTML que viven dentro del mismo `index.html`, después del bloque del home. Cada sección tiene un `id` que corresponde al anchor de su planeta:

- `id="nosotros"`
- `id="servicios"`
- `id="portafolio"`
- `id="contacto"`

---

### SECCIÓN 1: NOSOTROS (`id="nosotros"`)

**Estructura:**

1. Encabezado de sección con el texto:
   - Título: `NOSOTROS`
   - Subtítulo: `El equipo detrás de AVX`

2. Párrafo de apertura (extraer de `11_CONTENT_SPEC.md`, sección NOSOTROS):
   > AVX Informática es una empresa de desarrollo de software, arquitectura tecnológica e integración de inteligencia artificial con base en Chile...

3. Tres tarjetas de equipo, una por persona, en este orden:
   - Álvaro Vargas Quezada
   - Nicolás Montenegro Pizarro
   - Mauricio Carrasco Hernández

**Cada tarjeta debe mostrar:**
- Nombre completo
- Rol en AVX (en verde neon, tipografía monoespacio)
- Descripción de 2-3 líneas (extraer de `11_CONTENT_SPEC.md`)
- Stack principal como tags/badges (lista horizontal de tecnologías)
- Formación (una línea, la más relevante)
- NO incluir datos de contacto personal en las tarjetas

**Diseño de las tarjetas:**
- Fondo: `rgba(7, 20, 40, 0.85)` con borde sutil verde
- Sin bordes redondeados (border-radius: 0)
- Layout en fila para desktop, columna para mobile
- Hover: borde verde se intensifica con glow

---

### SECCIÓN 2: SERVICIOS (`id="servicios"`)

**Estructura:**

1. Encabezado:
   - Título: `SERVICIOS`
   - Subtítulo: `Qué construimos y resolvemos`

2. Grilla de 8 servicios (extraer todos de `11_CONTENT_SPEC.md`, sección SERVICIOS):
   1. Desarrollo de Software a Medida
   2. Arquitectura de Software
   3. Integración de Inteligencia Artificial
   4. Desarrollo Mobile
   5. Integración de Sistemas y APIs
   6. Automatización de Procesos
   7. Cloud & DevOps
   8. Capacitación Técnica

**Cada tarjeta de servicio debe mostrar:**
- Número de orden (en verde neon, pequeño, monoespacio): `01`, `02`, etc.
- Nombre del servicio (tipografía Orbitron, tamaño mediano)
- Descripción corta: el primer párrafo de cada servicio en `11_CONTENT_SPEC.md` (una oración, máximo dos)
- Lista de 3-4 ítems representativos del "Incluye" (los más relevantes)
- Línea de "Para quién" en tipografía más pequeña, color secundario

**Diseño:**
- Grid de 4 columnas en desktop, 2 en tablet, 1 en mobile
- El servicio de IA (número 03) puede destacarse visualmente con mayor tamaño o efecto diferente
- Hover en cada card: borde activo verde neon + leve traslación hacia arriba (translateY -4px)
- Fondo de card: `rgba(7, 20, 40, 0.7)` con borde `1px solid rgba(0, 255, 136, 0.2)`

---

### SECCIÓN 3: PORTAFOLIO (`id="portafolio"`)

**Estructura:**

1. Encabezado:
   - Título: `PORTAFOLIO`
   - Subtítulo: `Proyectos que demuestran capacidad real`

2. Texto introductorio:
   > Trabajamos con CORFO, la Universidad de Chile, el Poder Judicial, la Dirección del Trabajo y empresas de retail de alto volumen. Estos son algunos de los proyectos que definen lo que somos capaces de construir.

3. Lista de 8 proyectos en formato de tarjetas expandibles o grilla. Usar TODOS los proyectos del archivo `11_CONTENT_SPEC.md`:

   - Plataforma de Metadatos CORFO (2025)
   - Administrador de Sentencias del Poder Judicial (2017–2018)
   - Sistema de Gestión Tributaria CORFO (2023–2024)
   - Normalización Masiva de Metadatos DSpace — Universidad de Chile (2024)
   - MiBO: Backoffice Institucional — Dirección del Trabajo (2019–2020)
   - OMS Omnix / Proyecto Sirius — ADRetail (2020–2021)
   - Modernización Sistema OJS — Universidad de Chile (2024)
   - APIs Financieras y de Retail — ADRetail / Blue Express (2021–2024)

**Cada tarjeta de proyecto debe mostrar:**
- Nombre del proyecto
- Cliente (en color secundario, monoespacio pequeño)
- Año o rango de años
- Tipo de proyecto como badges: `ARQUITECTURA`, `INTEGRACIÓN`, `DESARROLLO`, `IA + DATOS`, etc.
- Stack: lista de tecnologías como tags pequeños
- El problema (1-2 líneas)
- El impacto (1-2 líneas, en verde neon o destacado)
- NO mostrar toda la descripción por defecto — el detalle puede estar en un expand o modal

**Diseño:**
- Grid de 2 columnas en desktop
- Cards con número de proyecto en grande (tipografía Orbitron, opacidad 0.15) como elemento decorativo de fondo
- Línea de impacto siempre visible y destacada

---

### SECCIÓN 4: CONTACTO (`id="contacto"`)

**Estructura:**

1. Encabezado:
   - Título: `CONTACTO`
   - Subtítulo: `Cuéntanos tu problema tecnológico`

2. Texto:
   > No vendemos paquetes genéricos. Evaluamos tu situación y te decimos si podemos ayudarte y cómo. El primer contacto es sin costo.

3. Información de contacto directa:
   - Email: `alvaro@avx.cl`
   - Teléfono: `+56 9 5649 0299`
   - Ubicación: `Rengo, Región de O'Higgins — trabajo 100% remoto`

4. Formulario de contacto con estos campos:
   - Nombre (texto)
   - Empresa (texto)
   - Email (email)
   - Teléfono (texto, opcional)
   - Área de interés (select): Desarrollo a medida / Arquitectura / IA / Mobile / Integración / Cloud & DevOps / Capacitación / Otro
   - Mensaje (textarea, mínimo 4 líneas)
   - Botón de envío: `ENVIAR MENSAJE`

**Nota sobre el formulario:** Por ahora el formulario solo hace validación front-end y muestra un mensaje de confirmación simulado. La integración con backend (email, CRM) se implementa en una fase posterior. Agregar comentario en el código: `// TODO: Integrar con backend de envío de formulario`

**Diseño del formulario:**
- Sin bordes redondeados en inputs
- Inputs con fondo `rgba(7, 20, 40, 0.8)`, borde `1px solid rgba(0, 255, 136, 0.3)`
- Focus: borde verde neon completo con glow
- Labels en tipografía monoespacio, mayúsculas, tamaño pequeño
- Botón de envío: estilo consistente con los botones del home

---

### NAVEGACIÓN ENTRE SECCIONES

Agregar un elemento de navegación fijo (sticky) o en el header que permita:
- Volver al home (logo AVX como botón)
- Navegar entre secciones: NOSOTROS / SERVICIOS / PORTAFOLIO / CONTACTO

La navegación debe aparecer cuando el usuario hace scroll más allá del home, y desaparecer cuando está en el home (para no interferir con la estética espacial).

Estilo de la barra de navegación:
- Fondo: `rgba(2, 11, 24, 0.95)` con blur (backdrop-filter: blur(10px))
- Borde inferior: `1px solid rgba(0, 255, 136, 0.2)`
- Links: tipografía monoespacio, mayúsculas, tamaño pequeño, color secundario
- Link activo (sección visible): color neon verde
- Logo AVX a la izquierda como botón de regreso al inicio

---

### FONDO DE LAS SECCIONES DE CONTENIDO

Las secciones de contenido (nosotros, servicios, portafolio, contacto) usan el mismo universo de fondo que el home pero con un overlay más oscuro para mejorar la legibilidad del texto:

```css
.content-section {
  background: rgba(2, 11, 24, 0.92);
  /* La imagen de universo se ve a través de todas las secciones */
}
```

El universo de fondo es un único elemento que atraviesa todo el sitio. Las secciones son capas semitransparentes sobre él.

---

### SCROLL DESDE LOS PLANETAS

Los planetas del home ya tienen links a `#nosotros`, `#servicios`, `#portafolio`, `#contacto`. Asegúrate de que el scroll hacia esas secciones sea suave:

```css
html {
  scroll-behavior: smooth;
}
```

---

### RESTRICCIONES

- Sin frameworks JS
- Sin librerías de animación externas
- Sin imports de CDN adicionales a los ya definidos (JetBrains Mono, Orbitron)
- Todo el contenido de texto debe venir exactamente del archivo `11_CONTENT_SPEC.md`
- Respetar el sistema de variables CSS de `variables.css`
- Los colores de fondo de las secciones no deben ser negro puro — usar `--color-bg-deep` (#020B18) o variantes

---

### ORDEN DE IMPLEMENTACIÓN

1. Agregar `scroll-behavior: smooth` a base.css
2. Construir la barra de navegación sticky con JS para mostrar/ocultar según scroll
3. Construir sección NOSOTROS con las tres tarjetas de equipo
4. Construir sección SERVICIOS con la grilla de 8 servicios
5. Construir sección PORTAFOLIO con las 8 tarjetas de proyectos
6. Construir sección CONTACTO con formulario y validación front-end
7. Verificar que los anchors funcionan desde los planetas del home
8. Verificar coherencia visual completa con el home

Cuando termines cada sección, indícame qué construiste antes de avanzar a la siguiente.
