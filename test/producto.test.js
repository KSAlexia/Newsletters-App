// Ejecutar: node test/producto.test.js. Opciones con precio del módulo Producto (de 1 a 8).
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const st = d => ({ tournament: 'surfcup', name: 'Prueba', off: {}, franjaLeft: '', sections: [{ type: 'producto', d: Object.assign({ title: 'Servicio', price: '$10' }, d) }] });
const cards = html => (html.split('class="desk-only"')[1] || '').split('class="mob-only"')[0];
const count = (html, text) => html.split(text).length - 1;

// Editor: al principio se ve una opción; «Añadir otra» suma hasta 8; quitar sube las siguientes.
{
  const d = {};
  assert.equal(K.pkCount(d), 1, 'Se empieza con una opción visible');
  assert.equal(K.pkAdd(d), 2); assert.equal(K.pkCount(d), 2);
  for (let i = 0; i < 10; i++) K.pkAdd(d);
  assert.equal(K.pkCount(d), 8, 'Máximo 8 opciones');
  const p = K.MODULES.producto.fields;
  assert.equal(p.filter(f => f.type === 'opt').length, 8);
  const more = p.find(f => f.type === 'more');
  assert.equal(more.showIf(d), false, 'Con 8 no se ofrece añadir otra');
  assert.equal(more.showIf({}), true);
  assert.equal(p.find(f => f.k === 'p3_title').showIf({}), false, 'La opción 3 no se ve hasta añadirla');
  // Datos antiguos con dos opciones: se ven las dos.
  assert.equal(K.pkCount({ p1_title: 'A', p2_title: 'B' }), 2);
  // Quitar la 2 de 3: la 3 pasa a ser la 2.
  const q = { p1_title: 'A', p2_title: 'B', p2_price: '$2', p3_title: 'C', p3_text: 'c', pkN: 3 };
  K.pkRemove(q, 2);
  assert.deepEqual([q.p1_title, q.p2_title, q.p2_text, q.p2_price, q.p3_title], ['A', 'C', 'c', undefined, undefined]);
  assert.equal(K.pkCount(q), 2);
  // Quitar la única opción la vacía.
  const one = { p1_title: 'A', p1_price: '$1' }; K.pkRemove(one, 1);
  assert.equal(K.pkCount(one), 1); assert.equal(one.p1_title, undefined);
  console.log('OK: editor de opciones (1 visible, añadir hasta 8, quitar y reordenar, datos antiguos).');
}

// HTML responsive según el número de opciones y la longitud de los textos; móvil siempre apilado.
{
  const opts = (n, text) => { const d = {}; for (let i = 1; i <= n; i++) { d['p' + i + '_title'] = 'Op' + i; d['p' + i + '_price'] = '$' + i; d['p' + i + '_text'] = text || 'Texto corto.'; } return d; };
  const widths = html => (cards(html).match(/<td width="(\d+%?)" valign="top"/g) || []).map(x => x.match(/"(\d+%?)"/)[1]);
  const none = K.build(st({}));
  assert.ok(!none.includes('class="desk-only"'), 'Sin opciones no hay tarjetas');
  // Una: ancho completo, precio en el borde derecho y texto debajo.
  const h1 = K.build(st({ p1_title: 'Pack único', p1_price: '$99', p1_text: 'Todo incluido.', pkTitle: 'Choose your package:' })), c1 = cards(h1);
  assert.ok(h1.includes('Pack único') && h1.includes('Choose your package:'), 'Una sola opción se muestra');
  assert.deepEqual(widths(h1), ['100%']);
  assert.ok(/Pack único[\s\S]*align="right"[\s\S]*\$99[\s\S]*Todo incluido\./.test(c1), 'Nombre, precio a la derecha y texto debajo');
  // Dos: igual que siempre.
  assert.ok(!/width="233"/.test(cards(K.build(st(opts(2))))), 'Dos opciones usan el HTML de siempre');
  assert.equal(count(cards(K.build(st(opts(2)))), 'width="277"'), 2);
  // Tres cortas: tres en fila. Tres largas: dos y la tercera ancha.
  assert.deepEqual(widths(K.build(st(opts(3)))), ['143', '143', '143'], 'Tres opciones cortas en una fila');
  assert.deepEqual(widths(K.build(st(opts(3, 'x '.repeat(100))))), ['233', '233', '100%'], 'Con mucho texto: dos y una ancha');
  // Cuatro: rejilla 2×2 aunque sean cortas. Cinco: 3+2. Siete: 3+2+2. Ocho: 2×4.
  assert.deepEqual(widths(K.build(st(opts(4)))), ['233', '233', '233', '233']);
  assert.deepEqual(widths(K.build(st(opts(5)))), ['143', '143', '143', '233', '233']);
  assert.deepEqual(K.optionRows(Array.from({ length: 7 }, () => ({ title: 'a' }))).map(r => r.length), [3, 2, 2]);
  const h8 = K.build(st(opts(8)));
  assert.equal(widths(h8).length, 8); assert.equal(count(cards(h8), 'height="16"'), 3, 'Separación entre filas');
  // Móvil: una copia apilada con todas.
  const h3 = K.build(st(opts(3)));
  assert.equal(count(h3, 'class="mob-only"'), 1);
  ['Op1', 'Op2', 'Op3'].forEach(t => assert.equal(count(h3, '>' + t + '<'), 2, t + ' en escritorio y en móvil'));
  // Huecos: una opción sin nombre no se pinta y la revisión avisa.
  const gapSt = st({ p1_title: 'A', p2_price: '$5', p3_title: 'C' }), gapHtml = K.build(gapSt);
  assert.equal(count(cards(gapHtml), 'width="277"'), 2, 'Se pintan las que tienen nombre');
  assert.ok(K.check(gapSt, gapHtml).some(c => /opción 2 no tiene nombre/.test(c.msg)));
  assert.ok(!K.check(st({ p1_title: 'Solo una' }), K.build(st({ p1_title: 'Solo una' }))).some(c => /de dos en dos/.test(c.msg)), 'Ya no se exige rellenar dos');
  console.log('OK: Producto responsive (1 ancha con precio a la derecha, 3 en fila si son cortas, 2×2 con 4, 3+2 con 5, móvil apilado) y aviso de opción sin nombre.');
}
