// Ejecutar: node test/cards.test.js. Bloque «Tarjetas» (de 1 a 8, claras u oscuras, con botón).
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const st = d => ({ tournament: 'surfcup', name: 'Prueba', off: {}, franjaLeft: '', sections: [{ type: 'cards', d }] });
const desk = html => (html.split('class="desk-only"')[1] || '').split('class="mob-only"')[0];
const mob = html => (html.split('class="mob-only"')[1] || '');
const count = (html, text) => html.split(text).length - 1;
const widths = html => (desk(html).match(/<td width="(\d+%?)"[^>]*valign="top"/g) || []).map(x => x.match(/width="(\d+%?)"/)[1]);
const cards = (n, extra) => { const d = {}; for (let i = 1; i <= n; i++) Object.assign(d, { ['c' + i + '_title']: 'Card' + i, ['c' + i + '_price']: '$' + i, ['c' + i + '_text']: 'Corto.' }, extra ? extra(i) : {}); return d; };

// Paleta: sale «Tarjetas» y no el bloque antiguo; el antiguo sigue funcionando.
{
  assert.ok(K.MODULE_ORDER.includes('cards'));
  assert.ok(!K.MODULE_ORDER.includes('tarjetas'), 'Dos tarjetas ya no está en la paleta');
  assert.ok(K.MODULES.tarjetas, 'El bloque antiguo se sigue pudiendo pintar');
  const legacy = K.build({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: '', sections: [{ type: 'tarjetas', d: { a_title: 'A', b_title: 'B' } }] });
  assert.ok(legacy.includes('>A<') && legacy.includes('>B<'));
  console.log('OK: «Tarjetas» en la paleta y «Dos tarjetas» antiguo oculto pero funcionando.');
}

// Editor: empieza con una, añade hasta 8, quitar sube las siguientes (también el estilo).
{
  const d = {};
  assert.equal(K.cardsCount(d), 1);
  const f = K.MODULES.cards.fields, more = f.find(x => x.type === 'more');
  assert.equal(more.add(d), 'c2_title'); assert.equal(K.cardsCount(d), 2);
  assert.equal(f.filter(x => x.type === 'opt').length, 8);
  assert.equal(f.find(x => x.k === 'c3_title').showIf(d), false);
  assert.equal(f.find(x => x.k === 'c1_title').req, true); assert.ok(!f.find(x => x.k === 'c2_title').req, 'Solo la primera tarjeta es obligatoria');
  const q = { c1_title: 'A', c2_title: 'B', c2_style: 'dark', c3_title: 'C', c3_btn: 'Go', c3_url: 'https://x.com', cN: 3 };
  f.find(x => x.type === 'opt' && x.n === 2).remove(q);
  assert.deepEqual([q.c2_title, q.c2_style, q.c2_btn, q.c3_title], ['C', undefined, 'Go', undefined]);
  assert.equal(K.cardsCount(q), 2);
  console.log('OK: editor de tarjetas (1 visible, añadir, quitar con estilo y botón).');
}

// HTML: una ancha, filas según número y longitud, botones alineados, estilos y móvil.
{
  const h1 = K.build(st({ c1_label: 'Early bird', c1_title: 'Full Pack', c1_price: '$149', c1_text: 'Todo incluido.', c1_btn: 'Buy now', c1_url: 'https://example.com/buy' }));
  assert.deepEqual(widths(h1), ['100%'], 'Una tarjeta va a todo el ancho');
  assert.ok(/Early bird[\s\S]*Full Pack[\s\S]*align="right"[\s\S]*\$149[\s\S]*Todo incluido\.[\s\S]*Buy now/.test(desk(h1)), 'Etiqueta, título, precio a la derecha, texto y botón');
  assert.ok(desk(h1).includes('align="left" style="margin:18px 0 0 0;'), 'El botón de la tarjeta ancha va a la izquierda');
  assert.deepEqual(widths(K.build(st(cards(3)))), ['143', '143', '143'], 'Tres cortas en fila');
  assert.deepEqual(widths(K.build(st(cards(4)))), ['233', '233', '233', '233'], 'Cuatro en 2×2');
  assert.deepEqual(widths(K.build(st(cards(2)))), ['277', '277'], 'Dos claras: el HTML del bloque antiguo');
  // Con botón en alguna tarjeta de la fila: fila de cuerpos y fila de botones (alineados abajo).
  const hb = K.build(st(cards(2, i => i === 1 ? { c1_btn: 'Go', c1_url: 'https://example.com' } : {})));
  assert.equal(count(desk(hb), 'valign="bottom"'), 2, 'Dos celdas de botón en la fila (una vacía)');
  // Oscura: fondo de banda, textos en blanco y botón blanco.
  const hd = K.build(st({ c1_title: 'Dark', c1_text: 'Texto', c1_style: 'dark', c1_btn: 'Go', c1_url: 'https://example.com', c2_title: 'Light' }));
  const dark = desk(hd).split('Dark')[0].split('<td').pop();
  assert.ok(!/bgcolor="#FFFFFF"/.test(dark), 'La tarjeta oscura no tiene fondo blanco');
  assert.ok(/Dark<\/p>/.test(hd) && /color:#FFFFFF;text-transform/.test(desk(hd)), 'Título en blanco');
  assert.ok(/bgcolor="#FFFFFF" style="background-color:#FFFFFF;border-radius:[^"]*"><a [^>]*>Go</.test(desk(hd)), 'Botón blanco sobre la tarjeta oscura');
  // Móvil: todas apiladas, con su botón.
  const h3 = K.build(st(cards(3, i => ({ ['c' + i + '_btn']: 'B' + i, ['c' + i + '_url']: 'https://example.com/' + i }))));
  ['Card1', 'Card2', 'Card3', '>B1<', '>B3<'].forEach(t => assert.ok(mob(h3).includes(t), t + ' en móvil'));
  assert.equal(count(h3, 'class="mob-only"'), 1);
  console.log('OK: tarjetas responsive (ancha, 3 en fila, 2×2), botones alineados, estilo oscuro y móvil apilado.');
}

// Revisión e importación.
{
  const bad = st({ c1_title: 'A', c2_text: 'sin título', c3_title: 'C', c3_btn: 'Go' });
  const msgs = K.check(bad, K.build(bad)).map(c => c.msg).join('\n');
  assert.match(msgs, /tarjeta 2 no tiene título/); assert.match(msgs, /tarjeta 3\): el botón «Go» no tiene enlace/);
  const r = K.importProject(JSON.stringify({ tournament: 'surfcup', sections: [{ type: 'cards', d: { c1_title: 'A', c2_title: 'B', c2_price: '$2' } }, { type: 'tarjetas', d: { a_title: 'Old' } }] }), 'surfcup');
  assert.equal(r.state.sections[0].type, 'cards'); assert.equal(r.state.sections[0].d.c2_price, '$2');
  assert.equal(r.state.sections[1].type, 'tarjetas', 'El importador sigue aceptando el bloque antiguo');
  assert.ok(K.importPrompt().includes('cards → Tarjetas'), 'Las instrucciones de ChatGPT ofrecen el bloque nuevo');
  assert.ok(!K.importPrompt().includes('tarjetas → '), 'y no el antiguo');
  console.log('OK: revisión (tarjeta sin título, botón sin enlace) e importación con el bloque nuevo y el antiguo.');
}
