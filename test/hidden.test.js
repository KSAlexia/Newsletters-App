// Ejecutar: node test/hidden.test.js. Bloques ocultos (ojo): no salen en el email ni se revisan; en la vista previa, una tira.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const strip = h => h.replace(/<!-- \[\d+\] [^\n]*-->\n/g, '');
const mk = secs => ({ tournament: 'surfcup', name: 'Prueba', off: {}, franjaLeft: 'X', sections: secs.map(([type, d, hidden]) => Object.assign({ type, d: d || {} }, hidden ? { hidden: true } : {})) });

{
  // Ocultar un bloque da el mismo email que no tenerlo (también si separa piezas que se unen).
  const full = [['title', { text: 'Hola' }], ['text', { text: 'Uno' }], ['box', { text: 'Aviso' }], ['button', { btn: 'Go', url: 'https://x.com' }]];
  for (let h = 0; h < full.length; h++) {
    const withHidden = mk(full.map((x, i) => i === h ? [x[0], x[1], true] : x));
    const without = mk(full.filter((x, i) => i !== h));
    assert.equal(strip(K.build(withHidden)), strip(K.build(without)), 'Oculto ' + h + ' = quitado');
  }
  assert.ok(!K.build(mk([['text', { text: 'Secreto' }, true]])).includes('Secreto'));
  console.log('OK: un bloque oculto no sale en el email (igual que si no estuviera).');
}
{
  // Vista previa: tira con el índice original y los demás bloques conservan su índice.
  const st = mk([['text', { text: 'A' }], ['text', { text: 'B' }, true], ['images', {}]]);
  const p = K.build(st, { preview: true });
  assert.ok(/data-ksa-section="1" data-ksa-hidden="1"[\s\S]*Oculto: <strong>Texto/.test(p));
  assert.ok(!p.includes('>B<'));
  assert.ok(p.indexOf('data-ksa-section="0"') < p.indexOf('data-ksa-section="1"') && p.indexOf('data-ksa-section="1"') < p.indexOf('data-ksa-section="2"'), 'En su sitio');
  // Bloque nuevo pendiente junto a uno oculto: respeta el orden.
  const q = K.build(st, { preview: true, pendingAt: 2 });
  assert.ok(q.indexOf('data-ksa-hidden') < q.indexOf('data-ksa-pending') && q.indexOf('data-ksa-pending') < q.indexOf('data-ksa-section="2"'));
  const r = K.build(st, { preview: true, pendingAt: 1 });
  assert.ok(r.indexOf('data-ksa-pending') < r.indexOf('data-ksa-hidden'));
  console.log('OK: vista previa con tira del bloque oculto, índices y bloque nuevo en su sitio.');
}
{
  // Revisión: avisa de los ocultos y no revisa su contenido; los números de módulo siguen siendo los del panel.
  const st = mk([['text', { text: 'PENDIENTE: algo' }, true], ['button', { btn: 'Go' }]]);
  const msgs = K.check(st, K.build(st)).map(c => c.msg).join('\n');
  assert.match(msgs, /Hay 1 bloque oculto/);
  assert.doesNotMatch(msgs, /PENDIENTE de redactar/);
  assert.match(msgs, /Módulo 2 \(Botón\): el botón «Go» no tiene enlace|Módulo 2 \(Botón\): falta/);
  console.log('OK: revisión con aviso de ocultos, sin revisar su contenido.');
}
