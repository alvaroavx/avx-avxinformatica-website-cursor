# AVX Informática — Sistema de Diseño
## Documento 03: DESIGN_SYSTEM

---

### PALETA DE COLORES

```css
/* variables.css */

:root {
  /* Fondos */
  --color-bg-deep:        #020B18;   /* Azul-negro profundo — fondo base */
  --color-bg-surface:     #071428;   /* Superficie elevada */
  --color-bg-overlay:     rgba(2, 11, 24, 0.85); /* Overlay semitransparente */

  /* Verde Neon AVX — color de identidad */
  --color-neon-primary:   #00FF88;   /* Verde neon principal */
  --color-neon-dim:       #00CC6A;   /* Verde neon atenuado */
  --color-neon-faint:     rgba(0, 255, 136, 0.15); /* Verde casi transparente */
  --color-neon-glow:      rgba(0, 255, 136, 0.4);  /* Para box-shadow glow */

  /* Texto */
  --color-text-primary:   #E8F4F0;   /* Blanco frío — texto principal */
  --color-text-secondary: #7B9EA8;   /* Gris azulado — texto secundario */
  --color-text-muted:     #3A5560;   /* Texto muy atenuado */
  --color-text-neon:      #00FF88;   /* Texto de acento/activo */

  /* Planetas — colores base para diferenciación */
  --color-planet-nosotros:   #1A3A6B;  /* Azul profundo */
  --color-planet-servicios:  #2D1A4A;  /* Púrpura oscuro */
  --color-planet-portafolio: #1A4A2D;  /* Verde oscuro */
  --color-planet-contacto:   #4A2D1A;  /* Ámbar oscuro */

  /* HUD del juego */
  --color-hud-text:       #00FF88;
  --color-hud-bg:         rgba(0, 0, 0, 0.6);
  --color-hud-border:     rgba(0, 255, 136, 0.3);

  /* Estados */
  --color-danger:         #FF3D3D;   /* Vida perdida, peligro */
  --color-warning:        #FFB800;   /* Advertencia */
  --color-inactive:       #2A3A40;   /* Elemento inactivo */
}
```

**Regla de uso del verde neon:**
- Verde al 100% (`--color-neon-primary`): solo en elementos interactivos activos, bordes de foco, y puntaje del HUD
- Verde atenuado: bordes de componentes en reposo
- Verde faint: fondos de cards o areas de acento
- **NUNCA:** fondos grandes, texto de cuerpo, decoración sin función

### DIRECCIÓN VISUAL VIGENTE

La interfaz debe sentirse como una pantalla de navegación dentro de una nave:

- paneles oscuros con líneas neon,
- texto de consola en verde y blanco frío,
- overlays técnicos y lectura tipo HUD,
- planetas como nodos interactivos y no como decoración pasiva.

---

### TIPOGRAFÍA

```css
:root {
  /* Fuente principal — monoespacio para estética de terminal/HUD */
  --font-primary: 'JetBrains Mono', 'Courier New', monospace;

  /* Fuente display — para el tagline y textos grandes */
  --font-display: 'Orbitron', 'JetBrains Mono', monospace;

  /* Escalas de tamaño */
  --text-xs:    0.625rem;   /* 10px — labels HUD pequeños */
  --text-sm:    0.75rem;    /* 12px — metadata, labels de planetas */
  --text-base:  0.875rem;   /* 14px — texto de interfaz */
  --text-md:    1rem;       /* 16px — texto de cuerpo */
  --text-lg:    1.25rem;    /* 20px — subtítulos */
  --text-xl:    1.75rem;    /* 28px — títulos de sección */
  --text-2xl:   2.5rem;     /* 40px — tagline */
  --text-3xl:   3.5rem;     /* 56px — logo en contexto */

  /* Peso */
  --font-normal:  400;
  --font-medium:  500;
  --font-bold:    700;

  /* Letter-spacing para estética técnica */
  --tracking-tight:  -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.15em;  /* Para labels y botones */
  --tracking-widest:  0.25em;  /* Para el tagline principal */
}
```

