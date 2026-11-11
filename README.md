# Kaptiva · Generador de newsletters (v0.1)

App interna para montar newsletters de Cvent con piezas fijas. Sin IA y sin coste.

## Cómo usarla
1. Abre `index.html` con doble clic (Chrome o Edge). No hay que instalar nada.
2. Elige torneo y, si quieres, una receta en «Nueva desde receta…».
3. Rellena los módulos. La vista previa se actualiza sola.
4. Mira la pestaña **Revisión** y descarga el `.txt` para pegarlo en Cvent.

- Texto: un párrafo por línea. `**negrita**` y `[texto](enlace)`.
- Imágenes: siempre el custom link de Cvent.
- «Guardar proyecto» descarga un `.json` para reabrir o duplicar la newsletter más adelante.

## Qué hay en cada archivo
- `js/brands.js` → torneos: colores, header, footer. **Aquí se añade un torneo o un footer pendiente.**
- `js/modules.js` → las piezas de HTML, las recetas y la revisión automática.
- `js/head.js` → cabecera técnica del email (no tocar).
- `js/app.js` → funcionamiento de la pantalla.
- `css/app.css` → aspecto de la app (colores en las primeras líneas).
- `test/test.js` → comprueba que la app reproduce la referencia BASE (`node test/test.js`).

## Subirlo a GitHub
1. Crea un repositorio **privado** en github.com (botón «New»).
2. «Add file → Upload files» y arrastra todo el contenido de esta carpeta.
