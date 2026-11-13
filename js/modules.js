// ============================================================
// MOTOR DE NEWSLETTERS
// - Cada módulo es una pieza fija de HTML (copiada de las referencias aprobadas).
// - El texto de la usuaria se inserta TAL CUAL (solo se marcan negritas y enlaces).
// - Las piezas se escriben con los colores de Surf Cup y al final se cambian
//   por los del torneo elegido (una sola pasada, sin reemplazos encadenados).
// ============================================================
(function (root) {
  var K = root.KSA = root.KSA || {};
  var renderingProfile = false, renderingWCH = false;
  var P = '#6F4ACC', A = '#91FAFB', GREY = '#A5A0C4', SOFT = '#F7F4FC';
  // Roles de color que una marca puede separar del color principal (t.theme). Sin theme, cada rol vale lo mismo que antes,
  // así que el HTML de las demás marcas no cambia. Se resuelven al final de K.build.
  var C = { titleTracking: '%%C:titleTracking%%', title: '%%C:title%%', link: '%%C:link%%', button: '%%C:button%%', buttonText: '%%C:buttonText%%', franjaText: '%%C:franjaText%%', franjaBg: '%%C:franjaBg%%', line: '%%C:line%%', contactBg: '%%C:contactBg%%', band: '%%C:band%%', strong: '%%C:strong%%', titleCase: '%%C:titleCase%%', headWeight: '%%C:headWeight%%', btnRadius: '%%C:btnRadius%%',
    // Roles añadidos con el estilo de club (por defecto, lo de siempre): etiqueta sobre fondo oscuro, borde y etiqueta de las cajas
    // claras destacadas, línea bajo la franja y tamaño de los títulos principal y de sección.
    label: '%%C:label%%', edge: '%%C:edge%%', titleBar: '%%C:titleBar%%', onDark: '%%C:onDark%%', hilite: '%%C:hilite%%', franjaBar: '%%C:franjaBar%%', h1: '%%C:h1%%', h2: '%%C:h2%%' };
  var C_DEFAULT = { titleTracking: '0.3px', title: P, link: P, button: P, buttonText: '#FFFFFF', franjaText: P, franjaBg: '#FFFFFF', line: GREY, contactBg: '#FFFFFF', band: P, strong: P, titleCase: 'uppercase', headWeight: '400', btnRadius: '40px',
    label: P, edge: P, titleBar: P, onDark: A, hilite: P, franjaBar: A, h1: '38px;line-height:42px', h2: '34px;line-height:38px' };

  var F = {
    reg: "font-family:'DinProRegular', Arial, Helvetica, sans-serif;font-weight:400;",
    med: "font-family:'DinProMedium', Arial, Helvetica, sans-serif;font-weight:400;",
    bold: "font-family:'DinProBold', Arial, Helvetica, sans-serif;font-weight:bold;",
    black: "font-family:'DinProBlack', Arial, Helvetica, sans-serif;font-weight:900;",
    ex60: "font-family:'Extenda60', 'Arial Black', Arial, Helvetica, sans-serif;font-weight:" + C.headWeight + ";letter-spacing:" + C.titleTracking + ";",
    ex40: "font-family:'Extenda40', 'Arial Black', Arial, Helvetica, sans-serif;font-weight:" + C.headWeight + ";letter-spacing:" + C.titleTracking + ";"
  };

  // ---------- Texto ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function attr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function has(s) { return !!(s && String(s).trim()); }
  function paras(s) { return String(s || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  // Enlaces dentro del texto: solo https://, http:// (aviso) y mailto: se convierten en enlace.
  var LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  function linkLevel(u) {
    u = String(u || '');
    if (/^https:\/\/[^\s/?#.]+\.[^\s]+$/i.test(u)) return 'ok';
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(u)) return 'ok';
    if (/^http:\/\/[^\s/?#.]+\.[^\s]+$/i.test(u)) return 'warn';
    return 'error';
  }
  K.linkLevel = linkLevel;
  // **negrita**, *cursiva* y [texto](enlace). Nada más se toca.
  function inline(s, strongColor) {
    var h = esc(String(s || '').trim());
    h = h.replace(LINK, function (m, t, u) {
      // Un esquema no permitido (javascript:, data:, rutas sin https…) nunca llega a un href; la revisión lo marca.
      if (!/^(https?:\/\/|mailto:)/i.test(u)) return t;
      return '<a href="' + u.replace(/"/g, '&quot;') + '" target="_blank" style="color:' + C.link + ';text-decoration:underline;">' + t + '</a>';
    });
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="' + F.bold + 'color:' + (strongColor || C.strong) + ';">$1</strong>');
    // *cursiva* (un solo asterisco, después de las negritas)
    h = h.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em style="font-style:italic;">$2</em>');
    // ==etiqueta== (fondo del color principal, texto en negrita) y ++subrayado++ (negrita con subrayado del color principal).
    // Solo en el texto, nunca dentro de etiquetas o enlaces ya generados.
    if (h.indexOf('==') >= 0 || h.indexOf('++') >= 0) h = h.split(/(<[^>]+>)/).map(function (part) {
      if (part.charAt(0) === '<') return part;
      return part.replace(/==([^=\n]+?)==/g, '<span style="background-color:' + P + ';color:' + C.buttonText + ';font-weight:bold;padding:1px 6px;border-radius:3px;">$1</span>')
        .replace(/\+\+([^+\n]+?)\+\+/g, '<span style="font-weight:bold;color:' + (strongColor || C.title) + ';border-bottom:2px solid ' + P + ';">$1</span>');
    }).join('');
    return h;
  }
  // Extenda no tiene números: si el título lleva cifras, pasa a DinPro Black (algo más pequeño).
  function hasDigits(t) { return /\d/.test(String(t || '').replace(/\{\[.*?\]\}/g, '')); }
  // Salto de línea escrito en un título o dato (\n) → <br /> (p. ej. «Your Week in Paris,\n{[C-FIRST NAME:TC]}»).
  function br(h) { return h.replace(/\s*\n\s*/g, '<br />'); }
  function titleFont(text, fam, size, lh) {
    if (!renderingProfile && hasDigits(text)) { var n = Math.round(size * 0.8); return F.black + 'letter-spacing:0.3px;font-size:' + n + 'px;line-height:' + (n + 6) + 'px;'; }
    return F[fam] + 'font-size:' + size + 'px;line-height:' + lh + 'px;';
  }

  // ---------- Piezas comunes ----------
  var MSO_O = '<!--[if gte mso 9]><table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="650" style="width:650px;"><tr><td align="center" valign="top" width="650" style="width:650px;"><![endif]-->';
  var MSO_C = '<!--[if gte mso 9]></td></tr></table><![endif]-->';
  var TBL = '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"';

  function section(rows, bg) {
    bg = bg || '#FFFFFF';
    return '<tr><td align="center">' + MSO_O + TBL + ' style="background-color:' + bg + ';width:650px;" class="wrapper"><tbody>' + rows + '</tbody></table>' + MSO_C + '</td></tr>';
  }
  function cell(padding, align, content, bg) {
    bg = bg || '#FFFFFF';
    return '<tr><td bgcolor="' + bg + '"' + (align ? ' align="' + align + '"' : '') + ' style="padding:' + padding + ';background-color:' + bg + ';" class="mobile-pad">' + content + '</td></tr>';
  }
  // Placeholder de imagen: hueco gris de la medida del bloque. No es un asset y la revisión lo marca como error.
  K.IMG_PH = 'PLACEHOLDER';
  function isPh(v) { return String(v == null ? '' : v).trim() === K.IMG_PH; }
  K.isImagePlaceholder = isPh;
  function phBlock(w, h) {
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="' + w + '" align="center" style="width:' + w + 'px;max-width:100%;margin:0 auto;"><tbody><tr><td height="' + h + '" align="center" valign="middle" bgcolor="#E3E1E8" style="height:' + h + 'px;background-color:#E3E1E8;border:2px dashed #8A8698;' + F.bold + 'font-size:14px;line-height:20px;color:#55526A;text-align:center;letter-spacing:1px;">IMAGEN PENDIENTE · ' + w + ' px</td></tr></tbody></table>';
  }
  function imgFull(src, alt) {
    if (isPh(src)) return section('<tr><td style="padding:0;">' + phBlock(650, 260) + '</td></tr>');
    return section('<tr><td style="padding:0;text-align:center;font-size:0;line-height:0;"><img src="' + attr(src) + '" alt="' + attr(alt) + '" title="' + attr(alt) + '" border="0" width="650" style="width:650px;display:block;" class="img-max" /></td></tr>');
  }
  function bar(w, color, align, margin) {
    if(renderingProfile && color===P) color=C.titleBar;
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="' + w + '" align="' + align + '" style="margin:' + margin + ';"><tbody><tr><td height="4" style="height:4px;line-height:4px;font-size:0;background-color:' + color + ';border-radius:2px;">&nbsp;</td></tr></tbody></table>';
  }
  // Texto en puntos dentro de cajas y timeline: «•» del color principal y el texto a continuación (una línea, un punto).
  function dotLines(text, size, lh, first) {
    return paras(text).map(function (p, i) {
      return '<p style="' + F.reg + 'font-size:' + size + 'px;line-height:' + lh + 'px;color:#000000;word-break:break-word;padding-top:' + (i ? 7 : first) + 'px;"><span style="color:' + P + ';font-weight:bold;">&bull;</span>&nbsp; ' + inline(p) + '</p>';
    }).join('');
  }
  function bullets(text) {
    var rows = paras(text).map(function (it) {
      return '<tr><td valign="top" width="26" style="font-size:12px;line-height:24px;color:' + P + ';padding:0 0 12px 0;">&#9679;</td><td valign="top" style="' + F.reg + 'font-size:15px;line-height:24px;color:#000000;padding:0 0 12px 0;word-break:break-word;">' + inline(it) + '</td></tr>';
    }).join('');
    return TBL + '><tbody>' + rows + '</tbody></table>';
  }
  function button(text, url, block) {
    var a = block
      ? 'display:block;padding:13px 10px;' + F.bold + 'font-size:13px;line-height:17px;color:' + C.buttonText + ';text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;text-align:center;border-radius:' + C.btnRadius + ';'
      : 'display:inline-block;padding:14px 30px;' + F.bold + 'font-size:14px;line-height:18px;color:' + C.buttonText + ';text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;border-radius:' + C.btnRadius + ';';
    var t = block
      ? TBL + ' style="border-collapse:separate !important;">'
      : '<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:22px auto 0 auto;border-collapse:separate !important;">';
    return t + '<tbody><tr><td align="center" bgcolor="' + C.button + '" style="background-color:' + C.button + ';border-radius:' + C.btnRadius + ';"><a href="' + attr(url) + '" target="_blank" style="' + a + '">' + esc(text) + '</a></td></tr></tbody></table>';
  }
  function softBand(text, dots) {
    if (dots) return TBL + ' bgcolor="' + SOFT + '" style="background-color:' + SOFT + ';border-left:4px solid ' + (renderingProfile ? C.edge : P) + ';"><tbody><tr><td bgcolor="' + SOFT + '" style="padding:22px 24px;background-color:' + SOFT + ';">' + dotLines(text, 15, 24, 0) + '</td></tr></tbody></table>';
    var ps = paras(text).map(function (p, i) {
      return '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;word-break:break-word;' + (i ? 'padding-top:12px;' : '') + '">' + inline(p) + '</p>';
    }).join('');
    return TBL + ' bgcolor="' + SOFT + '" style="background-color:' + SOFT + ';border-left:4px solid ' + (renderingProfile ? C.edge : P) + ';"><tbody><tr><td bgcolor="' + SOFT + '" style="padding:22px 24px;background-color:' + SOFT + ';">' + ps + '</td></tr></tbody></table>';
  }
  function gap(h) { return '<div style="height:' + h + 'px;line-height:' + h + 'px;font-size:0;">&nbsp;</div>'; }

  // Contenido de una tarjeta (se usa igual en escritorio y móvil → nunca se desincronizan)
  // dark: tarjeta sobre el color de banda (textos en blanco, etiqueta en color de acento).
  function cardBody(c, dark) {
    var h = '', fg = dark ? '#FFFFFF' : C.title;
    if (has(c.label)) h += '<p style="' + F.med + 'font-size:11px;line-height:14px;color:' + (dark ? A : GREY) + ';letter-spacing:1.5px;text-transform:uppercase;">' + esc(c.label.trim()) + '</p>';
    if (has(c.title)) {
      var st = hasDigits(c.title) ? F.black + 'font-size:20px;line-height:24px;letter-spacing:0.3px;' : F.ex40 + 'font-size:28px;line-height:31px;';
      h += '<p style="' + st + 'color:' + fg + ';text-transform:' + C.titleCase + ';' + (has(c.label) ? 'padding-top:6px;' : '') + 'word-break:break-word;">' + esc(c.title.trim()) + '</p>';
    }
    if (has(c.price)) h += '<p style="' + F.black + 'font-size:26px;line-height:30px;color:' + fg + ';padding-top:6px;word-break:break-word;">' + esc(c.price.trim()) + '</p>';
    paras(c.text).forEach(function (p, i) {
      var t = '<p style="' + F.reg + 'font-size:15px;line-height:23px;color:' + (dark ? '#FFFFFF' : '#000000') + ';text-align:left;padding-top:' + (i ? 8 : 10) + 'px;word-break:break-word;">' + inline(p, dark ? '#FFFFFF' : undefined) + '</p>';
      h += dark ? t.split(C.link).join('#FFFFFF') : t;
    });
    return h;
  }
  // Tarjetas de igual altura: en escritorio, filas de dos (una tarjeta sola o la última impar ocupa todo el ancho);
  // en móvil, una copia apilada. Con exactamente dos tarjetas el HTML es el mismo de siempre.
  function cardGrid(cs) {
    // El botón se pinta en cuanto tiene texto; si falta el enlace, la revisión da error.
    var btn = cs.some(function (c) { return has(c.btn); });
    function cardBtn(c) { return has(c.btn) ? button(c.btn.trim(), String(c.url || '').trim() || '#', true) : '&nbsp;'; }
    var SP = '<td width="16" style="width:16px;font-size:0;line-height:0;">&nbsp;</td>';
    var desk = '<table role="presentation" class="desk-only" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody>';
    var mob = '', rows = [];
    for (var r = 0; r < cs.length; r += 2) rows.push(cs.slice(r, r + 2));
    function w(row) { return row.length === 1 ? ' colspan="3" width="100%"' : ' width="277"'; }
    rows.forEach(function (row, ri) {
      if (ri) desk += '<tr><td colspan="3" height="16" style="height:16px;font-size:0;line-height:0;">&nbsp;</td></tr>';
      if (btn) {
        desk += '<tr>' + row.map(function (c) { return '<td' + w(row) + ' valign="top" style="border:2px solid ' + P + ';border-bottom:none;border-radius:14px 14px 0 0;padding:22px 20px 0 20px;background-color:#FFFFFF;">' + cardBody(c) + '</td>'; }).join(SP) + '</tr>';
        desk += '<tr>' + row.map(function (c) { return '<td' + w(row) + ' valign="bottom" style="border:2px solid ' + P + ';border-top:none;border-radius:0 0 14px 14px;padding:18px 20px 22px 20px;background-color:#FFFFFF;">' + cardBtn(c) + '</td>'; }).join(SP) + '</tr>';
      } else {
        desk += '<tr>' + row.map(function (c) { return '<td' + w(row) + ' valign="top" style="border:2px solid ' + P + ';border-radius:14px;padding:22px 20px;background-color:#FFFFFF;">' + cardBody(c) + '</td>'; }).join(SP) + '</tr>';
      }
    });
    if (btn) {
      mob = cs.map(function (c) {
        return TBL + ' height="100%" style="height:100%;background-color:#FFFFFF;border:2px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody><tr><td valign="top" height="100%" style="height:100%;padding:22px 20px 0 20px;">' + cardBody(c) + '</td></tr><tr><td align="center" valign="bottom" style="padding:18px 20px 22px 20px;">' + cardBtn(c) + '</td></tr></tbody></table>';
      }).join(gap(16));
    } else {
      mob = cs.map(function (c) {
        return TBL + ' style="background-color:#FFFFFF;border:2px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody><tr><td valign="top" style="padding:22px 20px;">' + cardBody(c) + '</td></tr></tbody></table>';
      }).join(gap(16));
    }
    desk += '</tbody></table>';
    return desk + '<!--[if !mso]><!--><div class="mob-only" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + mob + '</div><!--<![endif]-->';
  }
  function twoCards(c1, c2) { return cardGrid([c1, c2]); }

  // Opciones con precio (módulo Producto), responsive según cuántas haya y cuánto texto tengan:
  // · 1 (o una que queda sola en su fila): ancho completo, nombre a la izquierda, precio en el borde derecho y texto debajo.
  // · 2, 4 y 8: filas de dos (rejilla 2×2…). · 3, 5, 6 y 7 con textos cortos: filas de tres (5 → 3+2, 7 → 3+2+2).
  //   Con textos largos, filas de dos y la última impar a todo el ancho. · En móvil, siempre una debajo de otra.
  var CARD_W = 570, CARD_GAP = 16;
  // Escala de imágenes (opción nueva de Imagen y Tarjetas): '' = tamaño de siempre.
  var SCALE_OPTS = [['', '100 % (tamaño normal)'], ['85', '85 %'], ['70', '70 %'], ['55', '55 %'], ['40', '40 %']];
  function plain(t) { return String(t || '').replace(/\*\*|==|\+\+|[*_]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim(); }
  K.optionRows = function (cs) {
    var n = cs.length, rows = [], i;
    if (n <= 2) return n ? [cs.slice()] : [];
    var short = cs.every(function (c) { return plain(c.title).length <= 22 && plain(c.price).length <= 12 && plain(c.text).length <= 140; });
    var per = short && n !== 4 && n !== 8 ? 3 : 2;
    for (i = 0; i < n; i += per) rows.push(cs.slice(i, i + per));
    // Con filas de tres, no dejar una sola al final: 3+3+1 → 3+2+2.
    if (per === 3 && rows.length > 1 && rows[rows.length - 1].length === 1) { var last = rows.pop(), prev = rows.pop(); rows.push(prev.slice(0, 2), [prev[2]].concat(last)); }
    return rows;
  };
  function priceTag(price, size, dark) {
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate !important;"><tbody><tr><td align="center" style="border:2px solid ' + (dark ? '#FFFFFF' : P) + ';border-radius:40px;padding:6px 16px;white-space:nowrap;"><p style="' + F.black + 'font-size:' + size + 'px;line-height:' + (size + 4) + 'px;color:' + (dark ? '#FFFFFF' : C.title) + ';text-align:center;">' + esc(price.trim()) + '</p></td></tr></tbody></table>';
  }
  // Tarjeta ancha: nombre y precio en la misma línea, texto debajo.
  function wideCard(c, dark) {
    var fg = dark ? '#FFFFFF' : C.title;
    var title = (has(c.label) ? '<p style="' + F.med + 'font-size:11px;line-height:14px;color:' + (dark ? A : GREY) + ';letter-spacing:1.5px;text-transform:uppercase;padding-bottom:6px;">' + esc(c.label.trim()) + '</p>' : '') +
      (has(c.title) ? '<p style="' + (hasDigits(c.title) ? F.black + 'font-size:20px;line-height:24px;letter-spacing:0.3px;' : F.ex40 + 'font-size:28px;line-height:31px;') + 'color:' + fg + ';text-transform:' + C.titleCase + ';word-break:break-word;">' + esc(c.title.trim()) + '</p>' : '');
    var h = TBL + '><tbody><tr><td valign="middle" style="padding:0 12px 0 0;">' + title + '</td>' + (has(c.price) ? '<td valign="middle" align="right" style="padding:0;white-space:nowrap;">' + priceTag(c.price, 22, dark) + '</td>' : '') + '</tr></tbody></table>';
    paras(c.text).forEach(function (p, i) {
      var t = '<p style="' + F.reg + 'font-size:15px;line-height:23px;color:' + (dark ? '#FFFFFF' : '#000000') + ';text-align:left;padding-top:' + (i ? 8 : 12) + 'px;word-break:break-word;">' + inline(p, dark ? '#FFFFFF' : undefined) + '</p>';
      h += dark ? t.split(C.link).join('#FFFFFF') : t;
    });
    return h;
  }
  // Botón de tarjeta: en una tarjeta oscura va en blanco para que se vea sobre el fondo de color.
  function cardButton(c, dark, wide) {
    var b = button(c.btn.trim(), String(c.url || '').trim() || '#', !wide);
    if (wide) b = b.replace('align="center" style="margin:22px auto 0 auto;', 'align="left" style="margin:18px 0 0 0;');
    return dark ? b.split('bgcolor="' + C.button + '" style="background-color:' + C.button).join('bgcolor="#FFFFFF" style="background-color:#FFFFFF').split('color:' + C.buttonText).join('color:' + C.title) : b;
  }
  // Rejilla responsive de tarjetas (bloque «Tarjetas»): mismas filas que las opciones de Producto (K.optionRows),
  // con etiqueta, botón (alineado abajo en cada fila) y estilo claro u oscuro por tarjeta. En móvil, apiladas.
  // Imagen opcional arriba de una tarjeta (nueva): sin imagen no añade nada. pct = escala; fluid = móvil (ancho en %).
  function cardPic(c, w, pct, fluid) {
    if (!has(c.img)) return '';
    var iw = Math.round(w * (pct || 100) / 100), src = String(c.img).trim();
    var pic = isPh(src) ? phBlock(iw, Math.round(iw * 0.6)) : '<img src="' + attr(src) + '" alt="' + attr(c.alt) + '" title="' + attr(c.alt) + '" border="0" width="' + iw + '" style="width:' + (fluid ? (pct || 100) + '%' : iw + 'px') + ';max-width:100%;height:auto;display:block;margin:0 auto;border-radius:8px;" />';
    return TBL + '><tbody><tr><td align="center" style="padding:0 0 14px 0;">' + pic + '</td></tr></tbody></table>';
  }
  function cardRows(cs, pct) {
    if (!cs.length) return '';
    var rows = K.optionRows(cs), SP = '<td width="' + CARD_GAP + '" style="width:' + CARD_GAP + 'px;font-size:0;line-height:0;">&nbsp;</td>';
    function look(c) { var bg = c.dark ? C.band : '#FFFFFF'; return 'border:2px solid ' + (c.dark ? C.band : P) + ';border-radius:14px;background-color:' + bg + ';'; }
    function bg(c) { return ' bgcolor="' + (c.dark ? C.band : '#FFFFFF') + '"'; }
    var desk = '<table role="presentation" class="desk-only" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody>';
    rows.forEach(function (row, ri) {
      if (ri) desk += '<tr><td height="' + CARD_GAP + '" style="height:' + CARD_GAP + 'px;font-size:0;line-height:0;">&nbsp;</td></tr>';
      var k = row.length, padX = k === 3 ? 16 : 20, w = Math.floor((CARD_W - CARD_GAP * (k - 1)) / k) - padX * 2 - 4, inner;
      if (k === 1) {
        var c = row[0];
        inner = '<tr><td width="100%"' + bg(c) + ' valign="top" style="' + look(c) + 'padding:22px 24px;">' + cardPic(c, CARD_W - 52, pct) + wideCard(c, c.dark) + (has(c.btn) ? cardButton(c, c.dark, true) : '') + '</td></tr>';
      } else if (row.some(function (c) { return has(c.btn); })) {
        // Dos filas (cuerpo y botón) para que los botones queden alineados abajo aunque los textos midan distinto.
        inner = '<tr>' + row.map(function (c) { return '<td width="' + w + '"' + bg(c) + ' valign="top" style="' + look(c) + 'border-bottom:none;border-radius:14px 14px 0 0;width:' + w + 'px;padding:' + (k === 3 ? '20px ' : '22px ') + padX + 'px 0 ' + padX + 'px;">' + cardPic(c, w, pct) + cardBody(c, c.dark) + '</td>'; }).join(SP) + '</tr>' +
          '<tr>' + row.map(function (c) { return '<td width="' + w + '"' + bg(c) + ' valign="bottom" style="' + look(c) + 'border-top:none;border-radius:0 0 14px 14px;width:' + w + 'px;padding:18px ' + padX + 'px ' + (k === 3 ? 20 : 22) + 'px ' + padX + 'px;">' + (has(c.btn) ? cardButton(c, c.dark) : '&nbsp;') + '</td>'; }).join(SP) + '</tr>';
      } else {
        inner = '<tr>' + row.map(function (c) { return '<td width="' + w + '"' + bg(c) + ' valign="top" style="' + look(c) + 'width:' + w + 'px;padding:' + (k === 3 ? '20px ' : '22px ') + padX + 'px;">' + cardPic(c, w, pct) + cardBody(c, c.dark) + '</td>'; }).join(SP) + '</tr>';
      }
      desk += '<tr><td style="padding:0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody>' + inner + '</tbody></table></td></tr>';
    });
    desk += '</tbody></table>';
    var mob = cs.map(function (c) {
      return TBL + bg(c) + ' style="' + look(c) + 'border-collapse:separate !important;"><tbody><tr><td valign="top" style="padding:22px 20px;">' + cardPic(c, 486, pct, true) + (cs.length === 1 ? wideCard(c, c.dark) : cardBody(c, c.dark)) + (has(c.btn) ? '<div style="height:18px;line-height:18px;font-size:0;">&nbsp;</div>' + cardButton(c, c.dark) : '') + '</td></tr></tbody></table>';
    }).join(gap(16));
    return desk + '<!--[if !mso]><!--><div class="mob-only" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + mob + '</div><!--<![endif]-->';
  }
  function optionCards(cs) {
    if (cs.length === 2) return cardGrid(cs); // mismo HTML que antes
    var rows = K.optionRows(cs), SP = '<td width="' + CARD_GAP + '" style="width:' + CARD_GAP + 'px;font-size:0;line-height:0;">&nbsp;</td>';
    var box = 'border:2px solid ' + P + ';border-radius:14px;background-color:#FFFFFF;';
    var desk = '<table role="presentation" class="desk-only" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody>';
    rows.forEach(function (row, ri) {
      if (ri) desk += '<tr><td height="' + CARD_GAP + '" style="height:' + CARD_GAP + 'px;font-size:0;line-height:0;">&nbsp;</td></tr>';
      // El ancho de una celda no incluye su padding ni el borde: se resta para que la fila no pase de CARD_W.
      var k = row.length, padX = k === 3 ? 16 : 20, w = Math.floor((CARD_W - CARD_GAP * (k - 1)) / k) - padX * 2 - 4;
      var cells = k === 1 ? '<td width="100%" valign="top" style="' + box + 'padding:22px 24px;">' + wideCard(row[0]) + '</td>'
        : row.map(function (c) { return '<td width="' + w + '" valign="top" style="' + box + 'width:' + w + 'px;padding:' + (k === 3 ? '20px ' : '22px ') + padX + 'px;">' + cardBody(c) + '</td>'; }).join(SP);
      desk += '<tr><td style="padding:0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody><tr>' + cells + '</tr></tbody></table></td></tr>';
    });
    desk += '</tbody></table>';
    var mob = cs.map(function (c) {
      return TBL + ' style="background-color:#FFFFFF;border:2px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody><tr><td valign="top" style="padding:22px 20px;">' + (cs.length === 1 ? wideCard(c) : cardBody(c)) + '</td></tr></tbody></table>';
    }).join(gap(16));
    return desk + '<!--[if !mso]><!--><div class="mob-only" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + mob + '</div><!--<![endif]-->';
  }

  // Grupos repetibles «de 1 a N, con ＋ Añadir otro»: claves <prefix><n>_<campo> y d[countKey] con cuántos se ven en el editor.
  // cfg: { prefix, countKey, max, keys (los que cuentan como rellenos), titleKey, noun ('opción'/'tarjeta'), fields(n, show) }
  K.repeat = function (cfg) {
    var g = {};
    // Claves «p1_title» por defecto; cfg.key permite las de bloques ya existentes («l1», «v1»…).
    function key(n, k) { return cfg.key ? cfg.key(n, k) : cfg.prefix + n + '_' + k; }
    g.filled = function (d, n) { return cfg.keys.some(function (k) { return has(d[key(n, k)]); }); };
    g.count = function (d) {
      var hi = 0, n; d = d || {};
      for (n = 1; n <= cfg.max; n++) if (g.filled(d, n)) hi = n;
      return Math.min(cfg.max, Math.max(1, hi, parseInt(d[cfg.countKey], 10) || 0));
    };
    g.add = function (d) { d[cfg.countKey] = Math.min(cfg.max, g.count(d) + 1); return d[cfg.countKey]; };
    // Quita el elemento n y sube los siguientes (todas sus claves, también las que no cuentan como rellenas).
    g.remove = function (d, n) {
      var count = g.count(d), j, all = cfg.allKeys || cfg.keys;
      for (j = n; j < cfg.max; j++) all.forEach(function (k) { var v = d[key(j + 1, k)]; if (has(v)) d[key(j, k)] = v; else delete d[key(j, k)]; });
      all.forEach(function (k) { delete d[key(cfg.max, k)]; });
      d[cfg.countKey] = Math.max(1, count - 1);
    };
    // Elementos que se pintan: los que tienen título, en orden.
    g.items = function (d) {
      var out = [], n, all = cfg.allKeys || cfg.keys;
      for (n = 1; n <= cfg.max; n++) if (has(d[key(n, cfg.titleKey)])) { var it = {}; all.forEach(function (k) { it[k] = d[key(n, k)]; }); out.push(it); }
      return out;
    };
    g.fields = function () {
      var out = [], n;
      for (n = 1; n <= cfg.max; n++) (function (n) {
        var show = function (d) { return n <= g.count(d); }, name = cfg.noun.charAt(0).toUpperCase() + cfg.noun.slice(1) + ' ' + n;
        out.push({ type: 'opt', n: n, label: name, showIf: show, canRemove: function (d) { return g.count(d) > 1 || g.filled(d, n); }, remove: function (d) { g.remove(d, n); } });
        cfg.fields(n, show).forEach(function (f) { out.push(f); });
      })(n);
      out.push({ type: 'more', label: cfg.more || '＋ Añadir otra ' + cfg.noun, hint: cfg.hint, showIf: function (d) { return g.count(d) < cfg.max; }, add: function (d) { return key(g.add(d), cfg.titleKey || cfg.keys[0]); } });
      return out;
    };
    // Revisión: un elemento con contenido pero sin título no se muestra.
    g.check = function (d, W, where) {
      if (cfg.titleKey) for (var n = 1; n <= cfg.max; n++) if (!has(d[key(n, cfg.titleKey)]) && g.filled(d, n)) W(where + ': la ' + cfg.noun + ' ' + n + ' no tiene ' + cfg.titleName + ' y no se mostrará.');
    };
    return g;
  };
  var LAYOUT_HINT = 'Una sola va a todo el ancho; con textos cortos van hasta tres por fila (con 4, en rejilla 2×2). En móvil, una debajo de otra.';

  // Opciones con precio del módulo Producto: de 1 a PK_MAX (p1_*, p2_*…). d.pkN guarda cuántas se muestran en el editor.
  var PK_MAX = 8;
  var PK = K.repeat({ prefix: 'p', countKey: 'pkN', max: PK_MAX, keys: ['title', 'price', 'text'], titleKey: 'title', titleName: 'nombre', noun: 'opción',
    hint: 'Hasta ' + PK_MAX + ' opciones. Una sola va a todo el ancho con el precio a la derecha; con textos cortos van hasta tres por fila (con 4, en rejilla 2×2). En móvil, una debajo de otra.',
    fields: function (n, show) {
      return [{ k: 'p' + n + '_title', label: 'Opción ' + n, type: 'text', half: true, showIf: show }, { k: 'p' + n + '_price', label: 'Precio ' + n, type: 'text', half: true, showIf: show },
        { k: 'p' + n + '_text', label: 'Texto opción ' + n, type: 'area', showIf: show }];
    } });
  K.PK_MAX = PK_MAX; K.pkCount = PK.count; K.pkAdd = PK.add; K.pkRemove = PK.remove; K.pkOptions = PK.items;
  function pkFields() { return PK.fields(); }

  // Bloque «Tarjetas»: de 1 a 8 (c1_*, c2_*…).
  var CARDS = K.repeat({ prefix: 'c', countKey: 'cN', max: 8, keys: ['label', 'title', 'price', 'text', 'btn', 'url', 'img'], allKeys: ['label', 'title', 'price', 'text', 'btn', 'url', 'style', 'img', 'alt'], titleKey: 'title', titleName: 'título', noun: 'tarjeta',
    hint: 'Hasta 8 tarjetas. ' + LAYOUT_HINT,
    fields: function (n, show) {
      var c = 'c' + n + '_';
      return [
        { k: c + 'title', label: 'Título ' + n, type: 'text', req: n === 1, half: true, showIf: show, ph: 'Pack, dato o fecha' }, { k: c + 'price', label: 'Precio ' + n + ' (opcional)', type: 'text', half: true, showIf: show, ph: '$49' },
        { k: c + 'label', label: 'Etiqueta ' + n + ' (opcional)', type: 'text', half: true, showIf: show, ph: 'Dates' }, { k: c + 'style', label: 'Estilo ' + n, type: 'select', half: true, showIf: show, opts: [['', 'Clara con borde'], ['dark', 'Oscura (color de banda)']] },
        { k: c + 'text', label: 'Texto ' + n + ' (opcional)', type: 'area', hint: TIP, showIf: show },
        { k: c + 'img', label: 'Imagen ' + n + ' (opcional) · custom link', type: 'url', img: true, half: true, showIf: show }, { k: c + 'alt', label: 'Descripción imagen ' + n, type: 'text', half: true, showIf: show },
        { k: c + 'btn', label: 'Botón ' + n + ' (opcional)', type: 'text', half: true, showIf: show }, { k: c + 'url', label: 'Enlace ' + n, type: 'url', half: true, showIf: show }
      ];
    } });
  K.cardItems = function (d) { return CARDS.items(d || {}).map(function (c) { c.dark = c.style === 'dark'; return c; }); };
  K.cardsCount = CARDS.count;

  // ============================================================
  // MÓDULOS  (fields = lo que se rellena en la app)
  // tipos de campo: text · area (un párrafo por línea) · url · select · head (subtítulo del formulario)
  // req: true → si está vacío, la revisión avisa
  // ============================================================
  var M = K.MODULES = {};
  var TIP = 'Un párrafo por línea. **negrita** · *cursiva* · [texto](enlace) · ==etiqueta destacada== · ++subrayado de color++';

  // Franja de un kit con referencias (t.theme.franja, de js/brand-designs.js): estilo propio a cada lado, como en sus HTML de ejemplo.
  function franjaKit(d, t, spec) {
    var left = has(d.left) ? d.left : (t.franjaLeft || ''), right = has(d.right) ? d.right.trim() : t.franjaRight || (t.club ? t.brand : t.name);
    function ps(x) {
      var font = x.font === 'serif' ? "font-family:Georgia, 'Times New Roman', Times, serif;font-weight:bold;" : x.font === 'bold' ? F.bold : x.font === 'regbold' ? F.reg.replace('font-weight:400;', 'font-weight:bold;') : F.reg;
      return font + (x.italic ? 'font-style:italic;' : '') + 'font-size:' + x.size + ';line-height:' + (spec.lh || '14px') + ';color:' + x.color + ';letter-spacing:' + x.tracking + ';text-transform:uppercase;' + (spec.nowrap ? 'white-space:nowrap;' : spec.keepAll ? 'white-space:nowrap;word-break:keep-all;' : 'word-break:break-word;');
    }
    // mobileSub: en móvil la etiqueta baja a 9 px sin espaciado (la regla CSS se añade al <head> solo en estos emails, ver K.build).
    var pc = spec.mobileSub ? '<p class="mobile-sub" style="' : '<p style="';
    var tdL = spec.nowrap ? '<td align="left" style="white-space:nowrap;">' : '<td align="left">', tdR = spec.nowrap ? '<td align="right" style="white-space:nowrap;padding-left:12px;">' : '<td align="right" style="padding-left:12px;">';
    return section(cell(spec.pad || '12px 40px', '', TBL + '><tbody><tr>' + tdL + pc + ps(spec.l) + '">' + esc(left.trim()) + '</p></td>' + tdR + pc + ps(spec.r) + '">' + esc(right) + '</p></td></tr></tbody></table>', spec.bg) +
      (spec.bar ? '<tr><td height="4" bgcolor="' + spec.bar + '" style="height:4px;line-height:4px;font-size:0;background-color:' + spec.bar + ';">&nbsp;</td></tr>' : ''));
  }

  M.franja = {
    letter: 'B', name: 'Franja identificadora', tag: 'FRANJA',
    fields: [{ k: 'left', label: 'Etiqueta izquierda', type: 'text', req: true, ph: 'Media Packages' }],
    build: function (d, t) {
      var spec = renderingProfile && t.theme && t.theme.franja;
      if (spec) return franjaKit(d, t, spec);
      var compact = renderingProfile && t.theme && t.theme.franjaTracking;
      var ps = (compact ? F.bold : F.med) + 'font-size:' + (compact ? t.theme.franjaSize : '11px') + ';line-height:14px;color:' + C.franjaText + ';letter-spacing:' + (compact ? t.theme.franjaTracking : '3px') + ';text-transform:uppercase;word-break:break-word;';
      // Una marca puede fijar las etiquetas (t.franjaLeft por defecto a la izquierda, t.franjaRight a la derecha).
      var left = has(d.left) ? d.left : (t.franjaLeft || ''), right = has(d.right) ? d.right.trim() : t.franjaRight || (t.club ? t.brand : t.name);
      return section(cell(compact ? '12px 40px' : '14px 40px', '', TBL + '><tbody><tr><td align="left"><p style="' + ps + '">' + esc(left.trim()) + '</p></td><td align="right"><p style="' + ps + '">' + esc(right) + '</p></td></tr></tbody></table>', C.franjaBg) +
        (compact ? '' : '<tr><td height="4" bgcolor="' + C.franjaBar + '" style="height:4px;line-height:4px;font-size:0;background-color:' + C.franjaBar + ';">&nbsp;</td></tr>'));
    }
  };

  M.intro = {
    letter: 'C', name: 'Texto / Intro (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Título» (estilo saludo) y «Texto».', tag: 'INTRO',
    fields: [
      { k: 'greet', label: 'Saludo (opcional, sale como título)', type: 'text', ph: 'Dear {[C-FIRST NAME]},' },
      { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }
    ],
    build: function (d) {
      var h = '', first = true;
      if (has(d.greet)) { h += '<p style="' + F.bold + 'font-size:28px;line-height:34px;color:' + C.title + ';word-break:break-word;">' + esc(d.greet.trim()) + '</p>'; first = false; }
      paras(d.text).forEach(function (p) {
        h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;' + (first ? '' : 'padding-top:14px;') + 'word-break:break-word;">' + inline(p) + '</p>'; first = false;
      });
      return section(cell('32px 40px 22px 40px', 'left', h));
    }
  };

  M.titulo = {
    letter: 'I', name: 'Título centrado (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Título», «Texto» y «Botón».', tag: 'TITULO',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true },
      { k: 'text', label: 'Texto (opcional)', type: 'area', hint: TIP },
      { k: 'btn', label: 'Texto del botón (opcional)', type: 'text' },
      { k: 'url', label: 'Enlace del botón', type: 'url' }
    ],
    build: function (d) {
      var ps = paras(d.text), b = has(d.btn);
      var h = '<p style="' + titleFont(d.title, 'ex60', 38, 42) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:center;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bar(56, P, 'center', '14px auto 0 auto');
      ps.forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;text-align:center;padding-top:' + (i ? 8 : 20) + 'px;word-break:break-word;">' + inline(p) + '</p>'; });
      if (b) h += button(d.btn.trim(), String(d.url || '').trim() || '#', false);
      return section(cell(ps.length || b ? '34px 40px 36px 40px' : '34px 40px 6px 40px', 'center', h));
    }
  };

  M.lista = {
    letter: 'D', name: 'Título + lista (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Título» (estilo sección) y «Lista».', tag: 'TITULO + LISTA',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true },
      { k: 'items', label: 'Puntos', type: 'area', req: true, hint: 'Un punto por línea. **negrita** · [texto](enlace)' }
    ],
    build: function (d) {
      return section(cell('30px 40px 10px 40px', 'left', '<p style="' + titleFont(d.title, 'ex60', 34, 38) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';padding-bottom:16px;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bullets(d.items)));
    }
  };

  var E_LINES = { compra: 'To purchase your package {[E-MODIFY REG LINK]}', modificar: 'If you want to modify your registration {[E-MODIFY REG LINK]}' };
  M.compra = {
    letter: 'E', name: 'Caja de compra / registro (campos Cvent)', tag: 'CAJA COMPRA (CAMPOS CVENT)',
    fields: [
      { k: 'variant', label: 'Frase principal', type: 'select', opts: [['compra', 'To purchase your package (Click here)'], ['modificar', 'If you want to modify your registration (Click here)'], ['custom', 'Otra (escribe tu frase)']] },
      { k: 'line', label: 'Tu frase', type: 'text', ph: 'To book your hotel [click here](https://…)', hint: 'Para el enlace de Cvent de la inscripción escribe {[E-MODIFY REG LINK]}; para otro enlace, [texto](https://…). Admite **negrita**.', showIf: function (d) { return d.variant === 'custom'; } },
      { k: 'layout', label: 'Orden', type: 'select', opts: [['top', 'Frase arriba, datos debajo'], ['bottom', 'Datos arriba, frase debajo']] },
      { k: 'info', label: 'Línea sobre los datos (opcional)', type: 'text', ph: 'Your registration access information:', showIf: function (d) { return d.layout === 'bottom'; } }
    ],
    defaults: { variant: 'compra', layout: 'top' },
    build: function (d) {
      var line = d.variant === 'custom' ? (d.line || '').trim() : E_LINES[d.variant || 'compra'];
      var lab = F.med + 'font-size:11px;line-height:14px;color:' + GREY + ';letter-spacing:1.5px;text-transform:uppercase;text-align:center;padding-bottom:4px;';
      var val = F.bold + 'font-size:18px;line-height:24px;color:' + C.title + ';text-align:center;word-break:break-word;';
      function dato(pad, l, v) { return '<tr class="css-vsf5of"><td align="center" style="padding:' + pad + ';text-align:center;word-break:break-word;"><p style="' + lab + '">' + l + '</p><p style="' + val + '">' + v + '</p></td></tr>'; }
      function cta(pad) { return '<tr class="css-vsf5of"><td align="center" style="padding:' + pad + ';' + F.bold + 'font-size:20px;line-height:26px;color:#000000;text-align:center;word-break:break-word;"><span style="color: rgb(0,0,0);"><span style="font-weight: bold;">' + (d.variant === 'custom' ? inline(line, '#000000') : esc(line)) + '</span></span></td></tr>'; }
      var rule = '<tr><td style="padding:14px 40px 6px 40px;">' + TBL + '><tbody><tr><td style="border-top:1px solid ' + C.line + ';font-size:0;line-height:0;">&nbsp;</td></tr></tbody></table></td></tr>';
      var rows;
      if (d.layout === 'bottom') {
        rows = (has(d.info) ? '<tr class="css-vsf5of"><td align="center" style="padding:26px 16px 6px 16px;text-align:center;word-break:break-word;"><p style="' + F.bold + 'font-size:16px;line-height:24px;color:#000000;text-align:center;word-break:break-word;">' + esc(d.info.trim()) + '</p></td></tr>' : '') +
          dato(has(d.info) ? '10px 16px 6px 16px' : '26px 16px 6px 16px', 'Confirmation number', '{[C-CONFIRMATION NUM]}') + dato('10px 16px 6px 16px', 'Email used for registration', '{[C-EMAIL]}') + rule + cta('14px 16px 26px 16px');
      } else {
        rows = cta('26px 16px 8px 16px') + rule + dato('10px 16px 6px 16px', 'Confirmation number', '{[C-CONFIRMATION NUM]}') + dato('10px 16px 26px 16px', 'Email used for registration', '{[C-EMAIL]}');
      }
      return section(cell('22px 40px 8px 40px', 'left', TBL + ' style="background-color:#FFFFFF;border:3px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody>' + rows + '</tbody></table>'));
    }
  };

  M.contacto = {
    letter: 'F', name: 'Caja de contacto (Get in Touch)', tag: 'CONTACTO',
    fields: [], note: 'Texto fijo con el email de contacto y el teléfono del evento.',
    build: function (d, t) {
      var mail = t && t.club ? String(t.contact || '').trim() : K.CLIENT.contactEmail;
      var link = mail ? '<a href="mailto:' + attr(mail) + '" style="color:' + C.link + ';text-decoration:underline;"><span style="' + F.bold + '">' + esc(mail) + '</span></a>' : '<span style="' + F.bold + '">CONTACTO PENDIENTE</span>';
      return section(cell('16px 40px 32px 40px', 'center', TBL + ' style="background-color:' + C.contactBg + ';border:1px solid ' + C.line + ';border-left:4px solid ' + (renderingProfile ? C.edge : P) + ';"><tbody><tr><td align="center" style="padding:22px 24px;text-align:center;"><p style="' + F.ex60 + 'font-size:34px;line-height:38px;color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:center;padding-bottom:10px;">Get in Touch</p><p style="' + F.reg + 'font-size:15px;line-height:23px;color:#000000;text-align:center;word-break:break-word;">If you have any questions, please feel free to contact us at ' + link + '</p><p style="' + F.bold + 'font-size:15px;line-height:23px;color:' + P + ';text-align:center;padding-top:8px;word-break:break-word;"><span style="color: ' + C.title + ';"><span style="font-weight: bold;">For any questions, please contact us at: {[E-CUSTOM:Event Phone Number]}</span></span></p></td></tr></tbody></table>'));
    }
  };

  // Banda de datos: de 1 a 4 datos (l1/v1… como siempre, para que las newsletters guardadas no cambien).
  var DATOS = K.repeat({ key: function (n, k) { return k + n; }, countKey: 'dN', max: 4, keys: ['l', 'v'], noun: 'dato', more: '＋ Añadir otro dato',
    hint: 'Hasta 4 datos en fila, separados por una línea. En móvil, uno debajo de otro.',
    fields: function (n, show) {
      return [{ k: 'l' + n, label: 'Etiqueta ' + n, type: 'text', half: true, showIf: show, ph: ['Date', 'Time', 'Venue', 'Format'][n - 1] }, { k: 'v' + n, label: 'Valor ' + n, type: 'text', half: true, showIf: show }];
    } });
  K.datosCount = DATOS.count;
  // Timeline: de 1 a 8 hitos (d1/h1/t1… como siempre).
  var HITOS = K.repeat({ key: function (n, k) { return k + n; }, countKey: 'hN', max: 8, keys: ['d', 's', 'h', 't'], noun: 'hito', more: '＋ Añadir otro hito',
    hint: 'Hasta 8 hitos, uno debajo de otro.',
    fields: function (n, show) {
      return [{ k: 'd' + n, label: 'Fecha o momento', type: 'text', half: true, req: n === 1, ph: 'Day ' + n, showIf: show }, { k: 's' + n, label: 'Etiqueta bajo la fecha (opcional)', type: 'text', half: true, ph: 'Arrival', showIf: show }, { k: 'h' + n, label: 'Título', type: 'text', half: true, req: n === 1, showIf: show }, { k: 't' + n, label: 'Texto', type: 'area', hint: TIP, showIf: show }];
    } });
  K.hitosCount = HITOS.count;
  M.datos = {
    letter: 'J', name: 'Banda de datos (fondo de color)', tag: 'BANDA DE DATOS',
    fields: [
      { k: 'style', label: 'Presentación', type: 'select', opts: [['', 'Banda de color'], ['summary', 'Resumen vertical en caja suave']] },
      { k: 'pre', label: 'Antetítulo (opcional)', type: 'text' },
      { k: 'title', label: 'Titular', type: 'text', req: true },
      { type: 'head', label: 'Datos (de 1 a ' + DATOS.max + ')' }
    ].concat(DATOS.fields(), [
      { k: 'text', label: 'Texto de apoyo (opcional)', type: 'area', hint: TIP }
    ]),
    build: function (d) {
      if (d.style === 'summary') {
        var rows = [1,2,3,4].filter(function(n){ return has(d['l'+n]) || has(d['v'+n]); });
        var content = rows.map(function(n,i){ return '<tr><td style="padding:'+(i ? '8px' : '14px')+' 20px '+(i===rows.length-1 ? '14px' : '6px')+' 20px;"><p style="'+F.reg+'font-size:11px;line-height:17px;color:#888888;letter-spacing:1px;text-transform:uppercase;padding-bottom:3px;word-break:break-word;">'+esc(d['l'+n]||'')+'</p><p style="'+F.bold+'font-size:17px;line-height:24px;color:'+C.title+';word-break:break-word;">'+br(esc(d['v'+n]||''))+'</p></td></tr>'; }).join('');
        return section(cell('24px 40px 0 40px','left',(has(d.pre) ? eyebrow(d.pre,C.label,'padding-bottom:12px;') : '')+(has(d.title) ? eyebrow(d.title,C.label,'line-height:17px;padding-bottom:12px;') : '')+TBL+' style="background-color:'+SOFT+';border-left:4px solid '+C.edge+';"><tbody>'+content+'</tbody></table>'+(has(d.text) ? bodyText(d.text,13,20,'#888888','left',10) : '')));
      }
      var h = '';
      if (has(d.pre)) h += '<p style="' + F.med + 'font-size:12px;line-height:16px;color:' + A + ';letter-spacing:3px;text-transform:uppercase;text-align:center;padding-bottom:10px;">' + esc(d.pre.trim()) + '</p>';
      h += '<p class="h1" style="' + titleFont(d.title, 'ex60', 40, 44) + 'color:#FFFFFF;text-transform:uppercase;text-align:center;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>';
      var cols = [1, 2, 3, 4].map(function (n) { return [d['l' + n], d['v' + n]]; }).filter(function (c) { return has(c[0]) || has(c[1]); });
      if (cols.length) {
        var w = Math.floor(100 / cols.length) + '%';
        h += TBL + ' style="margin-top:26px;"><tbody><tr>' + cols.map(function (c, i) {
          return '<td class="data-col" width="' + w + '" align="center" valign="top" style="padding:4px 10px;' + (i ? 'border-left:1px solid ' + A + ';' : '') + '"><p style="' + F.med + 'font-size:11px;line-height:14px;color:' + A + ';letter-spacing:1.5px;text-transform:uppercase;text-align:center;padding-bottom:6px;">' + esc((c[0] || '').trim()) + '</p><p style="' + F.black + 'font-size:22px;line-height:26px;color:#FFFFFF;text-align:center;word-break:break-word;">' + esc((c[1] || '').trim()) + '</p></td>';
        }).join('') + '</tr></tbody></table>';
      }
      paras(d.text).forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#FFFFFF;text-align:center;padding-top:' + (i ? 10 : 26) + 'px;word-break:break-word;">' + inline(p, '#FFFFFF') + '</p>'; });
      return section(cell('38px 40px 38px 40px', 'center', h, C.band), C.band);
    }
  };

  M.cards = {
    letter: 'K', name: 'Tarjetas', tag: 'TARJETAS',
    fields: CARDS.fields().concat([{ k: 'imgScale', label: 'Tamaño de las imágenes de las tarjetas', type: 'select', opts: SCALE_OPTS.map(function (o) { return o[0] ? o : ['', '100 % (todo el ancho de la tarjeta)']; }), showIf: function (d) { return K.cardItems(d).some(function (c) { return has(c.img); }); } }]),
    // Mismo margen que «Dos tarjetas»; con dos tarjetas claras (sin imagen) el HTML es idéntico al del bloque antiguo.
    build: function (d) {
      var cs = K.cardItems(d), pics = cs.some(function (c) { return has(c.img); });
      // Sin ningún título todavía, se pintan los recuadros vacíos (como el bloque antiguo) para poder verlos y pulsarlos.
      if (!cs.length) for (var n = 1; n <= K.cardsCount(d); n++) cs.push({ dark: d['c' + n + '_style'] === 'dark' });
      return section(cell('32px 40px 10px 40px', 'left', cs.length === 2 && !cs[0].dark && !cs[1].dark && !pics ? twoCards(cs[0], cs[1]) : cardRows(cs, scalePct(d.imgScale))));
    }
  };

  // Bloque antiguo: ya no sale en la paleta, pero las newsletters que lo usan se siguen viendo igual.
  M.tarjetas = {
    letter: 'K', name: 'Dos tarjetas (antiguo)', tag: 'TARJETAS', note: 'Bloque antiguo. Para newsletters nuevas usa «Tarjetas» (de 1 a 8).',
    fields: [
      { type: 'head', label: 'Tarjeta 1' },
      { k: 'a_label', label: 'Etiqueta (opcional)', type: 'text' }, { k: 'a_title', label: 'Título', type: 'text', req: true },
      { k: 'a_price', label: 'Precio (opcional)', type: 'text' }, { k: 'a_text', label: 'Texto', type: 'area', hint: TIP },
      { k: 'a_btn', label: 'Botón (opcional)', type: 'text', half: true }, { k: 'a_url', label: 'Enlace', type: 'url', half: true },
      { type: 'head', label: 'Tarjeta 2' },
      { k: 'b_label', label: 'Etiqueta (opcional)', type: 'text' }, { k: 'b_title', label: 'Título', type: 'text', req: true },
      { k: 'b_price', label: 'Precio (opcional)', type: 'text' }, { k: 'b_text', label: 'Texto', type: 'area', hint: TIP },
      { k: 'b_btn', label: 'Botón (opcional)', type: 'text', half: true }, { k: 'b_url', label: 'Enlace', type: 'url', half: true }
    ],
    build: function (d) {
      function c(x) { return { label: d[x + '_label'], title: d[x + '_title'], price: d[x + '_price'], text: d[x + '_text'], btn: d[x + '_btn'], url: d[x + '_url'] }; }
      return section(cell('32px 40px 10px 40px', 'left', twoCards(c('a'), c('b'))));
    }
  };

  M.cierre = {
    letter: 'M', name: 'Cierre (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Título» (estilo entre dos líneas) y «Texto».', tag: 'CIERRE',
    fields: [{ k: 'title', label: 'Titular', type: 'text', req: true }, { k: 'text', label: 'Texto (opcional)', type: 'area', hint: TIP }],
    build: function (d) {
      var ps = paras(d.text);
      var h = bar(80, A, 'center', '0 auto') + '<p style="' + titleFont(d.title, 'ex60', 36, 40) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:center;padding-top:18px;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bar(80, A, 'center', '18px auto 0 auto');
      ps.forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;text-align:center;padding-top:' + (i ? 8 : 20) + 'px;word-break:break-word;">' + inline(p) + '</p>'; });
      return section(cell(ps.length ? '30px 40px 14px 40px' : '30px 40px 30px 40px', 'center', h));
    }
  };

  M.info = {
    letter: 'N', name: 'Banda informativa (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Caja» (suave), con un «Título» de sección encima si hace falta.', tag: 'BANDA INFORMATIVA',
    fields: [{ k: 'title', label: 'Título fuera de la banda (opcional)', type: 'text' }, { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }],
    build: function (d) {
      var h = has(d.title) ? '<p style="' + titleFont(d.title, 'ex60', 34, 38) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';word-break:break-word;padding-bottom:16px;">' + esc(d.title.trim()) + '</p>' : '';
      return section(cell(has(d.title) ? '30px 40px 30px 40px' : '10px 40px 30px 40px', 'left', h + softBand(d.text)));
    }
  };

  M.producto = {
    letter: 'O', name: 'Producto con precio', tag: 'PRODUCTO',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true, half: true }, { k: 'price', label: 'Precio', type: 'text', half: true, ph: '$49' },
      { k: 'sub', label: 'Subtítulo (opcional)', type: 'text' },
      { k: 'lead', label: 'Línea destacada (duración, formato…) (opcional)', type: 'text' },
      { k: 'text', label: 'Descripción', type: 'area', hint: TIP },
      { k: 'img', label: 'Imagen a la derecha (opcional) · custom link de Cvent', type: 'url', half: true }, { k: 'alt', label: 'Descripción de la imagen', type: 'text', half: true },
      { type: 'head', label: 'Lista (opcional)' },
      { k: 'incTitle', label: 'Título de la lista', type: 'text', ph: "What's included?" },
      { k: 'items', label: 'Puntos', type: 'area', hint: 'Un punto por línea.' },
      { type: 'head', label: 'Opciones con precio (opcional)' },
      { k: 'pkTitle', label: 'Título de las opciones', type: 'text', ph: 'Choose your package:' }
    ].concat(pkFields(), [
      { type: 'head', label: 'Aviso (opcional)' },
      { k: 'note', label: 'Aviso en banda suave', type: 'area', hint: TIP }
    ]),
    build: function (d) {
      var sub16 = F.bold + 'font-size:16px;line-height:25px;color:' + C.title + ';';
      var h = TBL + '><tbody><tr><td valign="middle" style="padding:0 16px 0 0;"><p style="' + titleFont(d.title, 'ex60', 38, 42) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:left;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' +
        (has(d.sub) ? '<p style="' + F.bold + 'font-size:16px;line-height:22px;color:' + C.title + ';letter-spacing:1px;text-transform:uppercase;text-align:left;padding-top:4px;word-break:break-word;">' + esc(d.sub.trim()) + '</p>' : '') + '</td>' +
        (has(d.price) ? '<td valign="middle" align="right" style="padding:0;white-space:nowrap;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate !important;"><tbody><tr><td align="center" style="border:2px solid ' + P + ';border-radius:40px;padding:8px 18px;white-space:nowrap;"><p style="' + F.black + 'font-size:22px;line-height:26px;color:' + C.title + ';text-align:center;">' + esc(d.price.trim()) + '</p></td></tr></tbody></table></td>' : '') +
        '</tr></tbody></table>' + bar(56, P, 'left', '14px 0 0 0') + '<div style="clear:both;height:0;line-height:0;font-size:0;">&nbsp;</div>';
      var withImg = has(d.img), body = '', first = true;
      if (has(d.lead)) { body += '<p style="' + sub16 + 'text-align:left;padding-top:' + (withImg ? 0 : 18) + 'px;word-break:break-word;">' + esc(d.lead.trim()) + '</p>'; first = false; }
      paras(d.text).forEach(function (p, i) {
        var pt = first ? (withImg ? 0 : 18) : (i === 0 ? 10 : 8); first = false;
        body += '<p style="' + F.reg + 'font-size:15px;line-height:23px;color:#000000;text-align:left;padding-top:' + pt + 'px;word-break:break-word;">' + inline(p) + '</p>';
      });
      if (withImg) {
        h += TBL + ' style="margin-top:22px;"><tbody><tr><td class="col2" width="290" valign="top" style="padding:0 20px 0 0;">' + body + '</td><td class="col2" width="280" valign="top" style="padding:0;">' + (isPh(d.img) ? phBlock(280, 200) : '<img src="' + attr(d.img.trim()) + '" alt="' + attr(d.alt) + '" title="' + attr(d.alt) + '" border="0" width="280" style="width:280px;max-width:100%;height:auto;display:block;" class="img-max" />') + '</td></tr></tbody></table>';
      } else h += body;
      var endsList = false;
      if (has(d.items)) {
        if (has(d.incTitle)) h += '<p style="' + sub16 + 'padding-top:24px;padding-bottom:10px;word-break:break-word;">' + esc(d.incTitle.trim()) + '</p>'; else h += gap(18);
        h += bullets(d.items); endsList = true;
      }
      var opts = K.pkOptions(d);
      if (opts.length) {
        if (has(d.pkTitle)) h += '<p style="' + sub16 + 'padding-top:14px;padding-bottom:10px;word-break:break-word;">' + esc(d.pkTitle.trim()) + '</p>'; else h += gap(14);
        h += optionCards(opts); endsList = false;
        if (has(d.note)) h += gap(24);
      } else if (has(d.note)) h += gap(10);
      if (has(d.note)) { h += softBand(d.note); endsList = false; }
      return section(cell(endsList ? '38px 40px 14px 40px' : '38px 40px 32px 40px', 'left', h));
    }
  };

  M.separador = {
    letter: 'P', name: 'Separador (línea fina)', tag: 'SEPARADOR', fields: [{ k:'style', label:'Color', type:'select', opts:[['','Color de marca'],['neutral','Gris suave']] }], note: 'Va entre dos productos seguidos.',
    build: function (d) {
      return section(cell('22px 40px 8px 40px', '', TBL + '><tbody><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:' + (d && d.style === 'neutral' ? C.line : P) + ';">&nbsp;</td></tr></tbody></table>'));
    }
  };

  M.imagen = {
    letter: 'A', name: 'Imagen (antiguo)', tag: 'IMAGEN', note: 'Bloque antiguo. Para newsletters nuevas usa «Imagen» (de 1 a 3).',
    fields: [
      { k: 'src', label: 'Custom link de Cvent', type: 'url', req: true, img: true },
      { k: 'alt', label: 'Descripción de la imagen (alt)', type: 'text', req: true },
      { k: 'size', label: 'Tamaño', type: 'select', opts: [['full', 'A sangre (650 px)'], ['inset', 'Con márgenes (570 px)']] }
    ],
    defaults: { size: 'full' },
    build: function (d) {
      if (d.size === 'inset' && isPh(d.src)) return section(cell('0 40px 8px 40px', 'center', phBlock(570, 220)));
      if (d.size === 'inset') return section(cell('0 40px 8px 40px', 'center', '<img src="' + attr((d.src || '').trim()) + '" alt="' + attr(d.alt) + '" title="' + attr(d.alt) + '" border="0" width="570" style="width:570px;max-width:100%;height:auto;display:block;margin:0 auto;" class="img-max" />'));
      return imgFull((d.src || '').trim(), d.alt || '');
    }
  };

  // ============================================================
  // COMPONENTES DEL BRAND KIT DE RMF WORLD CHALLENGE (sirven para cualquier marca).
  // Colores por rol: dorado = principal (P), carbón = C.band, suave = SOFT, texto oscuro = C.title.
  // Ancho útil 570 px (650 − 2 × 40). En móvil, las columnas «col2» se apilan.
  // ============================================================
  var SANS = "font-family:'DinProBold', Arial, Helvetica, sans-serif;font-weight:bold;";
  function eyebrow(text, color, extra) {
    return '<p style="' + SANS + 'font-size:11px;line-height:14px;color:' + color + ';letter-spacing:2px;text-transform:uppercase;word-break:break-word;' + (extra || '') + '">' + esc(String(text).trim()) + '</p>';
  }
  function boxTitle(text, size, lh, color, extra) {
    return '<p style="' + F.ex40 + 'font-size:' + size + 'px;line-height:' + lh + 'px;color:' + (color || C.title) + ';word-break:break-word;' + (extra || '') + '">' + br(esc(String(text).trim())) + '</p>';
  }
  function bodyText(text, size, lh, color, align, first) {
    return paras(text).map(function (p, i) {
      return '<p style="' + F.reg + 'font-size:' + size + 'px;line-height:' + lh + 'px;color:' + (color || '#000000') + ';text-align:' + (align || 'left') + ';word-break:break-word;padding-top:' + (i ? 8 : (first == null ? 10 : first)) + 'px;">' + inline(p, color && color !== '#000000' ? color : null) + '</p>';
    }).join('');
  }
  // Etiqueta de fecha/dato clave: fondo dorado y texto oscuro en negrita.
  function tag(text, top) {
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:' + (top == null ? 10 : top) + 'px;border-collapse:separate !important;"><tbody><tr><td bgcolor="' + P + '" style="background-color:' + P + ';padding:5px 10px;border-radius:3px;"><p style="' + SANS + 'font-size:12px;line-height:15px;color:' + C.buttonText + ';letter-spacing:1px;text-transform:uppercase;">' + esc(String(text).trim()) + '</p></td></tr></tbody></table>';
  }
  // Botón de 190 px: «gold» (color principal, texto según la marca) u «dark» (carbón, texto blanco).
  function btn190(text, url, style, align) {
    var bg = style === 'dark' ? C.band : C.button, color = style === 'dark' ? '#FFFFFF' : C.buttonText;
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="190" align="' + (align || 'center') + '" style="width:190px;margin:' + (align === 'left' ? '18px 0 0 0' : '22px auto 0 auto') + ';border-collapse:separate !important;" class="mobile-button"><tbody><tr><td align="center" bgcolor="' + bg + '" style="background-color:' + bg + ';border:1px solid ' + bg + ';border-radius:' + C.btnRadius + ';"><a href="' + attr(url) + '" target="_blank" style="display:block;padding:13px 10px;' + SANS + 'font-size:11px;line-height:15px;color:' + color + ';text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;text-align:center;">' + esc(text) + '</a></td></tr></tbody></table>';
  }
  function optBtn(d, align) { return has(d.btn) ? btn190(d.btn.trim(), String(d.url || '').trim() || '#', d.btnStyle, align) : ''; }
  var BTN_FIELDS = [
    { k: 'btn', label: 'Texto del botón (opcional)', type: 'text', half: true }, { k: 'url', label: 'Enlace del botón', type: 'url', half: true },
    { k: 'btnStyle', label: 'Estilo del botón', type: 'select', opts: [['gold', 'Color principal (dorado en WCH)'], ['dark', 'Oscuro (carbón)']] }
  ];
  function sectionTitle(text) {
    return has(text) ? '<p style="' + titleFont(text, 'ex60', 22, 28) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:center;word-break:break-word;">' + esc(text.trim()) + '</p>' + bar(40, P, 'center', '12px auto 22px auto') : '';
  }
  // Columnas iguales en escritorio que se apilan en móvil. cells: [{ html, bg, border }], ancho total 570.
  function columns(cells, width, gapW) {
    var sp = '<td class="desk-only" width="' + gapW + '" style="width:' + gapW + 'px;font-size:0;line-height:0;">&nbsp;</td>';
    // La tarjeta va en una tabla interior: en móvil «col2» quita el relleno de la celda y deja 16 px de separación.
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody><tr>' + cells.map(function (c) {
      var bg = c.bg || '#FFFFFF';
      return '<td class="col2" width="' + width + '" valign="top" height="100%" style="width:' + width + 'px;height:100%;">' +
        TBL + ' height="100%" bgcolor="' + bg + '" style="height:100%;background-color:' + bg + ';' + (c.border ? 'border:2px solid ' + c.border + ';' : '') + 'border-radius:8px;border-collapse:separate !important;"><tbody><tr><td valign="top" height="100%" style="height:100%;padding:20px 18px;">' + c.html + '</td></tr></tbody></table></td>';
    }).join(sp) + '</tr></tbody></table>';
  }

  M.step = {
    letter: 'S', name: 'Caja «Step» (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Caja» (suave) con etiqueta, título y fecha límite.', tag: 'STEP',
    fields: [
      { k: 'label', label: 'Etiqueta pequeña', type: 'text', half: true, ph: 'Step 1' }, { k: 'deadline', label: 'Fecha límite (etiqueta dorada)', type: 'text', half: true, ph: 'Deadline: May 1' },
      { k: 'title', label: 'Título de la caja', type: 'text', req: true },
      { k: 'text', label: 'Texto', type: 'area', hint: TIP }
    ].concat(BTN_FIELDS),
    defaults: { btnStyle: 'gold' },
    build: function (d) {
      var h = (has(d.label) ? eyebrow(d.label, renderingProfile ? C.label : P, 'padding-bottom:6px;') : '') + boxTitle(d.title || '', 20, 26) + (has(d.deadline) ? tag(d.deadline) : '') + (d.fmt === 'puntos' ? dotLines(d.text, 14, 22, 12) : bodyText(d.text, 14, 22, '#000000', 'left', 12)) + optBtn(d, 'left');
      return section(cell('12px 40px', 'left', TBL + ' bgcolor="' + SOFT + '" style="background-color:' + SOFT + ';border-left:4px solid ' + (renderingProfile ? C.edge : P) + ';"><tbody><tr><td bgcolor="' + SOFT + '" style="padding:22px 24px;background-color:' + SOFT + ';">' + h + '</td></tr></tbody></table>'));
    }
  };

  M.glance = {
    letter: 'G', name: 'Tarjetas «At a glance» (3 datos)', tag: 'AT A GLANCE',
    fields: [{ k:'density', label:'Composición', type:'select', opts:[['','Habitual'],['editorial','Compacta (referencia editorial)']] },
      { k: 'title', label: 'Título de sección (opcional)', type: 'text' },
      { type: 'head', label: 'Tarjeta 1 (oscura)' }, { k: 'l1', label: 'Etiqueta', type: 'text', half: true, ph: 'Dates' }, { k: 'v1', label: 'Dato', type: 'text', half: true, req: true }, { k: 't1', label: 'Nota (opcional)', type: 'text' },
      { type: 'head', label: 'Tarjeta 2 (oscura)' }, { k: 'l2', label: 'Etiqueta', type: 'text', half: true }, { k: 'v2', label: 'Dato', type: 'text', half: true, req: true }, { k: 't2', label: 'Nota (opcional)', type: 'text' },
      { type: 'head', label: 'Tarjeta 3 (clara con borde)' }, { k: 'l3', label: 'Etiqueta', type: 'text', half: true }, { k: 'v3', label: 'Dato', type: 'text', half: true, req: true }, { k: 't3', label: 'Nota (opcional)', type: 'text' }
    ],
    build: function (d) {
      var cards = [1, 2, 3].map(function (n) {
        var compact = d.density === 'editorial', dark = n < 3, fg = dark ? '#FFFFFF' : C.title;
        var html = (has(d['l' + n]) ? eyebrow(d['l' + n], dark ? C.onDark : C.hilite, 'padding-bottom:8px;') : '') + boxTitle(d['v' + n] || '', compact ? 17 : 22, compact ? 22 : 28, fg) + (has(d['t' + n]) ? bodyText(d['t' + n], 13, 20, dark ? '#FFFFFF' : '#000000', 'left', 8) : '');
        return { html: html, bg: dark ? C.band : '#FFFFFF', border: dark ? '' : C.hilite };
      });
      if (d.density === 'editorial') {
        var cells = cards.map(function(c){ return '<td class="col2" width="180" valign="top" bgcolor="'+c.bg+'" style="width:180px;background-color:'+c.bg+';border-radius:8px;'+(c.border ? 'border:2px solid '+c.border+';' : '')+'">'+TBL+'><tbody><tr><td style="padding:16px 14px;text-align:center;">'+c.html.replace(/<p style="/g,'<p style="text-align:center;').replace('font-size:11px;line-height:14px;','font-size:10px;line-height:14px;')+'</td></tr></tbody></table></td>'; });
        return section(cell('0 40px 28px 40px','left',sectionTitle(d.title)+TBL+' style="border-collapse:separate !important;"><tbody><tr>'+cells.join('<td class="desk-only" width="9" style="width:9px;font-size:0;line-height:0;">&nbsp;</td><td class="mob-only" height="12" style="display:none;max-height:0;overflow:hidden;mso-hide:all;height:12px;line-height:12px;font-size:0;background-color:#FFFFFF;">&nbsp;</td>')+'</tr></tbody></table>'));
      }
      return section(cell('22px 40px 12px 40px', 'left', sectionTitle(d.title) + columns(cards, 180, 15)));
    }
  };

  M.timeline = {
    letter: 'T', name: 'Timeline (fechas e hitos)', tag: 'TIMELINE',
    fields: [{ k: 'title', label: 'Título de sección (opcional)', type: 'text' }, { k: 'fmt', label: 'Texto de los hitos', type: 'select', opts: [['', 'Párrafos'], ['puntos', 'Puntos (una línea, un punto)']] }].concat(HITOS.fields()),
    build: function (d) {
      var rows = [1, 2, 3, 4, 5, 6, 7, 8].filter(function (n) { return has(d['d' + n]) || has(d['s' + n]) || has(d['h' + n]) || has(d['t' + n]); }).map(function (n, i) {
        var sep = i ? 'border-top:2px solid #FFFFFF;' : '';
        return '<tr><td width="120" valign="top" bgcolor="' + C.band + '" style="width:120px;padding:16px 14px;background-color:' + C.band + ';' + sep + '">' + boxTitle(d['d' + n] || '', 16, 20, '#FFFFFF') + (has(d['s' + n]) ? eyebrow(d['s' + n], '#FFFFFF', 'font-size:10px;padding-top:4px;') : '') + '</td>' +
          '<td valign="top" bgcolor="' + SOFT + '" style="padding:16px 20px;background-color:' + SOFT + ';' + sep + '">' + (has(d['h' + n]) ? boxTitle(d['h' + n], 17, 22) : '') + (d.fmt === 'puntos' ? dotLines(d['t' + n], 14, 22, has(d['h' + n]) ? 6 : 0) : bodyText(d['t' + n], 14, 22, '#000000', 'left', has(d['h' + n]) ? 6 : 0)) + '</td></tr>';
      }).join('');
      return section(cell('22px 40px 12px 40px', 'left', sectionTitle(d.title) + TBL + ' style="border-collapse:collapse;"><tbody>' + rows + '</tbody></table>'));
    }
  };

  M.deadlines = {
    letter: 'L', name: 'Dos fechas límite', tag: 'DEADLINES',
    fields: [
      { k: 'title', label: 'Título de sección (opcional)', type: 'text' },
      { type: 'head', label: 'Fecha 1' }, { k: 'l1', label: 'Etiqueta', type: 'text', half: true, ph: 'Payment' }, { k: 'd1', label: 'Fecha', type: 'text', half: true, req: true, ph: 'May 1, 2027' }, { k: 't1', label: 'Texto (opcional)', type: 'area', hint: TIP },
      { type: 'head', label: 'Fecha 2' }, { k: 'l2', label: 'Etiqueta', type: 'text', half: true }, { k: 'd2', label: 'Fecha', type: 'text', half: true, req: true }, { k: 't2', label: 'Texto (opcional)', type: 'area', hint: TIP }
    ],
    build: function (d) {
      var boxes = [1, 2].map(function (n) {
        return { html: (has(d['l' + n]) ? eyebrow(d['l' + n], C.hilite, 'padding-bottom:8px;') : '') + boxTitle(d['d' + n] || '', 19, 24) + bodyText(d['t' + n], 13, 21, '#000000', 'left', 8), border: C.hilite };
      });
      return section(cell('22px 40px 12px 40px', 'left', sectionTitle(d.title) + columns(boxes, 277, 16)));
    }
  };

  M.fotos3 = {
    letter: 'Q', name: 'Tres fotos en fila (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Imagen» con tres imágenes.', tag: 'TRES FOTOS',
    fields: [1, 2, 3].reduce(function (all, n) {
      return all.concat([{ k: 'src' + n, label: 'Foto ' + n + ' · custom link de Cvent', type: 'url', req: true, img: true }, { k: 'alt' + n, label: 'Foto ' + n + ' · descripción (alt)', type: 'text', req: true }]);
    }, []),
    build: function (d) {
      var cells = [1, 2, 3].map(function (n) {
        var src = String(d['src' + n] || '').trim();
        var img = isPh(src) ? phBlock(182, 182) : '<img src="' + attr(src) + '" alt="' + attr(d['alt' + n]) + '" title="' + attr(d['alt' + n]) + '" border="0" width="182" style="width:182px;max-width:100%;height:auto;display:block;border-radius:6px;" class="img-max" />';
        return '<td class="col2" width="182" valign="top" style="width:182px;">' + img + '</td>';
      });
      var sp = '<td class="desk-only" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>';
      return section(cell('12px 40px', 'center', TBL + '><tbody><tr>' + cells.join(sp) + '</tr></tbody></table>'));
    }
  };

  M.cta = {
    letter: 'R', name: 'Llamada a la acción (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Caja» con borde.', tag: 'CTA',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true },
      { k: 'text', label: 'Texto (opcional)', type: 'area', hint: TIP },
      { k: 'line', label: 'Línea con enlace de Cvent (opcional)', type: 'text', ph: 'Register here: {[E-RSVP YES LINK]}', hint: 'Escribe el campo de Cvent suelto: genera su propio enlace.' }
    ].concat(BTN_FIELDS),
    defaults: { btnStyle: 'gold' },
    build: function (d) {
      var h = (has(d.title) ? boxTitle(d.title, 20, 26, C.title, 'text-align:center;') : '') + bodyText(d.text, 14, 22, '#000000', 'center', has(d.title) ? 10 : 0) +
        (has(d.line) ? '<p style="' + SANS + 'font-size:14px;line-height:22px;color:' + C.title + ';text-align:center;padding-top:12px;word-break:break-word;">' + inline(d.line) + '</p>' : '') + optBtn(d);
      return section(cell('16px 40px', 'center', TBL + ' style="background-color:#FFFFFF;border:2px solid ' + C.hilite + ';border-radius:8px;border-collapse:separate !important;"><tbody><tr><td align="center" style="padding:24px 26px;">' + h + '</td></tr></tbody></table>'));
    }
  };

  M.boton = {
    letter: 'U', name: 'Botón suelto (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Botón».', tag: 'BOTON',
    fields: [
      { k: 'btn', label: 'Texto del botón', type: 'text', req: true, half: true }, { k: 'url', label: 'Enlace', type: 'url', req: true, half: true },
      { k: 'btnStyle', label: 'Estilo', type: 'select', opts: [['gold', 'Color principal (dorado en WCH)'], ['dark', 'Oscuro (carbón)']] }
    ],
    defaults: { btnStyle: 'gold' },
    build: function (d) { return section(cell('6px 40px 16px 40px', 'center', btn190(String(d.btn || '').trim(), String(d.url || '').trim() || '#', d.btnStyle))); }
  };

  M.important = {
    letter: 'V', name: 'Aviso «Important» (antiguo)', note: 'Bloque antiguo. Para newsletters nuevas usa «Caja» oscura.', tag: 'IMPORTANT',
    fields: [{ k: 'label', label: 'Etiqueta', type: 'text', ph: 'IMPORTANT' }, { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }],
    defaults: { label: 'IMPORTANT' },
    build: function (d) {
      // Sobre carbón, los enlaces y negritas van en blanco.
      var h = tag(has(d.label) ? d.label : 'IMPORTANT', 0) + bodyText(d.text, 14, 22, '#FFFFFF', 'left', 12).split(C.link).join('#FFFFFF');
      return section(cell('12px 40px', 'left', TBL + ' bgcolor="' + C.band + '" style="background-color:' + C.band + ';border-radius:8px;border-collapse:separate !important;"><tbody><tr><td bgcolor="' + C.band + '" style="padding:22px 24px;background-color:' + C.band + ';border-radius:8px;">' + h + '</td></tr></tbody></table>'));
    }
  };

  // Badges oficiales de Cvent (cvent-assets.com) enlazados con los campos de wallet de cada inscrito.
  var WALLET_APPLE = 'https://www.cvent-assets.com/event-email-editor/assets/images/US-UK_Add_to_Apple_Wallet_RGB_101421__d018a8bb15e6d1b46780.png';
  var WALLET_GOOGLE = 'https://www.cvent-assets.com/event-email-editor/assets/images/enUS_add_to_google_wallet_add-wallet-badge__b79d999246ba9434bcd9.png';
  var WALLET_DEFAULTS = { appleUrl:'{[C-PASSBOOK_LINK]}', googleUrl:'{[C-GOOGLEWALLET_LINK]}', appleImage:WALLET_APPLE, googleImage:WALLET_GOOGLE, qrUrl:'{[C-QRCODE_LINK]}' };
  K.cleanWallet = function (d) {
    var original=String(d.text||''), previousQr=d.qr, hasTable=/cvent-assets\.com.*(?:passbook|google_wallet|Apple_Wallet)/i.test(original);
    var qr=/\{\[C-QRCODE_LINK\]\}|cvent\.com\/g\/images\/QRCodeType\.gif/i.test(original);
    d.text=original.split(/\n/).filter(function(line){
      var plain=line.trim();
      if (/^(?:Apple Wallet|Add to Apple Wallet(?: Button)?|Add to Google Wallet(?: Button)?|Google Wallet|QR Code)$/i.test(plain)) return false;
      if (/^(?:\{\[C-QRCODE_LINK\]\}|(?:\[.*?\]\()?https:\/\/www\.cvent\.com\/g\/images\/QRCodeType\.gif\)?)$/i.test(plain)) return false;
      if (hasTable && /^\|/.test(plain) && (/cvent-assets\.com|^\|[\s:|\-]+$/.test(plain))) return false;
      return true;
    }).join('\n').trim();
    if(qr) d.qr='personal';
    return original!==d.text || previousQr!==d.qr;
  };
  function walletValid(value,key) {
    if (value===WALLET_DEFAULTS[key] && /Url$/.test(key)) return true;
    if (linkLevel(value)!=='ok' || !/^https:\/\//i.test(value) || /[<>"'\\\s]/.test(value)) return false;
    if (/Subscribers\/|EmailDesigner|EmailPreview|QRCodeType\.gif|passbook\/pass\/apple\?$/i.test(value)) return false;
    if (/Image$/.test(key)||key==='qrUrl') return /^https:\/\/(?:custom\.cvent\.com|www\.cvent-assets\.com)\//i.test(value);
    return true;
  }
  function walletValue(d,key) { var v=String(d[key]||'').trim()||WALLET_DEFAULTS[key];return walletValid(v,key)?v:WALLET_DEFAULTS[key]; }
  function walletField(key,label,extra) { return Object.assign({k:key,label:label,type:'url',fallback:WALLET_DEFAULTS[key],wallet:true,hint:'Vacío: usa el valor predeterminado mostrado. Cvent resuelve los campos personales al enviar.'},extra||{}); }
  M.wallet = {
    letter: 'W', name: 'Añadir a Apple / Google Wallet', tag: 'WALLET',
    note:'Los botones usan campos personales de Cvent, no enlaces del editor o de su vista previa. La app muestra el HTML; la descarga del pase y el QR se comprueban en un envío de prueba desde Cvent.',
    fields: [
      {k:'title',label:'Título (opcional)',type:'text'}, {k:'text',label:'Texto (opcional)',type:'area',hint:TIP},
      {type:'action',label:'Limpiar textos técnicos y recuperar QR',run:K.cleanWallet},
      {k:'buttons',label:'Botones visibles',type:'select',fallback:'both',opts:[['both','Apple y Google Wallet'],['apple','Solo Apple Wallet'],['google','Solo Google Wallet'],['none','Ningún botón']]},
      {type:'head',label:'Apple Wallet'},
      walletField('appleUrl','Enlace de Apple Wallet'),walletField('appleImage','Imagen del botón de Apple Wallet'),
      {type:'head',label:'Google Wallet'},
      walletField('googleUrl','Enlace de Google Wallet'),walletField('googleImage','Imagen del botón de Google Wallet'),
      {type:'head',label:'QR personal de registro'},
      {k:'qr',label:'Mostrar QR',type:'select',fallback:'none',opts:[['none','No mostrar'],['personal','Mostrar QR personal de Cvent']]},
      walletField('qrUrl','Imagen o campo del QR',{showIf:function(d){return d.qr==='personal';}})
    ],
    build: function (d) {
      var badge = function (href, src, alt, w) { return '<td class="col2" align="center" valign="middle" style="padding:6px 8px;"><a href="' + attr(href) + '" target="_blank"><img src="' + attr(src) + '" alt="' + alt + '" title="' + alt + '" border="0" width="' + w + '" height="48" style="width:' + w + 'px;height:48px;display:block;margin:0 auto;" /></a></td>'; };
      var mode=d.buttons||'both', badges=(mode==='both'||mode==='apple'?badge(walletValue(d,'appleUrl'),walletValue(d,'appleImage'),'Add to Apple Wallet',152):'')+(mode==='both'||mode==='google'?badge(walletValue(d,'googleUrl'),walletValue(d,'googleImage'),'Add to Google Wallet',174):'');
      var h = (has(d.title) ? boxTitle(d.title, 20, 26, C.title, 'text-align:center;') : '') + bodyText(d.text, 14, 22, '#000000', 'center', 8) +
        (badges ? '<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:16px auto 0 auto;"><tbody><tr>'+badges+'</tr></tbody></table>' : '');
      if(d.qr==='personal') h+='<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 0 auto;"><tbody><tr><td align="center"><img src="'+attr(walletValue(d,'qrUrl'))+'" alt="Personal registration QR code" border="0" width="180" height="180" style="width:180px;height:180px;display:block;margin:0 auto;" /></td></tr></tbody></table>';
      return section(cell('16px 40px', 'center', h));
    }
  };


  // ============================================================
  // PIEZAS MÍNIMAS (fase 2): Título, Texto, Lista, Botón e Imagen.
  // Título, Texto, Lista y Botón seguidos (con la misma alineación) se montan en UNA celda con el espaciado de los
  // bloques antiguos, así que la misma combinación da el mismo HTML:
  //   Título principal + Texto + Botón = «Título centrado» · Título saludo + Texto = «Texto / Intro»
  //   Título sección + Lista = «Título + lista» · Título entre líneas + Texto = «Cierre» · Botón solo = «Botón suelto»
  // Un Título siempre empieza celda nueva; tras un Botón, también. El Botón solo se une tras un Título principal.
  // ============================================================
  var TITLE_STYLES = [['principal', 'Principal (grande, con barra)'], ['seccion', 'Sección (mediano)'], ['saludo', 'Saludo (Dear…)'], ['entre', 'Entre dos líneas (cierre)'], ['ante', 'Antetítulo (pequeño, en mayúsculas)']];
  var TITLE_ALIGN = { principal: 'center', seccion: 'left', saludo: 'left', entre: 'center', ante: 'left' };
  function titleStyle(d) { return TITLE_STYLES.some(function (o) { return o[0] === d.style; }) ? d.style : 'principal'; }
  // Alineación de una pieza: el Título según su estilo (o la elegida); Texto y Botón heredan la de la celda si no se elige.
  function flowAlign(s, groupAlign) {
    var d = s.d || {};
    if (s.type === 'title') return titleStyle(d) === 'entre' ? 'center' : (d.align === 'left' || d.align === 'center' ? d.align : (renderingWCH && titleStyle(d)==='seccion' ? 'center' : TITLE_ALIGN[titleStyle(d)]));
    if (s.type === 'list') return 'left';
    return d.align === 'left' || d.align === 'center' ? d.align : (groupAlign || (s.type === 'button' ? 'center' : 'left'));
  }
  K.FLOW = { title: true, text: true, list: true, button: true };
  // Reparte las secciones en celdas: [{ start, end, align }] para las piezas encadenadas; el resto, una por sección.
  K.flowGroups = function (secs, breakAt) {
    var out = [], g = null;
    secs.forEach(function (s, i) {
      var flow = K.FLOW[s.type];
      // El Botón solo se une a una celda que empieza con un Título principal (como en el antiguo «Título centrado»);
      // si no, es el Botón suelto de siempre.
      var head = g && secs[g.start], principalHead = head && head.type === 'title' && titleStyle(head.d || {}) === 'principal';
      var joins = flow && g && i !== breakAt && s.type !== 'title' && secs[i - 1] && secs[i - 1].type !== 'button' && secs[i - 1].type !== 'box' && (s.type !== 'button' || principalHead) && flowAlign(s, g.align) === g.align;
      // Una Caja suave solo de texto justo después de un Título de sección = la antigua «Banda informativa» con título.
      if (s.type === 'box' && g && i !== breakAt && g.start === g.end && g.align === 'left' && head.type === 'title' && titleStyle(head.d || {}) === 'seccion' && boxSimple(s.d || {})) { g.end = i; return; }
      if (joins) { g.end = i; return; }
      g = flow ? { start: i, end: i, align: flowAlign(s) } : null;
      out.push(g || { start: i, end: i });
    });
    return out;
  };
  // Contenido de una pieza dentro de su celda. prev: pieza anterior de la misma celda (o null).
  function flowPiece(s, prev, align, first, next) {
    var d = s.d || {}, h = '';
    if (s.type === 'box') return softBand(d.text, d.fmt === 'puntos');
    if (s.type === 'title' && next && next.type === 'box') return '<p style="' + titleFont(d.text, 'ex60', 34, 38).replace('font-size:34px;line-height:38px;', 'font-size:' + C.h2 + ';') + 'color:' + C.title + ';text-transform:' + C.titleCase + ';word-break:break-word;padding-bottom:16px;">' + br(esc((d.text || '').trim())) + '</p>';
    if (s.type === 'title') {
      var st = titleStyle(d), txt = br(esc((d.text || '').trim())), ta = align === 'center' ? 'text-align:center;' : '';
      if (st === 'principal') return '<p style="' + titleFont(d.text, 'ex60', 38, 42).replace('font-size:38px;line-height:42px;', 'font-size:' + C.h1 + ';') + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:' + align + ';word-break:break-word;">' + txt + '</p>' + (align === 'center' ? bar(56, P, 'center', '14px auto 0 auto') : bar(56, P, 'left', '14px 0 0 0').replace(' align="left"', '')); // a la izquierda, sin align: una tabla con align flota y el texto de debajo se le pondría al lado
      if (st === 'seccion') return '<p style="' + titleFont(d.text, 'ex60', 34, 38).replace('font-size:34px;line-height:38px;', 'font-size:' + C.h2 + ';') + 'color:' + C.title + ';text-transform:' + C.titleCase + ';' + ta + 'padding-bottom:16px;word-break:break-word;">' + txt + '</p>' + (renderingWCH ? bar(40,P,'center','0 auto 16px auto').replace(/height="4"/g,'height="3"').replace(/height:4px/g,'height:3px') : '');
      if (st === 'saludo') return '<p style="' + F.bold + 'font-size:28px;line-height:34px;color:' + C.title + ';' + ta + 'word-break:break-word;">' + txt + '</p>';
      if (st === 'ante') return '<p style="' + SANS + 'font-size:12px;line-height:16px;color:' + (renderingProfile ? C.label : P) + ';letter-spacing:2px;text-transform:uppercase;' + ta + 'word-break:break-word;">' + txt + '</p>';
      return bar(80, A, 'center', '0 auto') + '<p style="' + titleFont(d.text, 'ex60', 36, 40) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';text-align:center;padding-top:18px;word-break:break-word;">' + txt + '</p>' + bar(80, A, 'center', '18px auto 0 auto');
    }
    if (s.type === 'text') {
      var afterTitle = prev && prev.type === 'title', small = d.size === 'small';
      paras(d.text).forEach(function (p, i) {
        if (d.size === 'intro' || d.size === 'body') h += '<p style="' + F.reg + 'font-size:' + (d.size === 'intro' ? '15px;line-height:25px;' : '14px;line-height:23px;') + 'color:#000000;text-align:' + align + ';' + (i || prev ? 'padding-top:14px;' : '') + 'word-break:break-word;">' + inline(p) + '</p>';
        else if (align === 'center') h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;text-align:center;padding-top:' + (i ? 8 : (prev ? 20 : 0)) + 'px;word-break:break-word;">' + inline(p) + '</p>';
        else if (small) h += '<p style="' + F.reg + 'font-size:13px;line-height:21px;color:#000000;' + (i ? 'padding-top:7px;' : prev ? 'padding-top:10px;' : '') + 'word-break:break-word;">' + inline(p) + '</p>';
        else h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;' + (i || prev ? 'padding-top:14px;' : '') + 'word-break:break-word;">' + inline(p) + '</p>';
      });
      return h;
    }
    if (s.type === 'list') return (prev && !(prev.type === 'title' && titleStyle(prev.d || {}) === 'seccion') ? gap(18) : '') + bullets(d.items);
    // Botón dentro de una celda (tras un título o un texto): el estilo de botón del antiguo «Título centrado».
    var b = button(String(d.btn || '').trim(), String(d.url || '').trim() || '#', false);
    if (align === 'left') b = b.replace('align="center" style="margin:22px auto 0 auto;', 'align="left" style="margin:18px 0 0 0;');
    if (d.btnStyle === 'dark') b = b.split('bgcolor="' + C.button + '" style="background-color:' + C.button).join('bgcolor="' + C.band + '" style="background-color:' + C.band).split('color:' + C.buttonText).join('color:#FFFFFF');
    return b;
  }
  // Márgenes de la celda: arriba según la primera pieza; abajo según la última (y el estilo del título que abre la celda).
  var FLOW_TOP = { principal: 34, seccion: 30, saludo: 32, entre: 30, ante: 30, text: 32, list: 30, button: 6 };
  function flowPad(pieces) {
    var a = pieces[0], z = pieces[pieces.length - 1], head = a.type === 'title' ? titleStyle(a.d || {}) : '', bottom;
    if (z.type === 'title') bottom = { principal: 6, seccion: 10, saludo: 22, entre: 30, ante: 6 }[head];
    else if (z.type === 'text' && z.d && (z.d.size === 'intro' || z.d.size === 'body')) bottom = 24;
    else if (z.type === 'text') bottom = head === 'principal' ? 36 : head === 'entre' ? 14 : 22;
    else if (z.type === 'list') bottom = 10;
    else if (z.type === 'box') bottom = 30;
    else bottom = 36;
    return (a.type === 'text' && a.d && (a.d.size === 'intro' || a.d.size === 'body') ? 16 : FLOW_TOP[head || a.type]) + 'px 40px ' + bottom + 'px 40px';
  }
  // Monta una celda de piezas. wrap(i, html): en la vista previa, cada pieza va marcada para poder seleccionarla.
  K.flowCell = function (pieces, align, wrap) {
    var h = '';
    pieces.forEach(function (s, j) { var part = flowPiece(s, j ? pieces[j - 1] : null, align, j === 0, pieces[j + 1]); h += wrap ? wrap(j, part) : part; });
    // Un Botón solo es el antiguo «Botón suelto» (190 px, dorado u oscuro).
    if (pieces.length === 1 && pieces[0].type === 'button') { var d = pieces[0].d || {}; return section(cell('6px 40px 16px 40px', 'center', wrap ? wrap(0, btn190(String(d.btn || '').trim(), String(d.url || '').trim() || '#', d.btnStyle)) : btn190(String(d.btn || '').trim(), String(d.url || '').trim() || '#', d.btnStyle))); }
    return section(cell(flowPad(pieces), align, h));
  };
  var ALIGN_OPTS = [['', 'Automática'], ['left', 'Izquierda'], ['center', 'Centrada']];
  M.title = {
    letter: 'I', name: 'Título', tag: 'TITULO', flow: true,
    fields: [
      { k: 'text', label: 'Título', type: 'text', req: true },
      { k: 'style', label: 'Estilo', type: 'select', half: true, opts: TITLE_STYLES }, { k: 'align', label: 'Alineación', type: 'select', half: true, opts: ALIGN_OPTS, showIf: function (d) { return titleStyle(d) !== 'entre'; } }
    ],
    defaults: { style: 'principal' },
    build: function (d) { var s = { type: 'title', d: d }; return K.flowCell([s], flowAlign(s)); }
  };
  M.text = {
    letter: 'C', name: 'Texto', tag: 'TEXTO', flow: true,
    fields: [{ k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }, { k: 'align', label: 'Alineación', type: 'select', half: true, opts: [['', 'Como el título de encima (o izquierda)'], ['left', 'Izquierda'], ['center', 'Centrada']] }, { k: 'size', label: 'Tamaño', type: 'select', half: true, opts: [['', 'Normal'], ['intro', 'Introducción (15/25 px)'], ['body', 'Cuerpo (14/23 px)'], ['small', 'Pequeño (notas, «good to know»)']], showIf: function (d) { return d.align !== 'center'; } }],
    build: function (d) { var s = { type: 'text', d: d }; return K.flowCell([s], flowAlign(s)); }
  };
  M.list = {
    letter: 'D', name: 'Lista', tag: 'LISTA', flow: true,
    fields: [{ k: 'items', label: 'Puntos', type: 'area', req: true, hint: 'Un punto por línea. **negrita** · [texto](enlace)' }],
    build: function (d) { return K.flowCell([{ type: 'list', d: d }], 'left'); }
  };
  M.button = {
    letter: 'U', name: 'Botón', tag: 'BOTON', flow: true,
    note: 'Debajo de un Título principal (y su texto) se une a ellos como en el antiguo «Título centrado». En cualquier otro sitio es un botón de 190 px.',
    fields: [
      { k: 'btn', label: 'Texto del botón', type: 'text', req: true, half: true }, { k: 'url', label: 'Enlace', type: 'url', req: true, half: true },
      { k: 'btnStyle', label: 'Estilo', type: 'select', half: true, opts: [['gold', 'Color principal (dorado en WCH)'], ['dark', 'Oscuro (carbón)']] }, { k: 'align', label: 'Alineación', type: 'select', half: true, opts: [['', 'Como el texto de encima'], ['left', 'Izquierda'], ['center', 'Centrada']] }
    ],
    defaults: { btnStyle: 'gold' },
    build: function (d) { var s = { type: 'button', d: d }; return K.flowCell([s], flowAlign(s)); }
  };
  function scalePct(v) { var n = parseInt(v, 10); return n > 0 && n < 100 ? n : 0; }
  function scaledPic(src, alt, w, extra) {
    src = String(src || '').trim();
    if (isPh(src)) return phBlock(w, Math.round(w * 0.6));
    return '<img src="' + attr(src) + '" alt="' + attr(alt) + '" title="' + attr(alt) + '" border="0" width="' + w + '" style="width:' + w + 'px;max-width:100%;height:auto;display:block;margin:0 auto;' + (extra || '') + '" class="img-max" />';
  }

  // Texto + imagen: texto (antetítulo, título, párrafos y botón opcionales) a un lado e imagen al otro. En móvil, apilados.
  var TI_W = { small: 200, '': 275, large: 340 };
  M.textimg = {
    letter: 'X', name: 'Texto + imagen', tag: 'TEXTO + IMAGEN',
    fields: [
      { k: 'label', label: 'Antetítulo (opcional)', type: 'text', half: true, ph: 'Good to know' }, { k: 'title', label: 'Título (opcional)', type: 'text', half: true },
      { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP },
      { k: 'img', label: 'Imagen · custom link de Cvent', type: 'url', req: true, img: true, half: true }, { k: 'alt', label: 'Descripción de la imagen (alt)', type: 'text', req: true, half: true },
      { k: 'side', label: 'Imagen', type: 'select', half: true, opts: [['right', 'A la derecha'], ['left', 'A la izquierda']] },
      { k: 'imgW', label: 'Tamaño de la imagen', type: 'select', half: true, opts: [['', 'Mitad (275 px)'], ['small', 'Pequeña (200 px)'], ['large', 'Grande (340 px)']] },
      { k: 'valign', label: 'Alineación vertical', type: 'select', opts: [['middle', 'Centrados'], ['top', 'Arriba']] },
      { k: 'btn', label: 'Texto del botón (opcional)', type: 'text', half: true }, { k: 'url', label: 'Enlace del botón', type: 'url', half: true },
      { k: 'btnStyle', label: 'Estilo del botón', type: 'select', opts: [['gold', 'Color principal (dorado en WCH)'], ['dark', 'Oscuro (carbón)']], showIf: function (d) { return has(d.btn); } }
    ],
    defaults: { side: 'right', valign: 'middle', btnStyle: 'gold' },
    build: function (d) {
      var iw = TI_W[d.imgW] || TI_W[''], GAP = 24, tw = 570 - iw - GAP, left = d.side === 'left', va = d.valign === 'top' ? 'top' : 'middle';
      var t = (has(d.label) ? '<p style="' + F.bold + 'font-size:12px;line-height:16px;color:' + C.label + ';letter-spacing:1.5px;text-transform:uppercase;word-break:break-word;padding-bottom:8px;">' + esc(d.label.trim()) + '</p>' : '') +
        (has(d.title) ? '<p style="' + titleFont(d.title, 'ex60', 28, 32) + 'color:' + C.title + ';text-transform:' + C.titleCase + ';word-break:break-word;">' + br(esc(d.title.trim())) + '</p>' : '') +
        bodyText(d.text, 16, 25, '#000000', 'left', has(d.title) ? 12 : 0) +
        // El botón (tabla con align="left") flota: sin el clear, en móvil la imagen se le monta encima.
        (has(d.btn) ? optBtn(d, 'left') + '<div style="clear:both;height:0;line-height:0;font-size:0;">&nbsp;</div>' : '');
      var src = String(d.img || '').trim();
      var pic = !src || isPh(src) ? phBlock(iw, Math.round(iw * 0.75)) : '<img src="' + attr(src) + '" alt="' + attr(d.alt) + '" title="' + attr(d.alt) + '" border="0" width="' + iw + '" style="width:' + iw + 'px;max-width:100%;height:auto;display:block;border-radius:8px;" class="img-max" />';
      var txtTd = '<td class="col2" width="' + tw + '" valign="' + va + '" style="width:' + tw + 'px;padding:' + (left ? '0 0 0 ' + GAP + 'px' : '0 ' + GAP + 'px 0 0') + ';">' + t + '</td>';
      var imgTd = '<td class="col2" width="' + iw + '" valign="' + va + '" style="width:' + iw + 'px;">' + pic + '</td>';
      return section(cell('30px 40px 30px 40px', 'left', TBL + '><tbody><tr>' + (left ? imgTd + txtTd : txtTd + imgTd) + '</tr></tbody></table>'));
    }
  };

  // Imagen: de 1 a 3 por fila. Una = el antiguo «Imagen» (a sangre o con márgenes); tres = «Tres fotos en fila».
  var IMGS = K.repeat({ prefix: 'f', countKey: 'fN', max: 3, keys: ['src', 'alt'], titleKey: 'src', titleName: 'enlace de imagen', noun: 'imagen',
    hint: 'Hasta 3 imágenes en fila. En móvil, una debajo de otra.',
    fields: function (n, show) {
      return [{ k: 'f' + n + '_src', label: 'Imagen ' + n + ' · custom link de Cvent', type: 'url', req: n === 1, img: true, showIf: show }, { k: 'f' + n + '_alt', label: 'Imagen ' + n + ' · descripción (alt)', type: 'text', req: n === 1, showIf: show }];
    } });
  K.imagesCount = IMGS.count;
  M.images = {
    letter: 'A', name: 'Imagen', tag: 'IMAGEN',
    fields: IMGS.fields().concat([
      { k: 'size', label: 'Tamaño (con una imagen)', type: 'select', opts: [['full', 'A sangre (650 px)'], ['inset', 'Con márgenes (570 px)']], showIf: function (d) { return IMGS.count(d) === 1 && !scalePct(d.scale); } },
      { k: 'scale', label: 'Escala (más pequeña, con más margen)', type: 'select', opts: SCALE_OPTS, hint: 'Reduce la imagen (o la fila) y la centra. En móvil mantiene la proporción.' }
    ]),
    defaults: { size: 'full' },
    build: function (d) {
      var its = IMGS.items(d), pct = scalePct(d.scale);
      // Escala (opcional, nueva): la fila ocupa ese % de los 570 px útiles y se centra. Sin escala, el HTML de siempre.
      if (pct) {
        var list = its.length ? its : [{ src: d.f1_src, alt: d.f1_alt }], total = Math.round(570 * pct / 100), n = list.length, w = Math.floor((total - 12 * (n - 1)) / n);
        var pics = list.map(function (it) { return '<td class="col2" width="' + w + '" valign="top" style="width:' + w + 'px;">' + scaledPic(it.src, it.alt, w, n === 3 ? 'border-radius:6px;' : '') + '</td>'; });
        return section(cell('12px 40px', 'center', '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="' + total + '" align="center" style="width:100%;max-width:' + total + 'px;margin:0 auto;"><tbody><tr>' + pics.join('<td class="desk-only" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>') + '</tr></tbody></table>'));
      }
      if (its.length <= 1) return M.imagen.build({ src: its.length ? its[0].src : d.f1_src, alt: its.length ? its[0].alt : d.f1_alt, size: d.size });
      if (its.length === 3) return M.fotos3.build({ src1: its[0].src, alt1: its[0].alt, src2: its[1].src, alt2: its[1].alt, src3: its[2].src, alt3: its[2].alt });
      var cells = its.map(function (it) {
        var src = String(it.src || '').trim();
        return '<td class="col2" width="279" valign="top" style="width:279px;">' + (isPh(src) ? phBlock(279, 210) : '<img src="' + attr(src) + '" alt="' + attr(it.alt) + '" title="' + attr(it.alt) + '" border="0" width="279" style="width:279px;max-width:100%;height:auto;display:block;" class="img-max" />') + '</td>';
      });
      return section(cell('12px 40px', 'center', TBL + '><tbody><tr>' + cells.join('<td class="desk-only" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>') + '</tr></tbody></table>'));
    }
  };


  // ============================================================
  // CAJA (fase 3): un recuadro para destacar algo. Mismo HTML que los bloques antiguos equivalentes:
  //   suave solo con texto = «Banda informativa» (con Título de sección encima = la banda con título)
  //   suave con etiqueta, título, fecha o botón = «Step» · con borde = «Llamada a la acción» · oscura = «Important»
  // ============================================================
  function boxStyle(d) { return d.style === 'borde' || d.style === 'oscura' ? d.style : 'suave'; }
  var BOX_EMPTY = 'KSA_CAJA_VACIA';
  function boxSimple(d) { return d.density !== 'editorial' && boxStyle(d) === 'suave' && !has(d.label) && !has(d.title) && !has(d.deadline) && !has(d.btn); }
  M.box = {
    letter: 'N', name: 'Caja', tag: 'CAJA',
    fields: [{ k:'density', label:'Composición', type:'select', opts:[['','Habitual'],['editorial','Compacta (referencia editorial)']] },
      { k: 'style', label: 'Estilo', type: 'select', opts: [['suave', 'Suave (fondo claro y barra lateral)'], ['borde', 'Con borde (centrada)'], ['oscura', 'Oscura (aviso)']] },
      { k: 'label', label: 'Etiqueta (opcional)', type: 'text', half: true, ph: 'Step 1 · IMPORTANT' }, { k: 'deadline', label: 'Fecha límite (etiqueta de color, opcional)', type: 'text', half: true, ph: 'Deadline: May 1', showIf: function (d) { return boxStyle(d) === 'suave'; } },
      { k: 'title', label: 'Título de la caja (opcional)', type: 'text', showIf: function (d) { return boxStyle(d) !== 'oscura'; } },
      { k: 'text', label: 'Texto', type: 'area', hint: TIP },
      { k: 'fmt', label: 'Formato del texto', type: 'select', opts: [['', 'Párrafos'], ['puntos', 'Puntos (una línea, un punto)']], showIf: function (d) { return boxStyle(d) === 'suave'; } },
      { k: 'line', label: 'Línea con enlace de Cvent (opcional)', type: 'text', ph: 'Register here: {[E-RSVP YES LINK]}', hint: 'Escribe el campo de Cvent suelto: genera su propio enlace.', showIf: function (d) { return boxStyle(d) === 'borde'; } },
      { k: 'btn', label: 'Texto del botón (opcional)', type: 'text', half: true, showIf: function (d) { return boxStyle(d) !== 'oscura'; } }, { k: 'url', label: 'Enlace del botón', type: 'url', half: true, showIf: function (d) { return boxStyle(d) !== 'oscura'; } },
      { k: 'btnStyle', label: 'Estilo del botón', type: 'select', opts: [['gold', 'Color principal (dorado en WCH)'], ['dark', 'Oscuro (carbón)']], showIf: function (d) { return boxStyle(d) !== 'oscura' && has(d.btn); } }
    ],
    defaults: { style: 'suave', btnStyle: 'gold' },
    build: function (d) {
      var st = boxStyle(d);
      if (d.density === 'editorial' && st !== 'oscura') {
        var bordered = st === 'borde', align = bordered ? 'center' : 'left';
        var content = (has(d.title) ? boxTitle(d.title,bordered ? 22 : 20,bordered ? 28 : 26,C.title,'text-align:'+align+';padding-bottom:10px;') : '') + (has(d.deadline) ? tag(d.deadline) : '') + (d.fmt === 'puntos' ? dotLines(d.text,14,23,0) : bodyText(d.text,bordered ? 15 : 14,bordered ? 24 : 23,'#000000',align,0)) + (has(d.line) ? bodyText(d.line,15,25,'#000000',align,12) : '') + optBtn(d,align);
        var label = has(d.label) ? TBL+'><tbody><tr><td style="border-top:1px solid '+C.line+';padding-top:22px;padding-bottom:14px;">'+eyebrow(d.label,C.label,'line-height:16px;')+'</td></tr></tbody></table>' : '';
        return section(cell(bordered ? '26px 40px 34px 40px' : '24px 40px 0 40px',align,label+TBL+' style="background-color:'+(bordered ? '#FFFFFF' : SOFT)+';'+(bordered ? 'border:2px solid '+C.edge : 'border-left:4px solid '+C.edge)+';"><tbody><tr><td style="padding:'+(bordered ? '22px 24px' : '18px 22px')+';text-align:'+align+';">'+content+'</td></tr></tbody></table>'));
      }
      if (st === 'oscura') return M.important.build({ label: has(d.label) ? d.label : 'IMPORTANT', text: d.text });
      if (st === 'borde') return M.cta.build(d);
      if (boxSimple(d)) return section(cell('10px 40px 30px 40px', 'left', softBand(d.text, d.fmt === 'puntos')));
      return M.step.build(d);
    }
  };
  K.MODULE_ORDER = ['title', 'text', 'list', 'images', 'textimg', 'button', 'cards', 'box', 'datos', 'producto', 'separador', 'compra', 'contacto', 'glance', 'timeline', 'deadlines', 'wallet'];
  // Bloques antiguos: fuera de la paleta, pero se siguen pintando igual en las newsletters que los usan.
  K.LEGACY = { intro: 'text', titulo: 'title', lista: 'list', cierre: 'title', imagen: 'images', fotos3: 'images', boton: 'button', tarjetas: 'cards', info: 'box', step: 'box', cta: 'box', important: 'box' };

  // ============================================================
  // MONTAJE
  // Fijo y automático: header del torneo, banner Media Packages (si se marca),
  // footer de imagen del torneo (si existe) y footer legal con la baja.
  // ============================================================
  // opts.preview: solo para la vista previa del editor. Cada módulo va en su propio <tbody data-ksa-section="i">
  // para poder seleccionarlo, arrastrarlo y editar su texto. Nunca se usa en lo que se copia o descarga.
  function spacedContent(html) {
    var background=html.match(/<table[^>]*style="background-color:([^;]+);width:650px;" class="wrapper">/);
    if (background && background[1]!=='#FFFFFF') return html+section('<tr><td height="20" bgcolor="#FFFFFF" style="height:20px;line-height:20px;font-size:0;background-color:#FFFFFF;">&nbsp;</td></tr>');
    return html.replace(/(class="wrapper"><tbody><tr><td[^>]*style="padding:)([^;]+)(;)/,function(all,start,padding,end){
      var values=padding.trim().split(/\s+/), top=values[0], right=values[1]||top, bottom=values[2]||top, left=values[3]||right;
      if (!/^(?:0|[0-9]+px)$/.test(bottom) || parseInt(bottom,10)>=20) return all;
      return start+top+' '+right+' 20px '+left+end;
    });
  }
  K.build = function (st, opts) {
    var previousProfile = renderingProfile, previousWCH = renderingWCH;
    renderingProfile = !!(K.Designs && K.Designs.active(st));
    try {
    var t = K.BrandKits ? K.BrandKits.effectiveTournament(st) : K.tournament(st.tournament), kit = K.BrandKits ? K.BrandKits.forState(st) : null, parts = [], n = 0;
    var profile = renderingProfile && K.Designs.get(kit && kit.designId || (K.Designs.forSection(st.tournament)||{}).id), wch = profile && profile.id==='rmf-wch'; renderingWCH=!!wch;
    var useSpacing = !!(K.Designs && (st.designVersion===K.Designs.version || renderingProfile));
    function content(html) { return useSpacing ? spacedContent(html) : html; }
    function add(tag, html) { parts.push('<!-- [' + (n++) + '] ' + tag + ' -->\n' + html); }
    var off = wch ? {} : (st.off || {});
    if (!off.header && t.header) add('HEADER', imgFull(t.header, has(st.headerAlt) ? st.headerAlt : (kit ? (kit.header.name || kit.name) : (t.club ? t.brand : K.CLIENT.name + ' · ' + t.name))));
    var banner = kit ? kit.mediaBanner.url : (t.club ? t.mediaBanner : K.CLIENT.mediaBanner);
    if (st.mediaPackages && banner) add('BANNER', imgFull(banner, 'Media Packages - ' + t.name));
    if (!off.franja) add('FRANJA', M.franja.build({ left: wch ? t.franjaLeft : st.franjaLeft, right: wch ? t.franjaRight : st.franjaRight }, t));
    var preview = !!(opts && opts.preview), pendingAt = preview && opts.pendingAt != null ? opts.pendingAt : -1;
    // Bloque nuevo aún sin tipo: solo en la vista previa, nunca en el email.
    var PENDING = '</tbody><tbody data-ksa-pending="1"><tr><td align="center" style="padding:34px 24px;background:#FFFFFF;border:2px dashed #6F4ACC;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#48237E;"><strong>Bloque nuevo</strong><br /><span style="font-size:13px;color:#6F4ACC;">Elige qué tipo de bloque es en el panel de la derecha →</span></td></tr></tbody><tbody>';
    // Bloques ocultos (ojo): no salen en el email. En la vista previa queda una tira fina para volver a mostrarlos.
    var all = st.sections || [], secs = [], map = [], shown = {};
    all.forEach(function (s, i) {
      if (s.hidden) return;
      // Caja suave vacía: en la vista previa lleva un texto guía gris para que se vea al añadirla (nunca en el email ni en los datos).
      if (preview && s.type === 'box' && boxSimple(s.d || {}) && !has((s.d || {}).text)) s = { type: s.type, d: Object.assign({}, s.d, { text: BOX_EMPTY }) };
      secs.push(s); map.push(i);
    });
    var vPending = pendingAt < 0 ? -1 : map.filter(function (i) { return i < pendingAt; }).length;
    function hiddenUpTo(limit) {
      if (!preview) return;
      all.forEach(function (s, i) {
        if (!s.hidden || shown[i] || i >= limit) return; shown[i] = true;
        var m = M[s.type], name = m ? m.name : s.type;
        add('OCULTO', '</tbody><tbody data-ksa-section="' + i + '" data-ksa-hidden="1"><tr><td style="padding:9px 24px;background:#F7F4FC;border:1px dashed #A5A0C4;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#6f6a85;">Oculto: <strong>' + esc(name) + '</strong> · no sale en el email</td></tr></tbody><tbody>');
      });
    }
    K.flowGroups(secs, vPending).forEach(function (g) {
      if (g.start === vPending) { hiddenUpTo(pendingAt); add('BLOQUE NUEVO', PENDING); }
      hiddenUpTo(map[g.start]);
      if (g.align) {
        // Piezas encadenadas: una sola celda. En la vista previa, cada pieza va en su propio <div> seleccionable.
        var pieces = secs.slice(g.start, g.end + 1);
        add(pieces.map(function (s) { return M[s.type].tag; }).join(' + '), content(K.flowCell(pieces, g.align, preview ? function (j, part) { return '<div data-ksa-section="' + map[g.start + j] + '">' + part + '</div>'; } : null)));
        return;
      }
      var s = secs[g.start], i = map[g.start], m = M[s.type]; if (!m) return;
      var part = content(m.build(s.d || {}, t));
      add(m.tag, preview ? '</tbody><tbody data-ksa-section="' + i + '">' + part + '</tbody><tbody>' : part);
    });
    if (vPending >= secs.length) { hiddenUpTo(pendingAt); add('BLOQUE NUEVO', PENDING); }
    else if (preview && !all.length) add('VACÍO', '</tbody><tbody data-ksa-empty="1"><tr><td align="center" style="padding:48px 24px;background:#F7F4FC;border:2px dashed #A5A0C4;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#48237E;">Arrastra aquí un bloque desde «＋ Añadir bloque»<br />o haz clic para elegir uno</td></tr></tbody><tbody>');
    hiddenUpTo(Infinity);
    if (wch) {
      if (!secs.some(function(s){return s.type==='contacto';})) add('CONTACTO', M.contacto.build({},t));
      add('FIRMA', section(cell('0 40px 24px','center','<p style="'+F.reg+'font-size:14px;line-height:22px;color:'+C.title+';">{[P-FIRST NAME]} {[P-LAST NAME]}</p>', C.contactBg)));
    }
    if (t.footer && !off.footer) add('IMAGEN FOOTER', imgFull(t.footer, t.footerAlt));
    add('OPT-OUT', section(cell('16px 20px', 'center', '<p style="' + F.reg + 'font-size:10px;line-height:14px;color:' + GREY + ';text-align:center;word-break:break-word;padding:3px 0;"><span style="color: ' + GREY + ';">If you no longer want to receive emails from {[P-FIRST NAME]} {[P-LAST NAME]}, please {[EMAIL OPT OUT]}.</span></p>')));
    var title = (t.club ? t.brand : K.CLIENT.name + ' · ' + t.name) + (has(st.name) ? ' – ' + st.name.trim() : '');
    var html = K.HEAD.replace('%%TITLE%%', function () { return esc(title); }) + ' ' + K.BODY_OPEN + parts.join('\n') + '\n' + K.BODY_CLOSE + '\n';
    // Franja con etiqueta reducida en móvil (WCH): su regla va solo en estos emails; el <head> del resto no cambia.
    if (html.indexOf('class="mobile-sub"') >= 0) html = html.replace('</style>', '@media screen and (max-width: 480px) {\n  .mobile-sub {\n    font-size: 9px !important;\n    letter-spacing: 0 !important;\n  }\n}</style>');
    // Paleta por roles (t.theme, solo sin kit aplicado): texto, grises, fondos suaves y roles separados del principal.
    // El kit editado de la propia marca (kit.base) conserva su paleta por roles; un kit aplicado aparte no.
    var clubLook = !((!kit || kit.base) && t.theme) && K.lookIsClub(st, t);
    var theme = (renderingProfile && t.theme) || ((!kit || kit.base) && t.theme) || (clubLook ? K.clubTheme(t) : {});
    // Estilo de club: en móvil, la fecha del Timeline va encima de su texto (como en la referencia de PSG).
    if ((clubLook || renderingProfile) && html.indexOf('<td width="120" valign="top" bgcolor="') >= 0) {
      html = html.split('<td width="120" valign="top" bgcolor="').join('<td class="tl-day" width="120" valign="top" bgcolor="')
        .split('<td valign="top" bgcolor="' + SOFT + '" style="padding:16px 20px;').join('<td class="tl-body" valign="top" bgcolor="' + SOFT + '" style="padding:16px 20px;')
        .replace('  .data-col {', '  .tl-day, .tl-body {\n    display: block !important;\n    width: 100% !important;\n    box-sizing: border-box;\n  }\n  .data-col {');
    }
    if (theme.body) html = html.replace(/color:#000000;/g, 'color:' + theme.body + ';');
    if (theme.grey) html = html.replace(/#A5A0C4/gi, theme.grey);
    if (theme.soft) html = html.replace(/#F7F4FC/gi, theme.soft);
    html = html.replace(/%%C:(\w+)%%/g, function (m, k) { return theme[k] || C_DEFAULT[k]; });
    if(preview) html=html.replace(/<img src="\{\[C-QRCODE_LINK\]\}"[^>]*\/>/g,'<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="180" style="width:180px;height:180px;border:1px dashed #AAAAAA;background:#F5F5F5;"><tbody><tr><td align="center" style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#444444;">QR personal de Cvent<br />{[C-QRCODE_LINK]}<br />Se genera para cada destinatario</td></tr></tbody></table>');
    if (preview) html = html.replace(new RegExp('(<p style="[^"]*)">' + BOX_EMPTY + '</p>', 'g'), '$1color:#8A84A3;font-style:italic;">Caja vacía · escribe su texto en el panel de la derecha</p>');
    var bodyAt = html.indexOf('<body');
    if (theme.link) html = html.slice(0, bodyAt).replace(/color: #6F4ACC;/g, 'color: ' + theme.link + ';') + html.slice(bodyAt);
    if (theme.bg) html = html.replace('bgcolor="#6F4ACC" style="background-color:#6F4ACC">', 'bgcolor="' + theme.bg + '" style="background-color:' + theme.bg + '">');
    // Colores del torneo: una sola pasada
    html = html.replace(/#6F4ACC|#91FAFB/gi, function (m) { return m.toUpperCase() === P ? t.principal : t.acento; });
    // Fuentes: las del kit aplicado o, si no hay kit, las de la sección del club. Sin enlace se elimina su @font-face.
    var fontSet = kit || (t.fonts ? { fonts: t.fonts } : null);
    if (K.BrandKits && fontSet) html = K.BrandKits.fontHtml(html, fontSet);
    // Fuentes de sistema por uso (p. ej. Georgia) cuando ese uso no tiene enlace.
    if (t.families) Object.keys(t.families).forEach(function (role) {
      if (fontSet && fontSet.fonts[role]) return;
      html = html.replace(new RegExp("font-family:\\s*'" + role + "'[^;\"}]*", 'g'), function () { return 'font-family:' + t.families[role]; });
    });
    return html;
    } finally { renderingProfile = previousProfile; renderingWCH = previousWCH; }
  };

  // Estilo de club (referencia: newsletter «Essential Pack» de PSG Experiences): franja del color principal con texto blanco,
  // títulos sin mayúsculas y algo más pequeños, texto gris oscuro, fondos suaves neutros y el acento en bordes y etiquetas
  // destacadas. Se calcula con los colores del kit de cada club. Solo en newsletters con st.look 'auto' (las nuevas);
  // las guardadas antes no tienen «look» y K.normalize les pone 'classic': no cambian.
  K.lookIsClub = function (st, t) { return st.look === 'auto' && !!t.club && t.club !== 'academy' && !t.theme; };
  K.clubTheme = function (t) {
    return { franjaBg: t.principal, franjaText: '#FFFFFF', franjaBar: t.principal, body: '#444444', soft: '#F5F7FB', line: '#EEEEEE', grey: '#AAAAAA',
      titleCase: 'none', onDark: '#FFFFFF', hilite: t.acento || t.principal, h1: '32px;line-height:40px', h2: '26px;line-height:32px', btnRadius: '4px' };
  };

  K.fileBase = function (st) {
    var t = K.tournament(st.tournament);
    var d = String(st.desc || st.name || 'newsletter').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'newsletter';
    return (t.filePrefix || K.CLIENT.filePrefix) + '-' + t.slug + '_' + d;
  };

  // ============================================================
  // REVISIÓN AUTOMÁTICA (checklist)
  // ============================================================
  K.check = function (st, html) {
    var t = K.BrandKits ? K.BrandKits.effectiveTournament(st) : K.tournament(st.tournament), kit = K.BrandKits ? K.BrandKits.forState(st) : null, out = [], off0 = st.off || {};
    function E(m) { out.push({ level: 'error', msg: m }); } function W(m) { out.push({ level: 'warn', msg: m }); } function OK(m) { out.push({ level: 'ok', msg: m }); }
    var all = st.sections || [], hiddenN = all.filter(function (x) { return x.hidden; }).length;
    // Los bloques ocultos no salen en el email: no se revisan (los números de módulo siguen siendo los del panel).
    var secs = all.map(function (x) { return x.hidden ? { type: '', d: {} } : x; });
    if (st.brandKit && K.BrandKits) { try { K.BrandKits.snapshot(st.brandKit); } catch (e) { E('Brand kit inválido: ' + e.message); } }
    if (kit && !t.header && !off0.header) W('El kit no tiene custom link de header; el email sale sin esa imagen.');
    if (kit && st.mediaPackages && !kit.mediaBanner.url) W('El kit no tiene custom link para el banner de Media Packages.');

    if (!kit && !t.header && !off0.header) W('Header de ' + t.name + ' PENDIENTE: la newsletter sale sin él. Necesito el custom link de Cvent del header.');
    if (t.provisional && !kit) W('Colores de ' + t.name + ' provisionales: faltan sus datos de diseño.');
    if (!kit && t.club && st.mediaPackages && !t.mediaBanner) W(t.clubName + ' no tiene banner de Media Packages: no se añade.');
    if (K.Designs && K.Designs.active(st) && t.id==='rmf-wc' && !has(t.contact)) E('Contacto WCH pendiente: configura el email o campo de contacto del evento.');
    if (t.club && !has(t.contact) && secs.some(function (x) { return x.type === 'contacto'; })) E('Caja de contacto: falta el email o custom field de contacto de ' + t.clubName + '. Sale «CONTACTO PENDIENTE».');
    if (!has(st.name)) W('Falta el nombre de la newsletter (título interno y nombre de archivo).');
    if (!t.footer && !off0.footer) W('Footer de imagen de ' + (kit ? kit.name : t.name) + ' PENDIENTE: la newsletter sale sin él. Necesito el custom link de Cvent del footer.');
    if (!all.length) W('La newsletter no tiene módulos todavía.');
    else if (hiddenN === all.length) W('Todos los bloques están ocultos: el email sale sin contenido.');
    if (hiddenN) W(hiddenN === 1 ? 'Hay 1 bloque oculto: no sale en el email.' : 'Hay ' + hiddenN + ' bloques ocultos: no salen en el email.');
    var off = st.off || {};
    if (!off.franja && !has(st.franjaLeft) && !has(t.franjaLeft)) E('Falta la etiqueta izquierda de la franja identificadora.');
    // {[E-RSVP YES LINK]} y {[E-MODIFY REG LINK]} generan su propio enlace: nunca dentro de otro enlace.
    var selfLink = /\{\[E-(RSVP YES|MODIFY REG) LINK\]\}/, inLink = /<a\b[^>]*\{\[E-(RSVP YES|MODIFY REG) LINK\]\}|<a\b[^>]*>(?:(?!<\/a>)[\s\S])*\{\[E-(RSVP YES|MODIFY REG) LINK\]\}/.test(html.slice(html.indexOf('<body')));
    // También en el texto escrito: dentro de [texto](…) o en un campo de enlace.
    secs.forEach(function (s) { var m = M[s.type]; if (!m) return; m.fields.forEach(function (f) {
      var v = String((s.d || {})[f.k] || '');
      if ((f.type === 'url' && selfLink.test(v)) || /\]\([^)]*\{\[E-(RSVP YES|MODIFY REG) LINK\]\}/.test(v) || /\[[^\]]*\{\[E-(RSVP YES|MODIFY REG) LINK\]\}[^\]]*\]\(/.test(v)) inLink = true;
    }); });
    if (inLink) E('{[E-RSVP YES LINK]} o {[E-MODIFY REG LINK]} está dentro de otro enlace: Cvent ya genera su propio enlace. Ponlo como texto suelto.');
    if (off.header) W('Header del torneo desactivado manualmente.');
    if (off.franja) W('Franja identificadora desactivada manualmente.');
    if (off.footer && t.footer) W('Footer de imagen desactivado manualmente.');

    // Campos obligatorios vacíos
    secs.forEach(function (s, i) {
      var m = M[s.type]; if (!m) return;
      m.fields.forEach(function (f) {
        if (f.req && !has((s.d || {})[f.k]) && (!f.showIf || f.showIf(s.d || {}))) E('Módulo ' + (i + 1) + ' (' + m.name + '): falta «' + f.label + '».');
        var v = (s.d || {})[f.k];
        if (f.type === 'url' && has(v) && !f.wallet) {
          var isImg = f.img || f.k === 'img';
          if (isImg && isPh(v)) E('Módulo ' + (i + 1) + ' (' + m.name + '): la imagen es un placeholder. Sustitúyelo por el custom link de Cvent antes de exportar.');
          else if (isImg) {
            var validImage = v.trim().indexOf(K.CLIENT.imageBase) === 0;
            if (K.BrandKits) { try { K.BrandKits.url(v, true); validImage = true; } catch (e) { validImage = false; } }
            if (!validImage) E('Módulo ' + (i + 1) + ' (' + m.name + '): la imagen no es un custom link de Cvent válido.');
          }
          if (!isImg && !/^(https?:\/\/|mailto:)/i.test(v.trim())) E('Módulo ' + (i + 1) + ' (' + m.name + '): el enlace debe empezar por https:// o mailto:.');
        }
      });
      var d = s.d || {};
      // Enlaces escritos en el texto: [texto](enlace)
      m.fields.forEach(function (f) {
        if (f.type !== 'text' && f.type !== 'area') return;
        var raw = String(d[f.k] || ''), where = 'Módulo ' + (i + 1) + ' (' + m.name + '), «' + f.label + '»: ';
        raw.replace(LINK, function (all, t, u) {
          var level = linkLevel(u);
          if (level === 'error') E(where + 'el enlace «' + u + '» no es válido. Usa https://… o mailto:…');
          else if (level === 'warn') W(where + 'el enlace «' + u + '» usa http:// (sin cifrar). Mejor https://.');
          return '';
        });
        if (/\[[^\]\n]+\]\s*\(/.test(raw.replace(LINK, ''))) W(where + 'hay un enlace mal escrito; no se convertirá en enlace. Formato: [texto](https://…), sin espacios en el enlace.');
      });
      // Frase propia: puede llevar el campo de Cvent o un enlace [texto](…); sin ninguno, la caja no lleva a ningún sitio.
      if(s.type==='wallet') {
        Object.keys(WALLET_DEFAULTS).forEach(function(key){
          if (key==='qrUrl' && d.qr!=='personal') return;
          var value=String(d[key]||'').trim();
          if(value && !walletValid(value,key)) E('Wallet: «'+key+'» no es un campo personal o enlace Cvent válido. No uses enlaces del editor, de EmailPreview ni imágenes QRCodeType.gif. Se exporta el valor predeterminado.');
          else if(value && /Url$/.test(key) && value!==WALLET_DEFAULTS[key]) W('Wallet: «'+key+'» usa una URL fija; comprueba que corresponde al pase o QR deseado. El campo Cvent predeterminado es personal por destinatario.');
        });
        if(/Apple Wallet|Add to Google Wallet Button|C-QRCODE_LINK|QRCodeType\.gif|EmailDesigner|EmailPreview/.test(String(d.text||''))) W('Wallet: revisa el texto opcional. Usa «Limpiar textos técnicos y recuperar QR» si contiene nombres de imágenes, campos QR o enlaces del editor.');
      }
      if (s.type === 'compra' && d.variant === 'custom') {
        if (!has(d.line)) E('Módulo ' + (i + 1) + ' (Caja de compra): falta tu frase.');
        else if (!/\{\[E-[A-Z -]+LINK\]\}/.test(d.line) && !/\[[^\]]+\]\([^)\s]+\)/.test(d.line)) W('Módulo ' + (i + 1) + ' (Caja de compra): tu frase no tiene enlace. Añade {[E-MODIFY REG LINK]} o [texto](https://…).');
      }
      function btnCheck(where, b, u) {
        if (has(b) && !has(u)) E('Módulo ' + (i + 1) + ' (' + where + '): el botón «' + String(b).trim() + '» no tiene enlace. Añádelo antes de enviar.');
        if (!has(b) && has(u)) E('Módulo ' + (i + 1) + ' (' + where + '): hay un enlace de botón pero falta el texto del botón.');
      }
      if (s.type === 'tarjetas') btnCheck('Tarjetas, tarjeta 1', d.a_btn, d.a_url), btnCheck('Tarjetas, tarjeta 2', d.b_btn, d.b_url);
      if (s.type === 'titulo') btnCheck('Título', d.btn, d.url);
      if (s.type === 'images') IMGS.check(d, W, 'Módulo ' + (i + 1) + ' (Imagen)');
      if (s.type === 'box' && boxStyle(d) !== 'oscura') btnCheck('Caja', d.btn, d.url);
      if (s.type === 'producto') PK.check(d, W, 'Módulo ' + (i + 1) + ' (Producto)');
      if (s.type === 'cards') { CARDS.check(d, W, 'Módulo ' + (i + 1) + ' (Tarjetas)'); for (var cn = 1; cn <= 8; cn++) btnCheck('Tarjetas, tarjeta ' + cn, d['c' + cn + '_btn'], d['c' + cn + '_url']); }
      if (s.type === 'producto' && has(d.img) && !isPh(d.img) && !has(d.alt)) E('Módulo ' + (i + 1) + ' (Producto): falta la descripción de la imagen.');
      if (i && secs[i - 1].type === s.type && (s.type === 'datos' || s.type === 'info' || (s.type === 'box' && boxSimple(d) && boxSimple(secs[i - 1].d || {})))) W('Módulos ' + i + ' y ' + (i + 1) + ': el mismo recurso dos veces seguidas.');
    });

    // Contenido marcado como pendiente al crear desde un guion
    secs.forEach(function (s, i) {
      var m = M[s.type]; if (!m) return;
      m.fields.forEach(function (f) { if (/^\s*PENDIENTE:/i.test(String((s.d || {})[f.k] || ''))) E('Módulo ' + (i + 1) + ' (' + m.name + '), «' + f.label + '»: contenido PENDIENTE de redactar.'); });
    });

    // Campos Cvent
    var found = html.match(/\{\[[^\]]*\]\}/g) || [], bad = [];
    found.forEach(function (f) { if (K.CVENT_FIELDS.indexOf(f) < 0 && bad.indexOf(f) < 0) bad.push(f); });
    if (bad.length) E('Campo de Cvent no reconocido: ' + bad.join(', ') + '. Revisa que esté escrito exactamente igual.');
    var body = html.slice(html.indexOf('<body'));
    if (/(^|[^{])\[(C|E|P)-[A-Z][^\]]*\](?!\})/.test(body) || /\{\[[^\]]*$/m.test(body.replace(/\{\[[^\]]*\]\}/g, ''))) E('Hay un campo de Cvent mal cerrado (debe ser {[...]}).');
    if (!bad.length) OK('Campos de Cvent correctos (' + found.length + ').');
    OK('Footer legal con baja ({[EMAIL OPT OUT]}) incluido.');
    if (kit) OK(kit.base ? 'Kit de la marca editado en este navegador («' + kit.name + '»).' : 'Brand kit «' + kit.name + '»: copia guardada con la newsletter.');
    else OK((off0.header ? 'Paleta' : 'Header de ' + t.name + ' y paleta') + ' del torneo aplicados.');

    // Textos
    var txt = secs.map(function (s) { return Object.keys(s.d || {}).map(function (k) { return s.d[k]; }).join('\n'); }).join('\n');
    if (/surf cup spain/i.test(txt)) E('Aparece «Surf Cup Spain»: debe ser «Surf Cup» o «Surf Cup Tournament».');
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(txt)) W('Hay emojis en el texto: no se usan en este estilo.');
    K.CLIENT.tournaments.forEach(function (o) {
      if (o.short && o.id !== t.id && new RegExp(o.short.replace(/ /g, '\\s+'), 'i').test(txt) && !(t.id === 'usacup' && o.id === 'surfcup' && false))
        W('El texto menciona «' + o.short + '» pero el torneo elegido es ' + t.name + '.');
    });
    if (st.mediaPackages && (!kit || kit.mediaBanner.url)) OK('Banner de Media Packages bajo el header.');
    if (secs.some(function (s) { var d = s.d || {}; return ['title', 'a_title', 'b_title'].some(function (k) { return hasDigits(d[k]); }); }))
      OK(kit ? 'Títulos con números: usan la fuente asignada a cifras en el kit.' : 'Títulos con números: se muestran en DinPro (Extenda no tiene números).');
    return out;
  };

  // ============================================================
  // RECETAS (puntos de partida) — apartado 8 del contexto
  // ============================================================
  K.RECIPES = [
    { id: 'blank', name: 'En blanco', sections: [] },
    { id: 'media', name: 'Media Packages / venta', mediaPackages: true, sections: [['text'], ['images'], ['images'], ['compra'], ['title', { style: 'seccion' }], ['list'], ['contacto']] },
    { id: 'anuncio', name: 'Anuncio / previa del torneo', sections: [['text'], ['title'], ['datos'], ['cards', { cN: 2 }], ['title', { style: 'entre' }], ['compra', { variant: 'modificar' }]] },
    { id: 'recordatorio', name: 'Recordatorio / instrucciones', sections: [['text'], ['box'], ['title', { style: 'seccion' }], ['list'], ['compra', { variant: 'modificar' }]] },
    { id: 'productos', name: 'Venta de varios servicios con precio', sections: [['title'], ['text', { align: 'left' }], ['producto'], ['separador'], ['producto'], ['title', { style: 'entre' }], ['compra', { layout: 'bottom' }], ['text']] },
    { id: 'transaccional', name: 'Transaccional / confirmación', sections: [['text'], ['compra'], ['contacto']] },
    // La receta de la BASE se queda con los bloques antiguos: la prueba la compara con la newsletter de referencia.
    { id: 'ref1', name: 'Ejemplo: Media Packages · Surf Cup 2026', tournament: 'surfcup', mediaPackages: true, name2: 'Media Packages', desc: 'media_packages', headerAlt: 'Kaptiva Global Stage',
      franja: 'Media Packages',
      sections: [
        ['intro', { text: 'Our in-house media team will be on site at the Surf Cup Tournament, capturing the best moments on the field and giving families **both digital and physical memories**.\nExplore our three photography packages below and choose the option that best fits your player.' }],
        ['imagen', { src: 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f28d166daebf47be89484d1c49deaf1f.png', alt: 'Early bird prices available until February 7th' }],
        ['imagen', { src: 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/7235e7858670437bbe52ac53561d1730.png', alt: 'Photography packages: Player Card Pack, On the Field Pack and Ultimate Tournament Pack' }],
        ['compra'],
        ['lista', { title: 'Delivery Details', items: '**Portrait photos** are printed and delivered in person at the end of the event.\nThe **15 or 20 action shots** are delivered **digitally within 15 days** after the event.\nDigital images are sent via email to **two email addresses** on file to ensure successful delivery and are available for high-quality download.' }],
        ['contacto']
      ] }
  ];

  K.normalize = function (st) {
    st.off = st.off || {}; st.sections = st.sections || [];
    if (st.look !== 'auto' && st.look !== 'classic') st.look = 'classic';
    if (st.franjaLeft == null) st.franjaLeft = '';
    st.sections = st.sections.filter(function (x) {
      if (x.type !== 'franja') return true;
      if (!has(st.franjaLeft)) st.franjaLeft = (x.d || {}).left || '';
      return false;
    });
    return st;
  };

  K.fromRecipe = function (id, keepTournament) {
    var r = K.RECIPES.filter(function (x) { return x.id === id; })[0] || K.RECIPES[0], uid = 0;
    return {
      tournament: r.tournament || keepTournament || 'surfcup', name: r.name2 || '', desc: r.desc || '', headerAlt: r.headerAlt || '', mediaPackages: !!r.mediaPackages, franjaLeft: r.franja || '', look: 'auto', designVersion: K.Designs ? K.Designs.version : undefined, off: {},
      sections: r.sections.map(function (s) {
        var d = {}, m = M[s[0]], k;
        for (k in (m.defaults || {})) d[k] = m.defaults[k];
        for (k in (s[1] || {})) d[k] = s[1][k];
        return { id: 's' + Date.now() + '_' + (uid++), type: s[0], d: d, open: true };
      })
    };
  };

  // ============================================================
  // IMPORTAR CON CHATGPT (sin coste de API)
  // La app genera las instrucciones; ChatGPT reparte el contenido en módulos
  // y devuelve un proyecto que la app valida y monta con sus piezas fijas.
  // ============================================================
  function moduleList(L) {
    L.push('MÓDULOS DISPONIBLES ("type" y sus campos en "d")');
    K.MODULE_ORDER.forEach(function (id) {
      var m = M[id], fs = m.fields.filter(function (f) { return f.k; }).map(function (f) {
        return f.k + (f.type === 'select' ? ' (uno de: ' + f.opts.map(function (o) { return o[0]; }).join(' | ') + ')' : '') + ' = ' + f.label;
      });
      L.push('- ' + id + ' → ' + m.name + (fs.length ? '. Campos: ' + fs.join('; ') : '. Sin campos.'));
    });
  }

  // Newsletter de referencia (PSG Experiences · Essential Pack): cómo se compone una newsletter de club bien hecha.
  // Se da como ejemplo a ChatGPT y la prueba test/club-style.test.js comprueba que se pinta como el original.
  K.REFERENCE_CLUB = { tournament: 'psg-exp', name: 'Essential Pack Information', desc: 'essential_pack_information', franja: 'Paris Saint-Germain Academy Clinic', franjaRight: 'November 2026 · Paris', mediaPackages: false, sections: [
    { type: 'title', d: { text: 'Your Week in Paris,\n{[C-FIRST NAME:TC]}', style: 'principal', align: 'left' } },
    { type: 'text', d: { text: 'Here’s how your week in Paris will unfold, day by day, along with everything you need to know about your hotel, meals, and important deadlines' } },
    { type: 'glance', d: { l1: 'Clinic dates', v1: 'Nov 22 – 28\n2026', l2: 'Reference hotel', v2: 'La Défense\ndistrict', l3: 'Final payment', v3: 'September 1\n2026' } },
    { type: 'title', d: { text: 'Your week, day by day', style: 'ante' } },
    { type: 'timeline', d: { fmt: 'puntos', d1: 'Nov 22', s1: 'Arrival', t1: 'Kaptiva Sports check-in, approx. 2:30–3:30 PM in the lobby of the reference hotel — welcome pack and players\' kit handed out\nWelcome meeting, approx. 4:00–5:00 PM\nAirport transfers are not included in this pack',
      d2: 'Nov 23–27', s2: 'Training', t2: 'Players travel by bus from the reference hotel to the training facilities with our staff\nFour days of double training sessions.\nTraining sessions are closed to relatives, except Parent\'s Day.',
      d3: 'Nov 28', s3: 'Departure', t3: 'A free day for Essential Pack families\nAirport transfers are not included in this pack' } },
    { type: 'box', d: { style: 'suave', title: 'Your reference hotel', fmt: 'puntos', text: 'The hotel is not included, but it will be the daily meeting point\nThe reference hotel will be located in the La Défense district. Families arrange their own accommodation' } },
    { type: 'box', d: { style: 'suave', title: 'Meals included', fmt: 'puntos', text: '**Players only:** lunch on the 4 double-training-session days\n**Relatives:** no meals included' } },
    { type: 'deadlines', d: { l1: 'Final payment deadline', d1: 'September 1, 2026', l2: 'Last day for changes', d2: 'September 22, 2026' } },
    { type: 'title', d: { text: 'Good to know', style: 'ante' } },
    { type: 'text', d: { size: 'small', text: 'The exact reference hotel name will be confirmed approximately one month before the event.\nPSG first-team match tickets are not included in the pack.\nThe detailed schedule is coming soon.' } },
    { type: 'images', d: { f1_src: 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/748789e7f0084448873ba7dd5fc209b8.png', f1_alt: 'Paris Saint-Germain', f2_src: 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/06bf20224c974d91ab31fa32fd179ec8.png', f2_alt: 'Paris Saint-Germain', f3_src: 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/fcdfd108a5ad45938f89a0ea142a47d1.jpg', f3_alt: 'Paris Saint-Germain' } },
    { type: 'box', d: { style: 'borde', title: 'Any questions about your pack?', text: 'Review or update your registration {[E-MODIFY REG LINK]} — or reply to this email and our team will help you.' } }
  ] };
  // Guía de composición común a las instrucciones de guion e importación: qué pieza usar para cada contenido.
  function composeGuide(L, tournamentId, context) {
    L.push('- GUÍA DE COMPOSICIÓN (qué pieza usar para cada contenido; respeta el orden del original):');
    L.push('  · Saludo «Dear …» → title (saludo) + text. Titular grande de apertura → title (principal) + text; si el original lo alinea a la izquierda, "align":"left". Titular con botón → title (principal) + text + button.');
    L.push('  · Saltos de línea dentro de un titular o de un dato (p. ej. «Your Week in Paris,» y en otra línea el nombre): escribe \\n en el texto.');
    L.push('  · 2 o 3 datos clave cortos en recuadros (fechas, hotel, pago) → glance (l1/v1… = etiqueta y dato; las dos primeras van en recuadro oscuro y la tercera, clara y destacada). Fecha, hora y lugar en una banda de color → datos (de 1 a 4: l1/v1…).');
    L.push('  · Agenda o programa día a día → title (ante) con el rótulo («Your week, day by day») + timeline con "fmt":"puntos": d = fecha («Nov 22»), s = etiqueta corta bajo la fecha («Arrival», «Training»), t = un punto por línea (\\n). Usa h solo si el día tiene un titular propio. De 1 a 8 hitos.');
    L.push('  · Información con titular y puntos o párrafos (hotel, comidas, transporte, instrucciones) → box (suave) con el title DENTRO de la caja; si son puntos, "fmt":"puntos". Una caja por tema. No uses title + list para esto.');
    L.push('  · Paso con fecha límite → box (suave) con label, title y deadline. Aviso importante → box (oscura) con label y text.');
    L.push('  · Dos fechas límite o plazos lado a lado → deadlines (l = qué es, d = la fecha). No uses cards para fechas.');
    L.push('  · Notas finales («Good to know», «Please note», letra pequeña) → title (ante) + text con "size":"small".');
    L.push('  · Pregunta o llamada final con enlace de Cvent o botón → box (borde) con el title dentro y el texto en text (line solo para una línea suelta con un campo de Cvent).');
    L.push('  · Opciones, packs o precios paralelos → cards (de 1 a 8: c1_title, c1_price, c1_text…; si cada opción tiene foto, c1_img/c1_alt). Cada servicio con precio e imagen → producto (separador entre dos productos seguidos).');
    L.push('  · Párrafo (con titular o botón) junto a una foto, uno al lado del otro → textimg (label, title, text, img, alt; "side":"left" si la foto va a la izquierda). No lo separes en text + images.');
    L.push('  · Lista de puntos suelta, sin caja → title (seccion) + list. Frase con {[E-MODIFY REG LINK]} y datos de registro → compra solo si el original tiene esa caja de compra; si tiene una caja suave, conserva box (suave) y el enlace en text o line. Cierre o despedida → title (entre) + text. Lo que no encaje → text.');
    L.push('  · Resumen de importes con etiquetas y valores en vertical dentro de caja clara → datos con "style":"summary", title como rótulo, l1/v1… y text para la nota. No convertirlo en list ni en cards.');
    L.push('  · Composición compacta: cajas suaves, caja final de borde recto y tarjetas de datos centradas → box o glance con "density":"editorial". Caja suave con rótulo superior → box (suave), label para el rótulo, title dentro, fmt puntos si corresponde. Caja final con borde → box (borde). Párrafo de introducción → text size intro; cuerpo compacto → size body. Separador gris → separador style neutral.');
    L.push('  · WALLETS Y QR: los badges de Apple/Google Wallet son el módulo wallet, nunca una tabla Markdown ni texto copiado de sus alt. Enlaces personales: appleUrl="{[C-PASSBOOK_LINK]}" y googleUrl="{[C-GOOGLEWALLET_LINK]}". Un enlace a EmailDesigner/EmailPreview o passbook/pass/apple? vacío es una vista del editor, no el enlace personal: usa esos campos Cvent. Las imágenes oficiales de cvent-assets.com son válidas para estos badges aunque no sean custom.cvent.com.');
    L.push('  · QR personal de check-in: si el original tiene img src="{[C-QRCODE_LINK]}" o el placeholder QRCodeType.gif, usa wallet con qr="personal" y qrUrl="{[C-QRCODE_LINK]}". No pongas ese campo en text, no exportes QRCodeType.gif y no lo confundas con un QR de Telegram. Copia solo los párrafos humanos del envío en title/text; Apple Wallet, Add to Google Wallet Button y QR Code son alt de imágenes, no párrafos del email.');
    L.push('  · Franja: etiqueta izquierda en "franja"; si el original tiene otra etiqueta a la derecha (p. ej. «November 2026 · Paris»), en "franjaRight".');
    var profile = K.Designs && K.Designs.forSection(tournamentId);
    if (profile) {
      var rules = K.BrandKits && K.BrandKits.instructionsFor(context || {tournament:tournamentId,designVersion:K.Designs.version});
      L.push('INSTRUCCIONES DEL BRAND KIT '+profile.name+' · '+profile.version);
      L.push(rules ? rules.text : profile.instructions);
      L.push('COMPOSICIÓN OBLIGATORIA DEL KIT (prevalece sobre el aspecto del HTML antiguo):');
      L.push('- Primero identifica la función de cada fragmento, después elige módulos. Mantén el orden de los temas y conserva todas las palabras, cifras, campos, enlaces e imágenes de contenido. Puedes separar una frase del resto de un párrafo y darle jerarquía, sin reescribirla.');
      L.push('- Apertura: si la primera frase presenta el mensaje o interpela al destinatario, promuévela a title principal alineado a la izquierda, aunque en el HTML sea un párrafo normal. El resto de la introducción va en text size intro. No uses el título del documento como contenido nuevo.');
      L.push('- Datos etiquetados de pagos, balances o importes → datos style summary, incluso cuando el original los presente como viñetas. Traslada literalmente las etiquetas a l1/l2/l3 y los valores a v1/v2/v3; el rótulo existente va en title. Conserva notas, paréntesis y puntuación en el valor o en text, sin duplicarlos.');
      L.push('- Información sobre plazos, pagos o instrucciones agrupadas → box style suave, density editorial. Usa el titular existente si lo hay; si no, title vacío. No la dejes como una sucesión de text solo porque el HTML antiguo use párrafos.');
      L.push('- Datos de acceso (confirmación y email) → box style suave, density editorial. Conserva el titular existente y el contenido literal; mantén las frases de acceso y sus enlaces antes o después de la caja según su orden. No uses box borde para credenciales. Reserva borde para una llamada final de ayuda o acción.');
      L.push('- INTERPRETAR DATOS: extrae 2–3 hechos clave de los párrafos y destácalos en glance density editorial, aunque no tengan etiquetas explícitas. Puedes redactar etiquetas breves en el idioma del envío. En un recordatorio de pago: importe del primer pago, fecha del primer pago y fecha del pago final. Conserva la cifra y la fecha exactas; no deduzcas un año ausente ni conviertas un saldo en precio. Si solo hay dos hechos, usa deadlines para dos fechas o datos; no inventes un tercero. Mantén los párrafos explicativos originales: repetir sus hechos en las tarjetas es un resumen visual permitido.');
      L.push('- Separadores de apoyo → separador style neutral; evita líneas del color principal entre todos los párrafos. No hace falta añadir separadores junto a cajas que ya delimitan el contenido.');
      L.push('- PATRÓN ESTRUCTURAL de un recordatorio de pago (los marcadores entre < > se sustituyen por fragmentos literales del envío; nunca se exportan):');
      L.push(JSON.stringify({sections:[{type:'title',d:{style:'principal',align:'left',text:'<primera frase de apertura>'}},{type:'text',d:{size:'intro',text:'<resto de la introducción>'}},{type:'glance',d:{density:'editorial',l1:'<etiqueta breve del importe>',v1:'<importe literal extraído>',l2:'<etiqueta breve del primer plazo>',v2:'<fecha literal extraída>',l3:'<etiqueta breve del último plazo>',v3:'<fecha literal extraída sin completar un año ausente>'}},{type:'box',d:{style:'suave',density:'editorial',title:'',text:'<párrafos literales de pagos y plazos>'}},{type:'datos',d:{style:'summary',title:'<rótulo literal del resumen>',l1:'<etiqueta literal>',v1:'<valor o campo literal>'}},{type:'box',d:{style:'suave',density:'editorial',title:'<titular literal de acceso>',text:'<datos literales de acceso>'}}]}));
      if(profile.id.indexOf('arsenal')===0) L.push('- ARSENAL VIGENTE: franja siempre roja y texto compacto (Helvetica/Arial 10/14 px, negrita, espaciado 1 px); titulares Georgia 32/40 px con espaciado -0.5 px. Prevalece sobre instrucciones guardadas que aún mencionen franja negra. El generador aplica estos detalles automáticamente.');
      L.push('- ESPACIADO COMÚN: la app garantiza al menos 20 px de espacio inferior en cada bloque visual de contenido. No añadas módulos de texto vacíos para crear huecos.');
      L.push('- REVISIÓN ANTES DE RESPONDER: una apertura que sigue siendo text, importes etiquetados que siguen como list o credenciales dentro de box borde indican una composición pendiente de normalizar. Si el envío contiene tres hechos clave claros y no has creado su glance, añádelo. Corrige esas elecciones antes de devolver el JSON. Comprueba después que no falta ni se ha añadido contenido.');
      L.push('No añadas textos de ejemplo: usa solo el contenido recibido. Los widgets Cvent y sus campos son literales. Si el original aporta un email de contacto, inclúyelo en contactEmail; si falta, no lo inventes.');
      if(profile.id==='rmf-wch') L.push('El contacto y la firma WCH se añaden automáticamente. No dupliques la firma como texto.');
      return;
    }
    L.push('- EJEMPLO DE REFERENCIA (newsletter de club bien compuesta; imítala en la elección de piezas, no en los textos):');
    L.push(JSON.stringify(K.REFERENCE_CLUB));
  }

  // Newsletter NUEVA a partir de un guion (BANNER 1: texto… / BANNER 2: foto… / BANNER 3: botón…).
  K.scriptPrompt = function (tournamentId, script) {
    var t = K.tournament(tournamentId), L = [];
    L.push('Convierte el GUION que pego al final en un proyecto JSON para una newsletter NUEVA de la app de newsletters de Kaptiva. Torneo o sección: ' + t.name + '.');
    L.push('');
    L.push('CÓMO LEER EL GUION');
    L.push('- El guion va por bloques (BANNER 1, BANNER 2…, o secciones con título). Respeta su orden: cada bloque se convierte en uno o varios módulos, en el mismo orden.');
    L.push('- Las etiquetas del guion («BANNER 1:», «Título:», «Texto:», «Botón:», «Foto:»…) indican dónde va cada cosa; no las copies como texto.');
    L.push('');
    L.push('REGLAS');
    L.push('- TEXTOS LITERALES: copia cada texto exactamente como está en el guion. No reescribas, resumas, traduzcas, corrijas ni añadas nada. Si ves una errata, déjala.');
    L.push('- Si un bloque DESCRIBE un contenido en vez de darlo escrito (p. ej. «texto sobre los horarios» o «aquí va el precio»), no lo redactes: pon en ese campo «PENDIENTE: » seguido de la descripción tal cual.');
    L.push('- No inventes hechos, precios, fechas ni enlaces. Puedes crear etiquetas cortas y descriptivas para datos extraídos del texto; no añadas promesas ni información nueva. Si un campo no tiene contenido en el guion, déjalo vacío ("").');
    L.push('- Campos de Cvent como {[C-FIRST NAME]} o {[E-MODIFY REG LINK]}: cópialos carácter a carácter.');
    L.push('- Negritas: **así**. Cursiva: *así*. Enlaces dentro de un texto: [texto](https://...). Varios párrafos o puntos de lista en un mismo campo: sepáralos con \\n.');
    L.push('- Fotos o imágenes: si el guion da una URL de custom.cvent.com, úsala tal cual. Si solo dice «foto», «imagen» o la describe, usa el módulo images con "f1_src":"PLACEHOLDER" y pon en "f1_alt" la descripción del guion (o "" si no hay). Dos o tres fotos en fila → un solo images con f1_*, f2_*, f3_*.');
    L.push('- Botones: el texto del botón en su campo y el enlace solo si el guion lo da; si no, deja el enlace vacío. Botón bajo un titular → button justo después del title principal (y su text). Opciones paralelas con botón → cards (una tarjeta por opción: c1_*, c2_*…). No deduzcas el bloque por el campo Cvent: conserva el tratamiento visual del original, usando compra solo para su caja de compra correspondiente.');
    L.push('- NO incluyas header, footer de imagen ni línea de baja (opt-out): la app los pone sola. Si el guion indica la etiqueta de la franja identificadora, ponla en "franja"; si no, "".');
    L.push('- PIEZAS: cada titular es un módulo title ("style": principal para titulares grandes, seccion para el título de una lista o sección, saludo para «Dear …», entre para la frase de despedida, ante para un rótulo pequeño en mayúsculas); elige la pieza por su función: párrafos narrativos → text; información agrupada → box; etiquetas con valores → datos; lista narrativa suelta → list; botón → button. No conviertas automáticamente cada párrafo en text ni cada lista HTML en list.');
    composeGuide(L, tournamentId);
    L.push('- No dejes fuera ningún texto del guion.');
    L.push('');
    moduleList(L);
    L.push('');
    L.push('RESPUESTA: devuelve SOLO el JSON, en un bloque de código, sin explicaciones, con esta forma:');
    L.push('{"tournament":"' + t.id + '","name":"Nombre de la newsletter","desc":"nombre_de_archivo","franja":"","mediaPackages":false,"sections":[{"type":"title","d":{"text":"Dear {[C-FIRST NAME]},","style":"saludo"}},{"type":"text","d":{"text":"..."}}]}');
    L.push('');
    L.push('GUION:');
    L.push('');
    if (has(script)) L.push(String(script).trim());
    return L.join('\n');
  };

  // Líneas del guion cuyo texto no aparece en la newsletter creada (para revisarlas a mano).
  K.scriptCoverage = function (script, st) {
    function clean(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim().toLowerCase(); }
    var all = clean([st.name, st.franjaLeft].concat((st.sections || []).map(function (s) { return Object.keys(s.d || {}).map(function (k) { return s.d[k]; }).join('\n'); })).join('\n'));
    return String(script || '').split(/\n+/).map(function (line) {
      line = line.replace(/^\s*[-•*]\s*/, '').trim();
      for (var n = 0; n < 3 && /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .()]{1,30}:\s+/.test(line); n++) line = line.replace(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .()]{1,30}:\s+/, '');
      return line.trim();
    }).filter(function (line) { return line.length >= 4 && all.indexOf(clean(line)) < 0; });
  };

  K.importPrompt = function (tournamentId, context) {
    var L = [];
    L.push('Convierte la newsletter que pego al final (HTML antiguo o guion de texto) en un proyecto JSON para la app de newsletters de Kaptiva (' + K.CLIENT.name + ').');
    L.push('');
    L.push('REGLAS');
    if (K.Designs && K.Designs.forSection(tournamentId)) L.push('- FIDELIDAD VISUAL AL BRAND KIT: el HTML antiguo es fuente de contenido, no una plantilla que debas calcar. Recompón su contenido con la jerarquía y piezas del kit seleccionado, aunque venga en párrafos, listas o cajas anticuadas. Conserva literalmente sus textos, enlaces y campos.');
    else L.push('- FIDELIDAD VISUAL: conserva la jerarquía y composición del HTML recibido usando las piezas disponibles.');
    L.push('- Referencia concreta: convierte el HTML que se pega en esta petición, sin recuperar textos, banners ni bloques de otras newsletters del chat. No añadas imágenes porque aparezcan en el catálogo de la marca.');
    L.push('- TEXTOS LITERALES: copia cada texto exactamente como está. No reescribas, resumas, traduzcas, corrijas ni añadas nada. Si ves una errata, déjala.');
    L.push('- No inventes hechos, precios, fechas ni enlaces. Puedes crear etiquetas cortas y descriptivas para datos extraídos del texto; no añadas promesas ni información nueva. Si un campo no tiene contenido en el original, déjalo vacío ("").');
    L.push('- Campos de Cvent como {[C-FIRST NAME]} o {[E-MODIFY REG LINK]}: cópialos carácter a carácter.');
    L.push('- Negritas: **así**. Cursiva: *así*. Enlaces dentro de un texto: [texto](https://...). Varios párrafos o puntos de lista en un mismo campo: sepáralos con \\n.');
    L.push('- Títulos: escríbelos como texto normal, sin HTML. Si un producto se llama "Título – Subtítulo", pon cada parte en su campo, sin el guion.');
    L.push('- NO incluyas el header, el footer de imagen ni la línea de baja (opt-out): la app los pone sola.');
    L.push('- Franja identificadora (la línea pequeña bajo el header, con una etiqueta a la izquierda y el torneo a la derecha): no es un módulo. Pon solo su etiqueta izquierda en "franja". El torneo de la derecha lo pone la app, salvo que el original tenga otra etiqueta a la derecha ("franjaRight").');
    if(K.Designs && K.Designs.forSection(tournamentId)) L.push('- Conserva los iconos que forman parte del contenido (por ejemplo, normas del camp). No inventes símbolos ni copies controles del editor.');
    else L.push('- NO copies iconos, emojis ni símbolos decorativos del original (ni como texto ni como imagen). Quítalos y deja el resto del texto igual.');
    L.push('- Si la newsletter es de Media Packages, pon "mediaPackages": true y NO añadas el banner de Media Packages como imagen.');
    L.push('- Imágenes: solo las que estén en el original y con su URL de custom.cvent.com tal cual. Si no hay URL, no pongas el módulo.');
    L.push('- PIEZAS: cada titular es un módulo title ("style": principal para titulares grandes, seccion para el título de una lista o sección, saludo para «Dear …», entre para la frase de despedida, ante para un rótulo pequeño en mayúsculas); elige la pieza por su función: párrafos narrativos → text; información agrupada → box; etiquetas con valores → datos; lista narrativa suelta → list; botón → button. No conviertas automáticamente cada párrafo en text ni cada lista HTML en list.');
    composeGuide(L, tournamentId, context);
    L.push('- No uses el mismo recurso dos veces seguidas y no dejes fuera ningún texto del original.');
    L.push('');
    L.push('TORNEOS ("tournament"): ' + K.CLIENT.tournaments.map(function (t) { return t.id + ' = ' + t.name; }).join(' · '));
    L.push('');
    moduleList(L);
    L.push('');
    L.push('RESPUESTA: devuelve SOLO el JSON, en un bloque de código, sin explicaciones, con esta forma:');
    L.push('{"tournament":"surfcup","name":"Nombre de la newsletter","desc":"nombre_de_archivo","franja":"Etiqueta izquierda","mediaPackages":false,"sections":[{"type":"title","d":{"text":"Dear {[C-FIRST NAME]},","style":"saludo"}},{"type":"text","d":{"text":"..."}}]}');
    L.push('');
    L.push('NEWSLETTER A CONVERTIR:');
    L.push('');
    return L.join('\n');
  };

  // Reconocimiento determinista durante la importación JSON, común a todas las marcas.
  // Solo tokens personales y assets oficiales conocidos: un QR genérico o de Telegram no basta.
  function walletSignals(value) {
    var v=String(value||'');
    return {apple:/\{\[C-PASSBOOK_LINK\]\}|US-UK_Add_to_Apple_Wallet_RGB_101421__d018a8bb15e6d1b46780\.png|https:\/\/www\.cvent\.com\/passbook\/pass\/apple\?(?=[\s)'"]|$)/i.test(v),google:/\{\[C-GOOGLEWALLET_LINK\]\}|enUS_add_to_google_wallet_add-wallet-badge__b79d999246ba9434bcd9\.png/i.test(v)||(/Google Wallet/i.test(v)&&/https:\/\/(?:app|www)\.cvent\.com\/[^\s)]*(?:EmailDesigner|EmailPreview)/i.test(v)),qr:/\{\[C-QRCODE_LINK\]\}|https:\/\/www\.cvent\.com\/g\/images\/QRCodeType\.gif/i.test(v)};
  }
  function hasWalletSignal(sig) {return sig.apple||sig.google||sig.qr;}
  function walletFromSignal(sig) {
    var d={buttons:sig.apple&&sig.google?'both':sig.apple?'apple':sig.google?'google':'none'};
    if(sig.apple)d.appleUrl=WALLET_DEFAULTS.appleUrl;
    if(sig.google)d.googleUrl=WALLET_DEFAULTS.googleUrl;
    if(sig.qr){d.qr='personal';d.qrUrl=WALLET_DEFAULTS.qrUrl;}
    return {type:'wallet',d:d};
  }
  function normalizeWalletImports(sections,notes) {
    var out=[],converted=0;
    function append(s,detected) {
      var previous=out[out.length-1];
      if(detected && previous && previous.type==='wallet') {
        var a=previous.d,b=s.d,am=a.buttons||'both',bm=b.buttons||'both';
        var apple=/^(both|apple)$/.test(am)||/^(both|apple)$/.test(bm),google=/^(both|google)$/.test(am)||/^(both|google)$/.test(bm);
        a.buttons=apple&&google?'both':apple?'apple':google?'google':'none';
        if(b.qr==='personal'){a.qr='personal';a.qrUrl=b.qrUrl;}
        ['appleUrl','googleUrl'].forEach(function(k){if(!has(a[k])&&has(b[k]))a[k]=b[k];});
      } else out.push(s);
      if(detected)converted++;
    }
    function technicalLabel(v){return /^(?:Apple Wallet|Google Wallet|Add to Apple Wallet(?: Button)?|Add to Google Wallet(?: Button)?|QR Code|image)$/i.test(v.trim().replace(/^[*_]+|[*_]+$/g,''));}
    sections.forEach(function(source){
      if(!source||!source.d){out.push(source);return;}
      var s=JSON.parse(JSON.stringify(source)),d=s.d;
      if(s.type==='wallet'){append(s,false);return;}
      if(s.type==='images'||s.type==='imagen') {
        var count=s.type==='imagen'?1:3, pending=[],found=false;
        function flush(){if(!pending.length)return;var rest=Object.assign({},d);for(var n=1;n<=3;n++){delete rest['f'+n+'_src'];delete rest['f'+n+'_alt'];}pending.forEach(function(pic,i){rest['f'+(i+1)+'_src']=pic.src;rest['f'+(i+1)+'_alt']=pic.alt;});out.push({type:'images',d:rest});pending=[];}
        for(var n=1;n<=count;n++){
          var src=d[s.type==='imagen'?'src':'f'+n+'_src'],alt=d[s.type==='imagen'?'alt':'f'+n+'_alt'];if(!has(src))continue;
          var sig=walletSignals(src);
          if(hasWalletSignal(sig)){found=true;flush();append(walletFromSignal(sig),true);}else pending.push({src:src,alt:alt||''});
        }
        if(!found) {out.push(s);return;}
        flush();return;
      }
      if(s.type==='button'||s.type==='boton') {
        var sig=walletSignals(d.url);
        if(!hasWalletSignal(sig)&&/EmailDesigner|EmailPreview|passbook\/pass\/apple\?$/i.test(String(d.url||''))){sig.apple=/apple wallet/i.test(d.btn||'');sig.google=/google wallet/i.test(d.btn||'');}
        if(hasWalletSignal(sig)){append(walletFromSignal(sig),true);return;}
      }
      if(['text','intro','list'].indexOf(s.type)>=0) {
        var key=s.type==='list'?'items':'text',value=Array.isArray(d[key])?d[key].join('\n'):String(d[key]||'');
        if(!hasWalletSignal(walletSignals(value))){out.push(s);return;}
        var buffer=[];
        function flushText(){if(buffer.length){var copy=Object.assign({},d);copy[key]=buffer.join('\n');out.push({type:s.type,d:copy});buffer=[];}}
        value.split(/\n/).forEach(function(line){
          var sig=walletSignals(line);
          if(!hasWalletSignal(sig)){if(!/^\|[\s:|\-]+$/.test(line.trim())&&!technicalLabel(line))buffer.push(line);return;}
          var human=line.replace(/!?\[([^\]]*)\]\(([^)]+)\)/g,function(all,label,url){return hasWalletSignal(walletSignals(url))||technicalLabel(label)&&/https:\/\/(?:app|www)\.cvent\.com\/.*(?:EmailDesigner|EmailPreview)/i.test(url)?(technicalLabel(label)?'':label):all;})
            .replace(/\{\[C-(?:PASSBOOK|GOOGLEWALLET|QRCODE)_LINK\]\}/g,'')
            .replace(/https:\/\/[^\s<>"'()|]+/g,function(url){return hasWalletSignal(walletSignals(url))?'':url;}).trim();
          if(technicalLabel(human)||/^[\s|!()\-:]*$/.test(human))human='';
          if(human)buffer.push(human);
          flushText();append(walletFromSignal(sig),true);
        });
        flushText();return;
      }
      out.push(s);
    });
    if(converted)notes.push('Wallet y QR detectados automáticamente: convertidos a bloques editables con campos personales de Cvent.');
    return out;
  }

  // Lee la respuesta, descarta lo que la app no conoce y devuelve el proyecto + avisos
  K.importProject = function (text, fallbackTournament) {
    var a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('No encuentro el proyecto en el texto pegado.');
    var raw = JSON.parse(text.slice(a, b + 1).replace(/[\u201C\u201D](?=\s*[:,}\]])|(?<=[{,\[:]\s*)[\u201C\u201D]/g, '"'));
    if (!raw || !Array.isArray(raw.sections)) throw new Error('El proyecto no tiene módulos.');
    var notes = [], uid = 0, okT = K.CLIENT.tournaments.some(function (t) { return t.id === raw.tournament; });
    if (!okT) notes.push('Torneo no reconocido: se mantiene el que tenías elegido.');
    var st = { tournament: okT ? raw.tournament : (fallbackTournament || 'surfcup'), name: String(raw.name || ''), desc: String(raw.desc || ''), headerAlt: '', contactEmail: String(raw.contactEmail || ''), mediaPackages: !!raw.mediaPackages, franjaLeft: String(raw.franja || ''), franjaRight: String(raw.franjaRight || ''), look: 'auto', designVersion: K.Designs ? K.Designs.version : undefined, off: {}, sections: [] };
    normalizeWalletImports(raw.sections,notes).forEach(function (s, i) {
      var m = s && M[s.type];
      if (!m) { notes.push('Módulo ' + (i + 1) + ' descartado: tipo «' + (s && s.type) + '» desconocido.'); return; }
      var d = {}, k, src = s.d || {};
      for (k in (m.defaults || {})) d[k] = m.defaults[k];
      m.fields.forEach(function (f) {
        if (!f.k || src[f.k] == null) return;
        var v = Array.isArray(src[f.k]) ? src[f.k].join('\n') : String(src[f.k]);
        if (f.type === 'select' && !f.opts.some(function (o) { return o[0] === v; })) return;
        d[f.k] = v;
      });
      Object.keys(src).forEach(function (k2) { if (!m.fields.some(function (f) { return f.k === k2; }) && has(src[k2])) notes.push('Módulo ' + (i + 1) + ' (' + m.name + '): se ha ignorado el campo «' + k2 + '».'); });
      if(s.type==='wallet' && K.cleanWallet(d)) notes.push('Wallet: eliminados textos técnicos de imágenes; el QR personal se conserva como imagen de Cvent.');
      st.sections.push({ id: 's' + Date.now() + '_' + (uid++), type: s.type, d: d, open: false });
    });
    return { state: K.normalize(st), notes: notes };
  };
})(typeof window !== 'undefined' ? window : globalThis);
