# Traspaso técnico · Kaptiva Newsletters

Actualizado: 12 de noviembre de 2026. Documento compartido para Codex, Claude y cualquier persona que continúe el proyecto. Describe el estado observado; los pendientes no son autorización para implementarlos todos. La petición actual del usuario determina el alcance.

**Cómo leer este documento:** el apartado 0 es el resumen vigente para retomar el trabajo. Los apartados 1 a 14 son el traspaso del 11/11 y algunas partes (archivos, módulos, pruebas, estado del repositorio) han quedado desactualizadas: si chocan con el apartado 0 o con el código, manda el apartado 0 / el código. Las secciones fechadas que siguen al 14 son el registro de cambios, en orden.

## 0. Estado actual · resumen para retomar (12/11/2026)

### Estilos por kit implementados (13/11/2026)

Leer `docs/brand-kits/README.md`, `manifest.json` y las siete fichas: instrucciones vigentes y referencias HTML archivadas para PSG, Arsenal y RMF. Camps USA/Canada comparten un kit por marca, manteniendo sus secciones. Siete perfiles automáticos en `js/brand-designs.js`; Camps USA/Canada comparten una ficha por marca. Se migra la biblioteca con copias recuperables y se conserva el HTML de newsletters anteriores.

### Qué es

App estática (HTML + CSS + JS sin framework, sin compilación ni backend) para montar newsletters de Kaptiva y exportarlas a Cvent (`.txt`/`.html`). Se abre `index.html`; Node solo para pruebas. Todo se guarda en `localStorage`. Interfaz y documentación en español.

### Archivos

| Archivo | Qué hace |
| --- | --- |
| `index.html` | Hub, editor, diálogos (importar, guion, brand kits, historial) y orden de carga de scripts |
| `css/app.css` | Solo la interfaz de la app (no el email) |
| `js/brands.js` | Cliente, 5 torneos de Kaptiva Global Stage y clubs con secciones (19 en total), colores, header/footer, fuentes, `theme` por roles (WCH) y campos Cvent permitidos |
| `js/head.js` | `K.HEAD`/`K.BODY_*`: cabecera del email, reglas móviles (480 px) y condicionales de Outlook |
| `js/brand-kits.js` / `js/brand-kits-ui.js` | Biblioteca de brand kits (validación, copia guardada con la newsletter, banners/fotos) y su interfaz |
| `js/modules.js` | **Núcleo del email**: piezas y bloques (`K.MODULES`), `K.build` (HTML), `K.check` (revisión), recetas, importación, instrucciones de ChatGPT, estilo de club |
| `js/block-icons.js` | Esquemas SVG de cada bloque para la paleta y el panel (solo interfaz) |
| `js/history.js` | Deshacer/rehacer y versiones por newsletter |
| `js/hub.js` | Árbol de ubicaciones/carpetas, ordenación y filtros del hub |
| `js/app.js` | Estado, guardado, hub, editor de campos, vista previa interactiva (iframe `srcdoc` + `enhancePreview`), exportación |

Claves de `localStorage`: `kaptiva-newsletters-projects-v1` (newsletters), `-hub-v1` (carpetas), `-hub-view-v1` (vista del hub), `-brand-kits-v1`, `-versions-v1` (historial), `kaptiva-newsletters-v1` (formato antiguo, migrado).

### Modelo de una newsletter (`state`)

`{ tournament, name, desc, franjaLeft, franjaRight, mediaPackages, headerAlt, look, brandKit?, off: {header, franja, footer}, sections: [{ id, type, d: {campos}, open, hidden? }] }`

- `designVersion: '2026-11-13'`: nuevas recetas/importaciones/guiones; activa el perfil preparado según la sección. `look` se conserva internamente para el HTML anterior; ya no tiene selector en la UI.
- `hidden: true`: bloque oculto con el ojo; no sale en el email ni se revisa.

### Bloques

- **Paleta** (`K.MODULE_ORDER`): piezas mínimas `title` (principal, sección, saludo, entre líneas, antetítulo), `text` (normal/pequeño), `list`, `images` (1–3), `button`, `cards` (Tarjetas 1–8), `box` (Caja suave/borde/oscura; texto o puntos); y bloques `datos` (1–4), `producto` (1–8 opciones), `separador`, `compra` (frase fija u «otra»), `contacto`, `glance`, `timeline` (1–8 hitos, etiqueta bajo la fecha, puntos), `deadlines`, `wallet`.
- **Antiguos** (`K.LEGACY`: intro, titulo, lista, cierre, imagen, fotos3, boton, tarjetas, info, step, cta, important): fuera de la paleta, pero se siguen pintando e importando igual.
- **Piezas encadenadas**: `title`/`text`/`list`/`button` seguidos se unen en una celda (`K.flowGroups`, `K.flowCell`) para reproducir exactamente el HTML de los bloques antiguos. Reglas en `js/modules.js` (comentario sobre `TITLE_STYLES`).
- Grupos repetibles con `K.repeat(cfg)` (Producto, Tarjetas, Imagen, Banda de datos, Timeline).
- Cada bloque nuevo necesita: entrada en `K.MODULES` (`fields`, `build`, `tag`, `letter`, `name`), `BLOCK_INFO` en `js/app.js`, esquema en `js/block-icons.js` y, si procede, línea en la guía de composición.

### Estilos del email

- Colores: el HTML se escribe con `P = #6F4ACC` (principal) y `A = #91FAFB` (acento) y `K.build` los cambia al final por los del torneo o kit. Roles por marca con `%%C:rol%%` (`C`/`C_DEFAULT` en `js/modules.js`), sustituidos por `theme`.
- **Estilo de club** (`K.lookIsClub`, `K.clubTheme`): con `look: 'auto'` en clubs (no torneos, no Kaptiva Sports Academy, no secciones con `theme` propio como WCH). Referencia de diseño: newsletter «Essential Pack» de PSG (`K.REFERENCE_CLUB`).
- Vista previa: `K.build(st, { preview: true })` añade marcas `data-ksa-section`, tiras de bloques ocultos y textos guía; nunca salen en lo exportado.

### Reglas de trabajo acordadas con el usuario

1. **Lo antiguo no cambia**: cualquier cambio en el generador debe dar exactamente el mismo HTML para newsletters y bloques existentes. Las novedades van como opciones apagadas por defecto o con `look`. Verificar con `node test/compare-modules.js <copia-anterior-de-modules.js>` (copiar `js/modules.js` antes de tocarlo, o usar `git show HEAD:js/modules.js > /tmp/m.js`) y con las pruebas de equivalencia de `test/pieces.test.js`.
2. Bloques mínimos que se combinan, no bloques grandes con muchas opciones; lo nuevo se añade como opción de una pieza existente si encaja.
3. Conservar textos literales, custom links y campos Cvent. No inventar assets ni URLs.
4. Probar en el navegador (escritorio y móvil, sin desbordes) además de las pruebas de Node; no está probado en Outlook/Gmail reales.
5. Documentar cada cambio en este archivo. Commit solo cuando el usuario lo pide.

### Instrucciones de ChatGPT

`K.importPrompt()` (HTML antiguo o guion → JSON) y `K.scriptPrompt()` (guion → JSON) se generan desde el código: reglas, «GUÍA DE COMPOSICIÓN» (`composeGuide`), lista de bloques y campos (`moduleList`, sale sola de `fields`) y el ejemplo `K.REFERENCE_CLUB`. `K.importProject` valida el JSON y descarta lo desconocido. Si se añade una opción de bloque, revisar la guía.

### Pruebas

```sh
for t in test/*.test.js; do node "$t" || echo "FALLA $t"; done
node test/test.js            # comparación con la BASE; muestra «igual: false 20205 20211» (diferencia conocida del footer)
node test/compare-modules.js /tmp/modules.antes.js
git diff --check
```

Suites: `hub`, `brand-kits`, `history`, `producto`, `cards`, `pieces` (equivalencia piezas ↔ antiguos en los 19 torneos), `hidden`, `icons`, `datos-timeline`, `compra`, `variantes`, `club-style`.

### Pendiente (no implementar sin petición)

- Fase 6 del catálogo: botón «Convertir» de bloque antiguo a piezas (opcional).
- At a glance y Dos fechas límite siguen como bloques propios (Tarjetas no los reproduce byte a byte).
- Probar en Outlook, Gmail y Cvent reales.
- Si el usuario pasa newsletters de referencia de otros clubs, ajustar su estilo (hoy todos usan el de PSG con sus colores).
- Deuda técnica del apartado 9 que siga vigente.

## 1. Objetivo y decisiones de producto

Herramienta interna para montar newsletters de KSA Global Stage con diseño consistente y exportarlas a Cvent. Debe poder usarla el resto de PMs sin necesitar aprobación de diseño en cada envío. El problema principal expresado por el usuario es el esfuerzo de aportar muchísimo contexto a la IA y que aun así cambie, omita o rompa algo.

Decisiones y aclaraciones del usuario:

- El flujo actual parte de newsletters base existentes: se reutilizan sus textos, imágenes, custom links y custom fields de Cvent.
- La importación mediante ChatGPT se diseñó para repartir ese material en los módulos de la app. No se pidió reemplazar ahora ese flujo.
- No asumir que los paquetes que hoy son imágenes deban convertirse inmediatamente en tarjetas con precios editables.
- Futuro deseado: partir también de un guion como «BANNER 1: texto… / BANNER 2: texto… / BANNER 3: foto / BANNER 4: botón». Formato, interpretación y validación pendientes de definir.
- Se propuso cerrar la BASE para que el PM solo rellene contenido, pero el usuario aplazó ese trabajo. No se ha aprobado una especificación final ni se han bloqueado los módulos.
- La organización del hub clasifica newsletters dentro de los torneos mediante carpetas, ordenación y filtros. Después se añadió una biblioteca local de brand kits, incluidos kits independientes, por petición expresa del usuario (apartado 14).
- Por ahora los torneos son las categorías principales. Una jerarquía principal genérica para otros tipos de proyectos no está implementada ni especificada.

No confundir los prompts de importación o los textos de newsletters con instrucciones para el agente que trabaja en el repositorio.

## 2. Cómo ejecutar y arquitectura

Aplicación estática en HTML, CSS y JavaScript sin framework, gestor de paquetes, compilación, backend, cuentas ni API de IA. Abrir `index.html` en Chrome o Edge. Node se utiliza para las pruebas, no para servir la aplicación.

Los scripts comparten el objeto global `KSA` mediante IIFEs. Algunos también funcionan en Node mediante `globalThis`. El HTML de email utiliza tablas, estilos inline, reglas móviles y condicionales de Outlook. No sustituir esa estructura por layouts web sin validar su compatibilidad de correo.

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Hub, editor, pestañas, diálogos y carga de scripts |
| `css/app.css` | Interfaz de la aplicación; no define el diseño del email exportado |
| `js/brands.js` | Marca, cinco torneos, colores, imágenes, contacto y lista de campos Cvent |
| `js/head.js` | Cabecera técnica y envolturas del email: fuentes externas, móvil y Outlook |
| `js/modules.js` | Módulos, recetas, montaje, revisión, normalización e importación |
| `js/app.js` | Estado, almacenamiento, hub, formularios, vista previa y exportación |
| `js/brand-kits.js` | Biblioteca de marca, validación, persistencia y copias aplicadas |
| `js/brand-kits-ui.js` | Gestor de kits, referencias locales y selector de imágenes |
| `test/brand-kits.test.js` | Pruebas de kits, snapshots, fuentes, colores, URLs y compatibilidad |
| `js/hub.js` | Funciones de jerarquía, prevención de ciclos, ordenación y filtrado |
| `js/history.js` | Deshacer/rehacer en memoria e historial de versiones por newsletter |
| `test/pieces.test.js` | Equivalencia exacta piezas nuevas ↔ bloques antiguos en todos los torneos, reglas de encadenado e Imagen 1–3 |
| `test/cards.test.js` | Pruebas del bloque Tarjetas (1 a 8, estilos, botones, revisión e importación) |
| `test/producto.test.js` | Pruebas del módulo Producto con 1 a 8 opciones con precio |
| `test/history.test.js` | Pruebas de deshacer/rehacer y versiones (agrupación, límites, falta de espacio) |
| `test/BASE-KSAGS-GLOBAL-STAGE.txt` | Referencia HTML de la BASE |
| `test/test.js` | Comparación del ejemplo con la BASE y comprobación básica de paleta FIT |
| `test/hub.test.js` | Pruebas sin dependencias de la organización del hub |
| `NOTAS-PROYECTO.txt` | Notas previas de producto; conservar como contexto |

Imágenes y fuentes del email se sirven desde Cvent; la app local no significa que esos recursos estén disponibles sin conexión. La previsualización usa `iframe.srcdoc`.

## 3. Funcionalidad previa que sigue disponible

- Torneos: Surf Cup 2026, FIT Tournament 2027, Endeka Sports Cup 2027, MIC Punta Cana 2027 y USA Cup 2027.
- Doce módulos añadibles: `intro`, `titulo`, `lista`, `datos`, `tarjetas`, `info`, `producto`, `separador`, `imagen`, `cierre`, `compra`, `contacto`. `franja` existe como pieza interna y se configura aparte.
- Recetas: `blank`, `media`, `anuncio`, `recordatorio`, `productos`, `transaccional`, `ref1`.
- Reordenar, duplicar y eliminar módulos; campos condicionados según sus opciones.
- Texto con párrafos por línea, `**negrita**` y `[texto](enlace)`.
- Vista previa escritorio/móvil, código y revisión con errores/avisos.
- Exportación `.txt` para Cvent, `.html` y proyecto individual `.json`.
- Header, franja y footer de imagen automáticos, aunque hay opciones para desactivarlos. Footer legal con baja siempre añadido por el generador.
- Colores sustituidos al final del montaje según torneo. Los títulos con cifras usan DinPro en lugar de Extenda.

La revisión actual no es una garantía de integridad editorial ni una aprobación visual. `okToExport()` permite descargar con errores si la persona confirma.

## 4. Cambios implementados en el hub

- Pantalla inicial con los cinco torneos, incluidos los vacíos, y número total de newsletters de cada torneo.
- Navegación mediante ruta de carpetas.
- Crear carpetas y subcarpetas; renombrarlas y moverlas dentro del mismo torneo.
- Impedir mover una carpeta a sí misma, a un descendiente o a otro torneo.
- Solo permitir eliminar carpetas vacías, para no borrar newsletters en cascada.
- Mover newsletters a otra carpeta o a la raíz de su torneo; duplicarlas manteniendo la ubicación.
- Orden por modificación reciente/antigua, nombre A–Z/Z–A o manual con flechas. Preferencia y orden manual guardados por ubicación.
- Flechas manuales desactivadas mientras haya búsqueda o filtros para no producir un orden ambiguo.
- Búsqueda por nombre sin distinguir mayúsculas ni tildes. Fechas inclusivas según el calendario local del navegador.
- Búsqueda y fechas afectan solo a los elementos inmediatos de la carpeta abierta, no a todo su árbol. Las carpetas también se filtran/ordenan como elementos.
- Crear una newsletter dentro de una carpeta la asigna a esa ubicación y al torneo abierto. Un archivo importado conserva su torneo; solo se asigna a la carpeta abierta si coincide.
- Cambiar el torneo de una newsletter en el editor la saca de una carpeta incompatible y la deja en la raíz del nuevo torneo.
- Abrir una newsletter o plegar módulos no actualiza la fecha de modificación. Los cambios de contenido sí. Moverla de carpeta no cambia esa fecha.
- Aviso visible si falla la escritura en el almacenamiento local.

La creación y el renombrado de carpetas usan un diálogo HTML con campo obligatorio y rechazo de nombres compuestos solo por espacios; mover usa un diálogo con selector de destino. Renombrar sin cambiar el nombre no modifica la fecha. Se pueden arrastrar newsletters sobre carpetas o tramos de la ruta dentro del mismo torneo; las carpetas se mueven con «Mover». El orden mezcla carpetas y newsletters; no se fuerza «carpetas primero». La fecha de una carpeta refleja creación/renombrado, no la actividad de sus descendientes.

## 5. Modelo de datos y persistencia

Todo se guarda en `localStorage` del navegador. No hay sincronización entre PMs, dispositivos o navegadores.

Claves:

- `kaptiva-newsletters-v1`: proyecto único antiguo; se migra cuando no hay proyectos en la colección.
- `kaptiva-newsletters-projects-v1`: diccionario por ID de proyecto.
- `kaptiva-newsletters-hub-v1`: organización del hub.
- `kaptiva-newsletters-brand-kits-v1`: biblioteca local `{version: 1, kits: [...]}`. Es independiente de la colección de newsletters.
- `kaptiva-newsletters-versions-v1`: historial de versiones `{version: 1, items: {<idNewsletter>: [{id, at, label, auto, content}]}}`. `content` es el JSON de la newsletter sin el estado plegado de los bloques. Se borra al eliminar la newsletter; duplicar no copia el historial.

Proyecto en la colección:

```js
{
  id: 'p…',
  updated: 1790000000000, // milisegundos; modificación del contenido
  folder: '',           // vacío = raíz del torneo; si no, ID de carpeta
  state: {
    tournament: 'surfcup', name: '…', desc: '…', headerAlt: '',
    mediaPackages: true, franjaLeft: 'Media Packages', off: {},
    sections: [{ id: 's…', type: 'intro', d: { text: '…' }, open: true }]
  }
}
```

Organización:

```js
{
  folders: {
    'fp…': { id: 'fp…', name: 'Ventas', tournament: 'surfcup', parent: '', updated: 1790000000000 }
  },
  sorts: { 'surfcup/': 'newest', 'surfcup/fp…': 'az' },
  orders: { 'surfcup/fp…': ['p…', 'fp…'] }
}
```

`parent: ''` significa raíz del torneo. Los proyectos antiguos sin `folder` siguen apareciendo en la raíz. Las referencias a carpetas inexistentes o de otro torneo se limpian al cargar/persistir proyectos.

`persist()` conserva el registro y su carpeta; compara el estado serializado excluyendo claves `open` para actualizar `updated` solo por cambios de contenido. La exportación individual guarda únicamente `state`: no incluye carpetas, orden del hub ni el resto de newsletters.

Limitaciones a tener presentes:

- Las dos claves se escriben por separado, sin transacción ni recuperación conjunta. Un fallo parcial puede descoordinar proyectos y organización.
- El aviso de fallo informa, pero no revierte cambios en memoria ni crea copias de seguridad.
- La carga valida poco los objetos persistidos. No existe reparación completa de jerarquías corruptas.
- No hay coordinación de escrituras entre varias pestañas; revisar este caso antes de asumir uso simultáneo seguro.
- La migración antigua elimina la clave anterior después de intentar guardar, sin condicionar ese borrado al éxito. Pendiente endurecer, no corregido en esta iteración.
- La organización depende del almacenamiento del navegador; el comportamiento al cambiar la ubicación de archivos locales requiere comprobación real.

## 6. Importación y conservación del contenido

`K.importPrompt()` genera instrucciones que se copian a un chat externo. El usuario aporta el HTML antiguo o guion y pega la respuesta JSON en la app. No hay llamada automática a ChatGPT.

`K.importProject(text, fallbackTournament)` extrae el JSON, exige un array `sections`, transforma campos en cadenas, aplica defaults, descarta tipos/campos desconocidos con avisos y normaliza el resultado. El formato del prompt usa `franja`; el estado interno usa `franjaLeft`.

Abrir un archivo de proyecto JSON utiliza otra ruta con validación más débil: comprueba `sections` y pasa a `createProject`/`normalize`. No asumir que ambas vías tienen el mismo contrato o robustez.

No existe comparación exhaustiva del contenido original contra lo importado. Pedir literalidad al modelo no demuestra que se conserve todo. Además, el prompt incluye excepciones a la literalidad como eliminar iconos decorativos y separar títulos/subtítulos. Revisar estas reglas cuando se retome el diseño del importador.

## 7. Comparación de la BASE: resultado comprobado

Se generó `K.build(K.fromRecipe('ref1'))` y se comparó con `test/BASE-KSAGS-GLOBAL-STAGE.txt` normalizando comentarios numerados, espacios y espacios entre etiquetas.

Resultado: `igual: false`, longitudes normalizadas 20193 frente a 20199. La única diferencia encontrada es que la URL del footer generado no incluye `?d=650`; la BASE sí. Se verificó que restaurar exclusivamente ese parámetro en memoria hace que la comparación completa dé igualdad. No se modificó el generador para corregirlo.

Orden de la BASE:

1. Header del torneo.
2. Banner Media Packages.
3. Franja identificadora.
4. Intro.
5. Imagen de promoción/fecha.
6. Imagen con paquetes.
7. Caja de compra y datos de registro.
8. Título y lista de entrega.
9. Contacto.
10. Footer de imagen.
11. Footer legal con baja.

Los paquetes y parte de la oferta son imágenes, no texto editable dentro de tarjetas. Igualdad del HTML no equivale a validación del rendering ni de los campos dinámicos después de procesarlos Cvent.

Pruebas exploratorias anteriores mostraron que la revisión no avisa al eliminar compra/contacto, cambiar imágenes a tamaño con márgenes, introducir una intro de 10.000 caracteres o poner un enlace relativo incorrecto en Markdown. Desactivar el header solo genera un aviso. Son comportamientos actuales, no controles ya solucionados.

## 8. Pruebas y alcance real de la verificación

Desde la raíz:

```sh
node --check js/app.js
node --check js/hub.js
node test/hub.test.js
node test/brand-kits.test.js
node test/test.js
git diff --check
```

- `test/hub.test.js`: pasa. Comprueba ordenaciones, rango de fechas, prevención de ciclos y movimientos entre torneos; simula eventos y almacenamiento para probar carpetas anidadas, proyectos antiguos, duplicación, movimiento, cambio de torneo y persistencia.
- La integración de ese test utiliza un DOM mínimo propio y `node:vm`. No ejecuta un navegador real, CSS, diálogos nativos ni todos los eventos reales de `details`.
- `test/test.js`: sigue mostrando la diferencia conocida del footer. No usa assertions para esa igualdad y termina con código 0 aunque difiera; no describir ese resultado como «BASE aprobada».
- La misma prueba muestra `fit restos: 0` para los colores que busca. Es una comprobación textual limitada, no cobertura completa de todos los módulos/torneos.
- `git diff --check`: sin errores en la revisión de esta entrega.
- Revisión visual del hub realizada en Chrome el 11/11/2026 sobre una copia aislada con datos sintéticos; ver el apartado 11 y las capturas. La revisión anterior había quedado bloqueada por conexión al navegador.
- Cvent, Outlook, Gmail y otros clientes de correo no se han probado en esta sesión.

## 9. Pendientes y siguiente paso sugerido

### Seguimiento de la entrega del hub

La revisión visual y funcional con datos aislados está realizada (apartado 11). Quedan como seguimiento: feedback de uso de los PMs, comprobación del almacenamiento al mover la ubicación física de los archivos y uso simultáneo de varias pestañas. No se abrió ni se alteró la colección real del usuario para hacer pruebas destructivas.

### Deuda técnica detectada, pendiente de priorizar

- Validación consistente y robusta del JSON de proyectos y de los datos locales.
- Guardado recuperable, migración segura y exportación/importación del hub completo si se requiere compartir carpetas.
- Enlaces dentro del texto: la validación actual de URL solo cubre campos declarados como `type: 'url'`, no todos los enlaces Markdown. Validar esquemas antes de generar HTML y revisar aislamiento del iframe, que actualmente no tiene `sandbox`.
- Corrección del parámetro de imagen de la BASE y prueba que falle realmente cuando haya regresiones.
- Footer de imagen pendiente para Endeka y MIC Punta Cana (`footer: null`). No inventar assets ni URLs.
- Al usar una receta con contenido Surf Cup en otro torneo, los textos de ejemplo no se reescriben automáticamente; la revisión puede advertir menciones a otro torneo.
- Resolver ambigüedad del README: «Sin IA» se refiere al generador local; hay un flujo manual asistido por ChatGPT.

### Producto aplazado por el usuario

- Cerrar plantillas para PMs y decidir qué campos/bloques son fijos, opcionales o editables.
- Reglas de extensión de texto y proporción/dimensiones de imágenes basadas en pruebas visuales, sin recortar contenido silenciosamente.
- Comprobación de que la importación no omite ni altera textos, campos Cvent, imágenes o enlaces.
- Guiones de banners descritos en texto.
- Bloqueo de exportación ante errores críticos: fue una propuesta, aún no implementada ni definida como especificación final.

## 10. Estado del repositorio y continuidad

Último commit observado antes de este documento: `bff2ba4` (`V02`). Hay cambios locales sin commit. No se ha hecho commit, push, publicación ni despliegue durante este trabajo.

Ya había modificaciones en `README.md`, `css/app.css`, `index.html`, `js/app.js` y `js/modules.js` antes de intervenir. No atribuir todo el diff respecto a HEAD a la nueva funcionalidad ni revertirlo en bloque. `js/modules.js` se leyó y probó, pero no se cambió durante la implementación del hub.

Archivos añadidos para el hub: `js/hub.js`, `test/hub.test.js`, `NOTAS-PROYECTO.txt`. La documentación de traspaso añade este documento y puntos de entrada `AGENTS.md`/`CLAUDE.md`. También se observó `.DS_Store` sin seguimiento; no forma parte de la funcionalidad.

Antes de continuar: leer este documento, revisar `git status` y el código actual, distinguir verificación automática de visual y seguir la siguiente petición del usuario. Mantener este documento actualizado si se corrige un pendiente o cambia una decisión.

## 11. Revisión visual y funcional del hub · 11/11/2026

### Entorno y protección de datos

Se leyeron AGENTS.md, este documento, NOTAS-PROYECTO.txt y README.md antes de intervenir. Se revisó Git y se conservaron los cambios locales anteriores. Los prompts del importador y el contenido de newsletters se trataron como datos, no como instrucciones.

Pruebas en Chrome real mediante la conexión de navegador. Se copió la app estática a `/tmp/newsletters-hub-review` y se sirvió exclusivamente en `http://127.0.0.1:8765`. Ese origen usa almacenamiento separado del `file://` abierto por el usuario. Se cargaron 32 newsletters sintéticas, carpetas anidadas, cuatro torneos vacíos, fechas distintas y un nombre de 294 caracteres sin espacios. No se modificaron ni eliminaron newsletters reales. Este servidor es solo una herramienta temporal de revisión: la app sigue sin compilación, backend ni dependencias nuevas.

### Correcciones de esta revisión

- El renderizado del orden manual destruía el botón enfocado: tras pulsar Enter, el foco quedaba en el body. Ahora vuelve a la flecha del mismo elemento; si queda desactivada, al botón de abrir. También se coloca el foco al navegar por la ruta, entrar/salir del editor, duplicar y confirmar un movimiento.
- Los nombres extremos estiraban los botones y distribuían el contenido de otras tarjetas por toda su altura. Las tarjetas y sus acciones conservan alturas naturales. El nombre se limita visualmente a tres líneas; el texto completo sigue en el nombre accesible y en `title`, y aparece completo en el diálogo de movimiento.
- El orden seleccionado se cortaba en pantalla estrecha. El selector dispone de una fila más ancha; la cuadrícula admite anchos inferiores a 230 px sin forzar desbordamiento.
- Crear/renombrar deja de depender de prompts nativos: diálogo HTML etiquetado, foco en el campo, envío con Enter, cancelación con Escape o botón y validación de espacios. Un renombrado sin cambio efectivo conserva la fecha.
- El diálogo de mover tiene nombre accesible, título largo que se parte y altura limitada con desplazamiento. Las flechas desactivadas se distinguen visualmente y hay foco visible para botones.
- El contador de torneo usa singular para una newsletter.

### Comprobaciones realizadas realmente

| Área | Evidencia y resultado |
| --- | --- |
| Torneos y contadores | Cinco torneos visibles; 32 newsletters iniciales en Surf Cup y 0 en los demás. Tras crear/duplicar/cambiar torneo: 33 en Surf Cup y 1 en FIT. |
| Carpetas, ruta y vacíos | Crear QA y una subcarpeta, renombrarla, entrar, volver por la ruta y mover la subcarpeta a Ventas. Ruta resultante confirmada después de recargar; estados vacíos visibles. |
| Restricciones | El selector de Ventas excluye la propia Ventas y su descendiente Noviembre. El intento de eliminar Ventas muestra el aviso de carpeta ocupada y conserva su contenido. Pruebas automáticas adicionales cubren ciclos y exclusión de otros torneos. No se completó eliminación de carpetas vacías en navegador. |
| Newsletters | Crear dentro de la subcarpeta, editar nombre y texto, duplicar allí, mover el original a raíz, cambiar la copia a FIT y verla en su raíz. El texto editado se volvió a leer del campo tras recargar. |
| Orden | A–Z, Z–A, modificación reciente/antigua contrastados con nombres/fechas sintéticos. Manual con Enter y foco conservado; orden y preferencia comprobados tras recarga. Flechas desactivadas al buscar. |
| Filtros | Búsqueda album encuentra Álbum; rango 10/11–10/11 incluye los elementos de ese día; rango invertido muestra aviso; búsqueda inexistente muestra estado sin resultados; Limpiar restaura la lista. Solo se filtran hijos inmediatos. |
| Fechas | Abrir Álbum conserva su fecha antigua visible. Plegar un módulo real y volver conserva la fecha visible de Newsletter QA, incluso en un minuto posterior. Prueba automatizada compara además milisegundos exactos al plegar y exige cambio al editar. Mover no cambia la fecha visible. |
| Escritorio/estrecho | Capturas inspeccionadas en escritorio (1728 px), 375 × 812 y 320 × 700. Ancho de documento igual al viewport en 375/320, sin desbordamiento horizontal. Diálogo de movimiento de nombre extremo revisado a 375 px. |
| Muchos elementos | Carpeta Ventas con 30 elementos, cuadrícula, ruta, contadores y desplazamiento comprobados. No es una prueba de rendimiento con miles de registros. |
| Teclado y diálogos | Enter para entrar al torneo, abrir newsletter, volver, crear/renombrar y reordenar; foco observado en cada destino. Escape cancela creación sin añadir carpeta y cierra movimiento. Nombre de solo espacios rechazado. No se hizo auditoría completa con lector de pantalla. |
| Consola | Sin errores ni avisos en los logs capturados durante el recorrido. Los diálogos nativos produjeron interrupciones de la herramienta de automatización; se recuperó la pestaña/recargó sin usar esos errores como evidencia de fallos del hub. |

Capturas de datos sintéticos en `test/capturas-hub/`: `hub-escritorio.jpg`, `hub-movil.jpg`, `hub-movil-dialogo.jpg` y `hub-muchos-elementos.jpg`.

Pruebas automáticas repetidas: `node --check js/app.js`, `node --check js/hub.js`, `node test/hub.test.js`, `node test/test.js` y `git diff --check`. Las pruebas del hub pasan, incluidas nuevas comprobaciones del diálogo (espacios/cancelación), protección de contenido, destinos seguros, renombrado sin cambios y timestamps exactos. Su DOM mínimo continúa sin sustituir la validación visual real. BASE sigue dando `igual: false 20193 20199` por el único parámetro conocido del footer; el script sale con 0 sin afirmar igualdad. `fit restos: 0` sigue siendo una comprobación textual limitada.

### Límites que siguen pendientes

- Validar traslado físico del archivo local, varias pestañas, errores parciales de guardado y migración segura; siguen vigentes las limitaciones del apartado 5.
- La colección real y sus fechas no se usaron como fixture. No se validó una eliminación real ni la eliminación final de carpeta vacía en navegador; su lógica conserva la confirmación nativa existente.
- No se probó Cvent ni rendering de email en Outlook/Gmail. La diferencia BASE se mantiene documentada, sin modificar el email.
- Sin cambios en plantillas cerradas, rediseño del email, guiones de banners ni importación profunda.
- Sin commit, push ni despliegue.

## 12. Creación directa de newsletters · 11/11/2026

El desplegable «Nuevo proyecto…» del hub se sustituye por el botón «＋ Nueva newsletter», con ancho ajustado al texto. Un clic abre directamente una newsletter en blanco en el torneo y carpeta actuales; desde la pantalla general usa el torneo predeterminado. Las recetas siguen disponibles dentro del editor. README actualizado. Verificado con comprobación de sintaxis, las pruebas existentes del hub (ahora crean mediante clic y comprueban receta vacía y ubicación), comparación BASE con la diferencia conocida y `git diff --check`. Este ajuste no incluye una nueva validación visual en navegador. Sin commit, push ni despliegue.

## 13. Arrastrar newsletters a carpetas · 11/11/2026

Se añade drag and drop nativo, sin dependencias: arrastrar una tarjeta de newsletter sobre una carpeta la mueve allí; soltarla sobre un tramo de la ruta la devuelve a esa carpeta superior o a la raíz del torneo. El destino se resalta durante el arrastre y un mensaje accesible confirma el movimiento. El contenido y su fecha de modificación se conservan. No cambia de torneo ni reordena elementos; las carpetas siguen usando «Mover». Ese botón sigue disponible para newsletters y es la alternativa con teclado y en táctil. No se implementa arrastre táctil personalizado.

Solo se aceptan arrastres iniciados en la misma instancia del hub; archivos/textos externos, soltar en la ubicación actual y cancelar no mueven registros. Se validan de nuevo el proyecto y el torneo del destino al soltar. Los botones de acciones no inician arrastres. Persistencia y límites de guardado mantienen el contrato existente del apartado 5.

Validación real en Chrome, con un registro sintético y dos niveles de carpetas en el origen aislado `http://127.0.0.1:8766`, sin tocar el almacenamiento de la app real: raíz → Ventas → Subcarpeta → Ventas por la ruta → raíz por la ruta; recarga confirma la ubicación y la fecha antigua. Soltar sobre el fondo conserva la ubicación. El botón Mover sigue abriendo su diálogo. Sin errores/avisos en los logs capturados. Captura del aviso de destino: `test/capturas-hub/hub-arrastrar.jpg`.

Pruebas automatizadas ampliadas: arrastre interno a carpeta y raíz, persistencia tras recargar el DOM simulado, conservación exacta de estado/fecha, cancelación, rechazo de drop externo, ubicación actual y exclusión de botones de acciones. `node --check js/app.js`, `node test/hub.test.js` y `git diff --check` pasan. La comparación BASE conserva la diferencia conocida del footer y no implica aprobación visual del email. README actualizado. Sin commit, push ni despliegue.

## 14. Biblioteca interna de brand kits · 11/11/2026

El usuario pidió guardar header, footer, imágenes reutilizables, colores y custom links de fuentes, y confirmó que también quiere kits independientes para otras marcas/proyectos. Se conserva el hub por torneos; no se implementa una jerarquía principal genérica. Se preservan los cambios locales de las iteraciones anteriores, sin commit, push ni despliegue.

### Comportamiento y archivos

- Acceso desde el hub y desde el editor. El gestor permite crear un kit vacío, copiar los recursos existentes de un torneo, editar kits guardados, guardar explícitamente, descartar borradores e importar/exportar un kit como JSON. Las fichas originales de `brands.js` se usan como punto de partida y no se modifican. No hay eliminación de kits en esta versión.
- Header, footer y banner opcional: nombre/alt, custom link y archivo de referencia opcional. Biblioteca adicional de hasta 30 imágenes para insertar en Imagen o Producto. La elección conserva un alt ya escrito; lo rellena con el nombre del recurso si estaba vacío.
- Principal y acento se aplican al generador existente. Secundario se guarda como referencia, porque el diseño actual no le asigna un papel propio. No se rediseñan los módulos.
- Siete URLs de fuente para los usos actuales: titulares principales/secundarios, cifras, negrita, ligero, etiquetas y párrafos. Se sustituyen las fuentes del HTML generado solo cuando hay un kit aplicado; no se edita `head.js`. Los nombres de familia internos actúan como alias de cada uso. Un campo vacío elimina su `@font-face` y mantiene el respaldo Arial/Helvetica.
- Las imágenes exportables necesitan HTTPS de `custom.cvent.com`. Las fuentes admiten URLs HTTPS; se rechazan esquemas locales/data/javascript, credenciales y caracteres que pudieran romper el CSS. No se inventan ni publican assets. Los archivos locales solo son referencias del gestor, no recursos alojados para destinatarios del email.
- El selector de Brand kit guarda en `state.brandKit` una copia normalizada (id/nombre, asociación, colores, URLs de header/footer/banner, URLs de fuente y biblioteca de nombres/URLs). Omite los archivos base64. Por tanto, duplicar/exportar/reabrir un proyecto conserva su aspecto aunque se edite el kit original. La biblioteca no se aplica automáticamente: hay que elegirla otra vez para actualizar una newsletter. Cambiar de torneo conserva un kit independiente aplicado; elegir «Kit automático del torneo» lo quita. Cambiar de receta conserva el kit aplicado.
- `brand-kits.js` gestiona datos; `brand-kits-ui.js`, diálogos y picker. Ambos son scripts nativos sin dependencias, compilación ni backend. `modules.js` resuelve los recursos de la copia aplicada. Sin kit, una prueba compara el HTML completo con el generado antes de cargar el nuevo módulo y exige igualdad.
- Los cambios no guardados bloquean cerrar/cambiar kit hasta guardar o descartar; también hay protección de salida con un borrador pendiente. La validación y el fallo de escritura mantienen el borrador y el kit anterior en memoria; se puede exportar el borrador. Una biblioteca corrupta no se sobrescribe automáticamente.

### Datos locales y límites

Nueva clave localStorage: `kaptiva-newsletters-brand-kits-v1`. Cada kit puede guardar referencias raster (PNG/JPEG/WebP/GIF) de hasta 700 KB por archivo y un máximo de 2.300.000 caracteres serializados por kit. La cuota real del navegador también se comparte con newsletters y puede ser menor; el fallo se muestra y no sustituye el último kit guardado. No hay sincronización, permisos multiusuario ni coordinación entre pestañas. La exportación individual del kit incluye sus referencias; la de la newsletter conserva solo la copia aplicada y sus URLs. La asociación a un torneo es metadato orientativo, no un cambio de clasificación ni del contacto de KSA o los campos Cvent.

### Pruebas realizadas y evidencia

- Sintaxis de `app.js`, `modules.js`, `brand-kits.js` y `brand-kits-ui.js` verificada con `node --check`. `test/hub.test.js` y `test/brand-kits.test.js` pasan. La nueva suite prueba copia de kits originales sin diferencias, colores/fuentes en HTML, persistencia, independencia de la copia aplicada, conservación de JSON de proyecto, rechazo de URLs/referencias inseguras, fallback ante un kit inválido, formato woff2 con fragmento y fallo de cuota sin sustituir memoria.
- `test/test.js` conserva `igual: false 20193 20199`, por el único parámetro conocido del footer; no se declara BASE aprobada. `fit restos: 0` continúa como comprobación textual limitada. `git diff --check` sin errores.
- Chrome real sobre la copia aislada `http://127.0.0.1:8767`; la colección real del usuario no se utilizó. Se creó «Marca de prueba QA» desde Surf Cup, se marcó independiente, se cambiaron colores y una URL de fuente, y se añadió un recurso con URL existente. Guardado y persistencia del kit tras recarga comprobados.
- Se creó una newsletter sintética, se aplicó el kit y se insertó una imagen desde el picker. Se verificaron el enlace/alt del campo y los colores, URL de fuente y nombre de imagen en el HTML de la pestaña Código. Modificar la biblioteca conservó la copia anterior; después se volvió a elegir el kit para aplicar el nuevo color y se comprobó en el HTML tras la actualización diferida de vista previa. Newsletter y recurso sobreviven a recargar.
- Un color inválido no guarda y presenta error. Cerrar con cambios pendientes mantiene el diálogo y explica Guardar/Descartar. Escape con un kit guardado cierra. No se completó una auditoría con lector de pantalla ni la prueba del aviso de salida del navegador con borrador pendiente.
- Escritorio y 375 px revisados visualmente. A 320 px se detectó que los inputs de archivo superaban el ancho del diálogo; se corrigió su ancho mínimo y se repitió la comprobación: documento 320 px y diálogo 286/286 px de ancho visible/scroll, sin desbordamiento horizontal. Sin errores/avisos en los logs capturados de la versión corregida.
- Exportar kit se comprobó con archivos JSON realmente generados en Descargas (`brand-kit.json` y `brand-kit (1).json`, ambos de prueba): se leyeron y verificaron versión, nombre sintético, colores y recurso. El conector no notificó el evento download, pero el archivo sí se produjo.
- Capturas: `test/capturas-hub/brand-kits-escritorio.jpg`, `brand-kits-movil.jpg` y `brand-kits-imagenes.jpg`. Solo muestran datos sintéticos y recursos ya existentes.

### Pendientes concretos

- La automatización de subida de archivos se bloqueó por el permiso «Allow access to file URLs» de la extensión ChatGPT en Chrome. No se cambió ese permiso. El flujo de subida de referencias y la importación JSON por selector de archivo están implementados, pero no validados de extremo a extremo en navegador. La suite sí comprueba su estructura/normalización y los límites de tamaño. No presentar el test unitario como una subida visual completada.
- Validar el rendering real de nuevas fuentes e imágenes en Cvent y clientes de correo. Esta revisión comprueba el generador y la interfaz, no compatibilidad final de cada asset o fuente.
- Siguen pendientes sincronización, almacenamiento recuperable entre varias pestañas y el backlog previamente aplazado. No se han cerrado plantillas ni cambiado la importación de contenido asistida por ChatGPT.

## Imágenes en el editor: panel, arrastre, intercambio y placeholders (2026-11-12)

Pedido por el usuario: previsualizar las imágenes de los brand kits en el editor, arrastrarlas a los bloques, intercambiarlas entre bloques y poder dejar placeholders. Sin backend ni dependencias nuevas; sin commit.

