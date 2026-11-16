// Ejecutar: node test/estilos-kit.test.js. Cada kit sale por defecto como sus newsletters de referencia
// (docs/brand-kits/referencias, medidas el 16/11/2026), y las opciones del editor permiten ajustarlo.
const assert = require('node:assert/strict');
for (const f of ['head', 'brands', 'brand-kits', 'brand-designs', 'modules']) require('../js/' + f + '.js');
const K = globalThis.KSA;
const build = (tid, sections) => { const st = K.fromRecipe('blank', tid); st.sections = sections; return K.build(st); };
const gift = d => ({ type: 'box', d: Object.assign({ style: 'borde', label: '🎁', title: 'Is this camp a gift?', text: 'Make it special.', btn: 'Download gift certificate', url: 'https://e.com' }, d) });
const block = (h, tag) => h.split(/<!-- \[\d+\] /).find(b => b.startsWith(tag));

// Títulos de sección con el estilo de cada marca.
const sec = [{ type: 'title', d: { style: 'seccion', text: 'Modifications' } }, { type: 'text', d: { text: 'x' } }];
assert.ok(/font-family:'Arial Black'[^"]*font-size:28px;line-height:34px;color:#B4001E;[^"]*text-transform:uppercase/.test(build('arsenal-exp', sec)), 'Arsenal Experiences: Arial Black rojo en mayúsculas');
assert.ok(/border-top:1px solid #EEEEEE;padding-top:26px/.test(build('arsenal-exp', sec)), 'Arsenal Experiences: línea gris encima');
assert.ok(/Georgia[^"]*font-size:26px;line-height:32px;color:#0C0C0C;letter-spacing:-0.3px;text-align:center;text-transform:uppercase/.test(build('arsenal-usa', sec)), 'Arsenal Camps: Georgia 26/32 en mayúsculas, centrado');
assert.ok(/width="56" align="center" style="margin:14px auto/.test(build('arsenal-usa', sec)) && !/width="56"/.test(block(build('arsenal-usa', [{ type: 'title', d: { style: 'seccion', bar: 'no', text: 'X' } }, { type: 'text', d: { text: 'x' } }]), 'TITULO')), 'Camps: barra bajo el título de sección (opción para quitarla)');
assert.ok(!/width="56"/.test(block(build('psg-exp', sec), 'TITULO')), 'Experiences: sin barra');
assert.ok(/font-size:21px;line-height:28px;color:#004070;text-transform:none/.test(build('psg-exp', sec)), 'PSG Experiences: 21/28 azul');
assert.ok(/Georgia[^"]*font-size:24px;line-height:30px;color:#1A1D4F/i.test(build('rmf-exp', sec)), 'RMF Experiences: Georgia 24/30');

// Caja con borde: fondo, borde, icono y botón como cada kit.
let h = block(build('arsenal-usa', [gift()]), 'CAJA');
assert.ok(h.includes('background-color:#FDF5F5;border:2px solid #B4001E;border-radius:4px'), 'Arsenal Camps: caja rosada con borde rojo');
assert.ok(/font-size:26px;line-height:30px;text-align:center;[^"]*">🎁</.test(h), 'El emoji va grande dentro de la caja');
assert.ok(/white-space:nowrap/.test(h) && h.indexOf('Download gift') < h.lastIndexOf('</td></tr></tbody></table></td></tr></tbody></table>'), 'Botón en una línea, dentro de la caja');
h = block(build('rmf-usa', [gift()]), 'CAJA');
assert.ok(h.includes('background-color:#FDFAF3;border:1px solid #BF873C;border-left:4px solid #BF873C;border-radius:4px') || h.includes('background-color:#FDFAF3;border:1px solid #bf873c;border-left:4px solid #bf873c;border-radius:4px'), 'RMF Camps: crema con borde dorado a la izquierda');
assert.ok(/margin:20px auto 0 auto/.test(h) && /bgcolor="#1A1D4F"/i.test(h), 'RMF Camps: botón azul marino debajo de la caja');
// Opciones del editor: fondo, esquinas, botón dentro y ancho.
h = block(build('rmf-usa', [gift({ bordeBg: 'white', corners: 'square', btnPos: 'inside', btnW: '190' })]), 'CAJA');
assert.ok(/background-color:#FFFFFF;border:1px solid #bf873c;border-left:4px solid #bf873c;border-collapse/i.test(h) && !/margin:20px auto 0 auto/.test(h) && /width="190"/.test(h), 'Opciones de la caja con borde');

// Botones por kit.
const btnOf = tid => block(build(tid, [{ type: 'button', d: { btn: 'Join Telegram', url: 'https://t.me/x', btnStyle: 'gold' } }]), 'BOTON');
assert.ok(/white-space:nowrap/.test(btnOf('arsenal-usa')) && !/width="190"/.test(btnOf('arsenal-usa')), 'Arsenal Camps: ajustado al texto');
assert.ok(/width="210"/.test(btnOf('psg-exp')) && /font-style:italic/.test(btnOf('psg-exp')), 'PSG Experiences: 210 px en cursiva');
assert.ok(/width="260"/.test(btnOf('rmf-exp')), 'RMF Experiences: 260 px');
assert.ok(/width="100%"/.test(block(build('arsenal-usa', [{ type: 'button', d: { btn: 'Go', url: 'https://e.com', btnW: 'full' } }]), 'BOTON')), 'Opción: todo el ancho');

// Datos, viñetas, negritas, notas y timeline.
const pares = { type: 'box', d: { style: 'suave', fmt: 'pares', text: 'Event: {[E-TITLE]}\nDate: {[E-START DATE]}' } };
assert.ok(/font-size:11px;[^"]*color:#888888;letter-spacing:1px/.test(build('arsenal-usa', [pares])), 'Datos: etiqueta 11 px gris');
assert.ok(/font-family:'DinProRegular'[^"]*font-size:14px;line-height:17px;color:#004070/.test(build('psg-usa', [pares])), 'PSG Camps: valor en la regular azul');
assert.ok(/color:#BF873C;font-weight:bold;">&bull;/i.test(build('rmf-exp', [{ type: 'box', d: { style: 'suave', fmt: 'puntos', title: 'T', text: 'a\nb' } }])), 'RMF Experiences: viñetas doradas');
assert.ok(/<strong style="font-family:'DinProBlack'/.test(build('psg-exp', [{ type: 'text', d: { text: '**Players only:** lunch' } }])), 'PSG: negrita recta (no la cursiva)');
assert.ok(/font-size:13px;line-height:21px;color:#888888/.test(build('arsenal-exp', [{ type: 'text', d: { size: 'small', text: 'Please be aware' } }])), 'Arsenal Experiences: notas en gris');
assert.ok(/color:#888888/.test(build('psg-exp', [{ type: 'text', d: { tone: 'grey', text: 'Nota' } }])), 'Opción: texto gris');
assert.ok(/border-top:8px solid #FFFFFF/.test(build('psg-exp', [{ type: 'timeline', d: { d1: 'Nov 22', t1: 'a', d2: 'Nov 23', t2: 'b' } }])), 'PSG Experiences: 8 px entre días');

// Dos cajas seguidas: 12 px.
h = build('psg-exp', [{ type: 'box', d: { style: 'suave', density: 'editorial', title: 'Hotel', text: 'a' } }, { type: 'box', d: { style: 'suave', density: 'editorial', title: 'Meals', text: 'b' } }]);
const boxes = h.split(/<!-- \[\d+\] /).filter(b => b.startsWith('CAJA'));
assert.ok(/padding:36px 40px 12px 40px/.test(boxes[0]) && /padding:0 40px 36px 40px/.test(boxes[1]), 'Cajas seguidas a 12 px');

// Saludo «Dear …,» como primer párrafo: la línea siguiente va pegada (WCH).
h = build('rmf-wc', [{ type: 'text', d: { size: 'intro', text: '**Dear {[C-FIRST NAME]},**\nMadrid is getting closer!' } }]);
assert.ok(!/<p style="[^"]*padding-top:14px;[^"]*">Madrid is getting closer/.test(h), 'WCH: la línea tras el saludo va pegada');
// Separador: 20 px encima y 22 debajo.
h = build('psg-exp', [{ type: 'text', d: { text: 'a' } }, { type: 'separador', d: { style: 'neutral' } }, { type: 'text', d: { text: 'b' } }]);
assert.ok(/padding:36px 40px 20px 40px/.test(h) && /padding:0 40px 22px 40px/.test(h), 'Separador 20/22');
// Datos en caja suave: relleno 14/20 como las referencias.
assert.ok(/padding:14px 20px 14px 20px;text-align:left;/.test(build('arsenal-usa', [pares])), 'Caja de datos 14/20');
// Instrucciones: separadores, cursivas y notas como el original.
const pr = K.importPrompt('arsenal-exp');
assert.ok(/separador \(style neutral\) solo donde el original tiene una línea/.test(pr) && /cursivas → \*así\*/.test(pr) && /"tone":"grey"/.test(pr), 'Instrucciones de formato y separadores');

// Opciones nuevas: texto + imagen en panel, botón con contorno, aviso claro, barra de acento, caja con borde a la izquierda,
// widget de Cvent a 20 px y firma en letra de titular.
assert.ok(/bgcolor="#F5F7FB" style="background-color:#F5F7FB;border-left:4px solid #004070;"><tbody><tr><td style="padding:18px 20px;">/.test(build('psg-exp', [{ type: 'textimg', d: { panel: 'soft', title: 'T', text: 'x', img: 'https://custom.cvent.com/x/pix/a.png', alt: 'a' } }])), 'Texto + imagen en panel suave');
h = block(build('arsenal-usa', [{ type: 'button', d: { btn: 'Learn more', url: 'https://e.com', btnStyle: 'outline' } }]), 'BOTON');
assert.ok(/bgcolor="#FFFFFF" style="background-color:#FFFFFF;border:2px solid #B4001E/.test(h) && /color:#B4001E;/.test(h), 'Botón con contorno');
assert.ok(/background-color:#FDF3F0;border-left:4px solid #C0392B/.test(build('rmf-usa', [{ type: 'box', d: { style: 'aviso', label: 'Important', text: 'x' } }])), 'Aviso claro');
assert.ok(/border-left:4px solid #E30613/.test(build('psg-exp', [{ type: 'box', d: { style: 'suave', density: 'editorial', edge: 'accent', title: 'T', text: 'x' } }])), 'Barra lateral de acento');
h = block(build('psg-usa', [{ type: 'box', d: { style: 'borde', boxAlign: 'left', title: 'Your access', text: 'Code: X' } }]), 'CAJA');
assert.ok(/font-size:16px;line-height:22px;[^"]*text-align:left/.test(h) && /border:2px solid/.test(h), 'Caja con borde a la izquierda');
assert.ok(/padding:36px 20px 36px 20px/.test(build('psg-usa', [{ type: 'text', d: { text: '{[C-PAYMENTS]}' } }])), 'Widget de Cvent a 20 px');
assert.ok(/font-size:17px;line-height:25px;color:#1A1D4F/i.test(build('rmf-usa', [{ type: 'text', d: { tone: 'serif', text: 'Summer Camps' } }])), 'Firma en letra de titular');

// Bloques nuevos copiados de las referencias.
const normas = { type: 'normas', d: { n1_icon: '👕', n1_title: 'Uniform', n1_text: 'Mandatory', n2_icon: '🧳', n2_title: 'Lost & Found', n2_text: 'Ask us' } };
h = block(build('arsenal-usa', [normas]), 'NORMAS');
assert.ok(/background-color:#B4001E;"><tbody><tr><td valign="top" style="padding:18px 20px;">/.test(h) && /font-size:38px;line-height:1;/.test(h), 'Normas en paneles (Arsenal Camps)');
h = block(build('rmf-usa', [normas]), 'NORMAS');
assert.ok(/background-color:#1A1D4F;border-radius:10px/i.test(h) && /background-color:#BF873C;border-radius:10px/i.test(h) && /width="275"/.test(h), 'Normas en rejilla con colores alternos (RMF Camps)');
const act = { type: 'actividad', d: { a1_tag: 'Supporters only', a1_title: 'Tower', a1_text: 'Visit\n- Guide', a1_price: '£40', a1_img: 'https://custom.cvent.com/x/pix/a.jpg', a1_alt: 'a' } };
assert.ok(/width="210"/.test(block(build('arsenal-exp', [act]), 'ACTIVIDADES')), 'Actividad: foto a la izquierda (Arsenal)');
assert.ok(/border:1px solid #E8E1D3;border-radius:8px/.test(block(build('rmf-exp', [act]), 'ACTIVIDADES')), 'Actividad: borde fino (RMF)');
assert.ok(/height:170px;object-fit:cover/.test(block(build('psg-exp', [act]), 'ACTIVIDADES')), 'Actividad: foto arriba (PSG)');
assert.ok(/&bull;/.test(block(build('rmf-exp', [act]), 'ACTIVIDADES')), 'Actividad: «- » se pinta como punto');
h = block(build('arsenal-usa', [{ type: 'botones', d: { preset: 'calendar' } }]), 'BOTONES');
['GOOGLE', 'OUTLOOK', 'ICAL', 'ICS'].forEach(k => assert.ok(h.includes('{[E-CALENDAR URL:' + k + ']}'), 'Calendario ' + k));
assert.ok((h.match(/border:2px solid #B4001E/g) || []).length === 4, 'Calendario: botones con contorno');
h = block(build('rmf-usa', [{ type: 'opciones', d: { o1_title: 'Day', o1_price: '$350', o2_title: 'Full', o2_price: '$450', o2_best: 'Best value' } }]), 'OPCIONES');
assert.ok(/Best value/.test(h) && /border:1px solid #BF873C;border-radius:8px/i.test(h), 'Opciones con destacada');
assert.ok(/border-top:1px solid rgba\(255,255,255,0.15\)/.test(build('rmf-exp', [{ type: 'registro', d: { text: 'Email: {[C-EMAIL]}' } }])), 'Tarjeta oscura de registro');
h = build('arsenal-exp', [{ type: 'paquete', d: { p1_title: 'Full', p1_price: '$570', p1_cur: 'USD' } }, { type: 'paquete', d: { p1_title: 'A', p1_price: '$1', p2_title: 'B', p2_price: '$2' } }]);
assert.ok(/border-radius:6px 6px 0 0/.test(h) && /border-top:4px solid #B4001E/.test(h), 'Paquete destacado y dos tarjetas');
h = build('psg-exp', [{ type: 'box', d: { style: 'suave', fmt: 'mixto', title: 'Hotel', text: '## Shops\n- Carrefour\n> Closed Sunday' } }]);
assert.ok(/font-size:15px;line-height:24px/.test(h) && /&bull;/.test(h) && /font-size:13px;line-height:20px;color:#888888/.test(h), 'Caja mixta');
assert.ok(new Set(K.MODULE_ORDER.map(t => K.MODULES[t].letter)).size === K.MODULE_ORDER.length, 'Letras únicas');
assert.ok(/BLOQUES ESPECÍFICOS/.test(K.importPrompt('rmf-usa')) && /"preset":"calendar"/.test(K.importPrompt('rmf-usa')), 'Instrucciones de los bloques nuevos');

// Sin kit (torneos, Bayern…): sin cambios de estilo de marca.
assert.ok(/width="190"/.test(block(build('surfcup', [{ type: 'box', d: { style: 'borde', title: 'x', text: 'y', btn: 'Go', url: 'https://e.com' } }]), 'CAJA')), 'Sin kit: botón de 190 px de siempre');
console.log('OK: estilos por kit como sus referencias y opciones del editor.');
