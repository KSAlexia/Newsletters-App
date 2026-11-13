// Esquemas de cada bloque (miniaturas con placeholders) para la paleta y el panel de bloques.
// Solo interfaz: no afectan al HTML del email. Colores por clase (ver .sk en css/app.css).
(function (root) {
  var K = root.KSA = root.KSA || {};
  function r(x, y, w, h, cls, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? Math.min(h / 2, 1.6) : rx) + '" class="' + cls + '"/>'; }
  function ln(x, y, w, cls) { return r(x, y, w, 3, cls || 'i'); }               // línea de texto
  function tt(x, y, w, cls) { return r(x, y, w, 5, cls || 't'); }               // línea de título
  function dot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="1.8" class="b"/>'; }
  function img(x, y, w, h) {                                                   // imagen placeholder
    return r(x, y, w, h, 'im', 1.5) + '<path d="M' + (x + 2) + ' ' + (y + h - 2) + 'L' + (x + w * 0.4) + ' ' + (y + h * 0.45) + 'L' + (x + w * 0.62) + ' ' + (y + h * 0.7) + 'L' + (x + w * 0.75) + ' ' + (y + h * 0.55) + 'L' + (x + w - 2) + ' ' + (y + h - 2) + 'Z" class="i"/>' +
      '<circle cx="' + (x + w * 0.74) + '" cy="' + (y + h * 0.3) + '" r="' + Math.max(1.4, h * 0.1) + '" class="i"/>';
  }
  function btn(x, y, w, cls) { return r(x, y, w, 8, cls || 'b', 2) + r(x + w * 0.25, y + 3, w * 0.5, 2, 'w', 1); }
  function card(x, y, w, h, dark) { return r(x, y, w, h, dark ? 'd' : 'cb', 2) + tt(x + 3, y + 4, w * 0.6, dark ? 'w' : 't') + ln(x + 3, y + 12, w - 6, dark ? 'wl' : 'i') + ln(x + 3, y + 18, w * 0.55, dark ? 'wl' : 'i'); }
  var S = {
    title: tt(14, 12, 36) + r(26, 22, 12, 2.5, 'b'),
    text: ln(6, 7, 52) + ln(6, 13, 48) + ln(6, 19, 30) + ln(6, 27, 50) + ln(6, 33, 22),
    list: dot(9, 9) + ln(14, 7.5, 40) + dot(9, 19) + ln(14, 17.5, 32) + dot(9, 29) + ln(14, 27.5, 44),
    images: img(4, 10, 17, 20) + img(23.5, 10, 17, 20) + img(43, 10, 17, 20),
    textimg: r(4, 8, 14, 2.5, 'b') + tt(4, 13, 24) + ln(4, 21, 28) + ln(4, 27, 22) + img(36, 6, 24, 28),
    button: btn(18, 16, 28),
    cards: card(3, 7, 18, 26) + card(23, 7, 18, 26, true) + card(43, 7, 18, 26),
    box: r(4, 5, 56, 30, 's', 2) + r(4, 5, 2.5, 30, 'b', 1) + r(11, 10, 12, 2.5, 'b') + tt(11, 15, 30) + ln(11, 23, 42) + ln(11, 29, 28),
    datos: r(2, 6, 60, 28, 'd', 2) + tt(20, 10, 24, 'w') + ln(7, 20, 12, 'wl') + ln(5, 26, 16, 'wl') + ln(26, 20, 12, 'wl') + ln(24, 26, 16, 'wl') + ln(45, 20, 12, 'wl') + ln(43, 26, 16, 'wl'),
    producto: img(4, 7, 20, 26) + tt(28, 8, 18) + r(49, 7, 11, 7, 'pb', 3.5) + ln(28, 18, 32) + ln(28, 24, 24) + r(28, 30, 32, 3, 'b'),
    separador: ln(6, 9, 30) + r(4, 19, 56, 1.6, 'i', 0.8) + ln(6, 27, 40),
    compra: r(6, 4, 52, 32, 'cb', 2) + tt(18, 9, 28) + ln(14, 18, 36) + btn(22, 24, 20),
    contacto: r(4, 6, 56, 28, 's', 2) + '<circle cx="15" cy="20" r="6" class="b"/>' + r(12, 19, 6, 2, 'w', 1) + tt(25, 12, 22) + ln(25, 20, 30) + ln(25, 26, 20, 'b'),
    glance: card(3, 7, 18, 26, true) + card(23, 7, 18, 26, true) + card(43, 7, 18, 26),
    timeline: r(5, 5, 14, 8, 'd', 1.5) + r(21, 5, 38, 8, 's', 1.5) + ln(24, 7.5, 24) + r(5, 16, 14, 8, 'd', 1.5) + r(21, 16, 38, 8, 's', 1.5) + ln(24, 18.5, 30) + r(5, 27, 14, 8, 'd', 1.5) + r(21, 27, 38, 8, 's', 1.5) + ln(24, 29.5, 18),
    deadlines: r(3, 7, 28, 26, 'cb', 2) + r(7, 11, 12, 2.5, 'b') + tt(7, 17, 18) + ln(7, 26, 16) + r(33, 7, 28, 26, 'cb', 2) + r(37, 11, 12, 2.5, 'b') + tt(37, 17, 18) + ln(37, 26, 16),
    wallet: r(6, 15, 24, 10, 'd', 3) + r(10, 19, 16, 2, 'w', 1) + r(34, 15, 24, 10, 'd', 3) + r(38, 19, 16, 2, 'w', 1),
    franja: r(2, 15, 60, 10, 'b', 1.5) + r(6, 19, 18, 2, 'w', 1) + r(42, 19, 16, 2, 'w', 1)
  };
  // Bloques antiguos: el esquema de su equivalente (con algún matiz).
  S.intro = r(6, 6, 26, 4, 't') + ln(6, 15, 52) + ln(6, 21, 46) + ln(6, 29, 34);
  S.titulo = tt(14, 5, 36) + r(26, 13, 12, 2, 'b') + ln(12, 19, 40) + btn(22, 27, 20);
  S.lista = tt(6, 5, 30) + dot(9, 17) + ln(14, 15.5, 40) + dot(9, 26) + ln(14, 24.5, 30) + dot(9, 35) + ln(14, 33.5, 36);
  S.cierre = r(26, 8, 12, 2, 'a') + tt(12, 17, 40) + r(26, 29, 12, 2, 'a');
  S.imagen = img(4, 5, 56, 30);
  S.fotos3 = S.images; S.boton = S.button;
  S.tarjetas = card(4, 7, 27, 26) + card(33, 7, 27, 26);
  S.info = r(4, 8, 56, 24, 's', 2) + ln(10, 14, 44) + ln(10, 20, 40) + ln(10, 26, 24);
  S.step = r(4, 5, 56, 30, 's', 2) + r(10, 9, 12, 2.5, 'b') + tt(10, 14, 26) + r(40, 13, 14, 7, 'a', 2) + ln(10, 23, 40) + btn(10, 27, 16);
  S.cta = r(4, 5, 56, 30, 'cb', 2) + tt(10, 10, 30) + ln(10, 19, 44) + btn(10, 25, 18);
  S.important = r(4, 6, 56, 28, 'd', 2) + r(10, 11, 18, 3, 'a', 1.5) + ln(10, 19, 44, 'wl') + ln(10, 25, 32, 'wl');
  K.BLOCK_ICONS = S;
  // SVG de la miniatura del bloque; null si no tiene esquema (la app usa entonces la letra).
  K.blockIcon = function (id) {
    return S[id] ? '<svg class="sk" viewBox="0 0 64 40" aria-hidden="true" focusable="false">' + S[id] + '</svg>' : null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