**Google Fonts a cargar:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
```

---

### SISTEMA DE ESPACIADO

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;
  --space-16:  64px;
  --space-24:  96px;
}
```

---

### EFECTOS VISUALES

#### Glow neon estándar
```css
/* Para elementos activos con identidad verde */
.neon-glow {
  box-shadow:
    0 0 8px var(--color-neon-glow),
    0 0 24px rgba(0, 255, 136, 0.2),
    inset 0 0 8px rgba(0, 255, 136, 0.05);
}

/* Para texto con glow */
.neon-text-glow {
  text-shadow:
    0 0 8px var(--color-neon-primary),
    0 0 20px rgba(0, 255, 136, 0.5);
}
```

#### Pulso del logo (en reposo en el home)
```css
@keyframes logoPulse {
  0%   { filter: drop-shadow(0 0 6px rgba(0, 255, 136, 0.4)); }
  50%  { filter: drop-shadow(0 0 18px rgba(0, 255, 136, 0.7)); }
  100% { filter: drop-shadow(0 0 6px rgba(0, 255, 136, 0.4)); }
}
/* Duración: 3s, ease-in-out, infinite */
```

#### Estrellas titilantes (home particles)
- Opacidad oscila entre 0.3 y 1.0
- Duración aleatoria entre 2s y 6s por estrella
- No hay movimiento de posición, solo cambio de opacidad

---

### Z-INDEX LAYERS

```css
:root {
  --z-background:    0;     /* Imagen de fondo estático */
  --z-particles:     1;     /* Canvas de partículas */
  --z-planets:       2;     /* Planetas y sus órbitas */
  --z-home-content:  10;    /* Logo, tagline, botones del home */
  --z-game-canvas:   20;    /* Canvas del juego (cubre todo) */
  --z-hud:           21;    /* HUD del juego */
  --z-overlay:       30;    /* Pantallas de transición, instrucciones, resultados */
  --z-fallback:      100;   /* Pantalla fallback (siempre encima) */
}
```

---

### COMPONENTES DE BOTÓN

#### Botón primario (CONTÁCTANOS)
```
Estilo: borde verde neon, fondo transparente con hover a fondo verde semi-transparente
Texto: mayúsculas, tracking-wider, font-display
Sin bordes redondeados (border-radius: 0)
Con efecto de esquinas: pseudoelementos ::before y ::after en las esquinas
```

#### Botón secundario (INICIAR SIMULACIÓN)
```
Estilo similar al primario pero con menor intensidad de glow
En hover: intensidad de glow aumenta
```

#### Botón de HUD (SALIR / ESC)
```
Más pequeño, tipografía monoespacio
Borde neon delgado
Fondo: --color-hud-bg
```

---

### ESTÉTICA DEL UNIVERSO DE FONDO

La imagen de fondo debe ser:
- Fotografía o render de nebulosa/galaxia lejana
- Tonos: azul profundo, violeta, con algunas estrellas brillantes
- **Sin objetos muy llamativos cerca del centro** (el logo va al centro)
- Formato preferido: WebP, mínimo 1920×1080px, máximo 500KB
- Se puede obtener de: NASA Image Gallery (dominio público), Unsplash (estrellas/space)

La imagen es decorativa. El contenido va sobre ella. Nunca saturar el fondo con elementos que compitan con el contenido.

---

### PLANETAS — ESPECIFICACIÓN VISUAL

Cada planeta es un elemento HTML circular con:
- Tamaño base: 80-120px de diámetro (varía por planeta)
- Fondo: gradiente radial usando el color del planeta + alpha
- Borde: 1px sólido en el color del planeta + glow sutil
- Label: texto debajo o superpuesto, siempre visible en modo home
- Hover: planeta se ilumina levemente, cursor pointer

Los planetas tienen animación CSS de rotación lentísima en su propio eje (visual solamente, no orbital en el MVP). Se distribuyen en posiciones fijas alrededor del logo central.

Posiciones sugeridas para 4 planetas (en % del viewport):
- NOSOTROS:   15% left, 30% top
- SERVICIOS:  75% left, 25% top
- PORTAFOLIO: 20% left, 65% top
- CONTACTO:   72% left, 68% top
