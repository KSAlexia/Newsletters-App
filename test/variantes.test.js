// Ejecutar: node test/variantes.test.js. Variantes sacadas de la newsletter de PSG: antetítulo, texto pequeño,
// cajas y timeline en puntos, etiqueta bajo la fecha y etiqueta derecha de la franja. Todas opcionales.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const st = (secs, extra) => Object.assign({ tournament: 'psg-exp', name: 'x', off: {}, franjaLeft: 'Academy Clinic', sections: secs.map(([type, d]) => ({ type, d })) }, extra || {});
const body = h => h.slice(h.indexOf('<body'));

{ // Antetítulo + texto pequeño: una celda, mayúsculas del color principal y texto de 13 px.
  const h = body(K.build(st([['title', { text: 'Good to know', style: 'ante' }], ['text', { text: 'Uno.\nDos.', size: 'small' }]])));
  assert.ok(/letter-spacing:2px;text-transform:uppercase;word-break:break-word;">Good to know<\/p><p style="[^"]*font-size:13px;line-height:21px;[^"]*padding-top:10px;/.test(h));
  assert.ok(/font-size:13px;line-height:21px;[^"]*padding-top:7px;[^"]*">Dos\./.test(h));
  assert.equal(K.flowGroups(st([['title', { text: 'A', style: 'ante' }], ['text', { text: 'b' }]]).sections).length, 1);
  console.log('OK: Título «Antetítulo» y Texto pequeño.');
}
{ // Caja suave en puntos (sola y con título) y Timeline con etiqueta bajo la fecha y puntos.
  const simple = body(K.build(st([['box', { text: 'Uno\nDos', fmt: 'puntos' }]])));
  assert.equal((simple.match(/&bull;<\/span>&nbsp; /g) || []).length, 2);
  const titled = body(K.build(st([['box', { title: 'Your hotel', text: 'Uno\nDos', fmt: 'puntos' }]])));
  assert.ok(/Your hotel[\s\S]*&bull;[\s\S]*Uno[\s\S]*&bull;[\s\S]*Dos/.test(titled));
  const tl = body(K.build(st([['timeline', { fmt: 'puntos', d1: 'Nov 22', s1: 'Arrival', h1: '', t1: 'Check-in\nWelcome meeting', d2: 'Nov 28', s2: 'Departure' }]])));
  assert.ok(/Nov 22<\/p><p style="[^"]*font-size:10px;padding-top:4px;">Arrival<\/p>/.test(tl));
  assert.equal((tl.match(/&bull;/g) || []).length, 2); assert.ok(tl.includes('Departure'));
  // Sin elegir nada, lo de siempre.
  assert.ok(!body(K.build(st([['box', { text: 'Uno\nDos' }]]))).includes('&bull;'));
  console.log('OK: Caja y Timeline en puntos, etiqueta bajo la fecha.');
}
{ // Franja: etiqueta derecha propia; vacía, la de siempre.
  assert.ok(K.build(st([], { franjaRight: 'November 2026 · Paris' })).includes('>November 2026 · Paris</p>'));
  const def = K.build(st([])), t = K.tournament('psg-exp');
  assert.ok(def.includes('>' + (t.franjaRight || (t.club ? t.brand : t.name)) + '</p>'), 'Sin etiqueta derecha: la de la marca');
  const r = K.importProject(JSON.stringify({ tournament: 'psg-exp', franja: 'L', franjaRight: 'R', sections: [{ type: 'title', d: { text: 'x', style: 'ante' } }] }), 'psg-exp');
  assert.equal(r.state.franjaRight, 'R'); assert.equal(r.state.sections[0].d.style, 'ante');
  console.log('OK: etiqueta derecha de la franja (y en la importación).');
}
