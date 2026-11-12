// Ejecutar: node test/datos-timeline.test.js. Banda de datos (1 a 4) y Timeline (1 a 8) repetibles, con las claves de siempre.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const build = (type, d) => K.build({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type, d }] });
const count = (h, t) => h.split(t).length - 1;

{
  // Banda de datos: empieza con uno, añade hasta 4, quitar sube los siguientes; datos antiguos (3) se ven los 3.
  const f = K.MODULES.datos.fields, more = f.find(x => x.type === 'more');
  assert.equal(K.datosCount({}), 1); assert.equal(K.datosCount({ l1: 'a', v3: 'c' }), 3);
  const d = {}; assert.equal(more.add(d), 'l2'); more.add(d); more.add(d); more.add(d);
  assert.equal(K.datosCount(d), 4); assert.equal(more.showIf(d), false);
  assert.equal(f.find(x => x.k === 'v4').showIf({}), false); assert.equal(f.find(x => x.k === 'v4').showIf(d), true);
  const q = { l1: 'A', v1: '1', l2: 'B', v2: '2', l3: 'C', v3: '3', dN: 3 }; f.find(x => x.type === 'opt' && x.n === 2).remove(q);
  assert.deepEqual([q.l2, q.v2, q.l3, q.v3, q.dN], ['C', '3', undefined, undefined, 2]);
  // HTML: 1, 3 y 4 columnas (las mismas de siempre hasta 3).
  assert.equal(count(build('datos', { title: 'T', l1: 'a', v1: 'b' }), 'class="data-col" width="100%"'), 1);
  assert.equal(count(build('datos', { title: 'T', l1: 'a', v1: 'b', l2: 'c', v2: 'd', l3: 'e', v3: 'f' }), 'class="data-col" width="33%"'), 3);
  const h4 = build('datos', { title: 'T', l1: 'a', v1: 'b', l2: 'c', v2: 'd', l3: 'e', v3: 'f', l4: 'Format', v4: '7v7' });
  assert.equal(count(h4, 'class="data-col" width="25%"'), 4); assert.ok(h4.includes('7v7'));
  console.log('OK: Banda de datos de 1 a 4 (editor, columnas y datos antiguos).');
}
{
  // Timeline: hasta 8 hitos; solo el primero es obligatorio; datos antiguos (4) se ven los 4.
  const f = K.MODULES.timeline.fields, more = f.find(x => x.type === 'more');
  assert.equal(K.hitosCount({}), 1); assert.equal(K.hitosCount({ d1: 'a', h4: 'x' }), 4);
  assert.equal(f.find(x => x.k === 'd1').req, true); assert.ok(!f.find(x => x.k === 'd2').req);
  const d = {}; for (let i = 0; i < 10; i++) more.add(d); assert.equal(K.hitosCount(d), 8);
  const all = {}; for (let n = 1; n <= 8; n++) Object.assign(all, { ['d' + n]: 'Day ' + n, ['h' + n]: 'Hito ' + n });
  const h = build('timeline', all);
  assert.equal(count(h, '<td width="120" valign="top"'), 8); assert.ok(h.includes('Hito 8'));
  assert.equal(count(h, 'border-top:2px solid #FFFFFF;'), 14, 'Separador entre hitos (dos celdas por fila, menos la primera)');
  console.log('OK: Timeline de 1 a 8 hitos (editor y HTML).');
}
