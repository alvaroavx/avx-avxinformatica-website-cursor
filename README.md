# AVX — sitio corporativo con demo arcade

Sitio estático del home de **AVX**: estética espacial, identidad neon verde y una **simulación arcade** (Canvas) como demo técnica. El código vive en la carpeta **`avx-home/`** (HTML, CSS, JS modular sin frameworks).

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