- `brand-kits-ui.js`: `U.images(st)` devuelve la lista de imágenes (kit aplicado o del torneo primero, después la biblioteca, sin duplicados). `pickImage` la reutiliza.
- `index.html` / `app.js`: panel `#image-panel` (details abierto, se desplaza con la columna del editor —ya no queda anclado, a petición del usuario 2026-11-12—, scroll horizontal) con el placeholder y las imágenes con custom link como fuentes arrastrables; las referencias sin URL aparecen atenuadas y no se arrastran. Cada campo de imagen (`img: true` o `k: 'img'`) se pinta como `.img-slot` con miniatura, botones «Elegir del brand kit», «Usar placeholder» y «Quitar imagen», y acepta soltar. La cabecera (`summary`) de un módulo con campo de imagen también acepta soltar, aunque esté plegado, y lo abre.
- Arrastre con HTML5 DnD y estado en memoria (`dragImage`), mismo patrón que el hub; solo se aceptan arrastres iniciados en la app. Soltar la miniatura de un bloque sobre otro intercambia la URL y el alt. Soltar una imagen del kit rellena el alt si estaba vacío o coincidía con el nombre de la imagen de kit anterior; un alt escrito a mano se conserva.
- `modules.js`: valor centinela `K.IMG_PH = 'PLACEHOLDER'` en el campo de imagen. Genera una tabla gris con borde discontinuo «IMAGEN PENDIENTE · N px» (650×260 a sangre, 570×220 con márgenes, 280×200 en Producto), sin `<img>` ni asset. `K.check` lo marca como error (y omite los errores de URL/alt duplicados), así que `okToExport()` pide confirmación. El HTML sin placeholders no cambia.
- El arrastre no funciona con pantalla táctil (limitación de HTML5 DnD); los botones del campo son la alternativa, también para teclado.

Pruebas: `node --check` de los scripts; `test/hub.test.js` y `test/brand-kits.test.js` pasan (nueva prueba de placeholders en los tres tamaños: hueco generado, sin `src="PLACEHOLDER"`, error en revisión sin duplicados). `test/test.js` mantiene `igual: false 20193 20199` conocido. En Chrome (panel del navegador integrado) sobre una copia aislada en `http://127.0.0.1:8766`, sin datos reales: receta ref1, intercambio entre los dos módulos Imagen (URL y alt intercambiados), placeholder soltado sobre un módulo plegado (hueco en el HTML y error en Revisión), imagen del kit sobre un campo (alt automático actualizado y alt manual conservado) y un arrastre real con ratón del placeholder al campo. Revisado visualmente en escritorio; a 375 px no hay desbordamiento horizontal. No probado: Firefox/Safari, lector de pantalla, ni rendering del placeholder en Cvent (no debe enviarse).

## Clubs y secciones (2026-11-12)

Pedido por el usuario: añadir los clubs Fundación Real Madrid, Paris Saint-Germain Academy, Arsenal y Bayern FC, cada uno con USA CAMPS, CANADA CAMPS y EXPERIENCES; Real Madrid además con RMF WORLD CHALLENGE y Bayern sin USA CAMPS. Decisiones del usuario: pantalla inicial con dos grupos (KSA Global Stage y Clubs); las secciones comparten casi siempre el diseño del club, pero algunas cambian header/footer/colores/fuentes; implementar ya sin Bayern (sus datos llegarán después); RMF WORLD CHALLENGE tiene diseño propio aún no recibido.

- `brands.js`: `K.CLIENT.clubs` con `base` por club y `sections` con overrides. Cada sección se añade a `K.CLIENT.tournaments` (ids `rmf-usa`, `psg-exp`, `arsenal-canada`, `bayern-exp`…) con `club`, `clubName`, `section`, `brand` (nombre en el título), `filePrefix`, `contact`, `fonts`, `families`, `mediaBanner: null` y `short: null`. Así el resto de la app (hub, carpetas, kits, guardado) los trata como torneos sin migración. `K.club(id)`.
- Mapeo de datos recibido: Arsenal Summer Camp → USA y CANADA; Arsenal Football Development Clinic → EXPERIENCES (mismo header de packs d0dda3…, footer e1baea…). PSG Clinics y Camps comparten datos. RMF Camps (footer «See You At Camp») → USA y CANADA; RMF Clinics (footer «Real Madrid Foundation») → EXPERIENCES; RMF WORLD CHALLENGE y Bayern: header/footer pendientes y colores provisionales (`provisional: true`; Bayern con la paleta KSA como neutra).
- Fuentes: sin `fonts` se usan las de KSA (RMF, por instrucción de la plantilla: vacío = igual que KSA). PSG: UltraBold para titulares y cifras (Extenda60/40, DinProBlack), Bold Italic para negrita (DinProBold), Regular para el resto; es una asignación propuesta, no confirmada por el usuario. Arsenal: Georgia en titulares y cifras, Helvetica en el texto, sin enlaces (`families` sustituye la pila `font-family` de cada uso sin URL y se eliminan sus `@font-face`).
- `modules.js`: título, alt del header y etiqueta derecha de la franja usan `brand` en clubs; la caja de contacto usa `t.contact` (vacío → «CONTACTO PENDIENTE» y error en revisión); sin banner de Media Packages en clubs (aviso); aviso de header pendiente y colores provisionales; `fileBase` usa el prefijo del club; la comprobación «el texto menciona otro torneo» solo usa torneos KSA. HTML de KSA sin cambios (prueba de igualdad).
- `brand-kits.js`: `defaults` usa el nombre, fuentes y banner de la sección del club.
- `app.js`: hub con grupos, nivel de club (`hubClub`) con sus secciones, ruta «Inicio › Club › Sección › carpetas»; «Nueva newsletter» en un club usa su primera sección. Selector del editor con `optgroup` por KSA y por club.
- Pendiente: datos de Bayern y de RMF WORLD CHALLENGE, contactos (el usuario enviará custom fields de Cvent, que hay que añadir a `K.CVENT_FIELDS`), confirmar el mapeo de fuentes de PSG y validar el rendering real en Cvent/clientes de correo. La receta de ejemplo «ref1» sigue fijando Surf Cup al aplicarse.

Pruebas: `node test/hub.test.js` (nuevo: grupos, nivel de club, Bayern sin USA, RMF con World Challenge, newsletter nueva en sección) y `node test/brand-kits.test.js` (nuevo: título, colores, footer, Georgia sin @font-face, fuentes PSG .otf, contacto pendiente, avisos de RMF WC) pasan; `test/test.js` mantiene la diferencia BASE conocida. En el navegador integrado sobre copia aislada `http://127.0.0.1:8767`: pantalla inicial con los dos grupos, Arsenal › EXPERIENCES, selector agrupado, HTML con header/footer/colores/Georgia de Arsenal y revisión con contacto pendiente; PSG muestra su header y fuentes propias en la vista previa.

## Edición manual del código (2026-11-12)

Pedido por el usuario: poder editar el código de una newsletter desde la pestaña Código, junto a «Copiar código».

- `index.html`: barra `.code-bar` con «Copiar código», «Editar código»/«Seguir editando», «Aplicar cambios», «Cancelar» y «Volver al código generado»; avisos `#code-note` y `#preview-note`.
- `app.js`: `state.customHtml` (HTML manual) y `state.customBase` (HTML generado al aplicar). `refresh()` usa `customHtml` si existe para vista previa, copia, `.txt`/`.html` y revisión; no sobrescribe el textarea mientras se edita (`editingCode`). Aplicar un código idéntico al generado elimina la versión manual. Aviso (warn) en Revisión y nota en vista previa; si `K.build(state) !== customBase`, se indica que hay cambios de módulos/ajustes que no están en el código. «Volver al código generado» pide confirmación. Salir al hub con cambios sin aplicar pide confirmación. Abrir proyecto, receta o importación salen del modo edición.
- Decisión: el código manual no se sincroniza con los módulos (no hay parseo inverso). Se guarda en el proyecto y viaja en el JSON exportado.
- CSS: se corrige que `#pane-preview { display:flex }` anulaba `.pane[hidden]` y la vista previa seguía visible bajo otras pestañas (defecto previo); el iframe ocupa el alto restante.
- Se probó añadir `sandbox` al iframe de vista previa: la vista previa quedaba en blanco en el navegador integrado, así que se retiró. Sigue pendiente el aislamiento del iframe (el HTML pegado a mano se ejecuta con el origen de la app).

Pruebas: `test/hub.test.js` añade editar → aplicar (guardado en el proyecto y en `srcdoc`), cancelar sin aplicar y volver al generado; pasan todas las suites. En el navegador integrado sobre copia aislada `http://127.0.0.1:8768`: edición aplicada en la vista previa, persistencia tras recargar, aviso de desfase al cambiar el nombre después de editar.

## Validación de enlaces y varias pestañas (2026-11-12)

Pedido por el usuario como prioridad del apartado de deuda técnica: validar enlaces escritos en el texto y evitar que dos pestañas se sobrescriban.

- Enlaces (`modules.js`): `K.linkLevel(u)` → `ok` (https con dominio, `mailto:` con email), `warn` (`http://`), `error` (el resto). `inline()` no genera `href` para esquemas que no sean `https?://` o `mailto:` (se muestra el texto). `K.check` revisa todos los campos `text`/`area` de cada módulo: error por enlace no válido, aviso por `http://` y por enlace mal escrito (`[texto] (…)`, espacios en la URL). Las recetas existentes no generan avisos nuevos.
- Pestañas (`hub.js`, `app.js`): `K.Hub.merge3(mine, base, theirs, key)` fusiona por id (newsletters, carpetas, ordenaciones y órdenes manuales). `saveAll()` lee lo guardado, fusiona con lo último sincronizado por esta pestaña (`synced`, comparando sin las claves `open`) y solo escribe si cambia. Gana lo cambiado en esta pestaña; lo demás se toma de lo guardado (incluidas altas y bajas de otras pestañas). Evento `storage`: fusiona al momento y refresca el hub. Si otra pestaña cambia la newsletter abierta y aquí no había cambios, se recarga el editor con aviso (`#sync-note`); si ambas la cambiaron, gana esta pestaña y se avisa; si otra pestaña la elimina mientras está abierta, se conserva con aviso.
- Incidencia durante el trabajo: GitHub Desktop guardó en un stash (`stash@{0}`, «!!GitHub_Desktop<brand-kits-e-imagenes>») los cambios sin commit de clubs y edición de código al cambiar de rama. Se recuperaron con `git stash apply` (el stash se conserva) y se volvió a aplicar la validación de enlaces encima.

Pruebas: `test/hub.test.js` añade `merge3` (cambios propios, ajenos, altas, bajas y conflicto) y dos pestañas simuladas sobre el mismo almacenamiento (crear en ambas sin perder ninguna, renombrar en ambas y conservar los dos cambios). Pasan todas las suites. En el navegador integrado con dos pestañas sobre `http://127.0.0.1:8769`: el hub de la segunda pestaña se actualiza al crear en la primera; con la misma newsletter abierta en ambas, renombrar en una recarga la otra con aviso. No probado: comportamiento de eventos `storage` con la app abierta desde `file://`, ni conflicto simultáneo real escribiendo a la vez en las dos.

## Ver otras newsletters desde el editor (2026-11-12)

Pedido por el usuario: ver otras newsletters estando dentro de una, para comparar. Eligió las dos opciones propuestas: saltar rápido y comparar al lado.

- `index.html`: botón `#switch` en la barra superior y diálogo `#switch-dialog` (búsqueda + lista agrupada); selector `#compare` en la barra de pestañas; la vista previa pasa a `.preview-row` con `#current-col` y `#compare-col` (cabecera con nombre/ubicación, «Abrir para editar» y ✕).
- `app.js`: `otherProjects()` agrupa por misma carpeta, mismo torneo/sección y resto, ordenadas por fecha. `goTo(id, keepCompare)` comprueba código sin aplicar, guarda la actual y abre la otra; con «Abrir para editar» la anterior queda en comparación. Atajo Ctrl/⌘+K. La comparada se genera con `K.build` sobre una copia (o su `customHtml`); no se edita ni se guarda. `fitFrames()` usa CSS `zoom` en escritorio para encajar los 650 px del email en cada columna sin activar el diseño móvil; en Móvil no se escala. El selector y la comparación se refrescan al abrir proyecto y al sincronizar con otra pestaña. `compareId` no se guarda.
- `.tabs` admite dos líneas para que el selector y Escritorio/Móvil quepan en pantallas estrechas.

Pruebas: `test/hub.test.js` añade buscador (aparece la otra, abrirla, guardar la anterior) y comparación (abrir, intercambio, cerrar); pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8770`): comparación Surf Cup vs Arsenal con zoom en escritorio, grupos del selector, Ctrl/⌘+K con búsqueda «arse» y Enter abriendo la Arsenal. `zoom` depende de Chrome/Edge (navegadores objetivo); no probado en Firefox/Safari.

## Nueva newsletter desde un guion (2026-11-12)

Pedido por el usuario: crear una newsletter nueva a partir de un guion con el mismo mecanismo que «Importar» (instrucciones para ChatGPT y pegar la respuesta). Cubre el pendiente «Guiones de banners descritos en texto».

- `modules.js`: `K.scriptPrompt(tournamentId, script)` genera instrucciones específicas de guion (orden por bloques, etiquetas no se copian, textos literales, `PENDIENTE: ` para contenido solo descrito, fotos sin URL → `imagen` con `src: "PLACEHOLDER"` y la descripción en `alt`, botones sin enlace con url vacía, reparto en módulos, torneo fijo) y añade el guion al final. La lista de módulos se comparte con `importPrompt` (`moduleList`). `K.scriptCoverage(script, st)` devuelve las líneas del guion (sin viñetas ni etiquetas «Algo: ») que no aparecen literalmente en la newsletter (comparación sin acentos, mayúsculas, `**` ni sintaxis de enlace). `K.check` avisa de campos que empiezan por «PENDIENTE:».
- `index.html`/`app.js`: botón «＋ Desde un guion» en el hub y diálogo `#script-dlg` (torneo/sección con `optgroup` vía `fillTournaments`, guion, copiar, respuesta, crear). Usa `K.importProject` y fuerza el torneo elegido (avisa si ChatGPT indicó otro); crea con `createProject` en la carpeta actual y muestra resumen con avisos y líneas no encontradas. El guion y la respuesta se conservan en el diálogo hasta crear.
- Sin llamada automática a ChatGPT ni a ninguna IA (igual que Importar). La comprobación de cobertura es orientativa: puede marcar líneas que el modelo reubicó legítimamente (p. ej. etiquetas de datos) y no detecta textos alterados dentro de una línea encontrada.

Pruebas: `test/brand-kits.test.js` (instrucciones con torneo y guion, cobertura, placeholder y PENDIENTE en revisión) y `test/hub.test.js` (crear desde guion en Arsenal › EXPERIENCES, torneo forzado y aviso de texto que falta); pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8771`): diálogo desde el nivel de club, creación con respuesta simulada, vista previa con diseño de Arsenal y placeholder, revisión con los errores esperados. No se probó con una respuesta real de ChatGPT.

## Montar por bloques en la vista previa (2026-11-12)

Pedido por el usuario: que montar a bloques sea más sencillo e intuitivo, arrastrar bloques en la vista previa para colocarlos y editar el texto en la propia vista previa sin el panel lateral.

- `modules.js`: `K.build(st, { preview: true })` envuelve cada módulo en `</tbody><tbody data-ksa-section="i">…</tbody><tbody>` y, sin módulos, añade una zona `data-ksa-empty`. Solo para la vista previa; `K.build(st)` (copiar/descargar/revisión) no cambia (prueba de que no lleva marcas). «PENDIENTE:» en un campo pasa de aviso a **error** en la revisión.
- `app.js`: paleta (`#palette`, `BLOCK_INFO`, `renderPalette`, `openPalette(at)`), `insertBlock`, `moveTo`, `duplicateBlock`, `removeBlock`, `selectSection`. `newSection` rellena los campos obligatorios de texto con «PENDIENTE: <etiqueta>» para que haya algo que pulsar. Tarjetas del panel arrastrables (`cardDrop`, indicadores `drop-before/after`) y resaltado del bloque seleccionado.
- Vista previa interactiva (`enhancePreview` al cargar el iframe; no con `customHtml`): estilos inyectados, recuadro al pasar y de selección, barra flotante por bloque (⠿ Mover arrastrable, ↑ ↓, ＋ debajo, ⧉, ✕), línea de inserción al arrastrar bloques (existentes o desde la paleta del documento padre), soltar imágenes del panel de brand kit en bloques con imagen, clic para seleccionar y abrir en el panel, los enlaces no navegan. Se conserva el scroll entre recargas (`previewScroll`).
- Edición en línea: `findEditable` busca, desde el elemento pulsado hacia arriba dentro del bloque, el elemento cuyo texto coincide con una línea de un campo `text`/`area` (sin `**` ni sintaxis de enlace); amplía al mayor elemento con el mismo texto para conservar negritas. `contenteditable`; Enter guarda, Esc cancela; `toMarkdown` convierte `strong/b` en `**` y `a` en `[texto](url)`. Reemplaza solo esa línea del campo. Si la línea es «PENDIENTE:», se selecciona entera. Mientras se edita no se recarga la vista previa (`inlineEditing`).
- Limitaciones: no se editan en línea los textos que combinan varios campos o que la plantilla genera (etiquetas fijas, campos Cvent de la caja de compra), ni campos vacíos opcionales; no se crean párrafos nuevos desde la vista previa. La edición sigue las mayúsculas del CSS visualmente pero guarda el texto tal como se escribe. HTML5 drag & drop no funciona en pantallas táctiles.

Pruebas: `test/brand-kits.test.js` (marcas solo en vista previa y zona vacía) y `test/hub.test.js` (paleta: añadir con PENDIENTE y cerrar; prueba de código ajustada a la vista previa interactiva); pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8772`): arrastre real con ratón desde la paleta a la zona vacía; barra flotante al pasar el ratón; mover un bloque encima de otro (eventos de arrastre sintéticos); editar un título PENDIENTE (seleccionado entero) y un párrafo con negrita y enlace conservando el formato; selección sincronizada con el panel. No probado: Firefox/Safari ni accesibilidad con teclado de la vista previa (las acciones siguen disponibles en el panel).

## Barra de formato y cursiva (2026-11-12)

Pedido por el usuario: un editor con negrita, cursiva y tamaños al editar en la vista previa. Se recomendó y el usuario aceptó negrita, cursiva, enlace y quitar formato, **sin tamaños libres en px** (rompen coherencia, móvil y Outlook, y obligarían a revisar diseño en cada envío). Alternativa ofrecida si hace falta: variantes cerradas por bloque (p. ej. título grande/normal/pequeño).

- `modules.js`: `inline()` convierte `*cursiva*` en `<em style="font-style:italic;">` después de las negritas (un asterisco suelto como `2*3` no cambia). Ayuda de campos e instrucciones de importar/guion mencionan la cursiva. `scriptCoverage` ignora asteriscos.
- `app.js`: `startEdit` muestra `.ksa-fmt` encima del texto solo en campos `area` (los únicos que pasan por `inline()`; comprobado campo a campo). Negrita/cursiva alternan (si la selección está dentro de `strong/b` o `em/i`, se quita); enlace con `prompt`, validado con `K.linkLevel` (error → no se aplica; vacío → quita el enlace); quitar formato deja solo texto. Atajos Ctrl/⌘+B/I/K. Pegar inserta texto plano. Enter/Esc guardan o cancelan directamente (`done()`), sin depender del evento blur. Los campos de una línea guardan `textContent` (texto plano). `toMarkdown` añade `em/i` → `*…*`; `cleanLine` ignora asteriscos.

Pruebas: suites existentes pasan. En el navegador integrado (`http://127.0.0.1:8773`): negrita, cursiva y enlace sobre partes seleccionadas → `[Hola](https://kaptiva.com) **equipo**, nos vemos en *Londres*` y `<em>`/enlace en el HTML exportado; quitar formato; Enter guarda; título sin barra y con aviso «no admite formato». No probado: Firefox/Safari; render de la cursiva en Outlook y en las fuentes de cada marca (DinPro, PSG, Georgia) — se sintetiza si la fuente no tiene cursiva.

## «＋» en la vista previa y panel a la derecha (2026-11-12)

Pedido por el usuario: un «+» en la propia newsletter de la vista previa para añadir un bloque que aparezca como bloque personalizado y luego elegir su tipo en el menú; y pasar el menú de edición a la derecha. El usuario indicó además que la edición en línea «no funciona correctamente en algunos bloques» (pendiente de concretar cuáles).

- CSS: `main` pasa a `1fr minmax(380px, 470px)` y `.editor` usa `order: 2` y borde izquierdo; por debajo de 900 px vuelve arriba (`order: 0`).
- `modules.js`: `K.build(st, { preview: true, pendingAt })` inserta un `<tbody data-ksa-pending>` «Bloque nuevo — elige qué tipo de bloque es en el panel de la derecha →» en la posición indicada. Solo vista previa; no altera índices de `data-ksa-section` ni el HTML exportado.
- `app.js`: `pendingInsert` (no se guarda en el proyecto). `startPending(at)` lo fija, abre la paleta con ese mensaje y refresca. Elegir un tipo en la paleta inserta en esa posición; arrastrar un bloque a otra posición también lo anula; cerrar la paleta lo quita. Botones `.ksa-plus` en cada separación (0…n) colocados con `getBoundingClientRect`, recolocados con `ResizeObserver` y `resize`; ocultos mientras hay un bloque nuevo pendiente. «＋» de la barra del bloque, clic en la zona vacía y «＋ Añadir bloque» del panel usan el mismo flujo. La vista previa se desplaza hasta el bloque nuevo.

Pruebas: suites existentes pasan. En el navegador integrado (`http://127.0.0.1:8774`): panel a la derecha; 7 «+» para 6 bloques; «+» entre los bloques 2 y 3 → «Bloque nuevo» en esa posición, paleta con el mensaje, sin rastro en el código exportado; elegir «Imagen» lo inserta ahí. No probado: Firefox/Safari.

## Correcciones de edición en la vista previa: tarjetas y botones (2026-11-12)

Problemas reportados por el usuario en «Dos tarjetas de igual altura»: al editar la tarjeta derecha se editaba la izquierda, y no se podía crear un botón desde la vista previa.

