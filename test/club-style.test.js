// Ejecutar: node test/club-style.test.js. Estilo de club (referencia: «Essential Pack» de PSG) y su guía para ChatGPT.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/brand-kits.js'); require('../js/modules.js');
const K = globalThis.KSA;
const imp = (o, t) => K.importProject(JSON.stringify(o), t || 'surfcup').state;
const body = h => h.slice(h.indexOf('<body'));

{ // Las nuevas (importadas o desde receta) llevan look 'auto'; las guardadas sin look pasan a 'classic' y no cambian.
  assert.equal(imp(K.REFERENCE_CLUB).look, 'auto'); assert.equal(K.fromRecipe('blank', 'psg-exp').look, 'auto');
  assert.equal(K.normalize({ tournament: 'psg-exp', sections: [] }).look, 'classic');
  const ref = imp(K.REFERENCE_CLUB);
  assert.equal(K.importProject(JSON.stringify(K.REFERENCE_CLUB), 'surfcup').notes.length, 0, 'La referencia se importa sin avisos');
  const classic = K.build(Object.assign({}, ref, { look: 'classic' })), club = K.build(ref);
  assert.notEqual(classic, club);
  assert.ok(!K.lookIsClub({ look: 'auto' }, K.tournament('surfcup')), 'Los torneos no cambian');
  assert.ok(!K.lookIsClub({ look: 'auto' }, K.tournament('academy-short')), 'Kaptiva Sports Academy no cambia');
  assert.ok(!K.lookIsClub({ look: 'auto' }, K.tournament('rmf-wc')), 'Una sección con estilo propio (WCH) no cambia');
  console.log('OK: estilo «auto» en las nuevas y «classic» en las guardadas antes; torneos, Academy y WCH sin cambios.');
}
{ // Lo que hace que se parezca a la de PSG.
  const h = body(K.build(imp(K.REFERENCE_CLUB)));
  assert.ok(h.includes('bgcolor="#004070" style="padding:14px 40px;background-color:#004070;"'), 'Franja del color principal');
  assert.ok(/color:#FFFFFF;letter-spacing:3px;text-transform:uppercase;word-break:break-word;">Paris Saint-Germain Academy Clinic/.test(h), 'Texto blanco en la franja');
  assert.ok(h.includes('>November 2026 · Paris</p>'), 'Etiqueta derecha de la franja');
  assert.ok(/font-size:32px;line-height:40px;color:#004070;text-transform:none;[^"]*">Your Week in Paris,<br \/>\{\[C-FIRST NAME:TC\]\}/.test(h), 'Título sin mayúsculas, 32 px, con salto de línea');
  assert.ok(h.includes('color:#444444;'), 'Texto gris oscuro'); assert.ok(!/color:#000000;/.test(h));
  assert.ok(/color:#FFFFFF;letter-spacing:2px;text-transform:uppercase;word-break:break-word;padding-bottom:8px;">Clinic dates/.test(h), 'Etiqueta blanca en los recuadros oscuros');
  assert.ok(/border:2px solid #E30613;[^>]*>[\s\S]{0,400}Final payment</.test(h), 'Recuadro claro con el acento');
  assert.ok(/Nov 22 – 28<br \/>2026/.test(h), 'Salto de línea en un dato');
  assert.equal((h.match(/class="tl-day"/g) || []).length, 3, 'Timeline apilable en móvil');
  assert.ok(/border:2px solid #E30613;border-radius:8px[^>]*><tbody><tr><td align="center" style="padding:24px 26px;"><p[^>]*>Any questions about your pack\?/.test(h), 'Caja con borde del acento y título dentro');
  assert.ok(K.build(imp(K.REFERENCE_CLUB)).includes('.tl-day, .tl-body {'), 'Regla móvil del timeline');
  console.log('OK: la referencia de PSG sale con franja, títulos, textos, recuadros, timeline y caja final como el original.');
}
{ // Otros clubs: mismo estilo con sus colores.
  const a = body(K.build(imp(Object.assign({}, K.REFERENCE_CLUB, { tournament: 'arsenal-exp' }))));
  assert.ok(a.includes('background-color:#B4001E;"') && a.includes('border:2px solid #8B0015;'));
  console.log('OK: el estilo de club se adapta a los colores de cada club (Arsenal).');
}
{ // Instrucciones de ChatGPT: guía de composición y ejemplo de referencia en las dos.
  [K.importPrompt(), K.scriptPrompt('psg-exp', 'x')].forEach(p => {
    assert.match(p, /GUÍA DE COMPOSICIÓN/); assert.match(p, /deadlines \(l = qué es, d = la fecha\)/);
    assert.match(p, /box \(suave\) con el title DENTRO/); assert.match(p, /"fmt":"puntos"/);
    assert.ok(p.includes(JSON.stringify(K.REFERENCE_CLUB)));
  });
  console.log('OK: las instrucciones de ChatGPT llevan la guía de composición y la newsletter de referencia.');
}
