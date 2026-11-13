// Ejecutar: node test/franjas.test.js. La franja identificadora de cada kit sigue el formato mayoritario de sus
// newsletters de referencia (docs/brand-kits/referencias/<kit>/*.html): fondo, padding, y tamaño, color, espaciado,
// negrita, cursiva y familia de cada etiqueta. Arsenal sigue la regla expresa del usuario (franja #B4001E, ambas
// etiquetas en blanco y negrita), que prevalece sobre sus referencias (#8B0015 y derecha #FFCCCC normal).
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
for (const f of ['head', 'brands', 'brand-kits', 'brand-designs', 'modules']) require('../js/' + f + '.js');
const K = globalThis.KSA, REF = path.join(__dirname, '../docs/brand-kits/referencias');
const W = /<table\b[^>]*class="wrapper"[^>]*>/g;

// Rasgos comparables de un style inline.
function traits(style) {
  const g = k => (style.match(new RegExp('(?:^|;)\\s*' + k + ':\\s*([^;]+)')) || [])[1];
  const fam = g('font-family') || '';
  return {
    size: g('font-size'), color: (g('color') || '').toUpperCase().replace(/\s/g, ''), tracking: g('letter-spacing'),
    bold: /bold|700|800/.test(g('font-weight') || ''), italic: /italic/.test(g('font-style') || ''), serif: /Georgia/.test(fam)
  };
}
// Franja = la sección que sigue a la imagen del header: fondo, padding y las dos etiquetas.
function franjaOf(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  const body = html.indexOf('<body'), img = html.indexOf('<img', body);
  W.lastIndex = img; const a = W.exec(html); const b = W.exec(html);
  const fr = html.slice(a.index, b ? b.index : undefined);
  const bg = (fr.match(/background-color:\s*(#[0-9A-Fa-f]{6})/g) || []).map(x => x.split(':')[1].trim().toUpperCase()).filter(c => c !== '#FFFFFF')[0];
  const ps = [...fr.matchAll(/<p\b[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/p>/g)];
  return { bg, pad: (fr.match(/padding:\s*([^;"]+)/) || [])[1], bar: /height="?4/.test(fr), lFont: ps[0][1], l: traits(ps[0][1]), r: ps[1] && traits(ps[1][1]), text: ps.map(p => p[2]) };
}
function majority(list) {
  const c = new Map(); list.forEach(x => { const k = JSON.stringify(x); c.set(k, (c.get(k) || 0) + 1); });
  return JSON.parse([...c.entries()].sort((a, b) => b[1] - a[1])[0][0]);
}

let checked = 0;
for (const p of K.Designs.profiles) {
  const dir = path.join(REF, p.id);
  const refs = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => { try { return franjaOf(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return null; } }).filter(x => x && x.r) : [];
  if (!refs.length) continue; // WCH: solo ficha de texto, sin HTML de ejemplo
  const want = majority(refs.map(r => ({ bg: r.bg, pad: r.pad, l: r.l, r: r.r })));
  for (const tid of p.sections) {
    const st = { tournament: tid, name: 'x', off: {}, franjaLeft: 'Registration Confirmation', franjaRight: 'Summer Camps', designVersion: K.Designs.version, sections: [{ type: 'text', d: { text: 'hola' } }] };
    const got = franjaOf(K.build(st));
    if (p.id !== 'rmf-wch') assert.deepEqual(got.text.map(t => t.trim()), ['Registration Confirmation', 'Summer Camps'], tid + ': etiquetas'); // WCH las fija la marca
    assert.equal(got.pad, '12px 40px', tid + ': padding 12/40 como las referencias');
    assert.equal(got.bar, false, tid + ': sin barra inferior de 4 px');
    if (p.id.indexOf('arsenal') === 0) {
      assert.equal(got.bg, '#B4001E', tid + ': franja roja (regla expresa del usuario)');
      for (const side of ['l', 'r']) assert.deepEqual(got[side], { size: '10px', color: '#FFFFFF', tracking: '1px', bold: true, italic: false, serif: false }, tid + ' ' + side);
    } else {
      assert.equal(got.bg, want.bg.toUpperCase(), tid + ': color de fondo de las referencias');
      for (const side of ['l', 'r']) assert.deepEqual(got[side], want[side], tid + ': etiqueta ' + (side === 'l' ? 'izquierda' : 'derecha') + ' como en ' + refs.length + ' referencias');
      // PSG: la negrita del kit es PSG Bold Italic. Experiences la pide en cursiva; Camps escribe «bold» sin cursiva y el navegador
      // engrosa la PSG regular (recta), así que la app usa la regular en negrita (comprobado en el navegador).
      if (p.id === 'psg-experiences') assert.match(got.lFont, /'DinProBold'/, tid + ': PSG Bold Italic');
      if (p.id === 'psg-camps') assert.match(got.lFont, /'DinProRegular'/, tid + ': PSG regular en negrita, recta');
    }
    checked++;
  }
}
assert.equal(checked, 10, 'PSG, Arsenal y RMF (Experiences, Camps USA/Canada y World Challenge)');

// World Challenge (sus dos emails de ejemplo): sin cortes de línea y, en móvil, 9 px sin espaciado como el ejemplo 02.
{
  const st = { tournament: 'rmf-wc', name: 'x', off: {}, franjaLeft: '', designVersion: K.Designs.version, sections: [{ type: 'text', d: { text: 'hola' } }] };
  const html = K.build(st), wch = franjaOf(html);
  assert.deepEqual(wch.text, ['WORLD CHALLENGE 2027', 'FUNDACIÓN REAL MADRID'], 'WCH: etiquetas fijas');
  assert.match(wch.lFont, /white-space:nowrap;word-break:keep-all;/, 'WCH: sin cortes de línea');
  assert.equal((html.match(/<p class="mobile-sub"/g) || []).length, 2, 'WCH: las dos etiquetas con mobile-sub');
  assert.match(html, /@media screen and \(max-width: 480px\) \{\n  \.mobile-sub \{\n    font-size: 9px !important;\n    letter-spacing: 0 !important;/, 'WCH: regla móvil en el head');
  const other = K.build({ ...st, tournament: 'rmf-exp' });
  assert.ok(!other.includes('mobile-sub'), 'Las demás marcas no llevan la regla');
}

// Las newsletters sin designVersion (anteriores a los kits) conservan su franja de siempre.
const old = K.build({ tournament: 'psg-exp', name: 'x', off: {}, franjaLeft: 'X', look: 'auto', sections: [{ type: 'text', d: { text: 'hola' } }] });
assert.match(old, /padding:14px 40px/, 'Franja anterior intacta');
console.log('OK: franjas de ' + checked + ' secciones iguales a sus referencias (WCH incluida).');