- Causa 1: `findEditable` tomaba el primer campo con el mismo texto. En tarjetas los títulos nuevos eran iguales («PENDIENTE: Título») y además el bloque repite el contenido (versión escritorio `desk-only` y móvil `mob-only`). Ahora, si varios campos coinciden, se elige por orden de aparición del elemento pulsado entre los elementos con ese texto (módulo nº de campos, por la duplicación escritorio/móvil). `newSection` añade el grupo al texto pendiente: «PENDIENTE: Título (Tarjeta 1)» / «(Tarjeta 2)».
- Causa 2: un botón vacío no se pinta, así que no había nada que pulsar. Nueva opción «＋ Texto/botón» en la barra del bloque (`optionalItems`, `applyOptional`, menú `.ksa-pop` en el iframe): lista campos opcionales vacíos de texto con su grupo y los botones (`btn`/`*_btn` con su `url`/`*_url`). Texto → «PENDIENTE: <campo> (<grupo>)», con aviso si ese campo no aparece en el email por depender de otros; botón → pide enlace (validado con `K.linkLevel`) y pone «PENDIENTE: Texto del botón»; con botón existente: cambiar enlace o quitarlo. Esc o clic fuera cierra el menú.

Pruebas: `test/hub.test.js` comprueba los textos pendientes distintos por tarjeta; pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8775`): dos tarjetas con el mismo título «Pack», editar la derecha cambia `b_title` (no `a_title`); añadir botón a la Tarjeta 2 desde el menú, editar su texto en línea y ver «Cambiar enlace / Quitar botón». No se ha revisado el resto de bloques uno por uno: el usuario dijo que había fallos «en algunos bloques» y solo concretó este.

## Corrección: campo editado en la vista previa con textos repetidos (2026-11-12)

El usuario siguió viendo que, en «Dos tarjetas» (vista Escritorio, textos rellenados en el panel), al escribir en la etiqueta o el botón de la tarjeta derecha se cambiaba la izquierda.

- Causa: la corrección anterior elegía el campo por orden de aparición entre elementos con el mismo texto. Falla cuando un campo con ese texto no se pinta: p. ej. `a_btn` y `b_btn` = «Reserva» pero solo `b_url` relleno → solo se ve el botón derecho, que quedaba en la posición 0 y se asignaba a `a_btn`. Reproducido con clics y teclado reales.
- Solución (`probeHit` en `app.js`): si varios campos coinciden con el texto pulsado, para cada candidato se genera el HTML del bloque con esa línea sustituida por una marca, se parsea en un `<tbody>` del documento de la vista previa y se compara la ruta de hijos (`pathOf`) del elemento con la marca con la del elemento pulsado dentro del bloque; gana el que está en la misma rama (`related`). No dependen del orden ni los campos invisibles ni la copia escritorio/móvil. Si no hay coincidencia, se usa el primero.

Verificación: en el navegador integrado (`http://127.0.0.1:8777`) con etiquetas «Oferta» en ambas tarjetas y botones «Reserva» con enlace solo en la derecha: editar el botón derecho → `b_btn` «Reserva ya» y `a_btn` sin cambios; editar la etiqueta derecha → `b_label` «Oferta B». Suites existentes pasan. No probado en vista Móvil con este caso concreto.

## Botón visible sin enlace (2026-11-12)

Pedido por el usuario: si se escribe el texto de un botón sin enlace, el botón debe verse igualmente y la revisión debe indicar que está incompleto.

- `modules.js`: `twoCards` (tarjetas) y `titulo` pintan el botón con solo `btn`; sin enlace usan `href="#"`. `K.check` sustituye el error genérico por mensajes concretos por bloque y tarjeta: «el botón «X» no tiene enlace. Añádelo antes de enviar» y «hay un enlace de botón pero falta el texto del botón». Al ser errores, la descarga pide confirmación.
- `app.js`: en «＋ Texto/botón», «＋ Botón» admite dejar el enlace vacío (se añade igual); un botón con texto y sin enlace ofrece «＋ Enlace del botón» y «Quitar botón».

Pruebas: `test/brand-kits.test.js` añade botón sin enlace visible en tarjetas y título, con sus errores; pasan todas las suites y la comparación BASE no cambia. Navegador integrado (`http://127.0.0.1:8778`): texto de botón en Tarjeta 2 desde el panel sin enlace → botón visible y error en Revisión.

## Hub más directo: panel de ubicaciones, recientes y búsqueda en todo (2026-11-12)

Pedido por el usuario: optimizar el menú principal para que sea más intuitivo y llegar antes a las newsletters (jerarquías). Antes, llegar a una newsletter de un club exigía Inicio → club → sección → carpeta, y la búsqueda solo miraba la carpeta abierta.

- `index.html`: el hub pasa a dos columnas (`.hub-layout`). A la izquierda, `#hub-tree-box` (`<details>`) con `#hub-tree`; a la derecha, buscador `#hub-search` siempre visible con `#hub-scope` («En esta carpeta» / «En todas»), ruta, controles (orden y fechas) y `#folders`. El texto de ayuda se acorta.
- `app.js`: `renderTree()` en cada `showLobby()`: Inicio, torneos KSA y clubs con contador; las secciones de un club se despliegan con ▸/▾ (abierto si es el club activo; el estado manual vive en memoria, `treeOpen`); la sección abierta muestra sus carpetas y solo despliega subcarpetas del camino actual. Ubicación actual marcada con `aria-current`. Las entradas de la sección abierta y sus carpetas aceptan arrastrar newsletters (mismo `dropDestination`, mismas reglas: no cambia de torneo).
- Inicio: bloque «Editadas recientemente» con las 6 últimas newsletters (`quickCard`: abrir, ubicación clicable que lleva a su carpeta, fecha). Luego los grupos KSA / Clubs como antes.
- Búsqueda: en Inicio y en el nivel de club busca en todas las newsletters y carpetas (`showResults`, ordenadas por modificación, con ubicación). Dentro de una sección se mantiene por defecto el comportamiento anterior (hijos inmediatos de la carpeta abierta, con fechas) y se puede cambiar a «En todas». Navegar limpia búsqueda, fechas y vuelve a «En esta carpeta». En resultados globales no se aplican orden ni fechas (se ocultan los controles).
- Tarjetas de carpeta: «Carpeta · N newsletters» (cuenta recursiva).
- `css/app.css`: panel fijo (sticky) de 260 px; por debajo de 800 px pasa arriba como desplegable «Ubicaciones», plegado al cargar (`matchMedia`).

Pruebas: `test/hub.test.js` añade recientes con ubicación, panel con clubs y carpetas de la sección abierta, búsqueda global desde Inicio (encuentra Surf Cup y Arsenal) y cambio de alcance dentro de una sección. Pasan todas las suites; `test/test.js` mantiene la diferencia BASE conocida. En el navegador integrado sobre `http://127.0.0.1:8771` con datos sintéticos (origen distinto al `file://` del usuario): Inicio con panel y recientes a 1300 px, desplegar Arsenal y abrir USA CAMPS desde el panel (ruta y carpeta mostradas), búsqueda «early» en todas (6 resultados con ubicación) y 375 px sin desbordamiento horizontal con el panel plegado. No probado: arrastrar sobre el panel en navegador real (solo lógica compartida con las tarjetas), Firefox/Safari.

## Hub a pantalla completa, grupos, filtros por apertura y Kaptiva Sports Academy (2026-11-12)

Pedido por el usuario: hub a pantalla completa con el panel de ubicaciones como menú lateral fijo; ordenar/filtrar newsletters y carpetas por orden, fecha de apertura, etc.; poder ocultar Recientes, Kaptiva Global Stage o Clubs; añadir Kaptiva Sports Academy como clasificación aparte (con Short Sessions, Residential Camps…) y renombrar «KSA Global Stage» a «Kaptiva Global Stage».

- Layout (`index.html`, `css/app.css`): `#lobby` es una rejilla de dos columnas a todo el ancho: menú `#hub-tree-box` (280 px, borde derecho, scroll propio) y `.hub-main` con barra, buscador, ruta, controles y contenido (scroll propio). Se quitó el ancho máximo centrado de 1100 px. Por debajo de 800 px el menú pasa arriba como desplegable «Menú de ubicaciones».
- Grupos (`brands.js`): `K.CLIENT.groups` = Kaptiva Global Stage (`stage`), Clubs (`clubs`), Kaptiva Sports Academy (`academy`). Cada club tiene `group` (por defecto `clubs`). Academy es una entrada más de `K.CLIENT.clubs` con `group: 'academy'` y `flat: true` (sus secciones se listan directamente en el menú y en el inicio, sin nivel de club). Secciones creadas: `academy-short` (SHORT SESSIONS) y `academy-residential` (RESIDENTIAL CAMPS). Sin diseño recibido: header/footer y contacto pendientes, paleta KSA marcada como provisional (la revisión avisa). El usuario dijo «etc.»: faltan por confirmar el resto de secciones.
- Renombrado: solo en la interfaz (grupo del menú, inicio, `optgroup` del selector del editor y la barra superior, ahora «Kaptiva · v0.3»). `K.CLIENT.name` sigue siendo «KSA Global Stage» porque aparece en el título y el alt del header de los emails y en el prompt de importación; cambiarlo alteraría los emails y la comparación con la BASE. Pendiente de decisión del usuario.
- Mostrar/ocultar: en el inicio, `#hub-show` con interruptores (Recientes y cada grupo). Ocultar un grupo lo quita del inicio y lo pliega en el menú; las cabeceras de grupo del menú también pliegan/despliegan. Un grupo plegado se muestra si contiene la ubicación abierta. Preferencia por navegador en `kaptiva-newsletters-hub-view-v1` (`{hide: {recent, stage, clubs, academy}}`), con try/catch.
- Apertura: `openProject` guarda `opened` en el registro de la newsletter (no en `state`), así que no cambia la fecha de modificación. Recientes del inicio ordenadas por la más reciente entre apertura y modificación. Las tarjetas muestran «abierta …».
- Orden y filtros (`#hub-controls`): nuevo orden «Apertura: más recientes» (`K.Hub.sort` modo `opened`; lo nunca abierto y las carpetas van al final), «Mostrar» (newsletters y carpetas / solo newsletters / solo carpetas) y «Fecha de» (modificación / apertura) para el rango Desde–Hasta (`K.Hub.matches(..., field)`; sin fecha de apertura no pasa un filtro de fechas). Los controles también se aplican a la búsqueda en todas las newsletters (orden guardado en `organization.sorts['*']`; sin orden manual). Las flechas manuales se desactivan con el filtro de tipo.

Pruebas: `test/hub.test.js` añade grupos del inicio (incluidas las secciones de Academy, sin «KSA Global Stage»), ocultar Clubs y Recientes con persistencia tras recargar, apertura sin cambiar la modificación, orden por apertura, filtro por tipo y rango por fecha de apertura. Pasan todas las suites; `test/test.js` mantiene la diferencia BASE conocida (emails sin cambios). En el navegador integrado sobre `http://127.0.0.1:8771` con datos sintéticos: menú fijo a la izquierda a ancho completo, interruptores de Clubs y Recientes (Clubs plegado también en el menú), orden por apertura en Surf Cup y 375 px sin desbordamiento con el menú plegado.

### Renombrado también en los emails (2026-11-12)

El usuario confirmó cambiar «KSA Global Stage» por «Kaptiva Global Stage» también en los emails. `K.CLIENT.name` = «Kaptiva Global Stage»: afecta al `<title>` y al alt/title del header de los torneos (`modules.js`), al nombre por defecto del header de los brand kits y al prompt de importación. La receta de ejemplo `ref1` usa ese alt. Los clubs y Academy no cambian (usan su `brand`). No cambian `filePrefix` (`ksags`) ni los nombres de archivo. `test/test.js` sustituye el nombre antiguo en la BASE antes de comparar (la BASE es un email real enviado con el nombre anterior); la única diferencia sigue siendo `?d=650`. README actualizado. No probado en Cvent/clientes de correo.

## Menú lateral en árbol con desplegables anidados (2026-11-12)

Pedido por el usuario: al entrar en un evento el menú se recogía y solo mostraba ese camino; quería jerarquías como desplegables dentro de desplegables, pudiendo entrar en carpetas dentro de carpetas desde el menú.

- `app.js` (`renderTree`): cada club, sección/torneo y carpeta con hijos tiene su propia flecha ▸/▾ (`branch()`), independiente de la ubicación abierta. Se pueden tener varias ramas abiertas a la vez y las carpetas se despliegan a cualquier profundidad, en cualquier torneo o sección. Pulsar el nombre entra en esa ubicación; la flecha solo despliega o pliega.
- Lo desplegado se guarda por navegador en `view.open` (claves `c:<club>`, `t:<sección>`, `f:<carpeta>`) dentro de `kaptiva-newsletters-hub-view-v1`. Entrar en una ubicación (menú, ruta, tarjeta o resultado de búsqueda) despliega su camino (`openPath`) y no pliega lo demás. Se elimina el despliegue automático limitado al camino actual (`treeOpen`).
- Las cabeceras de grupo siguen funcionando como antes (mostrar/ocultar grupo, compartido con los interruptores del inicio). Arrastrar newsletters al menú sigue limitado a la sección abierta (mismas reglas).
- CSS: sangría fija por nivel (16 px con línea guía) en lugar de la acumulada por `--depth`; flechas más grandes.

Pruebas: `test/hub.test.js` añade árbol plegado al inicio, carpetas de tres niveles, sin flecha cuando no hay subcarpetas, ramas de Surf Cup y Arsenal abiertas a la vez, conservación al entrar en una sección y tras recargar, y despliegue del camino al abrir un resultado de búsqueda (el DOM simulado ignora el reenfoque de la flecha). Pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8771`, datos sintéticos): Surf Cup › Ventas › Noviembre › Semana 1 y PSG › USA CAMPS › Borradores abiertos a la vez, recordados tras recargar, y entrar en Semana 1 desde el menú mantiene abierta la rama de PSG.

## Menú de ubicaciones también en el editor, plegable a columna estrecha (2026-11-12)

Pedido por el usuario: ver el menú también dentro de una newsletter y poder ocultarlo dejando una columna pequeña, o volver a mostrarlo.

- `index.html`: `#workspace` (rejilla) envuelve el menú `#hub-tree-box` y `.workspace-body`, que contiene el hub (`#lobby`), los avisos y el editor (`main`). El menú ya no está dentro de `#lobby`: es común a ambas vistas. Cabecera del menú `.tree-head` con «Ubicaciones» y el botón `#tree-collapse` («/»).
- Plegado: `view.collapsed` en `kaptiva-newsletters-hub-view-v1`; clase `tree-collapsed` → columna de 46 px con solo el botón ». Igual en hub y editor. En pantallas de 800 px o menos el menú sigue arriba como desplegable y no se muestra el botón de plegar.
- En el editor el menú marca la ubicación de la newsletter abierta (`editorLocation()`, con el torneo del selector aunque aún no se haya guardado) y despliega su camino; se vuelve a pintar al cambiar el torneo. Pulsar una ubicación sale al hub en esa carpeta: `navigate()` respeta el aviso de código sin aplicar y `showLobby()` guarda la newsletter. En el editor no se arrastra al menú.

Pruebas: `test/hub.test.js` añade ubicación marcada en el editor (carpeta de segundo nivel), plegar/desplegar con persistencia tras recargar y salir al hub por el menú guardando el nombre editado. Pasan todas las suites. En el navegador integrado (`http://127.0.0.1:8771`, datos sintéticos): editor a 1440 px con el menú y la carpeta Noviembre marcada, plegado a columna estrecha con la vista previa ensanchada, desplegado y salto a PSG › USA CAMPS › Borradores desde el editor; 375 px sin desbordamiento.

### Ajuste visual del menú (2026-11-12)

A petición del usuario, el marcador de la ubicación actual (barra izquierda de 3 px) ya no se pega al punto de color: la entrada seleccionada es una píldora con fondo suave y borde fino, las entradas tienen más margen interior (10 px) y separación (10 px) y el punto de color lleva un pequeño halo blanco. Solo CSS; revisado en el navegador integrado.

## Interfaz unificada (2026-11-12)

Pedido por el usuario: unificar la interfaz para que todo sea más coherente.

- `css/app.css`: tokens comunes en `:root` (`--r-sm` 6 px, `--r` 8 px, `--r-lg` 12 px, `--shadow-hover`, `--ring`) y un bloque final «SISTEMA VISUAL UNIFICADO» que impone un único estilo por pieza:
  - Botones: principal (relleno morado, hover más oscuro), secundario (borde, hover suave) y pequeño (acciones de tarjeta y selección de imagen); misma altura mínima (36 px / 28 px), radio y estado desactivado. Incluye los botones de la pestaña Código y de la comparación, que tenían estilos propios.
  - Campos (texto, búsqueda, fecha, selectores, áreas): misma altura, borde, radio y anillo de foco (`--ring`) en hub, editor y diálogos. La barra oscura superior conserva su estilo.
  - Títulos de sección en versalitas iguales: grupos del inicio y del menú, grupos del buscador «Ir a otra newsletter», subtítulos de campos y barra lateral de kits.
  - Avisos dentro de la página (`.fixed`, `.hub-feedback`, `.code-note`): misma forma; el color indica el tipo.
  - Tarjetas: radio grande para contenedores, medio para elementos de lista, misma sombra al pasar. Franja de color común de 12 px (principal + acento) en newsletters, carpetas y ahora también torneos, clubs y secciones.
  - Contadores en píldora iguales (menú y revisión).
- `app.js`: las tarjetas de torneo/club/sección del inicio dejan de usar 📁 (se reserva para carpetas, como en el menú) y llevan la franja de color de su marca.
- Terminología: el título del hub y el botón de volver pasan de «Proyectos» a «Newsletters» (README actualizado). Se mantienen «Exportar proyecto» y «Abrir archivo de proyecto» porque se refieren al archivo `.json`.
- `test/hub.test.js`: los clics en tarjetas de torneo/club/sección usan el nombre sin 📁. Pasan todas las suites.

Revisado en el navegador integrado (`http://127.0.0.1:8771`, datos sintéticos) a 1440 px: inicio, sección con filtros, editor, pestaña Código y diálogo de brand kits; 375 px sin desbordamiento. No es un rediseño completo del editor ni de los diálogos: solo homogeneiza las piezas comunes.

## Diseño de Bayern y Kaptiva Sports Academy (2026-11-12)

Datos recibidos del usuario y cargados en `js/brands.js` (sustituyen los provisionales; ya no hay avisos de colores provisionales, header pendiente ni contacto pendiente):

- **Bayern FC** (CANADA CAMPS y EXPERIENCES): nombre en el email «FC Bayern Soccer Camp»; header `pix/020025ab69804500ac546ae96b2ffdf4.png`; footer `pix/e1222579c3d6493381c01e340d4b6ef1.jpg` con alt «See you in Munich»; principal `#ED0037`, acento `#286CFC`, sin secundario; contacto `experience@fcbayernsoccercamps.com`. Fuentes `BAYERN_FONTS` (asignación propuesta, no confirmada): Cond Extra Bold → titulares principales/secundarios y cifras; Bold → negrita; Regular → medio, ligero y párrafo.
- **Kaptiva Sports Academy** (SHORT SESSIONS y RESIDENTIAL CAMPS): nombre «Kaptiva Sports Academy»; header `pix/6cc70ed029dd494b80735f821e8158a2.png`; footer `pix/0e125d09d568466780e1bd113486df30.png` con alt «Kaptiva Sports Academy» (la imagen muestra «See you in Spain»; se usa el alt indicado por el usuario); principal `#790B81`, acento `#AF6CB3`, sin secundario; contacto `admissions@kaptivasports.com`. Fuentes `ACADEMY_FONTS`: DinPro Black/Bold/Medium/Regular/Light a su uso homónimo; Flatory Serif ExtraBold Condensed → titulares principales y Flatory Serif Condensed → secundarios (asignación propuesta). Los `.ttf` se declaran como `truetype`.
- La plantilla incluía «SECCIÓN con diseño distinto: CANADA CAMPS» con los campos vacíos en ambos casos: no se ha creado ningún override. Academy no tiene sección CANADA CAMPS.

Pruebas: `test/brand-kits.test.js` añade, para las cuatro secciones, título, colores sin restos de la paleta KSA, header/footer/alt, contacto, fuentes, formato truetype y ausencia de avisos de diseño pendiente. Pasan todas las suites. Vista previa en el navegador integrado (datos sintéticos, 1440 px): Bayern › CANADA CAMPS y Academy › SHORT SESSIONS con su header, franja, título, caja de contacto y footer; revisión sin errores en ambas. No probado en Cvent ni en clientes de correo.

## Brand kit de RMF World Challenge 2027 (2026-11-12)

El usuario envió el brand kit completo de WCH (blanco y dorado; negro y carbón solo para texto y detalles; nunca rojo). Cargado en la sección `rmf-wc` de `js/brands.js`; deja de ser provisional.

