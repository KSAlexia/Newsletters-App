# RMF World Challenge 2027 · WCH

Estado: implementado en la app el 13/11/2026; las newsletters anteriores conservan su diseño.

## Aplicación

Kit independiente `rmf-wch`, asociado solo a la sección `rmf-wc`. No se fusiona con RMF Camps USA/Canada ni con RMF Experiences. Las reglas expresas de este documento prevalecen sobre los patrones de esas otras secciones.

[Documento original completo](referencias/rmf-wch/brand-kit-original.txt).

## Criterios de implementación

- El banner «See You in Madrid» es el cierre de imagen anterior a la línea legal; no añadir después otro pie de imagen de RMF.
- Contacto y firma son piezas fijas, pero este documento no especifica una dirección de contacto. Conservar el contacto del evento o solicitarlo al preparar contenido; no inventarlo.
- Los dos badges Wallet alojados en `www.cvent-assets.com` son recursos expresamente aportados y constituyen la excepción concreta a la regla de imágenes de `custom.cvent.com`. No sustituirlos por imágenes inventadas ni bloquearlos al validar estas referencias.
- Los placeholders de imagen pendiente son avisos de edición; no convertir el texto del placeholder en una URL.
- Generar y verificar HTML/TXT desde los bloques de la app, manteniendo intactas las newsletters antiguas hasta una petición de actualización.

Las siguientes reglas reproducen el contenido del kit aportado, con formato de lectura:

## 1. IDEA VISUAL
- Predominan el BLANCO y el DORADO.
- Negro y carbón solo para texto y detalles.
- Nunca rojo ni colores fuera de esta paleta.

## 2. COLORES
#FFFFFF  Blanco · fondo del email y del contenido, texto sobre carbón
#bea47a  Dorado · barras, bordes, bullets, etiquetas de fecha, botón dorado (fondo y borde), títulos pequeños (eyebrows/labels)
#F8F5EF  Dorado suave · fondo de cajas, timeline y contacto
#EAE5DA  Líneas divisorias y bordes suaves
#000000  Negro · H1, títulos, negritas, texto del botón dorado
#1F1F1F  Carbón · subheader, tarjetas oscuras, timeline, botón oscuro, aviso "Important"
#2B2B2B  Texto cuerpo
#6B6B6B  Notas y labels de datos
#9A9A9A  Footer legal

