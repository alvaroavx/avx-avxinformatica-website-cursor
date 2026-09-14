# AVX — sitio corporativo con demo arcade

Sitio estático del home de **AVX**: estética espacial, identidad neon verde y una **simulación arcade** (Canvas) como demo técnica. El código vive en la carpeta **`avx-home/`** (HTML, CSS, JS modular sin frameworks).

## Guía humana

### Qué es, para qué sirve y quiénes lo usan

Es un sitio corporativo experimental de **AVX Informática** que combina una portada de marca con una demostración arcade en el navegador. Sirve para presentar la identidad visual de AVX y explorar una interacción lúdica como demostración técnica. Está pensado para visitantes del sitio y para el equipo que mantiene contenido, diseño e implementación; no contiene cuentas, administración ni servicios de negocio.

### Qué contiene y cómo trabaja

El repositorio contiene el sitio en `avx-home/`: una entrada HTML, CSS organizado por experiencia, módulos JavaScript ES y activos gráficos. Un manejador de estado cambia entre home, juego y fallback; el modo arcade se dibuja con Canvas. Se distribuye como archivos estáticos y debe servirse por HTTP local o por un hosting estático, pues los módulos ES no funcionan correctamente abriendo el HTML con `file://`.

### Funcionalidades y tareas que resuelve

- Mostrar la portada corporativa con estética espacial y contacto de AVX.
- Cambiar entre la vista principal, el juego arcade y una alternativa de fallback.
- Ejecutar una simulación arcade local en Canvas como demostración técnica.
- Publicar el mismo contenido sin compilación ni backend.

### Trazabilidad humana

- **Solicitante:** no se encontró una solicitud ni una persona solicitante verificable en el repositorio.
- **Desarrollo:** el contenido identifica a AVX, y el primer commit disponible fue creado por **Álvaro Vargas Quezada**. Esa evidencia no permite asignar toda la autoría funcional o visual a una sola persona.
- **Cuándo:** el primer y único registro Git disponible es del **10 de septiembre de 2026**; representa el inicio observable de esta historia Git.

### Qué puede mejorar y oportunidades

La mayor oportunidad es cerrar la distancia entre el objetivo documentado y la experiencia implementada: completar o acotar el juego, revisar navegación de teclado, movimiento reducido, contraste, carga de assets y rendimiento móvil. También falta decidir una plataforma de hosting, TLS, cabeceras, analítica, observabilidad y rollback. La priorización está en [estado actual](docs/planning/current-status.md) y [plan de implementación](docs/planning/implementation-plan.md).

La especificación IA First está en [docs/README.md](docs/README.md). Distingue el estado implementado del objetivo de producto y contiene arquitectura, experiencia, rendimiento, inventario y plan de ejecución. Antes de cambiar el juego o el home, revise también [el estado actual](docs/planning/current-status.md) y [la auditoría documentación vs. implementación](docs/planning/docs-implementation-audit.md).

## Requisitos

- Un navegador moderno.
- **No** abrir `index.html` directamente con `file://` si quieres usar módulos ES (`import`): Chrome bloquea la carga y verás errores CORS. Sirve el proyecto por **HTTP local**.

## Ver el sitio en local

Desde la **raíz del repositorio** (donde está este `README.md`):

```bash
cd avx-home
python3 -m http.server 8080
```

Abre en el navegador:

**http://127.0.0.1:8080/**

(Otro puerto si el 8080 está ocupado.)

Alternativas:

```bash
# Node (si tienes npx)
cd avx-home && npx --yes serve -l 8080
```

```bash
# PHP
cd avx-home && php -S 127.0.0.1:8080
```

## Estructura rápida

| Ruta | Contenido |
|------|-----------|
| `avx-home/index.html` | Entrada única del sitio |
| `avx-home/styles/` | CSS (tokens, home, juego, fallback, …) |
| `avx-home/js/` | Módulos ES6 (`main.js`, estado, home, juego, …) |
| `avx-home/assets/` | Imágenes, favicon, sprites del juego |
| `docs/` | Especificación y brief para implementación |

## Contacto / dominio (proyecto)

- Dominio: **avx.cl**
- Contacto: **alvaro@avx.cl**

---

*Para despliegue en producción, sube el contenido de `avx-home/` a cualquier hosting de sitios estáticos (S3+CloudFront, Netlify, GitHub Pages, nginx, etc.).*

La plataforma de despliegue, TLS, cabeceras, observabilidad y rollback no están versionados; no deben darse por supuestos.