- Datos: nombre en el título y alt del header «Real Madrid Foundation World Challenge»; header `pix/df32a86304cb472599c44c9e4979cf33.png`; banner final «See You in Madrid» `pix/c2955fb129e34300b1277fc35ad7e793.png` (como footer de imagen, siempre antes de la línea de baja); principal y acento `#BEA47A`; Georgia en titulares y cifras y Helvetica/Arial en el resto, sin `@font-face` (mismo mecanismo `families` que Arsenal). Subheader fijo: `franjaLeft` «WORLD CHALLENGE 2027» (por defecto si la newsletter no pone otro; la revisión ya no lo exige) y `franjaRight` «FUNDACIÓN REAL MADRID». La foto WCH a sangre aparece en el panel de imágenes (`t.assets` → `BrandKits.defaults().assets`).
- Paleta por roles (`modules.js`): nuevos roles `C.title`, `strong`, `link`, `button`, `buttonText`, `franjaText`, `franjaBg`, `line`, `contactBg`, `band`, que antes eran siempre el color principal (o blanco/gris). `t.theme` puede separarlos, y además `body` (texto `#000000`), `grey`, `soft` y `bg` (fondo exterior del email). Se resuelven al final de `K.build`, antes del cambio de principal/acento, y solo si no hay brand kit aplicado. WCH: títulos, negritas y enlaces negros; botón dorado con texto negro; subheader carbón `#1F1F1F` con texto blanco; banda de datos carbón; cajas y contacto `#F8F5EF`; líneas `#EAE5DA`; texto `#2B2B2B`; grises `#9A9A9A`; fondo blanco.
- Comprobado que el HTML de las otras 18 secciones con las 7 recetas (escritorio y vista previa, 266 combinaciones) es idéntico byte a byte al anterior; solo cambia `rmf-wc`.
- Campos de Cvent: añadidos a `K.CVENT_FIELDS` los del kit (`{[C-LAST NAME]}`, `{[E-TITLE]}`, fechas/horas con formato, `{[E-TIME ZONE]}`, `{[E-ADDRESS]}`, `{[C-PAYMENTS]}`, `{[C-QRCODE_LINK]}`, wallets y `{[E-RSVP YES LINK]}`). Nueva comprobación para todas las marcas: error si `{[E-RSVP YES LINK]}` o `{[E-MODIFY REG LINK]}` está dentro de otro enlace (HTML, `[texto](…)` o campo de enlace). Ninguna receta existente da falso positivo.

Pendiente o fuera del modelo actual:
- Contacto de WCH: el kit pide «Contacto + firma» pero no indica email ni custom field; sigue «CONTACTO PENDIENTE» (error en revisión).
- Componentes del kit que no existen como módulos: caja «Step» con etiqueta de deadline, tarjetas «At a glance» (2 carbón + 1 blanca), timeline, dos cajas de deadline, tres fotos de 182 px, CTA con borde dorado, botón carbón, aviso «Important», etiqueta dorada y subrayado dorado para palabras urgentes, badges de Apple/Google Wallet (sus imágenes están en cvent-assets.com, no en custom.cvent.com). Las cajas de información y contacto existentes ya salen con fondo `#F8F5EF` y borde dorado.
- Tipografía: tamaños y pesos del kit (H1 Georgia 32/40 bold, intro 15/25…) no se aplican; se mantienen los tamaños del generador y los titulares en mayúsculas, que el kit no pide.
- No probado en Cvent ni en clientes de correo.

Pruebas: `test/brand-kits.test.js` añade WCH (solo colores de la paleta, título, header, banner, subheader carbón con texto blanco, fondo blanco, sin fuentes web, negrita y enlace negros, sin error de franja, foto en el panel, RSVP dentro de enlace como error y suelto como válido) y actualiza la prueba antigua que esperaba WCH pendiente. Pasan todas las suites; `test/test.js` mantiene la diferencia BASE conocida. Vista previa en el navegador integrado con contenido sintético: header, subheader, título, banda de datos, lista con bullets dorados, caja de información, contacto y banner final.

## Componentes del kit de World Challenge como bloques (2026-11-12)

A petición del usuario se crean los componentes del brand kit WCH que faltaban. Son módulos nuevos de `js/modules.js`, disponibles para todas las marcas (paleta «Añadir bloque», descripciones en `BLOCK_INFO` de `app.js`), con colores por rol: dorado = principal, carbón = `C.band`, fondo suave = `SOFT`, texto oscuro = `C.title`.

- `step` (S): caja suave con borde izquierdo, etiqueta pequeña, título de caja, etiqueta de fecha límite, texto y botón opcional.
- `glance` (G): «At a glance», tres tarjetas de 180 px (dos oscuras y una clara con borde), esquinas 8 px.
- `timeline` (T): hasta cuatro hitos; columna oscura de 120 px y cuerpo suave. En móvil sigue en dos columnas.
- `deadlines` (L): dos cajas de fecha límite con borde de 2 px (277 + 16 + 277 px, no 285 + 285, para dejar separación).
- `fotos3` (Q): tres fotos de 182 px con esquinas de 6 px; admite placeholder y el panel de imágenes (solo la primera foto recibe el arrastre sobre la vista previa).
- `cta` (R): caja blanca con borde de 2 px, título, texto, línea con campo de Cvent suelto (p. ej. `{[E-RSVP YES LINK]}`) y botón opcional.
- `boton` (U): botón suelto de 190 px, estilo principal (dorado) u oscuro (carbón).
- `important` (V): caja oscura con etiqueta «IMPORTANT» y texto blanco (enlaces y negritas en blanco).
- `wallet` (W): badges oficiales de Apple/Google Wallet (cvent-assets.com, 48 px de alto) enlazados a `{[C-PASSBOOK_LINK]}` y `{[C-GOOGLEWALLET_LINK]}`.
- En móvil, las tarjetas, cajas, fotos y badges se apilan (`col2`; la tarjeta va en una tabla interior para conservar su relleno).
- Texto: `==etiqueta==` (fondo del color principal, texto según `buttonText`, negrita) y `++subrayado++` (negrita con subrayado del color principal), solo fuera de etiquetas y enlaces. Barra de formato de la vista previa con «Etiqueta» y «Subrayar»; `toMarkdown` y `cleanLine` las reconocen para que editar en la vista previa no las pierda. README actualizado.
- Roles nuevos sin cambio para las demás marcas: `titleCase` (mayúsculas de titulares), `headWeight` (peso de las fuentes de titular) y `btnRadius` (esquinas del botón). WCH: titulares sin mayúsculas, en negrita, y botones con esquinas de 4 px.

Comprobado: el HTML de las 18 secciones no WCH con las 7 recetas sigue idéntico byte a byte. `test/brand-kits.test.js` añade los nueve módulos en WCH y Surf Cup (sin roles sin resolver ni errores salvo el contacto, wallets, solo paleta WCH, Important carbón con etiqueta dorada y enlace blanco, botón de 4 px, títulos sin mayúsculas, Surf Cup con su color) y las marcas de texto (sin tocar enlaces). Pasan todas las suites. En el navegador integrado (datos sintéticos): newsletter WCH con todos los bloques en escritorio y móvil (apilado sin desbordamiento), edición en la vista previa de un bloque Step con la barra (Etiqueta aplicada y guardada) y de un párrafo con `==…==`/`++…++` sin perder las marcas.

Pendiente: contacto de WCH (sin email ni custom field), tamaños exactos de la tipografía del kit (se aplican peso y mayúsculas, no los px), y prueba en Cvent y clientes de correo (en especial alturas iguales de tarjetas y esquinas en Outlook, que no admite `border-radius`).

## Corrección: editar el kit de una marca no se guardaba (2026-11-12)

Problema del usuario: al cambiar un footer en Brand kits y guardar, aparecía «guardado», pero al cerrar el diálogo o volver a la marca seguía el footer anterior.

Causa: las entradas «Copiar un kit de torneo» no eran los kits de las marcas, sino plantillas. Al pulsarlas se rellenaban siempre con el diseño fijo de `brands.js` (`B.defaults`), y «Guardar kit» creaba un kit independiente nuevo en «Tus kits». La marca y sus newsletters («Kit automático del torneo») no cambiaban nunca.

Corrección:
- `brand-kits.js`: un kit puede tener `base` (id de la marca/sección). Se guarda con id fijo `brand-<id>` (uno por marca), `B.brandKit(id)`, `B.brandDraft(id)` (el editado o, si no hay, el diseño de la app con `base`), `B.custom()` (solo independientes) y `B.remove(id)`. `B.forState(st)`: la copia aplicada a la newsletter manda; si no tiene, usa el kit editado de su marca.
- `modules.js`: con el kit editado de la propia marca se conserva la paleta por roles (`theme`), así WCH editado mantiene su estilo. La revisión indica «Kit de la marca editado en este navegador».
- `brand-kits-ui.js`: la barra lateral pasa a «Kits de cada marca» (con «· editado» cuando hay cambios) y «Tus kits independientes». En el kit de una marca: aviso de que se aplica a sus newsletters con el kit automático en este navegador, asociación bloqueada, «Guardar como kit independiente» y «Volver al diseño original». «Gestionar brand kits» desde el editor abre directamente el kit de la marca de esa newsletter. El selector de kit del editor solo lista kits independientes.
- `app.js`: al guardar o restaurar un kit se repinta la vista previa de la newsletter abierta.

Límites: el kit editado vive en el navegador (`kaptiva-newsletters-brand-kits-v1`); no llega a otros PMs ni cambia `brands.js`. Los kits que el usuario guardó antes desde «Copiar un kit de torneo» siguen como kits independientes y no afectan a la marca: hay que repetir el cambio en «Kits de cada marca». Las newsletters con una copia de kit aplicada (selector «… · copia aplicada») no cambian.

Pruebas: `test/brand-kits.test.js` añade borrador de marca, guardado con id fijo y un solo kit por marca, persistencia tras recargar, footer editado en la newsletter de esa sección y no en otras, prioridad de la copia aplicada, WCH editado con su estilo y restauración al original. Pasan todas las suites y el HTML sin kits editados sigue idéntico. En el navegador integrado: cambiar el footer de Fundación Real Madrid · USA CAMPS, guardar, cerrar, recargar y volver a entrar conserva el cambio («· editado»); la newsletter de esa sección muestra el footer nuevo; «Gestionar brand kits» desde el editor abre ese kit, y «Volver al diseño original» restaura el footer en la vista previa al momento.

### Seguimiento: editar no debe crear kits (2026-11-12)

El usuario seguía viendo kits independientes nuevos al editar. Además de las copias creadas antes de la corrección anterior, quedaban dos trampas en `brand-kits-ui.js`: al abrir Brand kits desde el inicio se mostraba por defecto el formulario de un kit nuevo vacío (`B.empty()`), y «Descartar cambios» sobre un borrador sin guardar volvía a ese formulario. Cambiar el footer ahí y guardar creaba un kit nuevo.

- Al abrir sin contexto se muestra el kit de la primera marca (o el último abierto); nunca un kit nuevo. «Descartar cambios» vuelve al kit de la marca, al kit guardado o a la primera marca.
- Solo crean kits: «＋ Nuevo kit independiente», «Duplicar» (en kits de marca: «Duplicar como kit independiente») e «Importar kit». El botón de guardar dice «Crear kit» en un kit nuevo y «Guardar cambios» en uno existente o de marca; un kit nuevo muestra un aviso de que se añadirá a «Tus kits independientes».
- Nuevo «Eliminar kit» (con confirmación) en los kits independientes, para limpiar las copias antiguas. Las newsletters que ya tenían una copia aplicada la conservan.

Pruebas: `test/brand-kits.test.js` añade editar una marca dos veces sin crear kits, editar un independiente sin duplicarlo y eliminarlo. En el navegador integrado (biblioteca vacía): al abrir aparece «Kit de Surf Cup 2026 / Guardar cambios»; dos guardados dejan solo `brand-surfcup`; «Nuevo kit» → «Crear kit»; crear y editar dejan un único kit; Duplicar añade uno y Eliminar lo quita.

## Imágenes y banners del brand kit por separado (2026-11-12)

Problema del usuario: en las imágenes del editor salían el header y el footer de Bayern en newsletters de otra marca. Causa: `U.images` añadía todos los kits guardados (`B.all()`), y desde la corrección anterior eso incluye los kits editados de cada marca (`brand-bayern`). Ahora solo se ofrecen el kit de la newsletter y los kits independientes (`B.custom()`).

Después, a petición del usuario, «Imágenes» queda solo para fotos y hay un apartado aparte, «Banners del brand kit», para el header, el footer, el banner de Media Packages y otros gráficos recurrentes:
- `brand-kits.js`: nueva lista `banners` (hasta 30, misma validación que `assets`; los kits guardados sin ella siguen siendo válidos). `B.groups(kit)` devuelve `{ banners: [header, footer, mediaBanner, ...banners], fotos: assets }`. `B.defaults` lee `t.banners` si una marca los define en `brands.js` (ninguna lo hace todavía).
- `brand-kits-ui.js`: el gestor muestra «Banners del brand kit» (header, footer, media y «＋ Añadir banner») e «Imágenes (fotos para los bloques)». `U.images` marca cada recurso con `group: 'foto' | 'banner'`; el selector «Elegir del brand kit» los muestra en dos apartados.
- `index.html` / `app.js` / `app.css`: el panel del editor («Imágenes y banners del brand kit») tiene dos filas: Imágenes (con el placeholder) y Banners. Los dos se pueden arrastrar a cualquier campo de imagen.

Pruebas: `test/brand-kits.test.js` añade la separación (las fotos no incluyen header/footer/media), kits sin `banners` y el límite de 30. Las suites pasan; `test/test.js` mantiene el `igual: false` conocido, sin cambios respecto a antes. En el navegador integrado (`http://127.0.0.1:8781`, datos sintéticos): el gestor muestra el apartado de banners y «＋ Añadir banner» crea «Banner 1»; en una newsletter de Surf Cup, Imágenes solo tiene el placeholder y Banners tiene header, footer y Media Packages; el selector de RMF WC separa la foto WCH de su header y su footer. No probado: Firefox/Safari.

## Corrección: «⠿ Mover» de la vista previa no arrastraba (2026-11-12)

Problema del usuario: el botón Mover de la barra flotante de la vista previa no dejaba mantenerlo pulsado y arrastrar.

Causas (`app.js`, `enhancePreview`):
- El asa era un `<button draggable>`: los navegadores no inician el arrastre desde un botón (no llegaba a dispararse `dragstart`). Ahora es un `<span role="button" draggable>` con `cursor: grab`.
- Con el botón del ratón pulsado, el `mousemove` del documento recolocaba la barra sobre el bloque bajo el cursor. Chrome busca el elemento arrastrable en el punto donde se pulsó, y ya no encontraba el asa. Ahora la barra no se mueve mientras haya un botón pulsado (`event.buttons`).
- La barra se ocultaba dentro de `dragstart`; ocultar el origen ahí puede cancelar el arrastre en Chrome. Ahora se oculta en el siguiente tick.

Pruebas: suites sin cambios (`test/test.js` mantiene el `igual: false` conocido). En el navegador integrado (`http://127.0.0.1:8782`, receta Anuncio, datos sintéticos), un arrastre real con el ratón desde «⠿ Mover» dispara `dragstart` → `drop` y el bloque queda en la posición de la línea de inserción (dos pruebas, hacia abajo). No probado: Firefox/Safari, ni arrastrar hacia arriba con desplazamiento automático.

## Deshacer (Ctrl/⌘ + Z) e historial de versiones (2026-11-12)

Pedido por el usuario: deshacer la última acción con Ctrl+Z y un historial de versiones en cada newsletter.

- `js/history.js` (nuevo, sin dependencias): `K.History.undoStack()` guarda el contenido anterior a cada cambio. Lo escrito seguido (menos de 700 ms entre cambios) es un solo paso. `boundary()` hace que la siguiente acción (mover, añadir, quitar, duplicar, editar en la vista previa…: todo lo que llama a `renderSections`) sea un paso propio, y lo que se escriba después, otro. Límite de 100 pasos, en memoria: se vacía al abrir otra newsletter o si otra pestaña la cambia. Versiones: `list/add/find/remove/removeAll/autoDue` sobre `localStorage`, con un máximo de 20 automáticas y 30 guardadas a mano por newsletter. Si el navegador se queda sin espacio, se borran automáticas antiguas de cualquier newsletter, nunca las guardadas a mano; si aun así no cabe, se avisa.
- `app.js`: `persist()` registra el paso y, si toca, una versión automática con el contenido anterior al cambio (al primer cambio y después cada 10 minutos de trabajo; no repite una idéntica a la última). Ctrl/⌘+Z deshace; Ctrl/⌘+Shift+Z o Ctrl+Y rehace, también con el foco en la vista previa o en los campos del editor (sustituye al deshacer nativo del campo para que sea siempre el de la newsletter). No actúa con un diálogo abierto, en el editor de código ni mientras se edita un texto en la vista previa (ahí funciona el deshacer del navegador). Antes de deshacer aplica lo que se esté escribiendo. Mensaje breve abajo («Deshecho», «No hay nada más que deshacer»…).
- Botón «Historial» en la barra superior del editor: guardar la versión actual con nombre opcional, lista (más reciente primero) con fecha, tipo y número de bloques, vista previa de cada versión, «Restaurar» y «Eliminar». Restaurar guarda antes una versión «Antes de restaurar…» (salvo que ya coincida con la última) y se puede deshacer con Ctrl/⌘+Z.
- Al eliminar una newsletter en el hub también se elimina su historial.

Límites: el historial vive en este navegador (no viaja con «Exportar proyecto» ni llega a otras personas). Deshacer no restaura qué bloques estaban desplegados ni el foco del campo en el que se escribía.

Pruebas: `test/history.test.js` (nuevo) y las suites existentes pasan (`test/hub.test.js` carga ahora `history.js`); `test/test.js` mantiene el `igual: false` conocido. En el navegador integrado (`http://127.0.0.1:8784`, datos sintéticos) con teclado real: escribir el nombre y pulsar ⌘Z lo deshace de una vez; un segundo ⌘Z quita la receta; ⌘⇧Z dos veces lo rehace todo; mover un bloque con ↓ y pulsar ⌘Z con el foco en la vista previa lo devuelve a su sitio; guardar una versión con nombre, verla en la vista previa del diálogo, restaurar la automática (0 bloques) y deshacer la restauración con ⌘Z. No probado: Ctrl+Z en Windows, Firefox/Safari ni el caso de quedarse sin espacio en un navegador real.

## «Bloque nuevo» sin tipo: cruz para quitarlo (2026-11-12)

Problema del usuario: costaba quitar un bloque recién añadido que aún no tenía contenido. Era el «Bloque nuevo» que aparece al pulsar «+» en la vista previa antes de elegir su tipo: no tenía la barra flotante (no es un bloque de `state.sections`) y solo se quitaba con la × de la paleta, en el panel derecho.

- `app.js` (`enhancePreview`): ✕ oscura arriba a la derecha del «Bloque nuevo», con el mismo estilo que la barra de los demás bloques, que lo quita y cierra la paleta (`closePalette`). Se recoloca con `placePlus` al cambiar el tamaño.
- Escape también lo cancela, tanto con el foco en la vista previa (si no se está editando un texto) como en el editor (si no hay un diálogo abierto).

Pruebas: `test/hub.test.js` pasa. En el navegador integrado (`http://127.0.0.1:8785`, datos sintéticos): «+» entre bloques → aparece «Bloque nuevo» con la ✕; un clic real en la ✕ lo quita, cierra la paleta y deja los 6 bloques intactos; Escape con el foco en la vista previa hace lo mismo.

## Producto con precio: de 1 a 8 opciones (2026-11-12)

Pedido por el usuario: en «Producto con precio» las opciones con precio iban siempre de dos en dos (con una sola no se mostraban y la revisión avisaba, y no se podía poner una tercera). Ahora se empieza con una, «＋ Añadir otra opción» suma más hasta 8, y el resultado es responsive.

- `modules.js`: campos `p1_*` … `p8_*` (`title`, `price`, `text`). `d.pkN` guarda cuántas se ven en el editor; `K.pkCount` usa el mayor entre `pkN` y la última opción rellenada (las newsletters antiguas con dos opciones muestran dos). `K.pkAdd`, `K.pkRemove` (quita una y sube las siguientes) y `K.pkOptions` (las que tienen nombre, en orden). Nuevo tipo de campo `opt` (cabecera «Opción N» con «Quitar») y `more` («＋ Añadir otra opción», oculto con 8).
- `twoCards` pasa a ser `cardGrid(cards)`: en escritorio, filas de dos tarjetas con 16 px entre filas; una tarjeta sola o la última de un número impar ocupa todo el ancho. En móvil, todas apiladas (la misma técnica `desk-only`/`mob-only` de antes). Con exactamente dos tarjetas el HTML es idéntico byte a byte al anterior: se comprobó en todas las recetas y torneos, y con datos antiguos de dos opciones. «Dos tarjetas de igual altura» no cambia.
- Revisión: desaparece el aviso «van de dos en dos». Avisa si una opción tiene precio o texto pero no nombre (no se muestra).
- `app.js`: el formulario pinta las cabeceras «Opción N» con «Quitar» y el botón «＋ Añadir otra opción», que lleva el cursor al nombre de la nueva opción.

Pruebas: `test/producto.test.js` (nuevo) y las suites existentes pasan; `test/test.js` mantiene el `igual: false` conocido. En el navegador integrado (`http://127.0.0.1:8786`, receta «Venta de varios servicios», datos sintéticos) con clics y teclado reales: al principio solo se ve la Opción 1; tres opciones → en escritorio dos en fila y la tercera a todo el ancho, en «Móvil» las tres apiladas; «Quitar» en la opción 2 sube la 3. No probado: rendering en Outlook, Gmail ni otros clientes de correo reales.

