// Ejecutar: node test/history.test.js. Deshacer/rehacer e historial de versiones sin navegador.
const assert = require('node:assert/strict');
require('../js/history.js');
const H = globalThis.KSA.History;

// ---------- Deshacer / rehacer ----------
{
  const u = H.undoStack({ gap: 700 });
  assert.equal(u.undo('A'), null, 'Sin pasos no hay nada que deshacer');
  // Escribir seguido (cambios a menos de 700 ms) es un solo paso.
  u.record('A', 1000); u.record('A1', 1200); u.record('A12', 1500);
  assert.equal(u.undo('A123'), 'A', 'Lo escrito seguido se deshace de una vez');
  assert.equal(u.redo('A'), 'A123');
  // Una pausa larga separa pasos.
  u.record('A123', 5000);
  assert.equal(u.undo('B'), 'A123'); assert.equal(u.undo('A123'), 'A');
  assert.equal(u.redo('A'), 'A123'); assert.equal(u.redo('A123'), 'B'); assert.equal(u.redo('B'), null);
  // Una acción (mover, añadir…) es un paso propio aunque llegue justo después de escribir, y lo que se escribe después también.
  const v = H.undoStack({ gap: 700 });
  v.record('S0', 1000); v.record('S1', 1100); v.boundary(); v.record('S2', 1200); v.record('S3', 1300); v.record('S4', 1400);
  assert.equal(v.undo('S5'), 'S3', 'Escribir después de una acción es otro paso');
  assert.equal(v.undo('S3'), 'S2', 'La acción se deshace sola');
  assert.equal(v.undo('S2'), 'S0', 'Lo escrito antes de la acción es un paso');
  // Un cambio nuevo borra lo que se podía rehacer.
  v.redo('S0'); v.record('S2', 9000); assert.equal(v.canRedo(), false);
  // Límite de pasos.
  const w = H.undoStack({ limit: 3 }); for (let i = 0; i < 10; i++) { w.boundary(); w.record('x' + i, i * 10000); }
  assert.equal(w.undo('now'), 'x9'); w.undo('x9'); w.undo('x8'); assert.equal(w.undo('x7'), null);
  console.log('OK: deshacer/rehacer agrupando lo escrito, pasos propios por acción, rehacer y límite.');
}

// ---------- Versiones ----------
{
  const data = {}, storage = { getItem: k => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); } };
  assert.deepEqual(H.list(storage, 'p1'), []);
  assert.ok(H.autoDue(storage, 'p1', 0), 'Sin versiones toca guardar una automática');
  const a = H.add(storage, 'p1', '{"n":1}', '', true, 1000);
  assert.equal(a.label, 'Automática'); assert.equal(H.autoDue(storage, 'p1', 1000 + H.AUTO_EVERY - 1), false);
  assert.ok(H.autoDue(storage, 'p1', 1000 + H.AUTO_EVERY));
  assert.equal(H.add(storage, 'p1', '{"n":1}', '', true, 2000), null, 'Una automática igual a la última no se repite');
  const m = H.add(storage, 'p1', '{"n":2}', '  Enviada a revisión ', false, 3000);
  assert.equal(m.label, 'Enviada a revisión'); assert.equal(m.auto, false);
  H.add(storage, 'p2', '{"otra":1}', 'De otra', false, 3000);
  assert.deepEqual(H.list(storage, 'p1').map(v => v.content), ['{"n":1}', '{"n":2}'], 'Cada newsletter tiene sus versiones, en orden');
  assert.equal(H.find(storage, 'p1', m.id).content, '{"n":2}');
  H.remove(storage, 'p1', a.id); assert.deepEqual(H.list(storage, 'p1').map(v => v.id), [m.id]);
  H.removeAll(storage, 'p1'); assert.deepEqual(H.list(storage, 'p1'), []); assert.equal(H.list(storage, 'p2').length, 1);
  // Límite de automáticas: se descarta la más antigua; las guardadas a mano se conservan.
  H.add(storage, 'p3', '{"keep":1}', 'A mano', false, 1);
  for (let i = 0; i < H.MAX_AUTO + 5; i++) H.add(storage, 'p3', '{"i":' + i + '}', '', true, 10 + i);
  const p3 = H.list(storage, 'p3');
  assert.equal(p3.filter(v => v.auto).length, H.MAX_AUTO); assert.ok(p3.some(v => v.label === 'A mano'));
  assert.equal(p3.filter(v => v.auto)[0].content, '{"i":5}');
  // Límite de versiones a mano: error claro, sin guardar.
  for (let i = 1; i < H.MAX_MANUAL; i++) H.add(storage, 'p3', '{"m":' + i + '}', 'M' + i, false, 100 + i);
  const before = data[H.KEY];
  assert.throws(() => H.add(storage, 'p3', '{"m":"x"}', 'Una más', false, 999), /hasta 30/);
  assert.equal(data[H.KEY], before, 'Superar el límite no cambia lo guardado');
  // Sin espacio: se borran automáticas antiguas (de cualquier newsletter) hasta que cabe; nunca las guardadas a mano.
  let cap = data[H.KEY].length;
  const tight = { getItem: storage.getItem, setItem: (k, v) => { if (v.length > cap) throw Error('QuotaExceededError'); data[k] = v; } };
  H.add(tight, 'p3', '{"m":"nueva"}', 'Cabe', true, 5000);
  const after = H.list(tight, 'p3');
  assert.ok(after.some(v => v.label === 'Cabe')); assert.ok(after.filter(v => v.auto).length < H.MAX_AUTO);
  assert.equal(after.filter(v => !v.auto).length, H.MAX_MANUAL);
  cap = 10; assert.throws(() => H.add(tight, 'p2', '{"z":1}', 'No cabe', false, 6000), /No hay espacio/);
  // Datos dañados: se empieza de cero sin romper.
  assert.deepEqual(H.list({ getItem: () => '{roto' }, 'p1'), []);
  console.log('OK: versiones por newsletter, automáticas sin repetir, límites, eliminar y falta de espacio.');
}
