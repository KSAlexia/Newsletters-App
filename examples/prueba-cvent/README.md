# Prueba real en Cvent, Gmail y Outlook

Una newsletter por brand kit, generada con la app el 13/11/2026 a partir de las newsletters de referencia de cada club. El contenido se ha convertido con las instrucciones de importación, haciendo de ChatGPT. Sirve para comprobar en clientes de correo reales lo que el navegador no puede garantizar.

| Kit | Archivo para Cvent | Proyecto para abrir en la app |
| --- | --- | --- |
| PSG Experiences | `psg-experiences_COPIAR_Y_PEGAR.txt` | `psg-experiences.json` |
| PSG Camps | `psg-camps_COPIAR_Y_PEGAR.txt` | `psg-camps.json` |
| Arsenal Experiences | `arsenal-experiences_COPIAR_Y_PEGAR.txt` | `arsenal-experiences.json` |
| Arsenal Camps | `arsenal-camps_COPIAR_Y_PEGAR.txt` | `arsenal-camps.json` |
| RMF Experiences | `rmf-experiences_COPIAR_Y_PEGAR.txt` | `rmf-experiences.json` |
| RMF Camps | `rmf-camps_COPIAR_Y_PEGAR.txt` | `rmf-camps.json` |
| RMF World Challenge | `rmf-world-challenge_COPIAR_Y_PEGAR.txt` | `rmf-world-challenge.json` |

Los `.json` se abren desde la app: abre una newsletter de la sección correspondiente → **Más acciones → Importar desde ChatGPT…** → pega el contenido del `.json`.

## Cómo hacer la prueba

1. En Cvent, crea un email de prueba en un evento de cada marca (o en uno de pruebas) y pega el contenido del `.txt` en el editor de código HTML.
2. Envía un **test email** a:
   - Gmail en el navegador.
   - Gmail en el móvil (iOS o Android).
   - Outlook de escritorio en Windows (el que más falla).
   - Outlook en el navegador.
   - Apple Mail en el iPhone.
3. Repasa la lista de abajo en cada uno y apunta lo que falle, con una captura.

## Qué mirar

- **Campos de Cvent**: el nombre (`{[C-FIRST NAME]}`), la fecha, la confirmación y los demás campos se sustituyen por datos reales. Los enlaces `{[E-MODIFY REG LINK]}` funcionan y no salen duplicados ni dentro de otro enlace.
- **Header, franja y footer**: el header y el banner final se ven enteros; la franja tiene su color y sus dos etiquetas en una línea (en World Challenge, en móvil a 9 px).
- **Fuentes**: PSG usa sus fuentes propias. Si un cliente no las carga, debe verse Helvetica/Arial, sin letras raras. Arsenal, RMF y World Challenge usan Georgia y Helvetica/Arial, que no dependen de nada.
- **Columnas en móvil**: las tarjetas, la foto con tarjetas al lado (World Challenge), «Texto + imagen» y los tres datos clave pasan a ir uno debajo de otro, sin desbordar.
- **Botones**: ocupan todo el ancho en móvil y el texto se lee. El botón de Telegram de PSG Camps, si lo hay, sale rojo.
- **Outlook en Windows**: es el que suele romper las esquinas redondeadas (se ven rectas, y es aceptable), los anchos y los espacios entre bloques. Comprueba que nada se sale de los 650 px.
- **Modo oscuro** (iPhone y Outlook): textos legibles; los fondos claros pueden invertirse.
- **Wallet y QR** (si un envío los lleva): los botones de Apple y Google Wallet y el QR personal aparecen con los datos del inscrito.

## Lo que ya está comprobado (y lo que no)

- Generados con las instrucciones de importación actuales (una simulación de ChatGPT independiente, sin acceso al código).
- Frente a cada original: están todos los campos de Cvent, todas las imágenes y todos los enlaces, incluidos los badges de App Store y Google Play, el QR de Telegram y el vídeo de Arsenal. De texto solo faltan las filas de ejemplo de los widgets de Cvent («ExampleInviteeName»…), que no son contenido. En World Challenge, la frase de contacto es la fija del kit.
- Comprobado en el navegador (escritorio y 375 px): composición frente a las referencias, ningún desbordamiento horizontal y apilado en móvil.
- La revisión de la app no da errores ni avisos en estos siete envíos.
- **No comprobado**: Cvent, Gmail, Outlook ni Apple Mail reales. Para eso es esta carpeta.
- El contenido sale de las referencias: algunos datos de ejemplo (nombres de eventos, enlaces externos) son de envíos anteriores. No uses estos archivos para enviar a familias.
