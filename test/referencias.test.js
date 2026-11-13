// Ejecutar: node test/referencias.test.js. Correcciones salidas de comparar la app con las newsletters de referencia (13/11/2026):
// etiqueta de la caja con borde, campos Cvent válidos, contacto y composición de World Challenge, tarjetas con foto al lado,
// caja de datos (etiqueta encima del valor), enlace en imágenes, rótulos de PSG Experiences e instrucciones de ChatGPT.
const assert = require('node:assert/strict');
for (const f of ['head', 'brands', 'brand-kits', 'brand-designs', 'modules']) require('../js/' + f + '.js');
const K = globalThis.KSA, V = K.Designs.version, U = 'https://custom.cvent.com/x/pix/foto.png';
const st = (tournament, sections, extra) => Object.assign({ tournament, name: 'x', off: {}, franjaLeft: 'X', designVersion: V, sections }, extra || {});
const msgs = s => K.check(s, K.build(s));

// Caja con borde: la etiqueta ya no se pierde (todas las marcas, con y sin kit).
for (const s of [st('psg-exp', [{ type: 'box', d: { style: 'borde', label: 'REQUEST EXTRA WRISTBANDS', text: 'Use your registration' } }]), { tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'box', d: { style: 'borde', label: 'Etiqueta', text: 'Texto' } }] }])
  assert.ok(K.build(s).includes(s.sections[0].d.label), 'Caja con borde: sale la etiqueta');

// Campos de Cvent de las referencias: sin errores; los de cada evento se aceptan por su forma; un botón puede enlazar a un campo.
['{[C-LAST NAME:TC]}', '{[E-START DATE]}', '{[C-AMOUNT PAID]}', '{[C-CUSTOM:Player Position]}', '{[E-CUSTOM:Camp City]}', '{[C-CURRENT REGISTRATION WIDGET:5d38-abc]}', '{[E-EMAIL LINK:View or modify your registration]}', '{[E-CALENDAR URL:ICS]}']
  .forEach(f => assert.ok(K.isCventField(f), f));
let r = msgs(st('rmf-usa', [{ type: 'text', d: { text: 'Hi {[C-CUSTOM:PARENT FIRST NAME]} {[C-LAST NAME:TC]} {[C-AMOUNT PAID]}' } }, { type: 'button', d: { btn: 'Join Telegram', url: '{[E-CUSTOM:Telegram]}' } }]));
assert.ok(!r.some(m => m.level === 'error'), 'Sin errores: ' + r.filter(m => m.level === 'error').map(m => m.msg).join(' | '));
r = msgs(st('rmf-usa', [{ type: 'text', d: { text: 'Hi {[C-FIRST NAM]}' } }]));
assert.ok(r.some(m => m.level === 'warn' && /no reconocido/.test(m.msg)) && !r.some(m => m.level === 'error' && /no reconocido/.test(m.msg)), 'Campo raro: aviso, no error');

