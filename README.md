# Rincones — El viaje de la vida

Blog de viajes familiar: un sitio sencillo y bonito para compartir historias con amigos y familia, y guardar recuerdos. Hecho con cariño 🧡

🌐 **En vivo:** https://rincones.rubenarcila.com/

---

## ¿Qué es esto?

Una web tipo revista, en español, con estas páginas:

- **Inicio** — historia destacada + presentación.
- **Historias** — todas las entradas, con filtros por continente, tipo de viaje y ambiente.
- **Historia individual** — texto largo, datos del viaje, sitios visitados, mapa de la ruta y álbum de fotos.
- **Destinos** — mapamundi con los lugares visitados.
- **Mapa de fotos** — mapa interactivo con las fotos geolocalizadas (app externa embebida).
- **Nosotros** — quiénes somos y lista de deseos de viajes.

Incluye un **editor dentro de la propia web** (botón "✏️ Editar historias") para crear y modificar entradas sin tocar el código. Los cambios se guardan en el navegador (localStorage) y se pueden exportar/importar como copia de seguridad en JSON.

---

## Cómo verlo en tu ordenador

No hay que instalar nada ni compilar. El sitio son archivos estáticos. Como usa varios archivos `.jsx` que se cargan entre sí, conviene abrirlo con un pequeño servidor local en vez de hacer doble clic:

```bash
# Opción A — con Python (suele venir instalado)
python3 -m http.server 8000

# Opción B — con Node
npx serve
```

Luego abre `http://localhost:8000` en el navegador.

> Si abres `index.html` con doble clic puede que algunos navegadores bloqueen la carga de los scripts. Usa el servidor local de arriba.

---

## Estructura de archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Punto de entrada. Carga las fuentes, React y todos los scripts. |
| `data.js` | Historias de ejemplo (los datos iniciales del blog). |
| `store.js` | Capa de guardado en el navegador (localStorage) + copia de seguridad. |
| `themes.jsx` | Colores, fondos y tipografía (estilo "Mediterráneo"). |
| `shared.jsx` | Piezas reutilizables: tarjetas, mapamundi, cabeceras. |
| `pages.jsx` | Las páginas del sitio (Inicio, Historias, etc.). |
| `editor.jsx` | El editor de historias dentro de la web. |
| `app.jsx` | Estructura general: menú, navegación y panel de control. |
| `fotos/` | Imágenes del blog. |

---

## Publicar (GitHub Pages)

El sitio está pensado para GitHub Pages:

1. Sube los archivos al repositorio.
2. En **Settings → Pages**, elige la rama y la carpeta que contiene `index.html`.
3. Espera 1–2 minutos y entra a la dirección que te da GitHub.

> Tras actualizar, si no ves los cambios, haz una **recarga forzada**: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac).

---

## Mapa de fotos

La página "Mapa de fotos" embebe una app externa (un mapa con las fotos de Flickr). Para que el mapa se cargue dentro de la página hace falta una **clave de la API de Flickr** y el **identificador del álbum** que se quiere mostrar. Ambos se configuran al principio de la sección del mapa en `pages.jsx`.

> ⚠️ **Nota:** la clave de la API es necesaria para incrustar el mapa. Guárdala en un sitio seguro y ten en cuenta que, si el repositorio es público, conviene no exponer claves con más permisos que los de solo lectura.

---

## Notas

- **Idioma:** español.
- **Contenido actual:** de ejemplo (familia y viajes ficticios) hasta poner el contenido real.
- **Fuentes:** Manrope (Google Fonts).
- Proyecto personal/familiar. 🌍
