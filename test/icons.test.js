// Ejecutar: node test/icons.test.js. Cada bloque tiene su esquema (miniatura con placeholders) y no toca el email.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const st = { tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: K.MODULE_ORDER.map(type => ({ type, d: {} })) };
const before = K.build(st);
require('../js/block-icons.js');
Object.keys(K.MODULES).forEach(id => {
  const svg = K.blockIcon(id);
  assert.ok(svg && /^<svg class="sk" viewBox="0 0 64 40"[^>]*>[\s\S]*<\/svg>$/.test(svg), id + ' tiene esquema');
  assert.ok(/<(rect|circle|path)\b/.test(svg), id + ' dibuja algo');
});
assert.equal(K.blockIcon('nada'), null, 'Sin esquema: la app usa la letra');
assert.equal(K.build(st), before, 'Los esquemas no cambian el email');
console.log('OK: esquema para los ' + Object.keys(K.MODULES).length + ' bloques (paleta y panel) sin cambiar el email.');