### Seguimiento: diseño responsive según el número de opciones (2026-11-12)

Pedido por el usuario: una sola opción con el precio en el borde derecho y el texto debajo; tres opciones cortas en una fila de tres; cuatro en rejilla 2×2.

- `modules.js`: `optionCards(cs)` sustituye a `cardGrid` en Producto. `K.optionRows` decide las filas: 1 → una ancha; 2 → el HTML de siempre (`cardGrid`, idéntico byte a byte); 4 y 8 → filas de dos; 3, 5, 6 y 7 con textos cortos (nombre ≤ 22, precio ≤ 12 y texto ≤ 140 caracteres sin formato) → filas de tres, sin dejar una sola al final (5 → 3+2, 7 → 3+2+2); con textos largos → filas de dos y la última impar ancha. Una tarjeta sola en su fila usa `wideCard`: nombre a la izquierda, precio en una píldora en el borde derecho y el texto debajo (también en móvil). Cada fila es su propia tabla dentro de la tabla `desk-only`; en móvil siguen todas apiladas.
- El ancho de cada celda descuenta su padding y el borde (143 px con tres por fila, 233 px con dos), para que la fila no supere los 570 px. Un primer intento con `table-layout:fixed` se salía del ancho del email en la vista previa; se corrigió así.

Pruebas: `test/producto.test.js` cubre 1, 2, 3 (corta y larga), 4, 5, 7 y 8 opciones; las demás suites pasan y las recetas generan el mismo HTML que antes. En el navegador integrado (`http://127.0.0.1:8787`, datos sintéticos): 1 opción con el precio a la derecha, 3 en fila, 4 en 2×2, y en «Móvil» todas apiladas, sin desbordamiento horizontal (`scrollWidth` igual al ancho de la vista) en escritorio ni en móvil. No probado: Outlook, Gmail y otros clientes de correo reales.

## Catálogo de bloques mínimos · fase 1: «Tarjetas» de 1 a 8 (2026-11-12)

