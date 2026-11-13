// Ejecutar: node test/textimg.test.js. Bloque «Texto + imagen», escala de Imagen e imagen en Tarjetas.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const U = 'https://custom.cvent.com/x/pix/foto.png';
const one = (type, d) => K.build({ tournament: 'surfcup', name: 'x', off: { header: true, franja: true, footer: true }, sections: [{ type, d }] });

// ---------- Texto + imagen ----------
assert.ok(K.MODULE_ORDER.includes('textimg'), 'Texto + imagen está en la paleta');
let h = one('textimg', { label: 'Good to know', title: 'Your hotel', text: 'Line one\nLine two', img: U, alt: 'Hotel', side: 'right', btn: 'Book', url: 'https://a.b' });
assert.ok(h.indexOf('Your hotel') < h.indexOf(U), 'Imagen a la derecha: el texto va primero');
assert.match(h, /<img src="https:\/\/custom\.cvent\.com\/x\/pix\/foto\.png" alt="Hotel"[^>]*width="275"/, 'Imagen de 275 px por defecto');
assert.match(h, /class="col2" width="271"/, 'Columna de texto: 570 − 275 − 24');
assert.ok(h.includes('GOOD TO KNOW') || h.includes('Good to know'), 'Antetítulo');
assert.ok(h.includes('>Book</a>'), 'Botón opcional');
h = one('textimg', { text: 'Hola', img: U, alt: 'A', side: 'left', imgW: 'small' });
assert.ok(h.indexOf(U) < h.indexOf('Hola'), 'Imagen a la izquierda: la imagen va primero');
assert.match(h, /width="200"/, 'Imagen pequeña: 200 px');
assert.match(one('textimg', { text: 'Hola', img: U, alt: 'A', imgW: 'large' }), /width="340"/, 'Imagen grande: 340 px');
assert.match(one('textimg', { text: 'Hola', img: 'PLACEHOLDER' }), /IMAGEN PENDIENTE · 275 px/, 'Placeholder con la medida');
const revSt = { tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'textimg', d: { text: '', img: '' } }] };
let rev = K.check(revSt, K.build(revSt));
assert.ok(JSON.stringify(rev).includes('Texto + imagen'), 'La revisión avisa de lo que falta');

// ---------- Imagen con escala ----------
h = one('images', { f1_src: U, f1_alt: 'A', scale: '70' });
assert.match(h, /width="399" align="center" style="width:100%;max-width:399px;margin:0 auto;"/, '70 % de 570 = 399 px, centrada');
assert.match(h, /<img [^>]*width="399"/, 'La imagen mide 399 px');
h = one('images', { f1_src: U, f1_alt: 'A', f2_src: U, f2_alt: 'B', f3_src: U, f3_alt: 'C', scale: '55' });
assert.match(h, /width="314"/, 'Tres imágenes al 55 %: fila de 314 px');
assert.equal((h.match(/<img [^>]*width="96"/g) || []).length, 3, 'Cada una de (314 − 24) / 3 = 96 px');
assert.equal(one('images', { f1_src: U, f1_alt: 'A', scale: '' }), one('images', { f1_src: U, f1_alt: 'A' }), 'Sin escala: HTML de siempre');
const sizeF = K.MODULES.images.fields.find(f => f.k === 'size');
assert.equal(sizeF.showIf({ f1_src: U, scale: '70' }), false, 'Con escala no se ofrece a sangre / con márgenes');

// ---------- Tarjetas con imagen ----------
const base = { cN: 2, c1_title: 'A', c1_text: 'x', c2_title: 'B', c2_text: 'y' };
const noPic = one('cards', base);
assert.equal(one('cards', Object.assign({}, base, { imgScale: '50' })), noPic, 'Escala sin imágenes: nada cambia');
h = one('cards', Object.assign({}, base, { c1_img: U, c1_alt: 'Foto A' }));
assert.notEqual(h, noPic);
assert.ok(h.includes('alt="Foto A"'), 'La imagen sale en la tarjeta');
assert.ok(h.indexOf('alt="Foto A"') < h.indexOf('>A</p>'), 'La imagen va encima del título');
assert.equal((h.match(/alt="Foto A"/g) || []).length, 2, 'En escritorio y en móvil');
assert.match(h, /style="width:100%;max-width:100%/, 'En móvil ocupa el ancho de la tarjeta');
h = one('cards', Object.assign({}, base, { c1_img: U, c1_alt: 'Foto A', imgScale: '50' }));
assert.match(h, /style="width:50%;max-width:100%/, 'Escala al 50 % también en móvil');
const scaleF = K.MODULES.cards.fields.find(f => f.k === 'imgScale');
assert.equal(scaleF.showIf(base), false, 'El tamaño solo aparece si hay alguna imagen');
assert.equal(scaleF.showIf(Object.assign({}, base, { c2_img: U })), true);
// Quitar una tarjeta sube también su imagen.
const d = Object.assign({}, base, { cN: 2, c2_img: U, c2_alt: 'Foto B' });
K.MODULES.cards.fields.find(f => f.type === 'opt' && f.n === 1).remove(d);
assert.equal(d.c1_img, U); assert.equal(d.c1_alt, 'Foto B'); assert.equal(d.c2_img, undefined);

// Instrucciones de ChatGPT
const prompt = K.scriptPrompt ? K.scriptPrompt('surfcup') : '';
assert.ok(!prompt || prompt.includes('textimg'), 'La guía de composición habla de textimg');

console.log('OK: Texto + imagen, escala de Imagen e imagen en Tarjetas.');
