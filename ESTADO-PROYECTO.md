# Traspaso técnico · Kaptiva Newsletters

Actualizado: 11 de noviembre de 2026. Documento compartido para Codex, Claude y cualquier persona que continúe el proyecto. Describe el estado observado; los pendientes no son autorización para implementarlos todos. La petición actual del usuario determina el alcance.

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
- `index.html` / `app.js`: panel `#image-panel` (details abierto, sticky en la columna del editor, scroll horizontal) con el placeholder y las imágenes con custom link como fuentes arrastrables; las referencias sin URL aparecen atenuadas y no se arrastran. Cada campo de imagen (`img: true` o `k: 'img'`) se pinta como `.img-slot` con miniatura, botones «Elegir del brand kit», «Usar placeholder» y «Quitar imagen», y acepta soltar. La cabecera (`summary`) de un módulo con campo de imagen también acepta soltar, aunque esté plegado, y lo abre.
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
