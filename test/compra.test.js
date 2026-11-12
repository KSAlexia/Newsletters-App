// Ejecutar: node test/compra.test.js. Caja de compra: dos frases fijas y «Otra (escribe tu frase)» con texto libre.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const st = d => ({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'compra', d }] });
const msgs = d => K.check(st(d), K.build(st(d))).map(c => c.level + ': ' + c.msg).join('\n');

const v = K.MODULES.compra.fields.find(f => f.k === 'variant');
assert.deepEqual(v.opts.map(o => o[0]), ['compra', 'modificar', 'custom']);
assert.equal(K.MODULES.compra.fields.find(f => f.k === 'line').showIf({ variant: 'custom' }), true);
// Frase propia con enlace propio: sale el enlace; con negrita, la negrita.
const h = K.build(st({ variant: 'custom', line: 'To book your hotel [click here](https://example.com/hotel) **now**' }));
assert.ok(/To book your hotel <a href="https:\/\/example\.com\/hotel"[^>]*>click here<\/a> <strong[^>]*>now<\/strong>/.test(h));
// Con el campo de Cvent, igual que antes.
assert.ok(K.build(st({ variant: 'custom', line: 'Change it here {[E-MODIFY REG LINK]}' })).includes('Change it here {[E-MODIFY REG LINK]}'));
// Revisión: sin frase, error; sin enlace, aviso (ya no se exige el campo de Cvent).
assert.match(msgs({ variant: 'custom', line: '' }), /error: .*falta tu frase/);
assert.match(msgs({ variant: 'custom', line: 'Solo texto' }), /warn: .*no tiene enlace/);
assert.doesNotMatch(msgs({ variant: 'custom', line: 'Hotel [here](https://example.com)' }), /no tiene enlace|debe incluir/);
assert.doesNotMatch(msgs({ variant: 'custom', line: 'Here {[E-MODIFY REG LINK]}' }), /no tiene enlace/);
console.log('OK: Caja de compra con frase propia (texto libre, enlace propio o de Cvent, negrita) y su revisión.');
