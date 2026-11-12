# Kaptiva · Generador de newsletters (v0.3)

App interna para montar newsletters de Cvent con piezas fijas. Sin IA y sin coste.

## Cómo usarla
1. Abre `index.html` con doble clic (Chrome o Edge). No hay que instalar nada.
2. En la pantalla de Proyectos, pulsa «Nueva newsletter» para abrir una en blanco. Se guarda solo dentro del torneo y la carpeta que tengas abierta.
3. Rellena los módulos. La vista previa se actualiza sola.
4. Mira la pestaña **Revisión** y descarga el `.txt` para pegarlo en Cvent.

- Texto: un párrafo por línea. `**negrita**` y `[texto](enlace)`.
- Imágenes: siempre el custom link de Cvent.
- Los proyectos se guardan en el navegador de cada persona. «Exportar proyecto» descarga un `.json` para pasarlo a otra persona (lo abre con «Abrir archivo de proyecto»).
- «Importar» usa ChatGPT para repartir una newsletter antigua o un guion en módulos.

## Qué hay en cada archivo
- `js/brands.js` → torneos: colores, header, footer. **Aquí se añade un torneo o un footer pendiente.**
- `js/brand-kits.js` → biblioteca local, validación y copia de los ajustes aplicados.
- `js/brand-kits-ui.js` → gestor de kits y selector de imágenes.
- `js/modules.js` → las piezas de HTML, las recetas y la revisión automática.
- `js/head.js` → cabecera técnica del email (no tocar).
- `js/app.js` → funcionamiento de la pantalla.
- `css/app.css` → aspecto de la app (colores en las primeras líneas).
- `test/test.js` → comprueba que la app reproduce la referencia BASE (`node test/test.js`).

## Subirlo a GitHub
1. Crea un repositorio **privado** en github.com (botón «New»).
2. «Add file → Upload files» y arrastra todo el contenido de esta carpeta.

## Organización del hub
- Entra en un torneo para crear carpetas y subcarpetas con «Nueva carpeta».
- Arrastra una newsletter sobre una carpeta para moverla; para volver a una carpeta superior o a la raíz, suéltala sobre ese tramo de la ruta. Solo dentro del mismo torneo; la fecha de contenido se conserva. En táctil o con teclado, usa «Mover».
- Usa «Mover» para clasificar newsletters o mover carpetas dentro del mismo torneo. Las carpetas se pueden renombrar; solo se eliminan si están vacías.
- Cada carpeta recuerda su orden: modificación reciente/antigua, A–Z, Z–A o manual mediante las flechas. Para usar las flechas, limpia los filtros.
- La búsqueda y el rango de fechas de modificación se aplican a los elementos de la carpeta abierta, no a sus descendientes.
- Abrir una newsletter no cambia su fecha de modificación. Al cambiar de torneo, se traslada a la raíz del nuevo torneo.
- La organización se guarda en este navegador. Exportar un proyecto individual no exporta el árbol de carpetas.
- Pruebas del hub sin dependencias: `node test/hub.test.js`.
- Decisiones y futuras mejoras: `NOTAS-PROYECTO.txt`.

## Continuar el desarrollo con Codex o Claude
Lee [ESTADO-PROYECTO.md](ESTADO-PROYECTO.md) para conocer la arquitectura, los cambios implementados, las decisiones de producto, las pruebas y los pendientes. `AGENTS.md` y `CLAUDE.md` remiten a ese documento compartido.

## Montar por bloques

