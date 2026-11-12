// ============================================================
// MOTOR DE NEWSLETTERS
// - Cada módulo es una pieza fija de HTML (copiada de las referencias aprobadas).
// - El texto de la usuaria se inserta TAL CUAL (solo se marcan negritas y enlaces).
// - Las piezas se escriben con los colores de Surf Cup y al final se cambian
//   por los del torneo elegido (una sola pasada, sin reemplazos encadenados).
// ============================================================
(function (root) {
  var K = root.KSA = root.KSA || {};
  var P = '#6F4ACC', A = '#91FAFB', GREY = '#A5A0C4', SOFT = '#F7F4FC';

  var F = {
    reg: "font-family:'DinProRegular', Arial, Helvetica, sans-serif;font-weight:400;",
    med: "font-family:'DinProMedium', Arial, Helvetica, sans-serif;font-weight:400;",
    bold: "font-family:'DinProBold', Arial, Helvetica, sans-serif;font-weight:bold;",
    black: "font-family:'DinProBlack', Arial, Helvetica, sans-serif;font-weight:900;",
    ex60: "font-family:'Extenda60', 'Arial Black', Arial, Helvetica, sans-serif;font-weight:400;letter-spacing:0.3px;",
    ex40: "font-family:'Extenda40', 'Arial Black', Arial, Helvetica, sans-serif;font-weight:400;letter-spacing:0.3px;"
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
  // **negrita** y [texto](enlace). Nada más se toca.
  function inline(s, strongColor) {
    var h = esc(String(s || '').trim());
    h = h.replace(LINK, function (m, t, u) {
      // Un esquema no permitido (javascript:, data:, rutas sin https…) nunca llega a un href; la revisión lo marca.
      if (!/^(https?:\/\/|mailto:)/i.test(u)) return t;
      return '<a href="' + u.replace(/"/g, '&quot;') + '" target="_blank" style="color:' + P + ';text-decoration:underline;">' + t + '</a>';
    });
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="' + F.bold + 'color:' + (strongColor || P) + ';">$1</strong>');
    return h;
  }
  // Extenda no tiene números: si el título lleva cifras, pasa a DinPro Black (algo más pequeño).
  function hasDigits(t) { return /\d/.test(String(t || '').replace(/\{\[.*?\]\}/g, '')); }
  function titleFont(text, fam, size, lh) {
    if (hasDigits(text)) { var n = Math.round(size * 0.8); return F.black + 'letter-spacing:0.3px;font-size:' + n + 'px;line-height:' + (n + 6) + 'px;'; }
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
    return '<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="' + w + '" align="' + align + '" style="margin:' + margin + ';"><tbody><tr><td height="4" style="height:4px;line-height:4px;font-size:0;background-color:' + color + ';border-radius:2px;">&nbsp;</td></tr></tbody></table>';
  }
  function bullets(text) {
    var rows = paras(text).map(function (it) {
      return '<tr><td valign="top" width="26" style="font-size:12px;line-height:24px;color:' + P + ';padding:0 0 12px 0;">&#9679;</td><td valign="top" style="' + F.reg + 'font-size:15px;line-height:24px;color:#000000;padding:0 0 12px 0;word-break:break-word;">' + inline(it) + '</td></tr>';
    }).join('');
    return TBL + '><tbody>' + rows + '</tbody></table>';
  }
  function button(text, url, block) {
    var a = block
      ? 'display:block;padding:13px 10px;' + F.bold + 'font-size:13px;line-height:17px;color:#FFFFFF;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;text-align:center;border-radius:40px;'
      : 'display:inline-block;padding:14px 30px;' + F.bold + 'font-size:14px;line-height:18px;color:#FFFFFF;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;border-radius:40px;';
    var t = block
      ? TBL + ' style="border-collapse:separate !important;">'
      : '<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:22px auto 0 auto;border-collapse:separate !important;">';
    return t + '<tbody><tr><td align="center" bgcolor="' + P + '" style="background-color:' + P + ';border-radius:40px;"><a href="' + attr(url) + '" target="_blank" style="' + a + '">' + esc(text) + '</a></td></tr></tbody></table>';
  }
  function softBand(text) {
    var ps = paras(text).map(function (p, i) {
      return '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;word-break:break-word;' + (i ? 'padding-top:12px;' : '') + '">' + inline(p) + '</p>';
    }).join('');
    return TBL + ' bgcolor="' + SOFT + '" style="background-color:' + SOFT + ';border-left:4px solid ' + P + ';"><tbody><tr><td bgcolor="' + SOFT + '" style="padding:22px 24px;background-color:' + SOFT + ';">' + ps + '</td></tr></tbody></table>';
  }
  function gap(h) { return '<div style="height:' + h + 'px;line-height:' + h + 'px;font-size:0;">&nbsp;</div>'; }

  // Contenido de una tarjeta (se usa igual en escritorio y móvil → nunca se desincronizan)
  function cardBody(c) {
    var h = '';
    if (has(c.label)) h += '<p style="' + F.med + 'font-size:11px;line-height:14px;color:' + GREY + ';letter-spacing:1.5px;text-transform:uppercase;">' + esc(c.label.trim()) + '</p>';
    if (has(c.title)) {
      var st = hasDigits(c.title) ? F.black + 'font-size:20px;line-height:24px;letter-spacing:0.3px;' : F.ex40 + 'font-size:28px;line-height:31px;';
      h += '<p style="' + st + 'color:' + P + ';text-transform:uppercase;' + (has(c.label) ? 'padding-top:6px;' : '') + 'word-break:break-word;">' + esc(c.title.trim()) + '</p>';
    }
    if (has(c.price)) h += '<p style="' + F.black + 'font-size:26px;line-height:30px;color:' + P + ';padding-top:6px;word-break:break-word;">' + esc(c.price.trim()) + '</p>';
    paras(c.text).forEach(function (p, i) {
      h += '<p style="' + F.reg + 'font-size:15px;line-height:23px;color:#000000;text-align:left;padding-top:' + (i ? 8 : 10) + 'px;word-break:break-word;">' + inline(p) + '</p>';
    });
    return h;
  }
  // Dos tarjetas de igual altura: rejilla en escritorio + copia apilada en móvil
  function twoCards(c1, c2) {
    var cs = [c1, c2], btn = cs.some(function (c) { return has(c.btn) && has(c.url); });
    var SP = '<td width="16" style="width:16px;font-size:0;line-height:0;">&nbsp;</td>';
    var desk = '<table role="presentation" class="desk-only" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate !important;border-spacing:0;"><tbody>';
    var mob = '';
    if (btn) {
      desk += '<tr>' + cs.map(function (c) { return '<td width="277" valign="top" style="border:2px solid ' + P + ';border-bottom:none;border-radius:14px 14px 0 0;padding:22px 20px 0 20px;background-color:#FFFFFF;">' + cardBody(c) + '</td>'; }).join(SP) + '</tr>';
      desk += '<tr>' + cs.map(function (c) { return '<td width="277" valign="bottom" style="border:2px solid ' + P + ';border-top:none;border-radius:0 0 14px 14px;padding:18px 20px 22px 20px;background-color:#FFFFFF;">' + (has(c.btn) && has(c.url) ? button(c.btn.trim(), c.url.trim(), true) : '&nbsp;') + '</td>'; }).join(SP) + '</tr>';
      mob = cs.map(function (c) {
        return TBL + ' height="100%" style="height:100%;background-color:#FFFFFF;border:2px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody><tr><td valign="top" height="100%" style="height:100%;padding:22px 20px 0 20px;">' + cardBody(c) + '</td></tr><tr><td align="center" valign="bottom" style="padding:18px 20px 22px 20px;">' + (has(c.btn) && has(c.url) ? button(c.btn.trim(), c.url.trim(), true) : '&nbsp;') + '</td></tr></tbody></table>';
      }).join(gap(16));
    } else {
      desk += '<tr>' + cs.map(function (c) { return '<td width="277" valign="top" style="border:2px solid ' + P + ';border-radius:14px;padding:22px 20px;background-color:#FFFFFF;">' + cardBody(c) + '</td>'; }).join(SP) + '</tr>';
      mob = cs.map(function (c) {
        return TBL + ' style="background-color:#FFFFFF;border:2px solid ' + P + ';border-radius:14px;border-collapse:separate !important;"><tbody><tr><td valign="top" style="padding:22px 20px;">' + cardBody(c) + '</td></tr></tbody></table>';
      }).join(gap(16));
    }
    desk += '</tbody></table>';
    return desk + '<!--[if !mso]><!--><div class="mob-only" style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + mob + '</div><!--<![endif]-->';
  }

  // ============================================================
  // MÓDULOS  (fields = lo que se rellena en la app)
  // tipos de campo: text · area (un párrafo por línea) · url · select · head (subtítulo del formulario)
  // req: true → si está vacío, la revisión avisa
  // ============================================================
  var M = K.MODULES = {};
  var TIP = 'Un párrafo por línea. **negrita** · [texto](enlace)';

  M.franja = {
    letter: 'B', name: 'Franja identificadora', tag: 'FRANJA',
    fields: [{ k: 'left', label: 'Etiqueta izquierda', type: 'text', req: true, ph: 'Media Packages' }],
    build: function (d, t) {
      var ps = F.med + 'font-size:11px;line-height:14px;color:' + P + ';letter-spacing:3px;text-transform:uppercase;word-break:break-word;';
      return section(cell('14px 40px', '', TBL + '><tbody><tr><td align="left"><p style="' + ps + '">' + esc((d.left || '').trim()) + '</p></td><td align="right"><p style="' + ps + '">' + esc(t.club ? t.brand : t.name) + '</p></td></tr></tbody></table>') +
        '<tr><td height="4" bgcolor="' + A + '" style="height:4px;line-height:4px;font-size:0;background-color:' + A + ';">&nbsp;</td></tr>');
    }
  };

  M.intro = {
    letter: 'C', name: 'Texto / Intro', tag: 'INTRO',
    fields: [
      { k: 'greet', label: 'Saludo (opcional, sale como título)', type: 'text', ph: 'Dear {[C-FIRST NAME]},' },
      { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }
    ],
    build: function (d) {
      var h = '', first = true;
      if (has(d.greet)) { h += '<p style="' + F.bold + 'font-size:28px;line-height:34px;color:' + P + ';word-break:break-word;">' + esc(d.greet.trim()) + '</p>'; first = false; }
      paras(d.text).forEach(function (p) {
        h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;' + (first ? '' : 'padding-top:14px;') + 'word-break:break-word;">' + inline(p) + '</p>'; first = false;
      });
      return section(cell('32px 40px 22px 40px', 'left', h));
    }
  };

  M.titulo = {
    letter: 'I', name: 'Título centrado con barra', tag: 'TITULO',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true },
      { k: 'text', label: 'Texto (opcional)', type: 'area', hint: TIP },
      { k: 'btn', label: 'Texto del botón (opcional)', type: 'text' },
      { k: 'url', label: 'Enlace del botón', type: 'url' }
    ],
    build: function (d) {
      var ps = paras(d.text), b = has(d.btn) && has(d.url);
      var h = '<p style="' + titleFont(d.title, 'ex60', 38, 42) + 'color:' + P + ';text-transform:uppercase;text-align:center;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bar(56, P, 'center', '14px auto 0 auto');
      ps.forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;text-align:center;padding-top:' + (i ? 8 : 20) + 'px;word-break:break-word;">' + inline(p) + '</p>'; });
      if (b) h += button(d.btn.trim(), d.url.trim(), false);
      return section(cell(ps.length || b ? '34px 40px 36px 40px' : '34px 40px 6px 40px', 'center', h));
    }
  };

  M.lista = {
    letter: 'D', name: 'Título + lista con bullets', tag: 'TITULO + LISTA',
    fields: [
      { k: 'title', label: 'Título', type: 'text', req: true },
      { k: 'items', label: 'Puntos', type: 'area', req: true, hint: 'Un punto por línea. **negrita** · [texto](enlace)' }
    ],
    build: function (d) {
      return section(cell('30px 40px 10px 40px', 'left', '<p style="' + titleFont(d.title, 'ex60', 34, 38) + 'color:' + P + ';text-transform:uppercase;padding-bottom:16px;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bullets(d.items)));
    }
  };

  var E_LINES = { compra: 'To purchase your package {[E-MODIFY REG LINK]}', modificar: 'If you want to modify your registration {[E-MODIFY REG LINK]}' };
  M.compra = {
    letter: 'E', name: 'Caja de compra / registro (campos Cvent)', tag: 'CAJA COMPRA (CAMPOS CVENT)',
    fields: [
      { k: 'variant', label: 'Frase principal', type: 'select', opts: [['compra', 'To purchase your package (Click here)'], ['modificar', 'If you want to modify your registration (Click here)'], ['custom', 'Otra frase…']] },
      { k: 'line', label: 'Otra frase (debe incluir {[E-MODIFY REG LINK]})', type: 'text', showIf: function (d) { return d.variant === 'custom'; } },
      { k: 'layout', label: 'Orden', type: 'select', opts: [['top', 'Frase arriba, datos debajo'], ['bottom', 'Datos arriba, frase debajo']] },
      { k: 'info', label: 'Línea sobre los datos (opcional)', type: 'text', ph: 'Your registration access information:', showIf: function (d) { return d.layout === 'bottom'; } }
    ],
    defaults: { variant: 'compra', layout: 'top' },
    build: function (d) {
      var line = d.variant === 'custom' ? (d.line || '').trim() : E_LINES[d.variant || 'compra'];
      var lab = F.med + 'font-size:11px;line-height:14px;color:' + GREY + ';letter-spacing:1.5px;text-transform:uppercase;text-align:center;padding-bottom:4px;';
      var val = F.bold + 'font-size:18px;line-height:24px;color:' + P + ';text-align:center;word-break:break-word;';
      function dato(pad, l, v) { return '<tr class="css-vsf5of"><td align="center" style="padding:' + pad + ';text-align:center;word-break:break-word;"><p style="' + lab + '">' + l + '</p><p style="' + val + '">' + v + '</p></td></tr>'; }
      function cta(pad) { return '<tr class="css-vsf5of"><td align="center" style="padding:' + pad + ';' + F.bold + 'font-size:20px;line-height:26px;color:#000000;text-align:center;word-break:break-word;"><span style="color: rgb(0,0,0);"><span style="font-weight: bold;">' + esc(line) + '</span></span></td></tr>'; }
      var rule = '<tr><td style="padding:14px 40px 6px 40px;">' + TBL + '><tbody><tr><td style="border-top:1px solid ' + GREY + ';font-size:0;line-height:0;">&nbsp;</td></tr></tbody></table></td></tr>';
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
      var link = mail ? '<a href="mailto:' + attr(mail) + '" style="color:' + P + ';text-decoration:underline;"><span style="' + F.bold + '">' + esc(mail) + '</span></a>' : '<span style="' + F.bold + '">CONTACTO PENDIENTE</span>';
      return section(cell('16px 40px 32px 40px', 'center', TBL + ' style="background-color:#FFFFFF;border:1px solid ' + GREY + ';border-left:4px solid ' + P + ';"><tbody><tr><td align="center" style="padding:22px 24px;text-align:center;"><p style="' + F.ex60 + 'font-size:34px;line-height:38px;color:' + P + ';text-transform:uppercase;text-align:center;padding-bottom:10px;">Get in Touch</p><p style="' + F.reg + 'font-size:15px;line-height:23px;color:#000000;text-align:center;word-break:break-word;">If you have any questions, please feel free to contact us at ' + link + '</p><p style="' + F.bold + 'font-size:15px;line-height:23px;color:' + P + ';text-align:center;padding-top:8px;word-break:break-word;"><span style="color: ' + P + ';"><span style="font-weight: bold;">For any questions, please contact us at: {[E-CUSTOM:Event Phone Number]}</span></span></p></td></tr></tbody></table>'));
    }
  };

  M.datos = {
    letter: 'J', name: 'Banda de datos (fondo de color)', tag: 'BANDA DE DATOS',
    fields: [
      { k: 'pre', label: 'Antetítulo (opcional)', type: 'text' },
      { k: 'title', label: 'Titular', type: 'text', req: true },
      { type: 'head', label: 'Datos (hasta 3)' },
      { k: 'l1', label: 'Etiqueta 1', type: 'text', half: true, ph: 'Date' }, { k: 'v1', label: 'Valor 1', type: 'text', half: true },
      { k: 'l2', label: 'Etiqueta 2', type: 'text', half: true, ph: 'Time' }, { k: 'v2', label: 'Valor 2', type: 'text', half: true },
      { k: 'l3', label: 'Etiqueta 3', type: 'text', half: true }, { k: 'v3', label: 'Valor 3', type: 'text', half: true },
      { k: 'text', label: 'Texto de apoyo (opcional)', type: 'area', hint: TIP }
    ],
    build: function (d) {
      var h = '';
      if (has(d.pre)) h += '<p style="' + F.med + 'font-size:12px;line-height:16px;color:' + A + ';letter-spacing:3px;text-transform:uppercase;text-align:center;padding-bottom:10px;">' + esc(d.pre.trim()) + '</p>';
      h += '<p class="h1" style="' + titleFont(d.title, 'ex60', 40, 44) + 'color:#FFFFFF;text-transform:uppercase;text-align:center;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>';
      var cols = [[d.l1, d.v1], [d.l2, d.v2], [d.l3, d.v3]].filter(function (c) { return has(c[0]) || has(c[1]); });
      if (cols.length) {
        var w = Math.floor(100 / cols.length) + '%';
        h += TBL + ' style="margin-top:26px;"><tbody><tr>' + cols.map(function (c, i) {
          return '<td class="data-col" width="' + w + '" align="center" valign="top" style="padding:4px 10px;' + (i ? 'border-left:1px solid ' + A + ';' : '') + '"><p style="' + F.med + 'font-size:11px;line-height:14px;color:' + A + ';letter-spacing:1.5px;text-transform:uppercase;text-align:center;padding-bottom:6px;">' + esc((c[0] || '').trim()) + '</p><p style="' + F.black + 'font-size:22px;line-height:26px;color:#FFFFFF;text-align:center;word-break:break-word;">' + esc((c[1] || '').trim()) + '</p></td>';
        }).join('') + '</tr></tbody></table>';
      }
      paras(d.text).forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#FFFFFF;text-align:center;padding-top:' + (i ? 10 : 26) + 'px;word-break:break-word;">' + inline(p, '#FFFFFF') + '</p>'; });
      return section(cell('38px 40px 38px 40px', 'center', h, P), P);
    }
  };

  M.tarjetas = {
    letter: 'K', name: 'Dos tarjetas de igual altura', tag: 'TARJETAS',
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
    letter: 'M', name: 'Cierre entre dos líneas', tag: 'CIERRE',
    fields: [{ k: 'title', label: 'Titular', type: 'text', req: true }, { k: 'text', label: 'Texto (opcional)', type: 'area', hint: TIP }],
    build: function (d) {
      var ps = paras(d.text);
      var h = bar(80, A, 'center', '0 auto') + '<p style="' + titleFont(d.title, 'ex60', 36, 40) + 'color:' + P + ';text-transform:uppercase;text-align:center;padding-top:18px;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' + bar(80, A, 'center', '18px auto 0 auto');
      ps.forEach(function (p, i) { h += '<p style="' + F.reg + 'font-size:16px;line-height:25px;color:#000000;text-align:center;padding-top:' + (i ? 8 : 20) + 'px;word-break:break-word;">' + inline(p) + '</p>'; });
      return section(cell(ps.length ? '30px 40px 14px 40px' : '30px 40px 30px 40px', 'center', h));
    }
  };

  M.info = {
    letter: 'N', name: 'Banda informativa (fondo suave)', tag: 'BANDA INFORMATIVA',
    fields: [{ k: 'title', label: 'Título fuera de la banda (opcional)', type: 'text' }, { k: 'text', label: 'Texto', type: 'area', req: true, hint: TIP }],
    build: function (d) {
      var h = has(d.title) ? '<p style="' + titleFont(d.title, 'ex60', 34, 38) + 'color:' + P + ';text-transform:uppercase;word-break:break-word;padding-bottom:16px;">' + esc(d.title.trim()) + '</p>' : '';
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
      { k: 'pkTitle', label: 'Título de las opciones', type: 'text', ph: 'Choose your package:' },
      { k: 'p1_title', label: 'Opción 1', type: 'text', half: true }, { k: 'p1_price', label: 'Precio 1', type: 'text', half: true },
      { k: 'p1_text', label: 'Texto opción 1', type: 'area' },
      { k: 'p2_title', label: 'Opción 2', type: 'text', half: true }, { k: 'p2_price', label: 'Precio 2', type: 'text', half: true },
      { k: 'p2_text', label: 'Texto opción 2', type: 'area' },
      { type: 'head', label: 'Aviso (opcional)' },
      { k: 'note', label: 'Aviso en banda suave', type: 'area', hint: TIP }
    ],
    build: function (d) {
      var sub16 = F.bold + 'font-size:16px;line-height:25px;color:' + P + ';';
      var h = TBL + '><tbody><tr><td valign="middle" style="padding:0 16px 0 0;"><p style="' + titleFont(d.title, 'ex60', 38, 42) + 'color:' + P + ';text-transform:uppercase;text-align:left;word-break:break-word;">' + esc((d.title || '').trim()) + '</p>' +
        (has(d.sub) ? '<p style="' + F.bold + 'font-size:16px;line-height:22px;color:' + P + ';letter-spacing:1px;text-transform:uppercase;text-align:left;padding-top:4px;word-break:break-word;">' + esc(d.sub.trim()) + '</p>' : '') + '</td>' +
        (has(d.price) ? '<td valign="middle" align="right" style="padding:0;white-space:nowrap;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse:separate !important;"><tbody><tr><td align="center" style="border:2px solid ' + P + ';border-radius:40px;padding:8px 18px;white-space:nowrap;"><p style="' + F.black + 'font-size:22px;line-height:26px;color:' + P + ';text-align:center;">' + esc(d.price.trim()) + '</p></td></tr></tbody></table></td>' : '') +
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
      if (has(d.p1_title) && has(d.p2_title)) {
        if (has(d.pkTitle)) h += '<p style="' + sub16 + 'padding-top:14px;padding-bottom:10px;word-break:break-word;">' + esc(d.pkTitle.trim()) + '</p>'; else h += gap(14);
        h += twoCards({ title: d.p1_title, price: d.p1_price, text: d.p1_text }, { title: d.p2_title, price: d.p2_price, text: d.p2_text }); endsList = false;
        if (has(d.note)) h += gap(24);
      } else if (has(d.note)) h += gap(10);
      if (has(d.note)) { h += softBand(d.note); endsList = false; }
      return section(cell(endsList ? '38px 40px 14px 40px' : '38px 40px 32px 40px', 'left', h));
    }
  };

  M.separador = {
    letter: 'P', name: 'Separador (línea fina)', tag: 'SEPARADOR', fields: [], note: 'Va entre dos productos seguidos.',
    build: function () {
      return section(cell('22px 40px 8px 40px', '', TBL + '><tbody><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:' + P + ';">&nbsp;</td></tr></tbody></table>'));
    }
  };

  M.imagen = {
    letter: 'A', name: 'Imagen', tag: 'IMAGEN',
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

  K.MODULE_ORDER = ['intro', 'titulo', 'lista', 'datos', 'tarjetas', 'info', 'producto', 'separador', 'imagen', 'cierre', 'compra', 'contacto'];

  // ============================================================
  // MONTAJE
  // Fijo y automático: header del torneo, banner Media Packages (si se marca),
  // footer de imagen del torneo (si existe) y footer legal con la baja.
  // ============================================================
  K.build = function (st) {
    var t = K.BrandKits ? K.BrandKits.effectiveTournament(st) : K.tournament(st.tournament), kit = K.BrandKits ? K.BrandKits.forState(st) : null, parts = [], n = 0;
    function add(tag, html) { parts.push('<!-- [' + (n++) + '] ' + tag + ' -->\n' + html); }
    var off = st.off || {};
    if (!off.header && t.header) add('HEADER', imgFull(t.header, has(st.headerAlt) ? st.headerAlt : (kit ? (kit.header.name || kit.name) : (t.club ? t.brand : K.CLIENT.name + ' · ' + t.name))));
    var banner = kit ? kit.mediaBanner.url : (t.club ? t.mediaBanner : K.CLIENT.mediaBanner);
    if (st.mediaPackages && banner) add('BANNER', imgFull(banner, 'Media Packages - ' + t.name));
    if (!off.franja) add('FRANJA', M.franja.build({ left: st.franjaLeft }, t));
    (st.sections || []).forEach(function (s) { var m = M[s.type]; if (m) add(m.tag, m.build(s.d || {}, t)); });
    if (t.footer && !off.footer) add('IMAGEN FOOTER', imgFull(t.footer, t.footerAlt));
    add('OPT-OUT', section(cell('16px 20px', 'center', '<p style="' + F.reg + 'font-size:10px;line-height:14px;color:' + GREY + ';text-align:center;word-break:break-word;padding:3px 0;"><span style="color: ' + GREY + ';">If you no longer want to receive emails from {[P-FIRST NAME]} {[P-LAST NAME]}, please {[EMAIL OPT OUT]}.</span></p>')));
    var title = (t.club ? t.brand : K.CLIENT.name + ' · ' + t.name) + (has(st.name) ? ' – ' + st.name.trim() : '');
    var html = K.HEAD.replace('%%TITLE%%', function () { return esc(title); }) + ' ' + K.BODY_OPEN + parts.join('\n') + '\n' + K.BODY_CLOSE + '\n';
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
    var secs = st.sections || [];
    if (st.brandKit && K.BrandKits) { try { K.BrandKits.snapshot(st.brandKit); } catch (e) { E('Brand kit inválido: ' + e.message); } }
    if (kit && !t.header && !off0.header) W('El kit no tiene custom link de header; el email sale sin esa imagen.');
    if (kit && st.mediaPackages && !kit.mediaBanner.url) W('El kit no tiene custom link para el banner de Media Packages.');

    if (!kit && !t.header && !off0.header) W('Header de ' + t.name + ' PENDIENTE: la newsletter sale sin él. Necesito el custom link de Cvent del header.');
    if (t.provisional && !kit) W('Colores de ' + t.name + ' provisionales: faltan sus datos de diseño.');
    if (!kit && t.club && st.mediaPackages && !t.mediaBanner) W(t.clubName + ' no tiene banner de Media Packages: no se añade.');
    if (t.club && !has(t.contact) && secs.some(function (x) { return x.type === 'contacto'; })) E('Caja de contacto: falta el email o custom field de contacto de ' + t.clubName + '. Sale «CONTACTO PENDIENTE».');
    if (!has(st.name)) W('Falta el nombre de la newsletter (título interno y nombre de archivo).');
    if (!t.footer && !off0.footer) W('Footer de imagen de ' + (kit ? kit.name : t.name) + ' PENDIENTE: la newsletter sale sin él. Necesito el custom link de Cvent del footer.');
    if (!secs.length) W('La newsletter no tiene módulos todavía.');
    var off = st.off || {};
    if (!off.franja && !has(st.franjaLeft)) E('Falta la etiqueta izquierda de la franja identificadora.');
    if (off.header) W('Header del torneo desactivado manualmente.');
    if (off.franja) W('Franja identificadora desactivada manualmente.');
    if (off.footer && t.footer) W('Footer de imagen desactivado manualmente.');

    // Campos obligatorios vacíos
    secs.forEach(function (s, i) {
      var m = M[s.type]; if (!m) return;
      m.fields.forEach(function (f) {
        if (f.req && !has((s.d || {})[f.k]) && (!f.showIf || f.showIf(s.d || {}))) E('Módulo ' + (i + 1) + ' (' + m.name + '): falta «' + f.label + '».');
        var v = (s.d || {})[f.k];
        if (f.type === 'url' && has(v)) {
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
      if (s.type === 'compra' && d.variant === 'custom' && String(d.line || '').indexOf('{[E-MODIFY REG LINK]}') < 0) E('Módulo ' + (i + 1) + ': la frase de la caja debe incluir {[E-MODIFY REG LINK]}.');
      if (s.type === 'tarjetas') ['a', 'b'].forEach(function (x) { if (has(d[x + '_btn']) !== has(d[x + '_url'])) E('Módulo ' + (i + 1) + ' (Tarjetas): un botón necesita texto y enlace.'); });
      if (s.type === 'titulo' && has(d.btn) !== has(d.url)) E('Módulo ' + (i + 1) + ' (Título): el botón necesita texto y enlace.');
      if (s.type === 'producto' && has(d.p1_title) !== has(d.p2_title)) W('Módulo ' + (i + 1) + ' (Producto): las opciones con precio van de dos en dos.');
      if (s.type === 'producto' && has(d.img) && !isPh(d.img) && !has(d.alt)) E('Módulo ' + (i + 1) + ' (Producto): falta la descripción de la imagen.');
      if (i && secs[i - 1].type === s.type && (s.type === 'datos' || s.type === 'info')) W('Módulos ' + i + ' y ' + (i + 1) + ': el mismo recurso dos veces seguidas.');
    });

    // Campos Cvent
    var found = html.match(/\{\[[^\]]*\]\}/g) || [], bad = [];
    found.forEach(function (f) { if (K.CVENT_FIELDS.indexOf(f) < 0 && bad.indexOf(f) < 0) bad.push(f); });
    if (bad.length) E('Campo de Cvent no reconocido: ' + bad.join(', ') + '. Revisa que esté escrito exactamente igual.');
    var body = html.slice(html.indexOf('<body'));
    if (/(^|[^{])\[(C|E|P)-[A-Z][^\]]*\](?!\})/.test(body) || /\{\[[^\]]*$/m.test(body.replace(/\{\[[^\]]*\]\}/g, ''))) E('Hay un campo de Cvent mal cerrado (debe ser {[...]}).');
    if (!bad.length) OK('Campos de Cvent correctos (' + found.length + ').');
    OK('Footer legal con baja ({[EMAIL OPT OUT]}) incluido.');
    if (kit) OK('Brand kit «' + kit.name + '»: copia guardada con la newsletter.');
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
    { id: 'media', name: 'Media Packages / venta', mediaPackages: true, sections: [['intro'], ['imagen'], ['imagen'], ['compra'], ['lista'], ['contacto']] },
    { id: 'anuncio', name: 'Anuncio / previa del torneo', sections: [['intro'], ['titulo'], ['datos'], ['tarjetas'], ['cierre'], ['compra', { variant: 'modificar' }]] },
    { id: 'recordatorio', name: 'Recordatorio / instrucciones', sections: [['intro'], ['info'], ['lista'], ['compra', { variant: 'modificar' }]] },
    { id: 'productos', name: 'Venta de varios servicios con precio', sections: [['titulo'], ['intro'], ['producto'], ['separador'], ['producto'], ['cierre'], ['compra', { layout: 'bottom' }], ['intro']] },
    { id: 'transaccional', name: 'Transaccional / confirmación', sections: [['intro'], ['compra'], ['contacto']] },
    { id: 'ref1', name: 'Ejemplo: Media Packages · Surf Cup 2026', tournament: 'surfcup', mediaPackages: true, name2: 'Media Packages', desc: 'media_packages', headerAlt: 'KSA Global Stage',
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
      tournament: r.tournament || keepTournament || 'surfcup', name: r.name2 || '', desc: r.desc || '', headerAlt: r.headerAlt || '', mediaPackages: !!r.mediaPackages, franjaLeft: r.franja || '', off: {},
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
  K.importPrompt = function () {
    var L = [];
    L.push('Convierte la newsletter que pego al final (HTML antiguo o guion de texto) en un proyecto JSON para la app de newsletters de Kaptiva (' + K.CLIENT.name + ').');
    L.push('');
    L.push('REGLAS');
    L.push('- TEXTOS LITERALES: copia cada texto exactamente como está. No reescribas, resumas, traduzcas, corrijas ni añadas nada. Si ves una errata, déjala.');
    L.push('- No inventes titulares, etiquetas, botones, precios, fechas ni enlaces. Si un campo no tiene contenido en el original, déjalo vacío ("").');
    L.push('- Campos de Cvent como {[C-FIRST NAME]} o {[E-MODIFY REG LINK]}: cópialos carácter a carácter.');
    L.push('- Negritas: **así**. Enlaces dentro de un texto: [texto](https://...). Varios párrafos o puntos de lista en un mismo campo: sepáralos con \\n.');
    L.push('- Títulos: escríbelos como texto normal, sin HTML. Si un producto se llama "Título – Subtítulo", pon cada parte en su campo, sin el guion.');
    L.push('- NO incluyas el header, el footer de imagen ni la línea de baja (opt-out): la app los pone sola.');
    L.push('- Franja identificadora (la línea pequeña bajo el header, con una etiqueta a la izquierda y el torneo a la derecha): no es un módulo. Pon solo su etiqueta izquierda en "franja". El torneo de la derecha lo pone la app.');
    L.push('- NO copies iconos, emojis ni símbolos decorativos del original (ni como texto ni como imagen). Quítalos y deja el resto del texto igual.');
    L.push('- Si la newsletter es de Media Packages, pon "mediaPackages": true y NO añadas el banner de Media Packages como imagen.');
    L.push('- Imágenes: solo las que estén en el original y con su URL de custom.cvent.com tal cual. Si no hay URL, no pongas el módulo.');
    L.push('- Reparto: saludo y párrafos de apertura → intro. Fecha, hora, lugar → datos. Dos opciones paralelas → tarjetas. Instrucciones o avisos → info. Cada servicio con precio → producto, con un separador entre dos productos seguidos. Frase con {[E-MODIFY REG LINK]} y datos de registro → compra. Texto que no encaje en nada → intro.');
    L.push('- No uses el mismo recurso dos veces seguidas y no dejes fuera ningún texto del original.');
    L.push('');
    L.push('TORNEOS ("tournament"): ' + K.CLIENT.tournaments.map(function (t) { return t.id + ' = ' + t.name; }).join(' · '));
    L.push('');
    L.push('MÓDULOS DISPONIBLES ("type" y sus campos en "d")');
    K.MODULE_ORDER.forEach(function (id) {
      var m = M[id], fs = m.fields.filter(function (f) { return f.k; }).map(function (f) {
        return f.k + (f.type === 'select' ? ' (uno de: ' + f.opts.map(function (o) { return o[0]; }).join(' | ') + ')' : '') + ' = ' + f.label;
      });
      L.push('- ' + id + ' → ' + m.name + (fs.length ? '. Campos: ' + fs.join('; ') : '. Sin campos.'));
    });
    L.push('');
    L.push('RESPUESTA: devuelve SOLO el JSON, en un bloque de código, sin explicaciones, con esta forma:');
    L.push('{"tournament":"surfcup","name":"Nombre de la newsletter","desc":"nombre_de_archivo","franja":"Etiqueta izquierda","mediaPackages":false,"sections":[{"type":"intro","d":{"greet":"","text":"..."}}]}');
    L.push('');
    L.push('NEWSLETTER A CONVERTIR:');
    L.push('');
    return L.join('\n');
  };

  // Lee la respuesta, descarta lo que la app no conoce y devuelve el proyecto + avisos
  K.importProject = function (text, fallbackTournament) {
    var a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error('No encuentro el proyecto en el texto pegado.');
    var raw = JSON.parse(text.slice(a, b + 1).replace(/[\u201C\u201D](?=\s*[:,}\]])|(?<=[{,\[:]\s*)[\u201C\u201D]/g, '"'));
    if (!raw || !Array.isArray(raw.sections)) throw new Error('El proyecto no tiene módulos.');
    var notes = [], uid = 0, okT = K.CLIENT.tournaments.some(function (t) { return t.id === raw.tournament; });
    if (!okT) notes.push('Torneo no reconocido: se mantiene el que tenías elegido.');
    var st = { tournament: okT ? raw.tournament : (fallbackTournament || 'surfcup'), name: String(raw.name || ''), desc: String(raw.desc || ''), headerAlt: '', mediaPackages: !!raw.mediaPackages, franjaLeft: String(raw.franja || ''), off: {}, sections: [] };
    raw.sections.forEach(function (s, i) {
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
      st.sections.push({ id: 's' + Date.now() + '_' + (uid++), type: s.type, d: d, open: false });
    });
    return { state: K.normalize(st), notes: notes };
  };
})(typeof window !== 'undefined' ? window : globalThis);