Propuesta aprobada por el usuario: pasar de 21 bloques a 13 piezas mínimas que se combinan (publicada como página privada «Catálogo de bloques mínimos», https://claude.ai/artifact/CiKeVKLzeVVjvoGExs7im9). Decisiones tomadas con las opciones recomendadas: las newsletters existentes no se convierten (los bloques antiguos se siguen pintando igual, solo desaparecen de la paleta); la imagen junto al texto se conservará como opción de Imagen; la receta de la BASE (ref1) mantiene los bloques antiguos. Fases pendientes: 2) Título, Texto, Lista, Botón e Imagen 1–3 con espaciado automático; 3) Caja; 4) Banda de datos y Timeline repetibles; 5) paleta con esquemas, recetas e instrucciones de ChatGPT; 6) «Convertir» bloques antiguos.

Fase 1 hecha:
- `modules.js`: `K.repeat(cfg)` generaliza los grupos «de 1 a N, con ＋ Añadir otro» (contar, añadir, quitar subiendo los siguientes, elementos con título, campos del editor y aviso de revisión). Las opciones de Producto lo reutilizan (`K.pkCount`, `K.pkAdd`, `K.pkRemove`, `K.pkOptions` siguen existiendo); su HTML no cambia.
- Bloque nuevo `cards` («Tarjetas»): de 1 a 8 (`c1_*` … `c8_*`, `d.cN`). Cada tarjeta: título (obligatorio solo en la primera), precio, etiqueta, estilo (clara con borde u oscura con el color de banda), texto, botón y enlace. Usa las mismas filas que Producto (`K.optionRows`): 1 ancha con el precio a la derecha y el botón a la izquierda; 3, 5, 6 y 7 cortas en filas de tres; 4 y 8 en filas de dos; móvil apilado. Si alguna tarjeta de una fila tiene botón, la fila se divide en cuerpo y botón para que los botones queden alineados abajo. En la tarjeta oscura los textos y enlaces van en blanco y el botón en blanco con el texto en color de título. `cardBody` y `wideCard` aceptan `dark`; sin él generan lo mismo que antes.
- «Dos tarjetas de igual altura» pasa a «Dos tarjetas (antiguo)»: fuera de la paleta y de las instrucciones de ChatGPT, con una nota en el panel; las newsletters que lo usan, la revisión y el importador lo siguen aceptando. At a glance y Dos fechas límite siguen en la paleta hasta que exista el bloque Título (fase 2), porque llevan título de sección.
- La receta «Anuncio» usa ahora «Tarjetas» con dos tarjetas; es la única receta cuyo HTML cambia. Las instrucciones de importar y de guion hablan de `cards`.
- Revisión: tarjeta con contenido pero sin título, y botón sin enlace (o al revés) en cada tarjeta.
- Vista previa: el recuadro de selección (`.ksa-box`) usa `box-sizing: border-box`; antes sobresalía 4 px y daba scroll horizontal en móvil.

Pruebas: `test/cards.test.js` (nuevo); `test/hub.test.js` añade el bloque desde la paleta y comprueba que el antiguo no aparece; el resto de suites pasan. Todas las recetas salvo «Anuncio» generan el mismo HTML que antes en los 19 torneos y secciones. En el navegador integrado (`http://127.0.0.1:8788`, datos sintéticos): «Tarjetas» desde la paleta empieza con una; con tres (una oscura con etiqueta y botones en dos) salen en fila con los botones alineados; en móvil, apiladas y sin desbordamiento horizontal. No probado: Outlook, Gmail y otros clientes reales.

## Catálogo de bloques mínimos · fase 2: Título, Texto, Lista, Botón e Imagen (2026-11-12)

Regla acordada con el usuario (le preocupaba perder el resultado actual): cada pieza nueva, usada para lo mismo que un bloque antiguo, genera EXACTAMENTE el mismo HTML. `test/pieces.test.js` lo comprueba en los 19 torneos y secciones; solo se ignoran los comentarios internos `<!-- [n] TIPO -->`, que no se ven.

- `modules.js`, piezas encadenadas: Título, Texto, Lista y Botón seguidos y con la misma alineación se montan en UNA celda (`K.flowGroups`, `K.flowCell`) con el espaciado de los bloques antiguos. Equivalencias: Título principal (+ Texto) (+ Botón) = «Título centrado»; Título saludo + Texto = «Texto / Intro»; Texto solo = Intro sin saludo; Título sección + Lista = «Título + lista»; Título entre dos líneas (+ Texto) = «Cierre»; Botón solo = «Botón suelto» (190 px, dorado u oscuro). Reglas: un Título siempre abre celda; tras un Botón, celda nueva; el Botón solo se une a una celda que empieza con un Título principal; una alineación distinta o cualquier otro bloque corta la celda. Márgenes de la celda: arriba según la primera pieza y abajo según la última (`flowPad`).
- Bloques nuevos: `title` (texto, estilo principal/sección/saludo/entre dos líneas, alineación), `text` (texto, alineación: como el título de encima o izquierda), `list` (puntos), `button` (texto, enlace, estilo, alineación) e `images` (1 a 3 con `K.repeat`: 1 = «Imagen» antiguo a sangre o con márgenes, 3 = «Tres fotos en fila», 2 = dos de 279 px que se apilan en móvil).
- «Tarjetas» usa el margen de «Dos tarjetas» y, con dos tarjetas claras, su mismo HTML. Sin ningún título todavía pinta los recuadros vacíos (como el antiguo), para poder verlos y pulsarlos.
- Paleta: Título, Texto, Lista, Imagen, Botón y Tarjetas sustituyen a Intro, Título centrado, Título + lista, Cierre, Imagen, Tres fotos y Botón suelto (`K.LEGACY`), que pasan a «(antiguo)» con una nota en el panel; se siguen pintando, revisando e importando. Siguen en la paleta: Banda de datos, Banda informativa, Producto (hasta que exista la imagen junto al texto), Separador, Compra, Contacto, Step, At a glance, Timeline, Fechas límite, CTA, Important y Wallet (fases 3 y 4).
- Recetas: todas salvo la de la BASE usan las piezas nuevas y generan el mismo HTML que antes de la fase 1 (comparado en todos los torneos). Instrucciones de importar y de guion: piezas (`title` con estilo, `text`, `list`, `button`, `images` con `f1_src`…) y su reparto.
- Vista previa: cada pieza de una celda va en su propio `<div data-ksa-section>`, así que se selecciona, se edita, se mueve y se borra por separado. Un «Bloque nuevo» entre dos piezas las separa solo en la vista previa.

Pruebas: `test/pieces.test.js` (nuevo); `cards`, `hub` y `brand-kits` adaptados al catálogo nuevo; todas las suites pasan y `test/test.js` mantiene el `igual: false` conocido. En el navegador integrado (`http://127.0.0.1:8789`, datos sintéticos): Título + Texto + Botón desde la paleta se ven como el antiguo «Título centrado», en una sola celda con tres piezas seleccionables; la ✕ de la barra flotante quita solo el Texto y Título + Botón conservan el margen 34/36. No probado: Outlook, Gmail y otros clientes reales (el HTML es el mismo que antes en las combinaciones equivalentes).

## Catálogo de bloques mínimos · fase 3: «Caja» (2026-11-12)

Misma regla: la Caja usada para lo mismo que un bloque antiguo genera exactamente su HTML (`test/pieces.test.js`, 19 torneos y secciones).

- `modules.js`: bloque `box` («Caja») con estilo suave, con borde u oscura; cada estilo muestra solo sus campos (suave: etiqueta, fecha límite, título, texto y botón; con borde: título, texto, línea con enlace de Cvent y botón; oscura: etiqueta y texto). Equivalencias: suave solo con texto = «Banda informativa»; Título de sección + Caja suave solo con texto = la banda con título (se montan en una celda, con el título en el orden de estilos de la banda antigua); suave con etiqueta, título, fecha o botón = «Step»; con borde = «Llamada a la acción»; oscura = «Important» (sin etiqueta pone IMPORTANT, como el antiguo). Tras una Caja empieza celda nueva.
- Banda informativa, Step, Llamada a la acción e Important pasan a «(antiguo)» (`K.LEGACY` → `box`), fuera de la paleta; se siguen pintando, revisando e importando. La receta «Recordatorio» usa la Caja y da el mismo HTML que antes. Las instrucciones de ChatGPT reparten avisos, pasos, llamadas a la acción e Important en `box` con su estilo.
- Revisión: botón sin enlace (o al revés) en la Caja; dos Cajas suaves de texto seguidas avisan como dos bandas informativas.
- Siguen en la paleta: Banda de datos, Producto (aviso incluido), At a glance, Timeline, Dos fechas límite (fase 4 o pendientes de equivalencia exacta), Separador, Compra, Contacto y Wallet.

Pruebas: nuevas equivalencias en `test/pieces.test.js` (suave, suave con título encima, Step, CTA, Important y una newsletter mixta) y reglas de encadenado de la Caja; todas las suites pasan y todas las recetas salvo la de la BASE dan el mismo HTML que antes de la fase 1. En el navegador integrado (`http://127.0.0.1:8790`, datos sintéticos): Título de sección + Caja suave, Caja con borde con botón y Caja oscura se ven como los bloques antiguos; cada estilo muestra solo sus campos; sin desbordamiento horizontal.

## Ocultar y mostrar bloques con el ojo (2026-11-12)

- Cada bloque tiene un ojo en el panel de la derecha (entre ↓ y ⧉) y en la barra flotante de la vista previa. Ocultar no borra: marca la sección con `hidden: true`, que se guarda con la newsletter y entra en deshacer y en el historial de versiones.
- **Email** (copiar, descargar, código, comparar): un bloque oculto no sale; el HTML es exactamente el mismo que si el bloque no existiera, también cuando separa piezas que se encadenan en una celda (`K.build` agrupa solo los visibles con `K.flowGroups`).
- **Vista previa**: en su sitio queda una tira fina «Oculto: <bloque> · no sale en el email» con `data-ksa-section` de su índice real, para seleccionarlo, moverlo, borrarlo o volver a mostrarlo (en la barra, «👁 Mostrar»). La tira no se edita. El «Bloque nuevo» pendiente respeta el orden con los ocultos.
- **Panel**: la tarjeta del bloque oculto se ve atenuada, con el nombre tachado y el ojo tachado.
- **Revisión**: avisa «Hay N bloques ocultos: no salen en el email» (y si están todos ocultos) y no revisa su contenido; los números de módulo siguen siendo los del panel.
- Prueba: `node test/hidden.test.js` (oculto = quitado en el HTML, tira e índices en la vista previa, orden con el bloque nuevo, revisión). Comprobado en el navegador: ocultar y mostrar desde el panel y desde la vista previa. El resto de suites pasan y las recetas generan el mismo HTML que antes.

## Catálogo de bloques mínimos · fase 5 (parte visual): esquemas en vez de letras (2026-11-12)

- Nuevo `js/block-icons.js` (cargado después de `modules.js`): `K.BLOCK_ICONS` y `K.blockIcon(id)` con un esquema SVG (placeholders: líneas de texto, título, imagen, botón, tarjetas, cajas…) para los 29 bloques, también los antiguos. Solo interfaz: no cambia el HTML del email.
- **Paleta**: cada bloque es una ficha con su esquema grande arriba, el nombre y la descripción. **Panel de bloques**: la letra de cada tarjeta pasa a ser una miniatura del esquema (atenuada si el bloque está oculto). Si un bloque no tuviera esquema, sale la letra de antes.
- Recetas e instrucciones de ChatGPT con las piezas nuevas ya se hicieron en las fases 1 a 3.
- Prueba: `node test/icons.test.js` (los 29 bloques tienen esquema y el email no cambia). Comprobado en el navegador: paleta y panel.
- **Sigue pendiente**: fase 4 (Banda de datos de 1 a 4 y Timeline de 1 a 8, con el mismo HTML en lo antiguo; At a glance y Dos fechas límite solo se retiran si Tarjetas los reproduce igual) y fase 6 (botón «Convertir» de bloques antiguos, opcional).

## Catálogo de bloques mínimos · fase 4: Banda de datos y Timeline de 1 a N (2026-11-12)

- **Banda de datos**: de 1 a 4 datos (antes 3 fijos). Empieza con uno y «＋ Añadir otro dato»; cada dato con «Quitar» (sube los siguientes). Con 4 van al 25 % en escritorio; en móvil, uno debajo de otro (clase `data-col` de siempre).
- **Timeline**: de 1 a 8 hitos (antes 4 fijos), con «＋ Añadir otro hito». Solo el primero es obligatorio.
- Mismas claves que antes (`l1`/`v1`…, `d1`/`h1`/`t1`…): las newsletters guardadas y lo importado no cambian. `K.repeat` acepta ahora `cfg.key(n, k)` para claves de bloques existentes y `cfg.more` para el texto del botón; nuevos `K.datosCount` y `K.hitosCount` (contadores en `dN` y `hN`).
- **HTML idéntico**: con datos antiguos (hasta 3 datos, hasta 4 hitos) el email es igual byte a byte que antes en los 19 torneos (133 casos comparados con la versión anterior del módulo) y todas las recetas siguen dando el mismo HTML que antes de la fase 1.
- Instrucciones de ChatGPT (importar y guion): el reparto dice «datos (de 1 a 4)» y «timeline (de 1 a 8)»; la lista de campos sale sola de los campos del bloque.
- **At a glance y Dos fechas límite siguen en la paleta**: «Tarjetas» no los reproduce byte a byte (otra rejilla y otra tipografía de dato), así que, según la regla acordada, no se retiran.
- Prueba: `node test/datos-timeline.test.js`. Comprobado en el navegador: 4 datos en fila en escritorio y apilados en móvil, sin desbordar.
- **Sigue pendiente**: fase 6 (botón «Convertir» de bloques antiguos, opcional).

## Corrección: tarjetas del panel que desbordaban y frase propia en la Caja de compra (2026-11-12)

- **Desbordamiento**: con nombres largos (p. ej. «Caja de compra / registro (campos Cvent)») los botones ↑ ↓ ojo ⧉ ✕ se salían de la tarjeta. Ahora los botones no encogen y van siempre a la derecha; cede primero el resumen y después el nombre, que se corta con «…» (el nombre entero sale al pasar el ratón). Comprobado en el navegador: ningún elemento sale de su tarjeta.
- **Caja de compra · Frase principal**: siguen las dos frases fijas y la tercera opción pasa a ser «Otra (escribe tu frase)», con texto libre. Puede llevar {[E-MODIFY REG LINK]}, un enlace propio [texto](https://…) o **negrita**. Ya no se exige el campo de Cvent: la revisión da error si la frase está vacía y aviso si no tiene ningún enlace.
- HTML: las dos frases fijas y las frases propias ya guardadas (texto llano con el campo de Cvent) salen igual que antes (76 casos comparados en los 19 torneos); el formato solo se aplica a la frase propia.
- Prueba: `node test/compra.test.js`.

## Caja vacía visible en la vista previa (2026-11-12)

- Una Caja suave recién añadida (sin texto, etiqueta, título ni botón) solo era una banda clara casi invisible. Ahora, **solo en la vista previa**, lleva dentro un texto guía gris en cursiva: «Caja vacía · escribe su texto en el panel de la derecha». También cuando va pegada a un Título de sección.
- No rellena el bloque (los datos quedan vacíos) y nunca sale en el email: `K.build` usa una marca interna (`BOX_EMPTY`) solo con `preview` y la cambia por el texto guía al final. Las recetas siguen dando el mismo HTML.
- Prueba añadida en `node test/pieces.test.js`. Comprobado en el navegador.
- Nota: el navegador puede guardar en caché los `.js` antiguos; si un cambio no se ve, recargar sin caché (⌘ + Mayús + R).

## Variantes sacadas de la newsletter de PSG Experiences (2026-11-12)

Se revisó una newsletter de PSG («Essential Pack Information»). Casi todo ya existía (header, franja, Título principal + Texto, At a glance, Timeline, Dos fechas límite, Imagen de 3, Caja con borde, banner final). Lo distinto se añadió como **opciones de las piezas que ya hay**, no como bloques nuevos (regla de bloques mínimos). Todas vienen apagadas: sin tocarlas, el HTML es el mismo de antes (recetas, Banda de datos/Timeline y Caja de compra comparados con la versión anterior: 0 diferencias).

- **Título · estilo «Antetítulo (pequeño, en mayúsculas)»** (`style: 'ante'`): rótulo de 12 px en mayúsculas del color principal (p. ej. «Your week, day by day», «Good to know»). Se encadena con el Texto de debajo en la misma celda.
- **Texto · Tamaño «Pequeño»** (`size: 'small'`): 13/21 px para notas o «good to know». Solo con alineación a la izquierda.
- **Caja suave · Formato «Puntos»** (`fmt: 'puntos'`): una línea, un punto con «•» del color principal (p. ej. «Your reference hotel», «Meals included»). Sirve con o sin título.
- **Timeline · «Texto de los hitos: Puntos»** (`fmt`) y **«Etiqueta bajo la fecha»** por hito (`s1`…`s8`, p. ej. «Arrival», «Training»).
- **Franja · etiqueta derecha (opcional)** (`st.franjaRight`, en «Datos»): sustituye al nombre del torneo o de la marca (p. ej. «November 2026 · Paris»). Se importa desde el JSON como `franjaRight`; las instrucciones de ChatGPT lo explican.
- **Corrección**: con un Título principal alineado a la izquierda, el texto de debajo se colocaba al lado de la barrita (la tabla con `align="left"` flotaba). Ahora la barra va sin `align`. No afecta a lo antiguo (el antiguo «Título centrado» siempre va centrado).
- Prueba: `node test/variantes.test.js`. Comprobado en el navegador recreando la newsletter de PSG, en escritorio y en móvil.

## Estilo de club y guía de composición para ChatGPT (referencia: PSG «Essential Pack», 2026-11-12)

Problema: la newsletter de PSG importada desde el JSON de ChatGPT no se parecía al original. Causas: (1) la app pintaba los clubs con el estilo de los torneos de Kaptiva (títulos grandes en mayúsculas, franja blanca, texto negro); (2) ChatGPT no sabía qué pieza usar (título + lista en vez de caja con puntos, Tarjetas en vez de Dos fechas límite, «Arrival» como título del hito, etc.).

- **Estilo de club** (`K.clubTheme(t)`, con los colores del kit de cada club): franja del color principal con texto blanco (sin línea de acento), títulos sin mayúsculas (principal 32/40, sección 26/32), texto `#444444`, fondos suaves `#F5F7FB`, etiqueta blanca en recuadros oscuros, y el acento en el borde y la etiqueta de los recuadros claros destacados (At a glance, Dos fechas límite, Caja con borde). En móvil, la fecha del Timeline va encima de su texto. Roles nuevos en `C` (`onDark`, `hilite`, `franjaBar`, `h1`, `h2`) con valores por defecto iguales a los de siempre.
- **Quién lo usa**: `st.look`. Las newsletters nuevas (receta, guion o importación) llevan `look: 'auto'` = estilo de club en los clubs (PSG, Arsenal, Bayern, Fundación Real Madrid; no en Kaptiva Sports Academy ni en secciones con estilo propio como WCH, ni en los torneos). Las guardadas antes no tienen `look` y `K.normalize` les pone `'classic'`: **no cambian**. Se puede cambiar en «Más opciones → Estilo de la newsletter».
- **Saltos de línea** (`\n`) en títulos y datos → `<br />` («Your Week in Paris,↵{[C-FIRST NAME:TC]}», «Nov 22 – 28↵2026»).
- **Caja con borde** sin título ya no deja un `<p>` vacío.
- **ChatGPT** (importar y guion): nueva «GUÍA DE COMPOSICIÓN» (qué pieza para cada contenido: glance para datos clave, title ante + timeline con s y puntos para la agenda, box suave con título dentro y puntos para hotel/comidas, deadlines para plazos, ante + texto pequeño para notas, box con borde con título dentro para la pregunta final, franjaRight…) y la newsletter de PSG como **ejemplo de referencia** (`K.REFERENCE_CLUB`).
- HTML con `look: 'classic'`: igual que antes en todas las recetas y torneos (0 diferencias).
- Prueba: `node test/club-style.test.js`. Comprobado en el navegador: la referencia de PSG (escritorio y móvil) frente al original, la misma con Arsenal y Bayern, y el selector de estilo en el editor.
- Pendiente: probar en Outlook/Gmail reales; si hay newsletters de referencia de otros clubs, comparar con ellas.

## Menú lateral ajustable y sin desbordamientos (12/11/2026)

- Ancho inicial 320 px; borde con asa para arrastrar, ajustable entre 240 y 520 px y limitado al 42 % de la pantalla en escritorio. Doble clic restablece 320 px. El separador admite foco, flechas izquierda/derecha, Inicio y Fin, con valor accesible.
- La preferencia `view.treeWidth` se guarda en `kaptiva-newsletters-hub-view-v1`; adaptarse a una ventana menor no sustituye el ancho elegido. Se conserva el plegado a columna estrecha.
- En pantallas de hasta 800 px el menú ocupa el ancho disponible y se despliega con su cabecera; desplazamiento vertical limitado. El estado plegado del escritorio ya no impide desplazarse por el menú móvil.
- Las filas permiten partir nombres largos, mantienen iconos/contadores dentro y limitan la sangría a 42 px incluso con muchos niveles. El contenedor no genera scroll horizontal. Cambios solo en la interfaz, sin tocar el generador de email.
- Comprobado en Chrome real sobre copia en origen local aislado: arrastre 240 → 390 px, persistencia tras recarga, teclado y doble clic, plegado, tamaños de 1280, 801, 390 y 320 px, y 18 carpetas anidadas con nombres largos/palabras sin espacios. Medidas del DOM confirman `scrollWidth === clientWidth` y ningún control/texto/icono fuera del menú en los casos revisados.
- Todas las suites `test/*.test.js`, sintaxis y comparación BASE ejecutadas; la BASE conserva únicamente la diferencia conocida `?d=650`. Añadida prueba del ancho por teclado, sus límites, persistencia y restablecimiento. Capturas en `test/capturas-hub/menu-responsive-escritorio.png` y `menu-responsive-movil.png`.

## Panel derecho ajustable y responsive (12/11/2026)

- Aclaración del usuario: el panel que necesitaba ajustar era el de edición de la derecha. Se mantiene también la mejora del menú izquierdo, aprobada por el usuario.
- Separador con asa en el borde izquierdo del panel derecho: arrastrar cambia su ancho; doble clic vuelve a 470 px. Admite teclado (flechas, Inicio/Fin) y valor accesible. Preferencia `view.editorWidth` independiente de `view.treeWidth`, guardada en la misma clave de vista.
- Ancho de 300 a 720 px, limitado al 60 % del espacio del editor. Un ResizeObserver adapta los límites al abrir una newsletter, redimensionar la ventana o ajustar/plegar el menú izquierdo sin sustituir el ancho preferido.
- Cuando el espacio real de trabajo baja a 760 px, panel y resultado se apilan en dos áreas con desplazamiento propio. Se usan consultas de contenedor: no depende solamente del ancho de pantalla. Dentro del panel, los campos dobles se apilan y las herramientas de los bloques pasan a otra fila por debajo de 380 px. Se permite partir textos largos, se limitan anchos mínimos de campos y se contiene el desplazamiento horizontal de imágenes dentro de su carrusel.
- La barra superior puede repartir sus controles en varias líneas para no forzar desbordamiento en pantallas pequeñas. El HTML exportado de los emails no se modifica.
- Validación real en Chrome, copia aislada en otro origen local: arrastre 300 → 500 px, persistencia al recargar y reabrir, teclado, doble clic, los 16 bloques del catálogo abiertos con panel de 300 px y pantalla móvil de 320 px. Sin controles fuera del panel y `scrollWidth === clientWidth`; sin errores de consola capturados. A 1024 px con menú izquierdo abierto quedan 704 px de trabajo y el editor se apila; a 1100 px conserva columnas, ampliadas al plegar el menú izquierdo.
- Todas las suites `test/*.test.js`, sintaxis de `js/app.js` y comparación BASE ejecutadas correctamente (la BASE mantiene la diferencia conocida `?d=650`). Prueba adicional de teclado, límites según espacio, persistencia, restablecimiento e independencia de ambos anchos. Capturas: `test/capturas-hub/panel-derecho-escritorio.png` y `panel-derecho-movil.png`.

## Recargar sin volver al inicio (12/11/2026)

- La app guarda la ubicación de esta pestaña antes de recargar o salir (`beforeunload`/`pagehide`) y la restaura al terminar el montaje. Usa `sessionStorage`, clave `kaptiva-newsletters-session-v1`, para que cada pestaña mantenga su propia navegación.
- Se restaura la newsletter abierta o ubicación del hub (torneo/sección, club, carpeta), búsqueda/filtros, pestaña de resultado (Vista previa/Revisión/Código), modo escritorio/móvil, comparación, selección de bloque, panel de imágenes/Más opciones y desplazamientos del hub, panel de edición, resultado, textarea de código e iframe. Los bloques abiertos/cerrados ya se guardaban con la newsletter.
- La restauración valida newsletter, torneo, club y carpeta. Si se eliminaron o la sesión es ilegible/no está disponible, vuelve a una ubicación válida sin bloquear la app. Restaurar una newsletter no cambia su fecha de modificación. Se conserva el guardado de contenido antes de recargar. Los diálogos y borradores de código sin aplicar no se restauran como ediciones aplicadas.
- Comprobado en Chrome real con datos aislados: recargar dentro de la carpeta QA Refresh; recargar una newsletter desde Código manteniendo nombre y pestaña; recargar en vista móvil conservando scroll del panel (874 → 874 px); recargar con ventana de 390 px manteniendo newsletter y modo móvil. Captura: `test/capturas-hub/recarga-misma-newsletter.png`.
- Prueba automática adicional: edición inmediatamente antes de recargar, newsletter y fecha, carpeta/filtros/scroll, independencia entre sesiones, destino eliminado y sesión corrupta. Suites `test/*.test.js`, sintaxis y comparación BASE ejecutadas; diferencia conocida `?d=650` conservada. No se toca el generador del email.


## Referencias de estilo por sub-brand · PSG (12/11/2026, análisis previo a implementación)

Objetivo del usuario: cada marca/sub-brand debe tener su propio estilo aplicado automáticamente; eliminar la elección confusa «Automático/Clásico». Se están reuniendo referencias. No se ha cambiado el generador ni migrado newsletters guardadas. Sigue pendiente concretar el tratamiento de las existentes.

### PSG Experiences · decisiones confirmadas

- Las cinco referencias aportadas son válidas: Essential Pack Information, Important Clinic Information, Extra Activities, Flight and Arrival Information y Essential Pack Check-in Information.
- El usuario confirma normalizar al máximo márgenes, jerarquía y piezas para conseguir un estándar coherente.
- Header fijo: `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/2c5043ece01d4a9a8ae79d29943bad1a.png` (presente en cuatro referencias). Descartar como header de Experiences el alternativo de Extra Activities `8a7e3c25ddbb48239a929b9525a9d45a.png`.
- Footer común Experiences: `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/1abe18827cfe4f5e9e62da2599c16442.png`.
- Patrones del HTML: azul #004070, rojo #E30613, cuerpo #444444 y fondos #F5F7FB; título principal 32/40 px, contenidos a 650 px y márgenes habituales de 40 px; cajas informativas con borde lateral, agenda, plazos, hotel con imagen y actividades con precio. Alias PSG/Virage apuntan a los mismos tres archivos de fuente: 2d7daec633b4437d99ea6d638c5bc5a8.ttf (400), 6d0ea52a58b145fe9b8c2077cddba5d6.otf (700 cursiva), f7af6f3c0aeb49dd880cd60fe6a07804.otf (800), bajo el directorio Cvent `/files/`.
- Adjuntos originales (bajo `/Users/agkaptiva/.codex/attachments/<id>/Texto pegado.txt`): cc1db099-767f-405e-8c64-895adbb0b4a5; bd933fec-b261-405e-a0d3-c5ffcdb906d5; 56f64855-0569-400d-8710-8e8c4ea4605b; 24a03a94-51d8-41e2-b271-40a96bd865f3; e306bbd6-220b-4ff4-b591-fda33aa9e454. El segundo contiene texto ajeno al email después de `</html>` (interfaz de ChatGPT/1Password): excluirlo al importar.

### PSG Camps USA · ocho referencias recibidas y analizadas

- Registration Confirmation, Early Drop-Off and Late Pick-Up, 100 Days To Go, 30 Days To Go, 4 Days To Go, 10 Days To Go, Cancellation Confirmation y 2 Days To Go.
- Las ocho comparten el header principal de PSG anterior y un footer propio de Camps: `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c09d6bae9864490ca533ea605b59cb6d.png`.
- Comparten los tres archivos de fuente de Experiences, aunque aquí el peso 800 se llama «PSG UltraBold». Azul #004070, cuerpo #444444, fondos #F5F7FB y rojo #E20613 en los botones Telegram de las referencias; no confundir la pequeña variación de rojo con un modelo distinto. Propuesta pendiente de implementar: base común PSG con reglas específicas de USA Camps, aplicadas por sección.
- Rasgos propios: franja con asunto a la izquierda y PSG Summer Camps a la derecha; fichas compactas etiqueta/valor para datos del camp; botones rojos; banners opcionales de cuenta atrás/Telegram; paneles azules de normas con texto blanco, títulos en mayúsculas e iconos; QR y wallets; información de registro/pagos de Cvent.
- Los banners 100/30/10 Days o Join Telegram son contenido opcional, no estilos alternativos. La referencia 4 Days no obliga a generar un banner «4 días» que no se ha aportado. La de 2 Days tampoco contiene banner de cuenta atrás.
- La confirmación de registro contiene un widget dinámico Cvent y filas Example… de su muestra. No convertir esas filas en datos reales ni reescribir campos dinámicos; preservar los widgets y distinguir la muestra del contenido editorial en la implementación.
- Adjuntos originales, en el mismo directorio base: 14afe77d-2d22-4378-bab7-63f16adb51bc; b99501ba-2f99-4860-b074-7e6caf74f3da; 05366e13-3739-42f0-8339-3aabcc12cee4; 9ca949c5-ea0d-433c-8d00-d351030d63c7; 2f2eb758-432c-4069-8a15-9963561c8b92; 9e134f5d-4af3-4814-9553-210fe8ab0ff2; 01070053-b3a4-426d-9fff-82d9f03f0ec1; 3ddd427c-4cec-4d92-b565-aa98987a34b8.

Análisis basado en el HTML adjunto; estas referencias todavía no se han renderizado ni validado en clientes de correo en esta fase.


### PSG · referencias completas y alcance confirmado (12/11/2026)

- El usuario confirma que PSG Camps USA y PSG Camps Canada tienen el mismo estilo: utilizar las ocho referencias de USA Camps para ambas secciones, sin pedir referencias adicionales de Canada.
- Recopilación de referencias de PSG terminada. Dos estilos de sub-brand a implementar: **PSG Experiences** y **PSG Camps** (compartido por USA/Canada). La sección elegida debe aplicar el estilo correspondiente automáticamente, sin elección «Club/Clásico».
- Se mantienen las decisiones confirmadas para Experiences: cinco referencias válidas, normalización máxima y header principal común a cuatro, descartando el alternativo de Extra Activities. Para Camps se usa el conjunto de ocho referencias ya registrado arriba.
- Este cierre completa la recopilación de PSG; no acredita implementación ni migración de newsletters existentes. El código del generador sigue sin modificarse en esta fase.


## Referencias Arsenal Experiences (12/11/2026, análisis previo a implementación)

- Siete HTML recibidos: Essential Pack Information; Key Reminders · Essential Pack; Extra Activities; Media Packs; dos versiones tituladas Premium Pack Information; Sports Psychology Programme.
- Identidad propia observada: rojo #B4001E, negro #0C0C0C, rojo oscuro #8B0015, fondo suave #FDF5F5 y texto #444444. Titulares Georgia en negrita y cuerpo Helvetica/Arial; no hay declaraciones @font-face en estas siete referencias. Ancho 650 px y márgenes habituales de 40 px. Franja negra; rojo para etiquetas, énfasis, precios y bordes de cajas. Estos patrones no se deben sustituir por el tema genérico derivado de PSG.
- Piezas presentes: resumen de tres datos, agenda con fecha roja sobre texto claro, cajas de aviso/listas, dos plazos, galerías, fichas de actividades con imagen lateral/fecha/hora/precio, paquete recomendado y opciones de media, hotel con imagen, botones Telegram y acceso a registro Cvent. Son variaciones de contenido dentro de Experiences, no modelos para elegir manualmente.
- Cinco referencias comparten header `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d0dda35e9eef4fc5bc22f768749c292a.png` y footer `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/e1baea18930047838d4054ffe1d0f262.png`.
- Las dos referencias Premium Pack Information usan header alternativo `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/ac1135b0a4bc4aac8346bb9e5a39e43a.png?d=650`, más contenido como banners de 570 px y cierres diferentes. Pendiente confirmar si el header/footer de las otras cinco será el estándar único también para estas.
- Las dos Premium tienen el mismo título pero contenido distinto: una indica que el alojamiento no está incluido y la otra aporta check-in/check-out y lavandería. No deducir prestaciones a partir del título ni fusionar sus textos como si fueran duplicados.
- Algunas imágenes de referencia usan custom links bajo `/files/` además de `/pix/`; conservar ambas rutas. No inventar ni sustituir assets al normalizar el estilo.
- Adjuntos bajo `/Users/agkaptiva/.codex/attachments/<id>/Texto pegado.txt`, en orden de recepción: c7a83a4f-9b69-4f90-9e66-72bacdd91fb9; 97fc4973-a4ab-4286-bac2-6fce2dc42783; d712e250-abac-4a30-b49c-78eb65c94486; 00d62518-4c19-4d82-bad2-dc712b3c9f44; 4df07e1a-dc87-4b7e-be6e-e36bd9b78a35; 66ef2d06-a40e-4250-aa40-deb5cc5da4d6; 9c17a07e-c067-45ba-8f80-0242705f3569.
- Análisis del HTML adjunto, sin renderizado de estas referencias en esta fase ni cambios en el generador. La equivalencia USA/Canada confirmada para PSG no debe suponerse automáticamente para Arsenal.


## Regla de normalización y Arsenal Camps (12/11/2026, referencias completas)

### Regla general confirmada por el usuario

- «Siempre haz un standard basado en la mayoría a menos que diga lo contrario». Aplicar el patrón predominante entre elementos comparables de cada marca/sub-brand (cabecera, pie, fuentes, colores, márgenes y jerarquía). No volver a preguntar por variantes minoritarias cuando la mayoría sea clara.
- La regla normaliza el diseño, no autoriza modificar textos, prestaciones, fechas, precios, enlaces, campos Cvent ni eliminar funciones que solo aparecen en un tipo de envío. Una mayoría de newsletters sin QR, por ejemplo, no elimina el QR de un mensaje de check-in.
- Arsenal Experiences: confirmados como estándar el header `d0dda35e9eef4fc5bc22f768749c292a.png` y footer `e1baea18930047838d4054ffe1d0f262.png`, comunes a cinco de las siete referencias. Cabeceras/cierres alternativos de las dos Premium se normalizarán a este estándar de marca; sus contenidos distintos se conservan.

### Arsenal Camps USA y Canada

- El usuario confirma expresamente que las doce referencias sirven tanto para USA como para Canada. Un único estilo **Arsenal Camps** aplicado automáticamente en ambas secciones.
- Referencias: Registration Confirmation; Registration Modification; Early Drop-Off and Late Pick-Up; Camp Update (cancelación del camp); 100 Days To Go; 50 Days To Go; 30 Days To Go; 15 Days To Go; 10 Days To Go; 4 Days To Go; 2 Days To Go; Access to OnArrival (equipo de trabajo).
- Las doce tienen el header `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d0dda35e9eef4fc5bc22f768749c292a.png`. Once usan footer `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/98f6f8c33f6d4fedb45231509e6f0fc5.png`; Camp Update no contiene imagen de pie. Header/footer mayoritarios quedan como estándar de Camps.
- Patrones: Georgia en negrita para titulares, Helvetica/Arial en texto, sin @font-face externo. Rojo #B4001E, negro #0C0C0C, rojo oscuro #8B0015, fondos suaves #FDF5F5, cuerpo #444444. Ancho 650 px, márgenes interiores habituales 40 px, franja negra con asunto y Arsenal Summer Camp.
- Componentes propios de los ejemplos: fichas compactas etiqueta/valor de registro y camp; servicios y precios; botones Telegram/certificado regalo; banners opcionales de cuenta atrás o Telegram; normas sobre fondo rojo con títulos/texto/iconos blancos; QR, Apple/Google Wallet; listas de instrucciones; acceso OnArrival y enlaces para calendario. El footer difiere del de Experiences aunque comparten header y base tipográfica/cromática.
- Conservar los widgets y campos Cvent de confirmación/modificación sin convertir sus Example… en contenido real. OnArrival es un mensaje para personal, no una receta para familias; conservar el propósito y enlaces específicos sin trasladarlos como valores por defecto a otros emails.
- No generalizar como predeterminados los horarios/precios/Tax ID de una referencia: son contenido de cada envío. Los textos legales/logísticos distintos tampoco se sustituyen por el más frecuente.
- Adjuntos originales bajo `/Users/agkaptiva/.codex/attachments/<id>/Texto pegado.txt`, en orden: 482548e8-f552-4c42-8ddf-52b2c7e0ab1f; 5c5c660d-8bd8-466d-8a28-e56dd818d0af; 612ebfb2-3641-4872-a467-9f5a3ca7613e; a6935e24-0818-4821-a5bc-05efc8078b19; 222c1372-ba00-4373-82a7-68f35fe1235b; 48b44ba8-388c-422e-838f-150ebe86c14e; a6a1d1a8-7cf7-4c37-aec7-ae44b4417185; 5e23adac-eca5-44cb-a959-43d71281e639; 92aafa85-ef17-4680-853e-c8698d8390c0; 9a2ad4db-e6bb-4200-888e-561dd4eae2f3; d9e1d3b3-d688-4930-9786-627e2a39c150; f5f4acb6-c1ae-4df1-aedd-fb140fd97bd7.
- Recopilación de Arsenal completa: **Arsenal Experiences** y **Arsenal Camps USA/Canada**. Análisis basado en HTML, sin renderizado ni cambios del generador en esta fase. La implementación y el tratamiento de newsletters ya guardadas siguen pendientes.


## Real Madrid Foundation Experiences (12/11/2026, referencias)

- Ocho adjuntos recibidos: Essential Pack Information; Premium Pack Information; All-In Pack Information (hotel/Telegram); Essential Pack Information (hotel/Telegram); Schedule & Extra Activities; All-In Pack Arrival Information; Premium Pack Arrival Information; Schedule & Extra Activities. El quinto y octavo son idénticos byte a byte: siete referencias únicas; no dar doble peso a ese diseño al determinar la mayoría.
- Header indicado expresamente por el usuario (prevalece sobre cualquier alternativo): `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0680e31902b84ed88b7a08dcaa246d83.png`. Seis adjuntos ya lo usan. El alternativo de Schedule & Extra Activities (`5b29266273624b748ebbcf23af298a1f.png?d=650`) no será el estándar.
- Footer común a los ocho: `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/6ca9b3ea03a54f20b3e76a29e1bbb500.png` (las dos copias Schedule llevan `?d=620`; conservar el enlace exacto al trabajar con contenido existente, usar el mayoritario sin parámetro como asset predeterminado de marca).
- Patrón mayoritario: azul oscuro #1A1D4F, dorado #BF873C, fondo suave #F6F5F0, cuerpo #444444. Titulares Georgia en negrita (principal 32/40 px), texto Helvetica/Arial, sin @font-face externo. Ancho 650 px, márgenes habituales 40 px. Franja azul, detalles/barras/etiquetas dorados, cajas claras con borde lateral, fechas oscuras con texto blanco y etiquetas doradas.
- Schedule & Extra Activities introduce 30/38 px en el principal, texto #2D2F30, fondo #FDFAF3 y otros cambios menores: normalizar al patrón mayoritario, conservando las piezas de actividades (imagen, descripción, lista de inclusiones, fecha, precio y promoción) cuando procedan.
- Componentes observados: resumen de tres datos, agenda, alojamiento/punto de encuentro, comidas, plazos, galerías de tres fotos, aviso destacado, hotel con imagen, Telegram con enlace y QR, traslados, pasos de llegada/check-in, QR de participante y wallets, horarios como imágenes y fichas de excursiones incluidas/de pago.
- Essential, Premium y All-In son paquetes de contenido dentro de Experiences, no estilos adicionales. No unificar ni deducir prestaciones, fechas, horarios o alojamiento al normalizar el diseño. Mantener literal el contenido y campos Cvent de cada envío. El QR fijo para Telegram y el QR dinámico del participante tienen funciones distintas.
- Esta definición corresponde a Experiences; no inferir todavía el estilo de Camps o RMF World Challenge a partir de estas referencias. Se mantiene la regla general de mayoría salvo excepción expresa.
- Adjuntos bajo `/Users/agkaptiva/.codex/attachments/<id>/Texto pegado.txt`, en orden: a2ef2364-a5cd-49b7-9dc0-2e68fbc06f61; d0deb324-c8e4-4a9e-9e06-7807dd1de531; a613e395-eaee-4477-a3c5-93ca54dabfda; 8e502f1b-7325-459a-a49f-3c5c9709fea7; 8b548e2c-a10b-4b6e-aae0-c50d2bd809ea; 73f66d00-14bb-4453-9dc1-826993fbb4e0; c387645b-0a19-4748-af66-fda8dd2502c9; deb703b1-a214-439c-9e46-16ae8cd9aed0.
- Análisis del HTML adjunto sin renderizado en esta fase. Registradas definición y excepción de header; generador y newsletters existentes sin cambios.


## RMF Camps USA y Canada (12/11/2026, referencias)

- El usuario confirma que RMF USA y Canada comparten estilo; usar este conjunto para ambas secciones automáticamente.
- Trece adjuntos: Camp Cancellation; Summer Camp USA Confirmation; Early Drop-Off & Late Pick-Up (dos copias idénticas); 100, 50, 30, 15, 10, 4 y 2 Days To Go; OnArrival Team Member; Cancellation Confirmation. Doce referencias únicas: deduplicar las copias de servicios antes de ponderar el diseño mayoritario.
- Header común a los trece: `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/0680e31902b84ed88b7a08dcaa246d83.png`. Aunque coincide con el elegido para Experiences, aquí queda confirmado por las propias referencias de Camps.
- Footer estándar mayoritario (doce adjuntos; falta en Camp Cancellation): `https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/db9333ea4c694dcd954c90570f8d30f4.png` («See You At Camp»). Es diferente del footer de Experiences.
- Patrón: azul #1A1D4F, dorado #BF873C, cuerpo #2D2F30 y fondo suave #F5F7FA. Georgia en negrita para titulares (principal 28/36 px frente a 32/40 px en Experiences) y Helvetica/Arial para texto, sin fuentes externas. Franja azul con etiqueta dorada y Summer Camps. Ancho 650 px, márgenes interiores habituales 40 px.
- Rasgos específicos: fichas etiqueta/valor de registro y datos del camp, opciones con precio y paquete destacado, normas en tarjetas con iconos (celdas de 275 px, dos columnas en escritorio), instrucciones, banners opcionales de cuenta atrás/Telegram, certificado regalo, QR y wallets, acceso OnArrival y calendarios.
- Las diferencias entre 15/10/2 días son de composición y contenido, no estilos para elegir. Los envíos de cancelación del camp y cancelación de una inscripción son distintos y conservan sus textos/funciones. No universalizar horarios, precios, Tax ID, políticas o enlaces de una referencia; preservar literalmente los campos Cvent, widgets y propósitos de cada envío. No tratar filas Example… del widget de confirmación como datos reales.
- Adjuntos bajo `/Users/agkaptiva/.codex/attachments/<id>/Texto pegado.txt`, en orden: 4c1bc170-0687-45b5-bdf5-0d7ecc08311b; 915990bc-cc52-4d33-b397-bfdb365cfacb; dec69c00-25f1-4b39-82e7-24f67045782b; 9faf91cb-070b-48d0-8c90-e99667bb1aec; 2066f423-2d37-4ec4-bec7-cdae45da195f; dd7450f2-7604-48b8-a29f-9db8d8a6366e; 124e0a26-6cf9-4a30-99f0-4853b3aa66ff; 3e009d0f-08ec-4db4-a562-49141aa09d5c; 291f4fa5-e791-4dfe-9a2b-b2f1e49aa13d; fb48a02c-fdfe-437c-a7f9-4535133185ad; ab80024e-6edf-4672-acff-e38ad497dafd; ada2622f-ccb1-49f0-b675-6811bb426ccf; 8b05f9af-f20b-499a-8836-47d1cdb079e2.
- Definidos RMF Experiences y RMF Camps USA/Canada. RMF World Challenge sigue siendo una sección independiente; este envío no autoriza a darle el estilo de Camps. Análisis del HTML sin renderizado ni modificaciones del generador en esta fase.


## Instrucciones por kit y fusiones previstas (12/11/2026)

El usuario anuncia una próxima petición de implementación y solicita conservar el contexto en instrucciones por kit. Preparadas seis fichas en `docs/brand-kits/`, con manifiesto sección→kit y 53 adjuntos originales archivados (51 HTML únicos). PSG Camps, Arsenal Camps y RMF Camps quedan definidos como kits compartidos USA/Canada, sin fusionar la organización del hub. Se documentan migración reversible, conservación de personalizaciones y snapshots, y futura integración de las instrucciones en biblioteca/importación. Esta iteración solo prepara documentación y referencias: no modifica el generador ni el almacenamiento del navegador.


## Kit WCH incorporado al contexto (13/11/2026)

- Añadida la ficha `docs/brand-kits/rmf-wch.md` y archivado el documento original íntegro en `docs/brand-kits/referencias/rmf-wch/brand-kit-original.txt`.
- Manifest: kit `rmf-wch` → sección existente `rmf-wc`, independiente de los kits RMF Experiences y Camps. Siete kits para diez secciones; tres parejas Camps USA/Canada siguen compartiendo kit.
- Reglas expresas del usuario: blanco/dorado #BEA47A, carbón #1F1F1F, cuerpo #2B2B2B y fondo suave #F8F5EF; sin rojo ni fuentes web. Georgia en titulares y Helvetica/Arial en cuerpo. Escala, componentes, medidas, tono inglés y tags Cvent completos en la ficha.
- Assets vigentes: header `df32a86304cb472599c44c9e4979cf33.png`, banner de cierre `c2955fb129e34300b1277fc35ad7e793.png` y foto `a13a3c67f33046eb8dc29f11262c117f.jpg?d=650`. No usar el hero d4485b5c… ni el pie antiguo 9082f8f3….
- Orden fijo: header, subheader carbón (WORLD CHALLENGE 2027 / FUNDACIÓN REAL MADRID), contenido, contacto/firma, banner See You in Madrid y línea legal de baja. Los badges Wallet de cvent-assets.com están expresamente aportados. No inventar contacto, enlaces ni assets pendientes.
- Actualizados índices y manifiesto. Esta iteración incorpora instrucciones y recursos documentados, sin modificar el runtime ni kits del navegador. Verificados enlaces locales, hash del original y mapeo de sección; no se declara validación visual del email.


## Implementación de siete kits, instrucciones y Camps compartidos (13/11/2026)

- Catálogo `js/brand-designs.js`: PSG Experiences/Camps, Arsenal Experiences/Camps, RMF Experiences/Camps y WCH. Mapea diez secciones a siete perfiles. Contiene assets de las referencias y reglas deterministas por función (fuentes, paleta, títulos, etiquetas, barras, cajas, botones y fondos). Funciona abriendo el HTML directamente; sin fetch, compilación ni backend.
- `brand-kits.js`: USA/Canada comparten una base editable por marca, con compatibilidad de IDs antiguos. Migración idempotente: backup íntegro antes de escribir, copias previas independientes y combinación de recursos. USA tiene prioridad al existir diferencias; Canada se conserva íntegramente en su copia. Los recursos que superen el límite combinado de 30 siguen accesibles en las copias. Un fallo de almacenamiento no elimina la biblioteca anterior ni la declara cargada.
- La biblioteca anterior sirve de fuente congelada para newsletters guardadas sin designVersion. Editar los kits compartidos o sus copias recuperadas no altera el HTML de esas newsletters. Sus snapshots tampoco se sustituyen. Las nuevas usan el catálogo y sus ajustes compartidos; cambiar la sección explícitamente selecciona su perfil actual.
- Selector Club/Clásico eliminado. Instrucciones visibles en un desplegable del editor y editables dentro de cada kit. Versionado e instrucciones se conservan al normalizar, exportar/importar y aplicar snapshots. Prompts de importación y guion incluyen las reglas del kit elegido; se evita el ejemplo universal PSG para las marcas preparadas.
- WCH: header/franja/cierre fijos, paleta blanco/dorado/carbón, Georgia/Helvetica, firma y contacto antes del banner. Contacto por newsletter con campo de email/Cvent, sin compartir datos de eventos entre países; revisión si falta en WCH. No se inventa email. No duplicar firma ni contacto si ya hay bloque de contacto.
- Corregida la etiqueta del kit automático al cambiar de sección y el desplazamiento de vista previa al abrir otra newsletter; la restauración tras recargar sigue usando su scroll guardado.
- Verificación: todas las suites test/*.test.js, sintaxis, comparación BASE (misma diferencia conocida ?d=650), compare-modules con 268 casos y 0 diferencias, golden hashes del HTML anterior para 38 combinaciones sección/look y una biblioteca con dos países personalizados. Pruebas nuevas de siete perfiles, instrucciones, campos de contacto, aliases, snapshots, edición compartida, migración recuperable/idempotente/falta de espacio, y editor WCH/cambio a Canada sin selector de modelo.
- Chrome real en origen local aislado: siete perfiles revisados en escritorio, los siete en ancho de pantalla 390 px con iframe sin scroll horizontal (358/358 px), instrucciones guardadas y visibles al cambiar entre USA y Canada, biblioteca con una ficha por pareja; WCH completo en móvil 390/390 px y cierre/contacto/firma en escritorio. Sin errores de consola capturados. Capturas `test/capturas-hub/kits-compartidos.png` y `wch-movil.png`.
- Pendiente externo: validación real en Outlook/Gmail/Cvent. La documentación recoge reglas de compatibilidad; las pruebas web/Node no acreditan esos clientes.

## Corrección de fidelidad Arsenal · 13/11/2026

Comparados los dos HTML y el JSON aportados: la composición simplificada y el banner adicional ya venían en el JSON; el generador no puede recuperar tarjetas/cajas que no están descritas. Había además recomendaciones demasiado generales de usar `compra` ante un enlace de registro.

Actualizado `K.importPrompt` y la guía de composición para conservar la estructura visual del HTML de esta petición y no reutilizar contenidos del chat. Nuevas opciones explícitas: `datos.style: summary` (resumen vertical en caja suave, título/nota); `box.density: editorial` (compacta, rótulo con separador opcional, caja final recta); `glance.density: editorial` (tarjetas centradas, 17/22, separación móvil); `text.size: intro/body` (15/25 y 14/23, espaciado compacto); `separador.style: neutral`. Valores anteriores intactos.

Caso reproducible en `examples/arsenal-payment-reminder/`: HTML original, JSON importable y exportación generada. Test de contenido/orden/campos Cvent y opciones de importación. Mantiene la identidad estándar Arsenal (franja negra, fondo blanco), no reproduce píxel a píxel el fondo/franja rojos del original. No modifica newsletters guardadas ni su localStorage.

Validación de esta corrección: todas las suites Node y 268 comparaciones sin diferencias en HTML existente. Chrome real en escritorio y 390 px: tarjetas apiladas con separación, cajas y resumen contenidos; ancho de documento 390/390. Sin validación de clientes de email reales.

## Normalización de composición, corrección del enfoque anterior · 13/11/2026

El usuario confirma que la IA sigue devolviendo listas/párrafos planos. El nuevo adjunto es contenido con formato antiguo; conservar su estructura era contrario al objetivo de normalizar al brand kit. Cambiados solo los prompts: para los siete perfiles, el HTML es fuente de contenido y la composición se elige por función, con prioridad explícita sobre su aspecto antiguo. Apertura a titular, importes etiquetados a datos summary incluso si vienen en viñetas, instrucciones y credenciales a caja suave. Sin inventar etiquetas o fechas para rellenar tarjetas, sin reescribir ni omitir contenido. Patrón estructural sin textos de ejemplo y revisión obligatoria en guion/importación. El importador/render y proyectos guardados no cambian.

Caso literal del último adjunto en examples/arsenal-payment-normalized: source.html, project.json, salida HTML/TXT e instrucciones actualizadas listas para copiar. El test compara todo su texto visible en orden, conserva el banner real y los campos Cvent, y comprueba las reglas en los siete kits y ambos prompts.

Verificación: suites Node completas, 268 casos de HTML sin diferencias, comparación literal del último adjunto y Chrome escritorio/móvil (390 px, sin desbordamiento horizontal). No se ha ejecutado una generación externa de ChatGPT; las pruebas verifican las instrucciones copiadas y el caso recompuesto, no garantizan obediencia de un modelo externo.

## Arsenal, separación común y datos extraídos · 13/11/2026

Petición expresa: Arsenal usa siempre franja roja y texto más compacto, bloques separados en todas las marcas, e interpretación de datos para tres recuadros. `brand-designs.js`: franja Arsenal #B4001E, texto 10/14 px bold con tracking 1 px; titulares tracking -0.5 px. Limitar franja/tipografía a los perfiles Arsenal Experiences y Camps. Los prompts y catálogo indican que esta regla prevalece sobre instrucciones antiguas de franja negra.

`K.build`: para estados con designVersion actual y perfiles activos, espacio inferior mínimo 20 px por bloque visual; conservar márgenes mayores y unidades de título+introducción. Fondos de banda completa reciben espacio blanco externo. Último bloque separado del footer. El cambio se aplica al render de newsletters con perfil preparado ya guardadas, conforme a la petición; no convierte estados antiguos sin versión.

Prompts de importación/guion: interpretar párrafos para extraer 2–3 hechos y etiquetas descriptivas, sin inventar valores, completar años o eliminar condiciones. Patrón con glance y revisión cuando existen tres hechos. Se permite repetir hechos en tarjetas como resumen y mantener la explicación completa. Caso actualizado con $1500, August 1st 2026 y September 1st sin año en examples/arsenal-payment-cards.

Verificación de este ajuste: todas las suites Node, incluidos tests de franja, tracking, separación por marca, extracción sin año inventado e instrucciones; 268 comparaciones anteriores sin diferencias y golden hashes legacy conservados. Chrome real escritorio y 390 px, documento 390/390 sin desbordes y tarjetas apiladas separadas. No verificado en clientes de correo reales. Las instrucciones visibles en el editor incluyen reglas vigentes incluso con personalizaciones de texto anteriores del kit.

## Centrado vertical de la franja Arsenal · 13/11/2026

La franja compacta sumaba una fila roja inferior de 4 px al padding 10/10; el texto quedaba 2 px por encima del centro total. Para Arsenal se elimina esa fila redundante y se usa padding 12/12: mantiene 38 px de altura con una línea de texto y centro vertical simétrico. Resto de marcas y perfiles legacy sin cambios.

Verificado en Chrome escritorio y móvil: centro del párrafo y centro de la franja coinciden (103.6328125 px en escritorio), altura 38 px. Suites Node completas y 268 comparaciones legacy sin diferencias.

## Wallet editable y QR personal · 13/11/2026

Comparación de ambos adjuntos: el HTML de salida ya incluía href con C-PASSBOOK_LINK y C-GOOGLEWALLET_LINK correctos. El error era copiar los alt «Apple Wallet», «Add to Google Wallet Button» y el campo C-QRCODE_LINK al texto opcional del bloque; el QR se exportaba como texto.

Se amplía el bloque existente `wallet`: enlaces e imágenes editables por plataforma, selección de botones y QR personal opcional (180 px, img src con C-QRCODE_LINK). Valores de respaldo visibles en la UI de bloques antiguos, sin mutarlos al cargar. Nueva acción «Limpiar textos técnicos y recuperar QR» para reparar explícitamente bloques ya guardados; la importación JSON nueva realiza esa limpieza acotada y emite un aviso. No se quitan párrafos humanos. Se rechazan enlaces del editor/preview y QRCodeType.gif, con revisión y fallback válido. URLs fijas válidas se admiten con aviso porque no cambian por destinatario. La vista previa muestra un marcador explicativo del QR; el export deja la imagen dinámica para Cvent.

`js/app.js` soporta acción de campo y fallback de valor, usados en Wallet. Prompt común de HTML/guion reconoce tokens, badges oficiales cvent-assets.com, QR personal y alt técnicos; no convierte los badges en tabla Markdown ni el QR en texto y distingue el QR de Telegram. Reglas comunes a todas las marcas.

Caso en examples/wallet-cvent: exportación completa corregida, cambiando solo la sección Wallet del adjunto generado, ejemplo JSON de ese bloque y vista previa. Compatibilidad: Wallet sin opciones nuevas conserva exactamente su HTML; ninguna limpieza silenciosa de newsletters guardadas.

Verificación: pruebas Node completas y 268 comparaciones de HTML anterior sin diferencias; test Wallet para tokens, imágenes editables, QR, limpieza idempotente, rechazo de enlaces de editor e importación. Chrome real del editor: campos por defecto visibles, limpieza de un bloque antiguo, edición del enlace Google y vista previa escritorio/móvil con badges apilados y marcador QR. Confirmado href literal C-GOOGLEWALLET_LINK en DOM. No se ha validado emisión ni descarga de pases mediante un envío real de Cvent.

## Detección automática de Wallet al importar JSON · 13/11/2026

El usuario requiere reconocimiento automático en todas las marcas sin limpieza manual. `K.importProject` normaliza las secciones nuevas antes de validarlas: campos C-PASSBOOK_LINK/C-GOOGLEWALLET_LINK/C-QRCODE_LINK, badges oficiales, placeholder QRCodeType.gif, botones con campos personales o URLs de editor identificados por etiqueta Wallet, y tablas Markdown con badges pasan a bloques Wallet editables. Se agrupan elementos contiguos, conservando texto humano y orden; una imagen múltiple que mezcla fotos y badges se separa sin perder las fotos. QR personal solo no inventa botones de Apple/Google. No se confunden menciones narrativas ni QR de Telegram. El bloque Wallet ya existente en el JSON se limpia automáticamente como antes. Es una regla del importador compartido, no depende de la marca ni de que la IA elija bien el tipo de bloque.

No transforma proyectos guardados al abrirlos; la acción manual queda para reparar un proyecto ya guardado. El reconocimiento necesita que el JSON contenga el campo, el asset o un enlace identificable; no puede recuperar recursos que se omitieron por completo. Se mantiene la resolución final de pases por Cvent.

Verificado: todas las suites Node, detección en las 19 secciones, casos de botones/imágenes/Markdown/QR solo, conservación de fotos y texto, idempotencia y exclusión de Telegram; 268 comparaciones de HTML sin diferencias. Chrome real con PSG Canada: JSON con dos imágenes de badges y un texto QR se importa como un Wallet con ambos botones y QR personal, sin ejecutar la limpieza manual.

## Texto + imagen, escala de Imagen e imagen en Tarjetas · 13/11/2026

Petición del usuario: un bloque con texto a la izquierda e imagen a la derecha, y poder poner imágenes en tarjetas y escalarlas (más margen, más pequeñas). Todo lo nuevo va apagado por defecto: sin tocar las opciones nuevas, el HTML es el mismo de antes.

- **Bloque nuevo `textimg` («Texto + imagen»)**, en la paleta tras Imagen: antetítulo, título y botón opcionales, texto (obligatorio), imagen y alt (obligatorios, `img`/`alt`, así que funciona arrastrar imágenes del kit y el placeholder). Opciones: imagen a la derecha (por defecto) o a la izquierda (`side`), tamaño mitad 275 px / pequeña 200 / grande 340 (`imgW`), alineación vertical centrada o arriba (`valign`). Dos celdas `col2`: en móvil se apilan (con la imagen a la derecha, primero el texto). El botón flotante lleva un `clear` para que la imagen no se le monte en móvil. Esquema en `block-icons.js`, `BLOCK_INFO` y línea en la guía de composición de ChatGPT (`textimg`; párrafo junto a una foto, no separarlo en text + images).
- **Imagen · «Escala»** (`scale`: 85/70/55/40 %): la imagen o la fila de 2–3 mide ese % de los 570 px útiles y se centra (tabla `width:100%;max-width:Npx` para que en móvil no desborde). Con escala se oculta «A sangre / Con márgenes».
- **Tarjetas · imagen por tarjeta** (`cN_img`, `cN_alt`, también en «Quitar», que sube la imagen con su tarjeta) y **«Tamaño de las imágenes de las tarjetas»** (`imgScale`, solo visible si alguna tarjeta tiene imagen). La imagen va arriba de la tarjeta, centrada y con esquinas redondeadas; en móvil, en %. Con imagen, dos tarjetas claras ya no usan la rejilla antigua `twoCards`, sino `cardRows`.

Verificación: todas las suites Node (nueva `test/textimg.test.js`), `test/test.js` con el `igual: false` conocido, `compare-modules.js` 268 casos sin diferencias y 12 920 comparaciones extra de Tarjetas (1–8, botones, oscuras, textos largos) e Imagen (1–3, tamaños, placeholders) en las 19 secciones, ambos estilos, con y sin `designVersion` y en vista previa: 0 diferencias. Email de muestra (PSG USA) revisado en el navegador integrado en escritorio y en móvil (375 px, documento 375/375 sin desbordamiento). **No probado en el navegador**: el panel del editor (campos nuevos, arrastrar imágenes al bloque), porque en esta sesión no se pudo arrancar un servidor local; tampoco en Outlook/Gmail reales.
