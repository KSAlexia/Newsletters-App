# Kaptiva · Generador de newsletters (v0.3)

App interna para montar newsletters de Cvent con piezas fijas. Sin IA y sin coste.

## Cómo usarla
1. Abre `index.html` con doble clic (Chrome o Edge). No hay que instalar nada.
2. En la pantalla de Proyectos, crea uno con «Nuevo proyecto…». Se guarda solo dentro del torneo y la carpeta que tengas abierta.
3. Rellena los módulos. La vista previa se actualiza sola.
4. Mira la pestaña **Revisión** y descarga el `.txt` para pegarlo en Cvent.

- Texto: un párrafo por línea. `**negrita**` y `[texto](enlace)`.
- Imágenes: siempre el custom link de Cvent.
- Los proyectos se guardan en el navegador de cada persona. «Exportar proyecto» descarga un `.json` para pasarlo a otra persona (lo abre con «Abrir archivo de proyecto»).
- «Importar» usa ChatGPT para repartir una newsletter antigua o un guion en módulos.

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

## Organización del hub
- Entra en un torneo para crear carpetas y subcarpetas con «Nueva carpeta».
- Usa «Mover» para clasificar newsletters o mover carpetas dentro del mismo torneo. Las carpetas se pueden renombrar; solo se eliminan si están vacías.
- Cada carpeta recuerda su orden: modificación reciente/antigua, A–Z, Z–A o manual mediante las flechas. Para usar las flechas, limpia los filtros.
- La búsqueda y el rango de fechas de modificación se aplican a los elementos de la carpeta abierta, no a sus descendientes.
- Abrir una newsletter no cambia su fecha de modificación. Al cambiar de torneo, se traslada a la raíz del nuevo torneo.
- La organización se guarda en este navegador. Exportar un proyecto individual no exporta el árbol de carpetas.
- Pruebas del hub sin dependencias: `node test/hub.test.js`.
- Decisiones y futuras mejoras: `NOTAS-PROYECTO.txt`.

## Continuar el desarrollo con Codex o Claude
Lee [ESTADO-PROYECTO.md](ESTADO-PROYECTO.md) para conocer la arquitectura, los cambios implementados, las decisiones de producto, las pruebas y los pendientes. `AGENTS.md` y `CLAUDE.md` remiten a ese documento compartido.
