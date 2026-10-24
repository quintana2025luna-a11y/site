# Jorge — Archivo vivo

Sitio web de portafolio y archivo artístico, en **español (por defecto) e inglés**. Es un sitio estático: HTML, CSS y JavaScript simples, **sin frameworks ni dependencias**. Lo único que necesitas instalado es [Node.js](https://nodejs.org) (versión 18 o superior) para regenerar las páginas y para la vista previa local.

> Regla de oro: **los textos viven en `content/`, la estructura y las imágenes en `data/`, los ajustes en `config.json`.** Después de editar cualquiera de ellos, ejecuta `node build.mjs`.

---

## 1. Qué hace el sitio y cómo funciona

La idea es un **ecosistema digital vivo**: el visitante no recorre una lista de proyectos, explora un sistema donde las piezas se conectan (una obra ↔ su proceso ↔ un experimento relacionado ↔ una nota). Por eso la interfaz usa «ventanas» (paneles con barra de título y código de catálogo `JA-01…`), un **mapa del ecosistema** en la portada y un panel de **Conexiones** al final de cada pieza.

Cómo se produce una página:

```
config.json  ─┐
data/*.json  ─┼─►  node build.mjs  ─►  index.html, projects/*.html, … y js/dictionary.js
content/*.json┘      (usa src/*.mjs)
```

1. `build.mjs` lee los ajustes, los datos y los textos.
2. Escribe cada página HTML **una sola vez, en español**. Cada texto lleva una marca `data-i18n="clave"`.
3. Escribe `js/dictionary.js` con los textos de **ambos** idiomas.
4. En el navegador, `js/main.js` cambia los textos al idioma elegido (selector **ES | EN** arriba a la derecha). No hay páginas duplicadas.

**Idioma:** el español es el predeterminado. La elección se guarda en el navegador (`localStorage`) y se mantiene al cambiar de página. También funciona con `?lang=en` en la dirección (por ejemplo `index.html?lang=en`); si el navegador bloquea el almacenamiento, el idioma viaja en los enlaces automáticamente. Sin JavaScript el sitio se lee en español.

## 2. Qué contiene cada carpeta y archivo

| Ruta | Qué es | ¿Lo editas? |
|---|---|---|
| `config.json` | **Ajustes globales:** correo, redes sociales, idioma por defecto, efectos, obra de la portada, menú. | Sí |
| `content/es.json`, `content/en.json` | **Todos los textos**, uno por idioma, con la misma estructura. | Sí (lo más frecuente) |
| `data/projects.json` | Estructura de los 4 proyectos: código, diseño (`layout`), portada, módulos, imágenes. Sin textos. | Sí |
| `data/explorations.json` | Entradas de «Exploraciones independientes». | Sí |
| `data/notes.json` | Fechas de las notas de campo. | Sí |
| `data/products.json` | Catálogo de vista previa de la tienda. | Sí |
| `data/about.json` | Herramientas, datos profesionales, retrato. | Sí |
| `data/ecosystem.json` | **El ecosistema:** posición de los puntos en el mapa y las conexiones entre piezas. | Sí |
| `assets/art/` | Tus imágenes. | Sí (añade las tuyas) |
| `assets/ph/` | Imágenes de «marcador» generadas. | No |
| `css/style.css` | Todos los estilos. | Para cambiar el aspecto |
| `js/main.js` | Comportamiento (idioma, menú, mapa, visor…). | Para añadir interacciones |
| `js/dictionary.js` | **Generado.** No editar. | No |
| `build.mjs` | Punto de entrada del generador. | Raramente |
| `src/context.mjs` | Carga los datos y define utilidades. | Raramente |
| `src/i18n.mjs` | Sistema de traducción. | Raramente |
| `src/components.mjs` | Piezas reutilizables: imagen, ventana, módulos, mapa, conexiones. | Para cambiar un componente |
| `src/layout.mjs` | `<head>`, cabecera con selector de idioma, pie. | Para cambiar cabecera/pie |
| `src/pages.mjs` | Cada página (portada, proyectos, sobre mí…). | Para cambiar la estructura de una página |
| `tools/serve.mjs` | Servidor local de vista previa. | No |
| `tools/check.mjs` | Verificador de enlaces. | No |
| `*.html` (en raíz y subcarpetas) | **Generados.** No editar a mano: se sobrescriben. | No |

## 3. Cómo ejecutar el sitio en local

```bash
node tools/serve.mjs      # abre http://localhost:4173/
```
o haz doble clic en `preview.command` (macOS/Linux) o `preview.bat` (Windows). Para regenerar **y** servir: `node build.mjs && node tools/serve.mjs`.

⚠️ Extrae el ZIP completo antes de abrir nada. Si abres `index.html` suelto (sin las carpetas `css/`, `js/`, `assets/` a su lado) se verá sin estilos; aparece un aviso amarillo bilingüe cuando pasa.

## 4. Cómo editar los textos en español e inglés

Abre `content/es.json` y `content/en.json`. **Tienen exactamente la misma estructura**; solo cambia el idioma de los valores.

Ejemplo: cambiar la descripción corta de Biopunk.

```json
// content/es.json
"projects": { "biopunk": { "short": "Un mundo sin presencia humana…" } }
// content/en.json
"projects": { "biopunk": { "short": "A world without human presence…" } }
```

Mapa rápido de claves:

| Quiero cambiar… | Clave |
|---|---|
| Declaración artística **corta** | `statement.short` |
| Declaración artística **larga** (párrafos) | `statement.long` (lista; agrega o quita párrafos) |
| Título, subtítulo, descripción de un proyecto | `projects.<slug>.title / subtitle / short` |
| Un texto dentro de un proyecto | `projects.<slug>.modules.<id-del-módulo>.heading / body / note` |
| Pie de foto de una imagen de galería | `projects.<slug>.modules.<id>.items.<n>.caption` |
| Menú y botones | `nav.*`, `home.*`, `ui.*` |
| Notas de campo | `notes.<slug>.title / body` |
| Títulos de las páginas (pestaña del navegador) | `meta.<página>.title / desc` |

- Un valor `null` significa «pendiente»: la página muestra un marcador visible, no inventa nada.
- **Textos que faltan en un idioma:** `node build.mjs` imprime la lista («⚠ Faltan N traducciones…») y en la web esos textos aparecen en español con un subrayado punteado amarillo cuando se está en inglés.
- **Datos con valor propio** (año, técnica, dimensiones) se escriben en `data/*.json`. Pueden ser texto simple (`"2026"`) o por idioma: `{ "es": "Óleo sobre lienzo", "en": "Oil on canvas" }`.
- **La declaración actual es provisional** (marcada con una etiqueta amarilla mientras `showPlaceholders` sea `true`): la corta es tu síntesis inicial y la larga es un borrador construido solo a partir de ella. Reemplaza ambas cuando tengas el texto final.

## 5. Cómo añadir un proyecto nuevo

1. En `data/projects.json`, copia un proyecto completo dentro de la lista y cambia `slug` (por ejemplo `"mi-proyecto"`), `number`, `acc` (código `JA-05`), `type`, `pin`, `theme` y `cover`. `layout` elige la presentación: `fieldguide`, `cinema`, `gallery` o `sheets`. Los módulos disponibles son `text`, `section`, `gallery` (estilos `grid`, `bands`, `asym`, `wall`, `close`, `pairs`, `pages`), `specimens`, `media`, `compare`, `facts`, `wip`.
2. En `content/es.json` y `content/en.json`, bajo `projects`, agrega `"mi-proyecto"` con `title`, `subtitle`, `short`, `verb`, `coverAlt`, `tags` y, dentro de `modules`, un bloque por cada `id` de módulo (`heading`, `body`…). Sigue el ejemplo de `ira`.
3. Si usas un `type` nuevo, agrégalo a `types` en ambos idiomas.
4. Opcional: agrega el punto al mapa en `data/ecosystem.json` → `nodes`.
5. `node build.mjs` → se crea `projects/mi-proyecto.html` automáticamente y aparece en la exposición, el índice y la navegación «anterior/siguiente».

Para una **nueva exploración**: añade una entrada a `data/explorations.json` y sus textos bajo `explorations.<slug>` en `content/*.json`.

## 6. Cómo reemplazar los marcadores por tu obra

1. Guarda la imagen en `assets/art/` (ideal: borde largo de ~2000 px, JPG/WebP; opcional una versión de 800 px).
2. En `data/*.json`, en el elemento que corresponda, pon:
   ```json
   "src": "assets/art/mi-obra-1600.jpg", "small": "assets/art/mi-obra-800.jpg", "w": 1600, "h": 1000
   ```
   (`small`, `w` y `h` son opcionales pero evitan saltos de diseño.) Quita `"provisional": true` cuando sea la imagen final.
3. Escribe el texto alternativo y el pie de foto en `content/es.json` y `content/en.json` (`…coverAlt`, `…items.<n>.caption`/`alt`).
4. Videos: `"src": "assets/art/video.mp4"` (puede ser una lista MP4 + WebM) y `"poster"`. Nunca se reproducen solos.
5. Cuando todo sea real, pon `"showPlaceholders": false` en `config.json`: se ocultan las etiquetas «Marcador» y los módulos vacíos.

La obra de la portada se elige en `config.json` → `home.heroProject` (el `slug` cuyo `cover` se muestra).

## 7. Cómo cambiar colores, tipografía, espacios y rejilla

Todo está al inicio de `css/style.css`, en `:root`:

```css
:root {
  --green: #79BF65;  --red: #591D28;            /* identidad */
  --display: "Fraunces", …;  --body: "Instrument Sans", …;  --mono: "IBM Plex Mono", …;
  --gutter: clamp(1rem, 4vw, 3rem);  --max: 1360px;  /* margen lateral y ancho máximo */
}
```
- **Colores:** cambia `--green` / `--red` y todo el sitio se actualiza. Cada proyecto tiene su paleta en `data/projects.json` → `theme`.
- **Tipografías:** se cargan desde Google Fonts en `src/layout.mjs` (constante `FONTS`) y se nombran en `:root`. Para no depender de Google, descárgalas y usa `@font-face`.
- **Espacios y ancho:** `--gutter` y `--max`. Las secciones usan `clamp(…)` para adaptarse a cada pantalla.
- **Rejilla:** las salas usan 12 columnas (`.room-grid`); las galerías usan `.gallery--…` (busca esa palabra en el CSS).
- **Ventanas:** `.win`, `.win-bar`, `.win-code` (sección «SISTEMA ARCHIVO VIVO» al final del CSS).

## 8. Cómo actualizar tu correo y tus perfiles

Todo en `config.json`:
```json
"email": "quintana2025luna@gmail.com",
"socials": [ { "id": "linkedin", "label": "LinkedIn", "url": null }, … ]
```
- El correo aparece como enlace `mailto:` en Contacto (Sobre mí), pie de página y franjas de contacto.
- Un `url: null` se muestra atenuado como «enlace sin configurar». Cuando tengas tu LinkedIn o YouTube, pega la dirección completa y ejecuta `node build.mjs`. **No se inventa ninguna dirección.**
- Para agregar otra red, añade un elemento a `socials`.

## 9. Cómo modificar o añadir una interacción sencilla

`js/main.js` está dividido en secciones numeradas (`---- 1. … ----`, hasta la 12). Cada una es independiente.

- **Desactivar efectos:** en `config.json` → `effects`, pon `false` en `pageTransition` (transición de color entre páginas), `heroParallax` (movimiento de la portada) o `pointerGlow` (resplandor que sigue al cursor). El visitante también puede reducir el movimiento desde el pie de página y el sitio respeta `prefers-reduced-motion`.
- **Añadir una interacción:** ejemplo, resaltar una tarjeta al pasar el cursor:
  ```js
  /* ---- 13. mi interacción ---- */
  $$('.entry').forEach(function (card) {
    card.addEventListener('pointerenter', function () { card.classList.add('is-hot'); });
    card.addEventListener('pointerleave', function () { card.classList.remove('is-hot'); });
  });
  ```
  y en `css/style.css`: `.entry.is-hot { outline: 2px solid var(--green); }`.
- Si tu interacción escribe texto visible, agrégalo como clave en `content/*.json` y márcalo con `data-i18n` (mira cómo lo hace `paintMotion`).

## 10. Cómo comprobar que no se rompió nada

```bash
node build.mjs         # regenera; avisa de traducciones que faltan
node tools/check.mjs   # verifica que cada enlace, imagen, script y ancla exista
node tools/serve.mjs   # y revisa a mano en el navegador
```
Lista de revisión manual después de un cambio grande:
1. Cambia a **EN** y recorre el menú: ¿todo cambia de idioma? ¿Persiste al navegar?
2. Reduce la ventana (o usa el modo móvil del navegador): ¿menú ☰, mapa convertido en lista, sin scroll horizontal?
3. Abre una imagen ampliada (Esc la cierra) y prueba filtros/búsqueda en Proyectos y Exploraciones.
4. Pulsa el correo: debe abrir tu cliente de correo con `quintana2025luna@gmail.com`.
5. Navega con el teclado (Tab): todo control debe mostrar un contorno verde al enfocarse.

## 11. Cómo construir o publicar el sitio

El «build» es solo `node build.mjs`: el resultado (los `.html`, `css/`, `js/`, `assets/`) **ya es el sitio publicable**. Para publicarlo:
1. En `config.json` pon `"siteUrl": "https://tu-dominio.com"` (activa la dirección canónica, las etiquetas para compartir y `sitemap.xml`) y, si ya no quieres etiquetas de marcador, `"showPlaceholders": false`.
2. Ejecuta `node build.mjs` y `node tools/check.mjs`.
3. Sube **el contenido de la carpeta** (sin `node_modules`, `src/`, `tools/` ni `content/` si no quieres; sí necesitas `*.html`, `css/`, `js/`, `assets/`, `robots.txt`, `sitemap.xml`) a cualquier alojamiento estático: GitHub Pages, Netlify, Cloudflare Pages o tu propio servidor.
4. Si quieres una imagen al compartir en redes, añade `assets/og.png` (1200×630).

---

## 12. Integración v0.4: Laboratorio, mapa interactivo, visor con zoom y veladura carmesí

Esta versión fusionó una segunda implementación (una sola página con Tailwind/Three.js) dentro de la arquitectura existente. **No se copió contenido inventado**: las imágenes de stock, precios, especificaciones, estadísticas y el formulario de contacto falso se descartaron; el contacto usa el correo real (mailto).

**Qué se integró y dónde vive cada cosa**

| Función | Datos | Textos | Comportamiento |
|---|---|---|---|
| Mapa del ecosistema con **filtros por territorio, contador real y puntos arrastrables** (ratón, táctil y `Alt`+flechas) | `data/ecosystem.json` (`nodes[].group`, `groups`) | `content/*.json` → `map.*` | `js/main.js` sección 12 |
| Página **Laboratorio** (`lab.html`): visor 3D, sintetizador, campo generativo, panel de proceso | `data/lab.json` | `lab.*` | `js/lab.js` (solo se carga en esa página) |
| **Visor de imágenes** con zoom (botones, rueda, pellizco, `+` `−` `0`, doble clic), arrastre, restablecer, `Esc` | — | `lb.*` | `js/main.js` sección 10 (reutiliza el `<dialog>`) |
| **Veladura carmesí** `rgba(89,29,40,.60)` sobre imágenes, tarjetas, navegación, filas del índice y nodos | variable `--veil` en `css/style.css` (bloque v4) | — | solo CSS |
| **Retícula** con coordenadas X/Y (solo con ratón; se apaga con «movimiento reducido») | `config.json` → `effects.reticle` | — | `js/main.js` sección 13 |
| **Tienda** con categorías (impresiones, ropa, libros de arte, mercancía), buscador y estados | `data/products.json` (`status`) | `shop.*` | `js/main.js` sección 8 |

**Decisiones técnicas importantes**
- **Three.js no se usa.** No se pudo descargar una copia local y un CDN puede fallar, así que el visor 3D es un renderizador propio en `canvas` (sin librerías ni WebGL): icosaedro, nudo toroidal y dodecaedro, con rotar, zoom, malla, giro automático y cambio de forma reales. Son **formas abstractas de ejemplo**, no modelos de tu obra. Si algún día quieres modelos reales, se puede sustituir ese módulo.
- El «shader» es un campo 2D animado en `canvas` (se declara así en la página). Se pausa fuera de pantalla, con la pestaña oculta y con «movimiento reducido» (empieza en pausa).
- El **audio nunca empieza solo**: requiere pulsar «Iniciar sonido», empieza con volumen bajo, se detiene con el botón, al ocultar la pestaña o al salir de la página, y si el navegador no soporta audio se muestra un aviso.
- Tipografías: se añadieron **Syne** (marca y navegación), **JetBrains Mono** (etiquetas) y **Cormorant Garamond** (cita de la declaración); se mantienen Fraunces e Instrument Sans.

**Añadir un artículo a la tienda:** en `data/products.json` agrega un objeto con `slug`, `category`, `status` (`example` | `placeholder` | `available` | `future`), `price`, `buyUrl` e `image`; y sus textos en `content/es.json` y `content/en.json` bajo `shop.products.<slug>`. Una categoría nueva: añádela a `categories` y su etiqueta en `shop.categories`. Un artículo solo se muestra como **Disponible** si tiene `buyUrl`; si no, se degrada a «Marcador». No hay pagos.

**Cambiar la intensidad de la veladura:** edita `--veil` (`rgba(89, 29, 40, .60)`) en la parte final de `css/style.css`.

**Añadir un punto al mapa:** agrégalo en `data/ecosystem.json` (`nodes`: `id`, `x`, `y`, `group`) y asegúrate de que el `id` exista como proyecto, exploración, nota o sección (en `extraNodes` o en `src/components.mjs` → `REG`).

**Imágenes adicionales que enviarás después**
1. Copia cada imagen a `assets/art/` con un nombre descriptivo (`proyecto-obra-numero.jpg`), en dos tamaños (800 y 1600 px de ancho).
2. En `data/projects.json`, en el módulo de galería correspondiente, reemplaza `"src": null` por la ruta (y `small`, `w`, `h`, `ratio` correctos); quita `provisional` cuando sea obra definitiva. La ruta se escribe **una sola vez**.
3. Escribe el pie y el texto alternativo en `content/es.json` y `content/en.json` (`projects.<slug>.modules.<id>.items.<n>.caption` / `.alt`).
4. Si no está claro a qué proyecto pertenece una imagen, déjala sin asignar y pregunta.
5. Ejecuta `node build.mjs` y `node tools/check.mjs`.

**Pruebas:** `node tools/check.mjs` verifica enlaces; las pruebas de navegador (Playwright) usadas en esta versión comprobaron carga de páginas, filtros y búsqueda, mapa (filtro, contador, arrastre, restablecer), visor (zoom, rueda, pellizco, panorámica, restablecer, `Esc`), veladura al 60 %, laboratorio completo, idioma ES/EN y móvil sin desbordamiento.

---

## Apéndice: dirección de diseño y referencias

**Concepto:** un entorno digital experimental que es a la vez archivo, exposición y publicación editorial. La obra manda; la interfaz respira alrededor de ella.

**Qué se tomó de cada referencia (como vocabulario, no como plantilla):**
- *Folio 2026* → secciones como **ventanas** con barra de título y un índice tipo explorador de archivos → componentes `.win`, índice y «ficha del sistema».
- *ITom* (pasillo con puertas) y *Where Worlds Take Shape* (explorar en vez de hacer clic en menús) → **navegación espacial**: el **mapa del ecosistema** de la portada, con nodos y conexiones.
- *Justine Soulié* → la ilustración **es** la interfaz: una sola obra grande, con ligera profundidad al mover el cursor.
- *Kolyd* y *Pascale Berkowitz* → catálogo numerado con metadatos (código, técnica, dimensiones) y la estructura de una futura tienda (impresiones, originales, consulta) sin simular pagos.
- *Wodniack* → cuadrículas de trazo técnico, índice numerado y control de preferencia de visualización.
- *Gema Vadillo* → sobriedad: enlace «saltar al contenido», menú claro, portafolio completo enlazado.

**Referencias no consultadas:** no pude leer *Arte Hueco* (Google Sites) ni la página de *Behance*; no se tomó nada de ellas.

**Pendientes (marcadores visibles en el sitio):** portada y contenido de Biopunk (hoy una captura provisional de Ser Parte), imágenes finales de Golden Tec, Ira y el ángel alquimista, declaración artística final, datos profesionales (residencia, disponibilidad, formación, exposiciones, CV), LinkedIn y YouTube, y los textos «Por añadir» de cada módulo.