// World Challenge como sus emails de ejemplo.
const wch = K.build(st('rmf-wc', [
  { type: 'title', d: { style: 'ante', text: 'MADRID · MARCH 19–27, 2027' } }, { type: 'title', d: { style: 'principal', align: 'left', text: 'SCHEDULE &\nWRISTBANDS' } },
  { type: 'title', d: { style: 'seccion', text: '01 · Tentative Schedule' } }, { type: 'box', d: { style: 'suave', density: 'editorial', label: 'PLAN YOUR MADRID EXPERIENCE', text: 'The program…' } },
  { type: 'box', d: { style: 'oscura', label: 'IMPORTANT', text: 'This schedule is **tentative**.' } },
  { type: 'box', d: { style: 'borde', label: 'REQUEST EXTRA WRISTBANDS', text: 'Use your registration:', line: '{[E-MODIFY REG LINK]}' } }
], { franjaLeft: '' }));
const blocks = wch.split(/<!-- \[\d+\] /);
const head = blocks.find(b => b.startsWith('TITULO + TITULO'));
assert.ok(head && head.includes('MADRID · MARCH') && head.includes('SCHEDULE &amp;<br />WRISTBANDS'), 'Antetítulo y titular en la misma celda');
assert.ok(head.includes('36px;line-height:44px') && head.includes('letter-spacing:-0.5px') && head.includes('padding-top:8px;'), 'H1 36/44, -0.5 px, pegado al rótulo');
const sec = blocks.find(b => b.startsWith('TITULO -->') && b.includes('Tentative Schedule'));
assert.ok(!/text-align:center/.test(sec) && !/height="3"/.test(sec), 'Título de sección a la izquierda y sin barra');
assert.match(sec, /padding:30px 40px 0 40px/, 'Sin hueco bajo el título de sección');
const box = blocks.find(b => b.startsWith('CAJA') && b.includes('PLAN YOUR'));
assert.match(box, /padding:0 40px/, 'La caja sigue al título sin hueco');
assert.ok(box.indexOf('PLAN YOUR') > box.indexOf('border-left:4px'), 'Etiqueta dentro de la caja');
const imp = blocks.find(b => b.includes('This schedule is'));
assert.ok(!/border-radius/.test(imp) && imp.includes('padding:15px 19px'), 'Important recto y compacto');
const cta = blocks.find(b => b.includes('REQUEST EXTRA'));
assert.ok(!/border-radius:8px/.test(cta) && /width="190"[^>]*bgcolor/.test(cta) && cta.includes('{[E-MODIFY REG LINK]}</td>'), 'CTA recta con el enlace de Cvent en recuadro dorado');
assert.ok(wch.includes('For any questions, please contact us at: <strong') && wch.includes('{[E-CUSTOM:Event Phone Number]}') && wch.includes('Sincerely,'), 'Contacto WCH con el teléfono del evento');
assert.equal((wch.match(/please contact us at/gi) || []).length, 1, 'Una sola frase de contacto');
assert.ok(!wch.includes('Get in Touch'), 'Sin caja Get in Touch');
r = msgs(st('rmf-wc', [{ type: 'text', d: { text: 'Hola' } }], { franjaLeft: '' }));
assert.ok(!r.some(m => m.level === 'error'), 'WCH sin contacto propio ya no da error');
const mail = K.build(st('rmf-wc', [{ type: 'text', d: { text: 'Hola' } }], { franjaLeft: '', contactEmail: 'wch@example.com' }));
assert.ok(mail.includes('mailto:wch@example.com') && !mail.includes('Event Phone Number'), 'Email propio en lugar del teléfono');

// Tarjetas apiladas junto a una foto (cualquier marca); en WCH, rectas.
const side = { sideImg: U, sideAlt: 'Fans', side: 'left', c1_style: 'dark', c1_label: 'ACCESS', c1_title: 'Full tournament', c1_text: 'One wristband.', c2_label: 'PER REGISTRATION', c2_title: 'Up to 4', c2_text: 'Personal.' };
for (const tid of ['rmf-wc', 'psg-exp']) {
  const h = K.build(st(tid, [{ type: 'cards', d: side }]));
  assert.ok(h.indexOf('alt="Fans"') < h.indexOf('Full tournament') && h.indexOf('Full tournament') < h.indexOf('Up to 4'), tid + ': foto y tarjetas apiladas en orden');
  assert.equal((h.match(/class="col2"/g) || []).length, 2, tid + ': dos columnas que se apilan en móvil');
  assert.equal(/border-radius:8px/.test(h), tid !== 'rmf-wc', tid + ': esquinas según la marca');
}
assert.ok(K.build(st('psg-exp', [{ type: 'cards', d: Object.assign({}, side, { side: 'right' }) }])).indexOf('Up to 4') < K.build(st('psg-exp', [{ type: 'cards', d: Object.assign({}, side, { side: 'right' }) }])).indexOf('alt="Fans"'), 'Foto a la derecha');