- **＋ Añadir bloque** abre una paleta con todos los bloques y una descripción corta. Pulsa uno para añadirlo al final, o **arrástralo a la vista previa** (o entre las tarjetas del panel) para colocarlo donde quieras. Una newsletter vacía muestra la paleta y una zona «Arrastra aquí un bloque» en la vista previa.
- Los textos obligatorios de un bloque nuevo salen como **«PENDIENTE: …»**: púlsalos en la vista previa y escribe encima. La revisión los marca como error hasta que los cambies.
- **En la vista previa**: al pasar el ratón por un bloque aparece su barra (⠿ Mover para arrastrarlo, ↑ ↓, ＋ añadir debajo, ⧉ duplicar, ✕ eliminar). Pulsar un bloque lo selecciona y lo abre en el panel.
- **Editar texto en la vista previa**: pulsa un texto, escribe y pulsa **Enter** para guardar (**Esc** cancela). Se conservan negritas y enlaces. Los textos compuestos de varios campos, las imágenes y las opciones se editan en el panel. Para añadir un párrafo nuevo, usa el panel.
- También puedes arrastrar las tarjetas del panel para reordenarlas y soltar imágenes del brand kit sobre un bloque con imagen en la vista previa.
- Con código editado a mano, la vista previa no es interactiva.

## Nueva newsletter desde un guion

1. En el hub, pulsa **＋ Desde un guion** (se propone el torneo o sección en el que estás).
2. Escribe o pega el guion, por bloques: `BANNER 1: Título: …`, `BANNER 2: Texto: …`, `BANNER 3: Foto: …`, `BANNER 4: Botón: … – https://…`.
3. **Copiar instrucciones y guion** y pégalo en un chat nuevo de ChatGPT. Pega su respuesta en el último campo y pulsa **Crear newsletter**.
- Los textos se copian tal cual. Las fotos sin custom link salen como **placeholder** y lo que el guion solo describe («texto sobre los horarios») se marca **PENDIENTE:**; la revisión avisa de ambos.
- Se crea en la carpeta donde estabas, con el torneo o sección elegido aunque ChatGPT diga otro. Al terminar, la app lista las líneas del guion que no encuentra tal cual en la newsletter.
- **Importar** (dentro de una newsletter) sigue sirviendo para convertir una newsletter antigua y sustituye el contenido de la abierta.

## Ver otras newsletters desde el editor

- **Ir a otra newsletter…** (barra superior, o Ctrl/⌘ + K) abre un buscador por nombre, torneo, club o carpeta. Aparecen primero las de la misma carpeta, luego las del mismo torneo o sección y después el resto; Enter abre la primera. La newsletter actual se guarda antes de cambiar.
- **Comparar con…** (junto a Escritorio/Móvil en la vista previa) muestra otra newsletter al lado de la tuya, sin salir de la que editas. En escritorio ambas se reducen para caber. **Abrir para editar** cambia a la comparada y deja la anterior al lado; ✕ cierra la comparación.

## Enlaces y varias pestañas

- Enlaces en el texto: `[texto](https://…)` o `[texto](mailto:…)`. La revisión marca como error cualquier otro enlace (sin https, `www.…` sin esquema, `javascript:`…), avisa de `http://` y de enlaces mal escritos (`[texto] (enlace)` o con espacios). Un enlace no permitido sale como texto, nunca como enlace.
- Puedes tener la app abierta en varias pestañas: al guardar, cada pestaña fusiona sus cambios con los de las demás por newsletter y carpeta, sin borrar lo que hagan otras. Si otra pestaña cambia la newsletter que tienes abierta (y tú no la estabas cambiando), se recarga con un aviso. Si las dos la cambian, se guarda la de la pestaña donde editas y se avisa.

## Editar el código a mano

- En la pestaña **Código**, **Editar código** desbloquea el HTML. **Aplicar cambios** lo usa en la vista previa, en «Copiar código» y en las descargas; **Cancelar** descarta lo escrito.
- El código editado se guarda con la newsletter (también en el JSON del proyecto). Mientras exista, los cambios en módulos y ajustes **no** se aplican al email: la vista previa y la revisión lo avisan, también si has cambiado módulos después de editar.
- **Volver al código generado** descarta la edición manual y regenera el HTML desde los módulos.

## Clubs

