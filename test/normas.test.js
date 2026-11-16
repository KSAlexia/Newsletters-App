// Ejecutar: node test/normas.test.js. Normas fijadas por el usuario (16/11/2026):
// el Tentative Schedule se mantiene como imagen, los titulares van como título principal y en una línea,
// y los titulares de Bayern llevan un interlineado más ajustado.
const assert = require('node:assert/strict');
for (const f of ['head', 'brands', 'brand-kits', 'brand-designs', 'modules']) require('../js/' + f + '.js');
const K = globalThis.KSA;

// Instrucciones de ChatGPT (importar y guion, con y sin kit): las normas van y al final, para que prevalezcan.
for (const tid of ['psg-exp', 'rmf-wc', 'arsenal-usa', 'bayern-exp', 'surfcup']) {
  for (const p of [K.importPrompt(tid), K.scriptPrompt(tid, '')]) {
    assert.ok(/Tentative Schedule NUNCA se pasa a código/.test(p), tid + ': schedule como imagen');
    assert.ok(/TENTATIVE SCHEDULE[^\n]*images/.test(p), tid + ': cómo montarlo');
    assert.ok(/Titulares: SIEMPRE en una sola línea/.test(p) && /Titulares en UNA sola línea/.test(p), tid + ': titulares en una línea');
    assert.ok(/titulares de sección → title seccion \(estilo de cada marca/.test(p), tid + ': títulos de sección con el estilo de la marca');
    assert.ok(/úsalas SOLO si el original ya muestra esos datos|Sin tarjetas glance que el original no tenga/.test(p), tid + ': tarjetas solo si las tiene el original');
    assert.ok(p.indexOf('NORMAS FIJAS') > p.indexOf('GUÍA DE COMPOSICIÓN'), tid + ': normas tras la guía');
  }
}

// Importación: los saltos de línea de un titular se unen; un schedule convertido en timeline se avisa.
const json = JSON.stringify({ tournament: 'psg-exp', name: 'x', sections: [
  { type: 'title', d: { style: 'principal', text: 'Your Week in Paris,\n{[C-FIRST NAME:TC]}' } },
  { type: 'title', d: { style: 'principal', text: 'Tentative Schedule' } },
  { type: 'timeline', d: { d1: 'Nov 22', t1: 'Arrival' } },
  { type: 'images', d: { f1_src: 'https://custom.cvent.com/x/pix/schedule.png', f1_alt: 'Tentative Schedule' } }
] });
const r = K.importProject(json);
assert.equal(r.state.sections[0].d.text, 'Your Week in Paris, {[C-FIRST NAME:TC]}');
assert.ok(r.notes.some(n => /Módulo 3: el Tentative Schedule ha llegado como timeline/.test(n)), r.notes.join(' | '));
assert.ok(!r.notes.some(n => /Módulo 4/.test(n)), 'La imagen del schedule no se avisa');
// Un timeline que no es el schedule no se avisa.
assert.ok(!K.importProject(JSON.stringify({ tournament: 'psg-exp', sections: [{ type: 'title', d: { style: 'ante', text: 'Your week, day by day' } }, { type: 'timeline', d: { d1: 'Nov 22', t1: 'x' } }] })).notes.length);

// Bayern: interlineado 1,05 × tamaño en su fuente de titulares (newsletters con el diseño actual); el resto, igual.
function titleLh(tid, version) {
  const st = K.fromRecipe('blank', tid); st.sections = [{ type: 'title', d: { style: 'principal', text: 'Your trip' } }];
  if (!version) delete st.designVersion;
  return K.build(st).match(/font-family:'Extenda60'[^"]*?font-size:(\d+)px;line-height:(\d+)px/).slice(1).map(Number);
}
const [size, lh] = titleLh('bayern-exp', true);
assert.equal(lh, Math.ceil(size * 1.05), 'Bayern: ' + size + '/' + lh);
assert.ok(titleLh('bayern-exp', false)[1] > Math.ceil(titleLh('bayern-exp', false)[0] * 1.05), 'Bayern antiguo: sin cambios');
const [ps, pl] = titleLh('psg-canada', true); assert.ok(pl > Math.ceil(ps * 1.05), 'Otros clubs: sin cambios');
console.log('OK: schedule como imagen, titulares en una línea y como principal, interlineado de Bayern.');