// Caja suave con formato «Datos»: etiqueta pequeña encima del valor.
const pares = K.build(st('rmf-usa', [{ type: 'box', d: { style: 'suave', label: 'REGISTRATION SUMMARY', fmt: 'pares', text: 'Player Name: {[C-FIRST NAME:TC]} {[C-LAST NAME:TC]}\nTax ID: **20-8849278**\n{[E-INVOICE LINK]}' } }]));
assert.match(pares, /letter-spacing:1px;text-transform:uppercase;[^"]*">Player Name<\/p><p style="[^"]*font-weight:bold;[^"]*">\{\[C-FIRST NAME:TC\]\} \{\[C-LAST NAME:TC\]\}<\/p>/, 'Etiqueta encima del valor');
assert.ok(pares.includes('>Tax ID</p>') && pares.includes('20-8849278') && !pares.includes('**'), 'Valor en negrita sin asteriscos');
assert.ok(pares.includes('{[E-INVOICE LINK]}') && pares.includes('REGISTRATION SUMMARY'), 'Línea sin «:» y etiqueta de la caja');

// Imagen con enlace al pulsarla; sin enlace, el HTML de siempre.
const plain = { f1_src: U, f1_alt: 'Telegram', f2_src: U.replace('foto', 'b'), f2_alt: 'App Store' };
const linked = K.build(st('rmf-exp', [{ type: 'images', d: Object.assign({}, plain, { f1_url: '{[E-CUSTOM:Telegram]}' }) }]));
assert.match(linked, /<a href="\{\[E-CUSTOM:Telegram\]\}" target="_blank"[^>]*><img src="https:\/\/custom\.cvent\.com\/x\/pix\/foto\.png"[^>]*\/><\/a>/, 'Imagen 1 con enlace');
assert.ok(!/<a [^>]*><img src="https:\/\/custom\.cvent\.com\/x\/pix\/b\.png/.test(linked), 'Imagen 2 sin enlace');
assert.equal(K.build(st('rmf-exp', [{ type: 'images', d: Object.assign({}, plain, { f1_url: '' }) }])), K.build(st('rmf-exp', [{ type: 'images', d: plain }])), 'Sin enlace no cambia');

// PSG Experiences: rótulos (antetítulo) en rojo como sus ejemplos; PSG Camps sigue en azul.
assert.match(K.build(st('psg-exp', [{ type: 'title', d: { style: 'ante', text: 'Your week' } }])), /color:#E30613;letter-spacing:2px;text-transform:uppercase;[^"]*">Your week/i);
assert.match(K.build(st('psg-usa', [{ type: 'title', d: { style: 'ante', text: 'Your week' } }])), /color:#004070;letter-spacing:2px;text-transform:uppercase;[^"]*">Your week/i);

// Instrucciones de ChatGPT sin las contradicciones encontradas.
const p = K.importPrompt('psg-usa');
assert.ok(p.includes('usa "tournament":"psg-usa"') && p.includes('"tournament":"psg-usa","name"'), 'Sección de destino explícita');
assert.ok(p.includes('banner a todo el ancho justo antes de la línea de baja'), 'Qué es el footer de imagen');
assert.ok(p.includes('Varias cajas (box) seguidas sí están bien') && !p.includes('No uses el mismo recurso dos veces seguidas'), 'Cajas seguidas permitidas');
assert.ok(p.includes('si en el original «Dear …» es el titular grande'), 'Saludo frente a titular');
assert.ok(K.importPrompt('rmf-wc').includes('No los copies como texto (esto no cuenta como dejar contenido fuera)'), 'Contacto WCH');
// WCH: «Dear …» en negrita del tamaño de la introducción, en la celda del titular y pegado al texto.
const greet = K.build(st('rmf-wc', [{ type: 'title', d: { style: 'principal', align: 'left', text: 'SCHEDULE' } }, { type: 'title', d: { style: 'saludo', text: 'Dear {[C-FIRST NAME]},' } }, { type: 'text', d: { size: 'intro', text: 'Madrid is getting closer!' } }], { franjaLeft: '' }));
const gcell = greet.split(/<!-- \[\d+\] /).find(b => b.startsWith('TITULO + TITULO + TEXTO'));
assert.ok(gcell && /font-size:15px;line-height:25px;[^"]*padding-top:20px;[^"]*">Dear/.test(gcell) && /padding-top:0|">Madrid is getting closer/.test(gcell) && !/padding-top:14px;[^"]*">Madrid/.test(gcell), 'Saludo WCH compacto');
assert.match(K.build(st('psg-exp', [{ type: 'title', d: { style: 'saludo', text: 'Dear X,' } }])), /font-size:28px;line-height:34px;[^"]*">Dear X,/, 'Otras marcas: saludo de siempre');

// Botón de color de acento (p. ej. Telegram en rojo en PSG).
assert.match(K.build(st('psg-usa', [{ type: 'button', d: { btn: 'Join Telegram', url: '{[E-CUSTOM:Telegram]}', btnStyle: 'accent' } }])), /background-color:#E20613;[^"]*"><a href="\{\[E-CUSTOM:Telegram\]\}"[^>]*color:#FFFFFF/i, 'Botón de acento');

// Con kit, los iconos del contenido no generan aviso; sin kit, sí.
assert.ok(!msgs(st('rmf-usa', [{ type: 'text', d: { text: '🎁 Is this camp a gift?' } }])).some(m => /emojis/.test(m.msg)), 'Kit: sin aviso de emojis');
assert.ok(K.check({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'text', d: { text: '🎁 Gift' } }] }, K.build({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'text', d: { text: '🎁 Gift' } }] })).some(m => /emojis/.test(m.msg)), 'Sin kit: aviso de emojis');
assert.ok(K.importPrompt('rmf-wc').includes('++así++') && K.importPrompt('rmf-wc').includes('"sideImg"') && K.importPrompt('rmf-usa').includes('"fmt":"pares"'), 'Instrucciones: subrayado, foto con tarjetas y datos');
console.log('OK: correcciones de la comparación con las referencias (caja con borde, Cvent, World Challenge, tarjetas con foto, datos, enlaces en imágenes, PSG e instrucciones).');
