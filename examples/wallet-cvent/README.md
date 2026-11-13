# Wallet y QR de Cvent

`newsletter-corregida.html` y `.txt` corrigen únicamente el bloque Wallet del HTML generado aportado el 13/11/2026: eliminan textos alt copiados y muestran `{[C-QRCODE_LINK]}` como imagen. El resto del documento se conserva.

`project.json` es un ejemplo de bloque Wallet (no contiene el resto de esa newsletter). `wallet.html` es su exportación y `preview.html` permite ver el marcador del QR, que Cvent genera al enviar.

En la app actualizada, abre el bloque existente y pulsa **Limpiar textos técnicos y recuperar QR**. Los campos de enlace e imagen de Apple/Google, los botones visibles y el QR son editables. Los valores predeterminados se muestran también en bloques ya guardados. Vaciar un campo restaura su valor predeterminado.

Apple: `{[C-PASSBOOK_LINK]}`. Google: `{[C-GOOGLEWALLET_LINK]}`. QR: `{[C-QRCODE_LINK]}` como `img src`. No utilizar URLs de EmailDesigner, EmailPreview, passbook/pass/apple? vacío ni QRCodeType.gif. El export conserva los campos dinámicos; solo Cvent puede resolverlos por destinatario. Verificar descarga de pases y QR mediante envío de prueba en Cvent; no se ha hecho un envío desde la app.