## 3. CÓMO RESALTAR (en lugar de rojo)
- Fechas límite / datos clave → etiqueta dorada: fondo #bea47a + texto negro en negrita.
- Palabras urgentes → negrita negra + subrayado dorado (border-bottom: 2px solid #bea47a).
- Avisos importantes → caja carbón #1F1F1F, texto blanco y etiqueta "IMPORTANT" en dorado.
- Títulos pequeños (Step, Good to know, labels) → siempre en dorado #bea47a, mayúsculas.

## 4. TIPOGRAFÍA
Titulares, cifras y fechas → Georgia, serif
Cuerpo, labels, botones y footer → Helvetica, Arial, sans-serif
(Sin fuentes web)

H1 ................ Georgia 32/40px · bold · negro · barra dorada debajo 56×4px
H2 de sección ..... Georgia 22/28px · bold · negro · centrado · barra dorada 40×3px
Título de caja .... Georgia 20/26px · bold · negro
Fecha deadline .... Georgia 19/24px · bold · negro
Intro ............. Helvetica 15/25px · #2B2B2B
Cuerpo/bullets .... Helvetica 14/22px · #2B2B2B
Notas ............. Helvetica 13/21px · #2B2B2B
Eyebrow/labels .... Helvetica 10–11px · bold · mayúsculas · espaciado 2px · dorado
Subheader ......... Helvetica 11px · bold · mayúsculas · blanco
Botón ............. Helvetica 11/15px · bold · mayúsculas · espaciado 1.5px
Footer ............ Helvetica 10/13px · #9A9A9A

Bullet estándar: punto (•) en dorado #bea47a.

## 5. IMÁGENES (links de Cvent)
Header WCH (siempre arriba):
https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/df32a86304cb472599c44c9e4979cf33.png

Banner "See You in Madrid" (siempre antes del footer):
https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/c2955fb129e34300b1277fc35ad7e793.png

Foto World Challenge (foto a sangre):
https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/a13a3c67f33046eb8dc29f11262c117f.jpg?d=650

Apple Wallet (badge):
https://www.cvent-assets.com/event-email-editor/assets/images/US-UK_Add_to_Apple_Wallet_RGB_101421__d018a8bb15e6d1b46780.png

Google Wallet (badge):
https://www.cvent-assets.com/event-email-editor/assets/images/enUS_add_to_google_wallet_add-wallet-badge__b79d999246ba9434bcd9.png

Ya NO se usan:
- Hero "Welcome to the Challenge" (d4485b5c…png)
- Banner inferior RMF antiguo (9082f8f3…png)

Reglas de imágenes:
- Solo custom links de Cvent. Nunca base64, Drive, Dropbox ni otras webs.
- Imágenes a ancho completo: 650px.
- Para subir imágenes nuevas: 1200px de ancho (retina), JPG ~80% de calidad.
- Si falta un link: dejar [PENDIENTE: custom link Cvent — nombre de la imagen].
- Alt habitual: "Real Madrid Foundation World Challenge".

## 6. ELEMENTOS FIJOS (en todas las newsletters)
## 1. Header WCH
## 2. Subheader: franja carbón #1F1F1F
   Izquierda: WORLD CHALLENGE 2027 (blanco)
   Derecha: FUNDACIÓN REAL MADRID (blanco)
## 3. … contenido …
## 4. Contacto + firma (fondo #F8F5EF)
## 5. Banner "See You in Madrid"
## 6. Footer: solo la línea de baja (unsubscribe)

## 7. COMPONENTES
- Caja "Step": fondo #F8F5EF + borde izquierdo dorado 4px + etiqueta dorada de deadline.
- Caja info: fondo #F8F5EF + borde izquierdo dorado 4px + título Georgia 20px.
- Tarjetas "At a glance": 3 de 180px (2 carbón + 1 blanca con borde dorado), esquinas 8px.
- Timeline: columna carbón de 120px + cuerpo #F8F5EF.
- Deadlines: 2 cajas de 285px con borde dorado 2px.
- Tres fotos: 182px cada una, esquinas 6px.
- CTA: caja blanca con borde dorado 2px + enlace de Cvent.
- Botón dorado: 190px · fondo y borde #bea47a · texto negro en mayúsculas · esquinas 4px.
- Botón carbón: 190px · fondo #1F1F1F · texto blanco.
- Aviso "Important": caja carbón · etiqueta dorada · texto blanco.

## 8. MEDIDAS Y REGLAS TÉCNICAS
- Ancho del email: 650px. Márgenes laterales del contenido: 40px (20px en móvil).
- Estructura en tablas y CSS inline (sin div, flexbox ni grid).
- Códigos de compatibilidad con Outlook en cada sección.
- Fondo del email: blanco.
- Nunca envolver filas con <span> o <div>.
- No usar min-height; para igualar alturas, height fijo.
- Entregar siempre .html (vista previa) + .txt (para pegar en Cvent).

## 9. TAGS DE CVENT (no modificar nunca)
{[C-FIRST NAME:TC]} ............ Nombre
{[C-LAST NAME]} ................ Apellido
{[C-EMAIL]} / {[C-CONFIRMATION NUM]}
{[E-TITLE]} .................... Nombre del evento
{[E-START DATE:WCMMSD1C4]} / {[E-END DATE:WCMMSD1C4]}
{[E-START TIME:UA]} / {[E-END TIME:UA]} / {[E-TIME ZONE]}
{[E-ADDRESS]} .................. Dirección
{[E-CUSTOM:Event Phone Number]}  Teléfono
{[C-PAYMENTS]} ................. Pagos
{[C-QRCODE_LINK]} .............. QR
{[C-PASSBOOK_LINK]} / {[C-GOOGLEWALLET_LINK]} .. Wallets
{[E-RSVP YES LINK]} ............ Inscripción (genera su propio enlace)
{[E-MODIFY REG LINK]} .......... Modificar registro (genera su propio enlace)
{[P-FIRST NAME]} {[P-LAST NAME]}  Firma
{[EMAIL OPT OUT]} .............. Baja

Importante: {[E-RSVP YES LINK]} y {[E-MODIFY REG LINK]} nunca van dentro de otro enlace.

## 10. IDIOMA Y TONO
- Copy de las newsletters: inglés.
- Tono: cercano y premium. En los recordatorios, urgente pero educado.

## Emails de ejemplo (13/11/2026)

El usuario aportó dos emails de WCH como referencia: `referencias/rmf-wch/01.html` (Schedule & Tournament Wristbands) y `02.html` (About Madrid). Su subheader manda sobre lo que la ficha no concreta: fondo carbón #1F1F1F, padding 12/40 y sin línea inferior; Helvetica 11 px negrita, blanca, en mayúsculas, espaciado 1 px y sin cortes de línea. En móvil baja a 9 px sin espaciado (clase `mobile-sub`, como en el 02). El resto de piezas de estos ejemplos no se ha comparado todavía con el generador.

Después, el generador se igualó a los dos ejemplos en el resto de piezas (13/11/2026), y estas decisiones prevalecen sobre la ficha original donde no coinciden:
- Titular de 36/44 px con espaciado −0,5 px. Antetítulo de 11 px pegado al titular. «Dear …» en negrita de 15 px, junto a la introducción.
- Títulos de sección (H2) a la izquierda y sin barra, a 14 px del bloque que los sigue.
- Caja suave con la etiqueta dentro. «Important» y la caja con borde, rectas.
- Si la línea con enlace de Cvent de la caja con borde es solo `{[E-MODIFY REG LINK]}` o `{[E-RSVP YES LINK]}`, va en un recuadro dorado de 190 px.
- Tarjetas rectas. La foto con tarjetas apiladas al lado es la opción «Foto al lado» del bloque Tarjetas.
- Contacto y firma: «For any questions, please contact us at: {[E-CUSTOM:Event Phone Number]}» (u otro contacto de la newsletter), «Sincerely,» y la firma, sobre fondo #F8F5EF.