- La pantalla inicial tiene dos grupos: **KSA Global Stage** (los torneos) y **Clubs**. Al entrar en un club aparecen sus secciones, que funcionan como un torneo (carpetas y newsletters propias):
  - Fundación Real Madrid: USA CAMPS, CANADA CAMPS, EXPERIENCES, RMF WORLD CHALLENGE
  - Paris Saint-Germain Academy: USA CAMPS, CANADA CAMPS, EXPERIENCES
  - Arsenal: USA CAMPS, CANADA CAMPS, EXPERIENCES
  - Bayern FC: CANADA CAMPS, EXPERIENCES
- Los datos están en `js/brands.js` (`K.CLIENT.clubs`). Cada sección hereda el diseño de su club (`base`) y puede cambiar header, footer, colores, fuentes, nombre del título o contacto. Un valor `null` o vacío queda PENDIENTE y la revisión lo avisa.
- El nombre del club sustituye a «KSA Global Stage» en el título del email, el alt del header y la etiqueta derecha de la franja. Los clubs no tienen banner de Media Packages.
- Contacto: `contact` acepta un email o un custom field de Cvent; si es un custom field, añádelo también a `K.CVENT_FIELDS`. Mientras esté vacío, la caja «Get in Touch» muestra «CONTACTO PENDIENTE» y la revisión da error.

## Brand kits

- Pulsa **Brand kits** en el hub o **Gestionar brand kits** dentro del editor. Crea un kit independiente o usa uno de los torneos como punto de partida; los kits originales no se sobrescriben.
- Guarda header, footer, banner opcional, colores y custom links de fuentes para siete usos del diseño. Principal y acento se aplican al email; el color secundario se guarda como referencia.
- Añade imágenes a la biblioteca. Puedes subir PNG, JPG, WebP o GIF de hasta 700 KB como referencias locales (hasta 30 imágenes por kit). Para usar una imagen en el email, añade su URL HTTPS de `custom.cvent.com`; la app no publica archivos en Cvent.
- En una newsletter, elige el kit en **Brand kit**. Se guarda una copia de sus ajustes junto al proyecto: editar la biblioteca no cambia newsletters anteriores. Para actualizar una newsletter, vuelve a elegir el kit guardado. **Kit automático del torneo** restaura el comportamiento anterior.
- En el editor, el panel **Imágenes del brand kit** (fijo arriba) muestra miniaturas del kit aplicado y de tu biblioteca. Arrastra una imagen hasta el campo de imagen de un bloque, o hasta la cabecera de un bloque plegado, para insertarla. Una referencia sin custom link se ve atenuada y no se puede arrastrar.
- Cada campo de imagen (módulos Imagen y Producto) muestra su miniatura. Arrástrala a otro bloque para **intercambiar** las imágenes; la descripción (alt) viaja con su imagen. También tiene botones **Elegir del brand kit**, **Usar placeholder** y **Quitar imagen**, que sirven sin ratón.
- El alt se rellena con el nombre de la imagen del kit si estaba vacío o era el nombre de la imagen anterior; un alt escrito a mano se conserva.
- **Placeholder**: deja un hueco gris «IMAGEN PENDIENTE» de la medida del bloque (650, 570 o 280 px). No es una imagen ni un asset; la revisión lo marca como error para que no se exporte por descuido. Sustitúyelo por el custom link antes de descargar.
- **Guardar kit** guarda en este navegador. **Exportar borrador** descarga un JSON con los ajustes y referencias; **Importar kit** abre ese JSON como kit nuevo sin sobrescribir otros. El JSON individual de una newsletter incluye su copia aplicada y URLs, pero no los archivos de referencia ni toda la biblioteca.
- La asociación a un torneo es orientativa: los kits no crean torneos, no cambian la clasificación del hub ni el contacto o los campos Cvent. Las fuentes externas conservan respaldos de sistema; hay que validar su rendering en los clientes de correo.
- Pruebas: `node test/brand-kits.test.js` y `node test/hub.test.js`. La subida/importación de archivos no pudo validarse automáticamente por un permiso de la extensión de Chrome; ver el estado del proyecto.
