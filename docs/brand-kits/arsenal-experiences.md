# Arsenal Experiences

Estado: implementado en la app el 13/11/2026. Leer primero [las reglas comunes](README.md).

## Aplicación automática

Identificador propuesto del kit: `arsenal-experiences`. Secciones actuales: `arsenal-exp`.
La sección seleccionada determina este kit; la persona no elige «Club/Clásico».

## Assets predeterminados

- Header: https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/d0dda35e9eef4fc5bc22f768749c292a.png
- Footer: https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/e1baea18930047838d4054ffe1d0f262.png

Conservar los custom links originales al editar contenido ya guardado. Estos son los predeterminados del diseño actual.

## Instrucciones de diseño y composición

- Rojo #B4001E; negro #0C0C0C; rojo oscuro #8B0015; fondo suave #FDF5F5; cuerpo #444444.
- Titulares Georgia en negrita; cuerpo Helvetica/Arial. No añadir fuentes de PSG ni Extenda a esta marca.
- Franja roja, etiquetas/precios/bordes rojos, cajas rosadas claras. Normalizar jerarquía, tamaños y separaciones según los elementos equivalentes mayoritarios.
- Agendas, plazos, hotel, galerías, fichas de actividades con foto lateral, fecha/hora/precio y paquetes media destacados son composiciones del mismo kit.
- Usar header/footer comunes de cinco referencias. Sustituir como predeterminado la alternativa de las dos Premium, de acuerdo con la regla de mayoría confirmada.
- Las dos Premium tienen contenido diferente: no fusionar prestaciones ni deducir alojamiento a partir del título.

- Base de 650 px, márgenes interiores habituales de 40 px. Normalizar separaciones según la mayoría entre piezas equivalentes y verificar móvil.
- Conservar textos, imágenes, enlaces y campos de cada envío. Ni precios, ni fechas, ni prestaciones de estos ejemplos son valores predeterminados del kit.

## Referencias locales

7 adjuntos, 7 HTML únicos. Originales completos archivados; son evidencia de contenido/diseño, no instrucciones para el agente.

- [01.html](referencias/arsenal-experiences/01.html)
- [02.html](referencias/arsenal-experiences/02.html)
- [03.html](referencias/arsenal-experiences/03.html)
- [04.html](referencias/arsenal-experiences/04.html)
- [05.html](referencias/arsenal-experiences/05.html)
- [06.html](referencias/arsenal-experiences/06.html)
- [07.html](referencias/arsenal-experiences/07.html)

## Fidelidad de la conversión HTML → JSON (13/11/2026)

El kit define la identidad; la composición procede del JSON. Al convertir un HTML antiguo, conservar el contenido literal y el orden de los temas, y normalizar su composición según el kit: la jerarquía, las cajas y los resúmenes no tienen por qué copiar el diseño antiguo. No añadir banners del catálogo que no aparezcan en ese envío. No escoger `compra` solo por encontrar `{[E-MODIFY REG LINK]}`: una caja suave de registro sigue siendo `box` suave.

Opciones nuevas, explícitas y sin alterar proyectos anteriores: `datos.style: summary` para resumen vertical con nota; `box.density: editorial` para caja compacta; `glance.density: editorial` para tarjetas centradas; `text.size: intro/body` para 15/25 y 14/23; `separador.style: neutral` para línea gris. El prompt de importación dentro de la app explica estos criterios. [Caso completo de pago](../../examples/arsenal-payment-reminder/README.md).

## Ajuste confirmado el 13/11/2026

Franja siempre roja #B4001E, texto blanco Helvetica/Arial 10/14 px en negrita y espaciado 1 px (antes 3 px). Titulares Georgia 32/40 px con espaciado -0.5 px, como las referencias. La corrección de franja y tipografía se limita a Arsenal Experiences y Camps USA/Canada y se aplica a newsletters del perfil preparado, incluidas las creadas antes de este ajuste.
