// Ejecutar: node test/brand-kits.test.js. Biblioteca y generación sin navegador.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA, original = K.build(K.fromRecipe('ref1'));
require('../js/brand-kits.js');
const B = K.BrandKits;
assert.equal(K.build(K.fromRecipe('ref1')), original, 'Sin kit aplicado no cambia el HTML existente');
const data = {}, storage = { getItem: k => data[k] || null, setItem: (k,v) => { data[k] = v; } };
B.load(storage); assert.equal(B.all().length, 0);
const kit = B.defaults('surfcup'); kit.name = 'Kit de prueba independiente'; kit.tournament = '';
assert.ok(kit.fonts.Extenda60.endsWith('.ttf'));
assert.equal(K.build({ ...K.fromRecipe('ref1'), brandKit: B.snapshot(kit) }), original, 'Una copia sin cambios reproduce el kit del torneo');
kit.colors.principal = '#123456'; kit.colors.acento = '#abcdef';
kit.fonts.Extenda60 = kit.fonts.DinProRegular;
kit.assets = [{ name: 'Muestra', url: kit.header.url, reference: { name: 'pixel.png', data: 'data:image/png;base64,iVBORw0KGgo=' } }];
const saved = B.save(kit, storage), snapshot = B.snapshot(saved);
assert.ok(saved.id); assert.equal(snapshot.assets[0].reference, undefined);
assert.ok(B.find(saved.id).assets[0].reference);
const st = { ...K.fromRecipe('ref1'), brandKit: snapshot };
const generated = K.build(st);
assert.match(generated, /#123456/); assert.match(generated, /#abcdef/);
assert.ok(!generated.includes('#6F4ACC'));
assert.ok(generated.includes("font-family: 'Extenda60'; font-style: normal; font-weight: 400; src: url('" + kit.fonts.DinProRegular));
assert.ok(generated.includes('{[EMAIL OPT OUT]}'));
const before = JSON.stringify(snapshot); saved.colors.principal = '#ffffff'; B.save(saved, storage);
assert.equal(JSON.stringify(st.brandKit), before, 'Editar la biblioteca no altera la copia aplicada');
assert.equal(K.build(st), generated);
B.load(storage); assert.equal(B.find(saved.id).colors.principal, '#ffffff');
const serialized = K.normalize(JSON.parse(JSON.stringify(st))); assert.equal(K.build(serialized), generated, 'La copia aplicada sobrevive a exportar e importar JSON');
const noImages = B.empty(); noImages.name = 'Sin imágenes';
const emptyHtml = K.build({ ...K.fromRecipe('blank'), brandKit: B.snapshot(noImages) });
assert.ok(!emptyHtml.includes('@font-face')); assert.ok(emptyHtml.includes('{[EMAIL OPT OUT]}'));
assert.ok(K.check({ ...K.fromRecipe('blank'), brandKit: B.snapshot(noImages) }, emptyHtml).some(x => /custom link de header/.test(x.msg)));
for (const value of ['javascript:alert(1)', 'data:image/png;base64,AA==', 'file:///private/a', 'https://custom.cvent.com.evil.test/x.png', 'https://user:pass@custom.cvent.com/x.png']) assert.throws(() => B.url(value, true));
assert.throws(() => B.normalize({ ...kit, colors: { principal: 'red', acento: '#abcdef' } }, true));
assert.throws(() => B.normalize({ ...kit, fonts: { Extenda60: "https://example.com/a');}</style><script>" } }, true));
assert.throws(() => B.normalize({ ...kit, assets: [{ reference: { data: 'data:image/svg+xml;base64,AA==' } }] }, true));
const previous = JSON.stringify(B.all());
assert.throws(() => B.save({ ...saved, name: 'No guardado' }, { setItem() { throw Error('QuotaExceededError'); } }));
assert.equal(JSON.stringify(B.all()), previous, 'Un fallo de guardado no sustituye el kit en memoria');
assert.throws(() => B.load({ getItem() { return '{roto'; } }));
assert.throws(() => B.save(saved, storage), /no se ha cargado/);
console.log('OK: kits independientes, persistencia, copia aplicada, imágenes, fuentes, colores, compatibilidad BASE y validación de datos/guardado.');

const badState = { ...K.fromRecipe('blank'), brandKit: { name: 'Invalido', colors: { principal: 'red', acento: '#ffffff' } } };
assert.doesNotThrow(() => K.build(badState));
assert.ok(K.check(badState, K.build(badState)).some(x => x.level === 'error' && /Brand kit inválido/.test(x.msg)));
const woffKit = B.defaults('surfcup'); woffKit.fonts.Extenda60 = 'https://custom.cvent.com/qa.woff2#v1';
assert.ok(B.fontHtml(K.HEAD, B.snapshot(woffKit)).includes("format('woff2')"));

assert.throws(() => B.normalize({ ...kit, assets: Array.from({ length: 31 }, () => ({ name: 'Extra', url: '' })) }, true), /30 imágenes/);
assert.throws(() => B.normalize({ ...kit, assets: [{ reference: { name: 'grande.png', data: 'data:image/png;base64,' + 'A'.repeat(960000) } }] }, true), /700 KB/);
assert.throws(() => B.normalize({ ...kit, assets: Array.from({ length: 3 }, () => ({ reference: { name: 'local.png', data: 'data:image/png;base64,' + 'A'.repeat(880000) } })) }, true), /tamaño local/);

const upperCaseImage = { ...K.fromRecipe('blank'), sections: [{ type: 'imagen', d: { src: 'https://CUSTOM.CVENT.COM/imagen.png', alt: 'Referencia', size: 'full' } }] };
assert.ok(!K.check(upperCaseImage, K.build(upperCaseImage)).some(x => /custom link de Cvent válido/.test(x.msg)));
upperCaseImage.sections[0].d.src = 'https://custom.cvent.com.evil.test/imagen.png';
assert.ok(K.check(upperCaseImage, K.build(upperCaseImage)).some(x => /custom link de Cvent válido/.test(x.msg)));

// Placeholders de imagen: hueco gris sin asset y error en la revisión para no exportarlo por descuido.
for (const [type, d, width] of [['imagen', { src: 'PLACEHOLDER', alt: '', size: 'full' }, 650], ['imagen', { src: 'PLACEHOLDER', alt: '', size: 'inset' }, 570], ['producto', { title: 'Pack', img: 'PLACEHOLDER' }, 280]]) {
  const st = { ...K.fromRecipe('blank'), franjaLeft: 'Test', sections: [{ type, d }] }, out = K.build(st), checks = K.check(st, out);
  assert.ok(out.includes('IMAGEN PENDIENTE · ' + width + ' px'), type + ' muestra el hueco de ' + width + ' px');
  assert.ok(!out.includes('src="PLACEHOLDER"'), 'El placeholder no se exporta como imagen');
  assert.ok(checks.some(x => x.level === 'error' && /placeholder/.test(x.msg)), 'La revisión marca el placeholder');
  assert.ok(!checks.some(x => /custom link de Cvent válido|falta la descripción/.test(x.msg)), 'Sin errores duplicados por el placeholder');
}
console.log('OK: placeholders de imagen en imagen a sangre, con márgenes y producto.');

// Clubs: nombre, fuentes, colores y pendientes por sección; KSA sigue igual (prueba de igualdad del principio).
{
  const make = id => { const st = { ...K.fromRecipe('blank'), tournament: id, franjaLeft: 'Camp', name: 'Prueba', sections: [{ type: 'contacto', d: {} }] }; return [st, K.build(st)]; };
  const [ars, arsHtml] = make('arsenal-exp');
  assert.match(arsHtml, /<title>Arsenal Football Development Clinic – Prueba<\/title>/);
  assert.ok(arsHtml.includes('e1baea18930047838d4054ffe1d0f262.png') && arsHtml.includes('#B4001E'));
  assert.ok(!/'(DinPro\w+|Extenda\d+)'/.test(arsHtml) && arsHtml.includes('font-family:Georgia'), 'Arsenal usa Georgia/Helvetica sin @font-face');
  assert.ok(arsHtml.includes('CONTACTO PENDIENTE') && K.check(ars, arsHtml).some(x => x.level === 'error' && /contacto/.test(x.msg)));
  assert.equal(K.fileBase(ars), 'arsenal-experiences_prueba');
  const [, psgHtml] = make('psg-canada');
  assert.ok(psgHtml.includes('f7af6f3c0aeb49dd880cd60fe6a07804.otf') && psgHtml.includes("format('opentype')") && psgHtml.includes('#004070'));
  const [wc, wcHtml] = make('rmf-wc'), wcChecks = K.check(wc, wcHtml);
  assert.ok(wcChecks.some(x => /Header de .*PENDIENTE/.test(x.msg)) && wcChecks.some(x => /provisionales/.test(x.msg)));
  assert.equal(K.CLIENT.tournaments.filter(t => t.club === 'bayern').map(t => t.section).join(), 'CANADA CAMPS,EXPERIENCES');
  console.log('OK: clubs con nombre, fuentes, colores, contacto y pendientes por sección.');
}
