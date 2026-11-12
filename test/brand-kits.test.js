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

// Banners (header, footer, media y gráficos recurrentes) separados de las fotos de los bloques.
{
  const bk = B.defaults('surfcup'); bk.banners = [{ name: 'Gráfico recurrente', url: bk.header.url + '?b=1' }]; bk.assets = [{ name: 'Foto', url: bk.header.url + '?f=1' }];
  const n = B.snapshot(bk), g = B.groups(n);
  assert.equal(n.banners[0].name, 'Gráfico recurrente');
  assert.deepEqual(g.fotos.map(a => a.name), ['Foto'], 'Las fotos no incluyen header, footer ni banner de media');
  assert.ok(g.banners.includes(n.header) && g.banners.includes(n.footer) && g.banners.includes(n.mediaBanner) && g.banners.some(a => a.name === 'Gráfico recurrente'));
  assert.deepEqual(B.snapshot({ ...bk, banners: undefined }).banners, [], 'Kits guardados sin banners siguen siendo válidos');
  assert.throws(() => B.normalize({ ...bk, banners: Array.from({ length: 31 }, () => ({ name: 'B', url: '' })) }, true), /30 banners/);
  console.log('OK: banners del brand kit separados de las imágenes (fotos).');
}

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
  const make = id => { const st = { ...K.fromRecipe('blank'), tournament: id, look: 'classic', franjaLeft: 'Camp', name: 'Prueba', sections: [{ type: 'contacto', d: {} }] }; return [st, K.build(st)]; };
  const [ars, arsHtml] = make('arsenal-exp');
  assert.match(arsHtml, /<title>Arsenal Football Development Clinic – Prueba<\/title>/);
  assert.ok(arsHtml.includes('e1baea18930047838d4054ffe1d0f262.png') && arsHtml.includes('#B4001E'));
  assert.ok(!/'(DinPro\w+|Extenda\d+)'/.test(arsHtml) && arsHtml.includes('font-family:Georgia'), 'Arsenal usa Georgia/Helvetica sin @font-face');
  assert.ok(arsHtml.includes('CONTACTO PENDIENTE') && K.check(ars, arsHtml).some(x => x.level === 'error' && /contacto/.test(x.msg)));
  assert.equal(K.fileBase(ars), 'arsenal-experiences_prueba');
  const [, psgHtml] = make('psg-canada');
  assert.ok(psgHtml.includes('f7af6f3c0aeb49dd880cd60fe6a07804.otf') && psgHtml.includes("format('opentype')") && psgHtml.includes('#004070'));
  const [wc, wcHtml] = make('rmf-wc'), wcChecks = K.check(wc, wcHtml);
  // Desde el 12/11/2026 World Challenge tiene diseño propio: ya no hay header pendiente ni colores provisionales.
  assert.ok(!wcChecks.some(x => /Header de .*PENDIENTE/.test(x.msg)) && !wcChecks.some(x => /provisionales/.test(x.msg)));
  assert.equal(K.CLIENT.tournaments.filter(t => t.club === 'bayern').map(t => t.section).join(), 'CANADA CAMPS,EXPERIENCES');
  console.log('OK: clubs con nombre, fuentes, colores, contacto y pendientes por sección.');
}

// Nueva newsletter desde un guion: instrucciones con torneo y guion, comprobación de textos y avisos.
{
  const script = 'BANNER 1: Título: Summer Camp 2027\nBANNER 2: Texto: Join us in **London** this summer.\nBANNER 3: Foto: jugadores celebrando\nBANNER 4: Botón: Book now\nHora: 10:00';
  const prompt = K.scriptPrompt('arsenal-exp', script);
  assert.ok(prompt.includes('Arsenal · EXPERIENCES') && prompt.includes('"tournament":"arsenal-exp"') && prompt.endsWith(script));
  assert.ok(prompt.includes('PLACEHOLDER') && prompt.includes('PENDIENTE: '));
  const answer = { tournament: 'arsenal-exp', name: 'Summer', sections: [{ type: 'titulo', d: { title: 'Summer Camp 2027', btn: 'Book now' } }, { type: 'intro', d: { text: 'Join us in **London** this summer.' } }, { type: 'imagen', d: { src: 'PLACEHOLDER', alt: 'jugadores celebrando' } }, { type: 'info', d: { text: 'PENDIENTE: horarios' } }] };
  const r = K.importProject(JSON.stringify(answer), 'arsenal-exp');
  assert.deepEqual(K.scriptCoverage(script, r.state), ['10:00'], 'Solo falta la línea que no está en la newsletter');
  const out = K.build(r.state), checks = K.check(r.state, out);
  assert.ok(checks.some(x => /PENDIENTE de redactar/.test(x.msg)) && checks.some(x => /placeholder/.test(x.msg)));
  console.log('OK: guion → instrucciones, comprobación de textos, placeholders y contenido pendiente.');
}

// Vista previa por bloques: marcas solo en la vista previa, nunca en lo exportado.
{
  const st = K.fromRecipe('ref1'), preview = K.build(st, { preview: true }), out = K.build(st);
  assert.equal((preview.match(/data-ksa-section="\d+"/g) || []).length, st.sections.length);
  assert.ok(!out.includes('data-ksa'), 'El HTML que se copia o descarga no lleva marcas del editor');
  const empty = { ...K.fromRecipe('blank'), franjaLeft: 'x' };
  assert.ok(K.build(empty, { preview: true }).includes('data-ksa-empty') && !K.build(empty).includes('data-ksa-empty'));
  console.log('OK: vista previa con bloques marcados y zona vacía, sin afectar al HTML exportado.');
}

// Cursiva: *texto* → <em>, sin tocar asteriscos sueltos ni las negritas.
{
  const h = K.build({ ...K.fromRecipe('blank'), franjaLeft: 'x', sections: [{ type: 'intro', d: { text: 'Hola **neg** y *cur* 2*3' } }] });
  assert.ok(h.includes('<em style="font-style:italic;">cur</em>') && h.includes('neg</strong>') && h.includes(' 2*3'));
  console.log('OK: cursiva en el email.');
}

// Bloque nuevo pendiente de tipo: solo en la vista previa, en la posición pedida.
{
  const st = K.fromRecipe('ref1'), p = K.build(st, { preview: true, pendingAt: 1 });
  const order = [...p.matchAll(/data-ksa-(section="(\d+)"|pending)/g)].map(m => m[2] || 'nuevo');
  assert.deepEqual(order.slice(0, 3), ['0', 'nuevo', '1']);
  assert.ok(K.build(st, { preview: true, pendingAt: 99 }).includes('data-ksa-pending') && !K.build(st).includes('Bloque nuevo'));
  console.log('OK: bloque nuevo pendiente solo en la vista previa.');
}

// Botón sin enlace: se ve en la newsletter y la revisión lo marca como incompleto.
{
  const st = { ...K.fromRecipe('blank'), franjaLeft: 'x', sections: [{ type: 'tarjetas', d: { a_title: 'A', b_title: 'B', b_btn: 'Reserva' } }, { type: 'titulo', d: { title: 'T', btn: 'Ver más' } }] };
  const out = K.build(st), checks = K.check(st, out).filter(x => x.level === 'error').map(x => x.msg).join('\n');
  assert.ok(out.includes('>Reserva</a>') && out.includes('>Ver más</a>'), 'Los botones sin enlace se pintan');
  assert.match(checks, /tarjeta 2\): el botón «Reserva» no tiene enlace/); assert.match(checks, /Título\): el botón «Ver más» no tiene enlace/);
  console.log('OK: botón sin enlace visible y marcado en la revisión.');
}

// Datos de diseño de Bayern y Kaptiva Sports Academy recibidos el 12/11/2026.
{
  const cases = {
    'bayern-canada': { title: 'FC Bayern Soccer Camp', colors: ['#ED0037', '#286CFC'], header: '020025ab69804500ac546ae96b2ffdf4.png', footer: 'e1222579c3d6493381c01e340d4b6ef1.jpg', alt: 'See you in Munich', mail: 'experience@fcbayernsoccercamps.com', font: 'a55077d0af444071a9c0e2c8455ac498.otf' },
    'bayern-exp': { title: 'FC Bayern Soccer Camp', colors: ['#ED0037', '#286CFC'], header: '020025ab69804500ac546ae96b2ffdf4.png', footer: 'e1222579c3d6493381c01e340d4b6ef1.jpg', alt: 'See you in Munich', mail: 'experience@fcbayernsoccercamps.com', font: '61fcb5a326e24f048a37611e055efe23.otf' },
    'academy-short': { title: 'Kaptiva Sports Academy', colors: ['#790B81', '#AF6CB3'], header: '6cc70ed029dd494b80735f821e8158a2.png', footer: '0e125d09d568466780e1bd113486df30.png', alt: 'Kaptiva Sports Academy', mail: 'admissions@kaptivasports.com', font: '4f15fb5051684e46873120016ed52f5a.ttf' },
    'academy-residential': { title: 'Kaptiva Sports Academy', colors: ['#790B81', '#AF6CB3'], header: '6cc70ed029dd494b80735f821e8158a2.png', footer: '0e125d09d568466780e1bd113486df30.png', alt: 'Kaptiva Sports Academy', mail: 'admissions@kaptivasports.com', font: '8ee7cfe4f92440f99df5a47fdee34944.otf' }
  };
  for (const [id, c] of Object.entries(cases)) {
    const st = { ...K.fromRecipe('media', id), look: 'classic' }, out = K.build(st), msgs = K.check(st, out).map(x => x.msg).join('\n');
    assert.ok(out.includes('<title>' + c.title), id + ': título');
    c.colors.forEach(col => assert.ok(out.includes(col), id + ': color ' + col));
    assert.equal((out.match(/#6F4ACC|#91FAFB/gi) || []).length, 0, id + ': sin restos de la paleta KSA');
    assert.ok(out.includes(c.header) && out.includes(c.footer) && out.includes('alt="' + c.alt + '"'), id + ': header y footer');
    assert.ok(out.includes(c.mail), id + ': contacto');
    assert.ok(out.includes(c.font), id + ': fuentes');
    assert.doesNotMatch(msgs, /provisional|PENDIENTE|pendiente|CONTACTO PENDIENTE/, id + ': sin avisos de diseño pendiente');
  }
  assert.match(K.build(K.fromRecipe('media', 'academy-short')), /4f15fb5051684e46873120016ed52f5a\.ttf'\) format\('truetype'\)/, 'Flatory .ttf como truetype');
  console.log('OK: Bayern y Kaptiva Sports Academy con header, footer, colores, fuentes y contacto.');
}

// RMF World Challenge 2027: blanco y dorado, negro/carbón para texto, Georgia/Helvetica sin fuentes web y nunca la paleta KSA.
{
  const st = K.fromRecipe('blank', 'rmf-wc');
  st.name = 'Welcome'; st.franjaLeft = '';
  st.sections = [
    { id: 'a', type: 'titulo', d: { title: 'Welcome', text: 'Hi **there**, see [the site](https://www.example.com).' } },
    { id: 'b', type: 'datos', d: { pre: 'Key dates', title: 'Madrid', l1: 'Arrival', v1: 'July 4' } },
    { id: 'c', type: 'info', d: { title: 'Payments', text: 'Due soon.' } },
    { id: 'd', type: 'contacto', d: {} }
  ];
  const out = K.build(st), body = out.slice(out.indexOf('<body')), msgs = K.check(st, out);
  const allowed = ['#FFFFFF', '#BEA47A', '#F8F5EF', '#EAE5DA', '#000000', '#1F1F1F', '#2B2B2B', '#6B6B6B', '#9A9A9A'];
  const used = [...new Set((out.match(/#[0-9A-Fa-f]{6}\b/g) || []).map(c => c.toUpperCase()))];
  assert.deepEqual(used.filter(c => !allowed.includes(c)), [], 'Solo colores de la paleta WCH');
  assert.ok(out.includes('<title>Real Madrid Foundation World Challenge – Welcome'));
  assert.ok(out.includes('df32a86304cb472599c44c9e4979cf33.png') && out.includes('alt="Real Madrid Foundation World Challenge"'), 'Header WCH');
  assert.ok(out.includes('c2955fb129e34300b1277fc35ad7e793.png') && out.includes('alt="See You in Madrid"'), 'Banner See You in Madrid');
  assert.ok(body.includes('>WORLD CHALLENGE 2027<') && body.includes('>FUNDACIÓN REAL MADRID<'), 'Subheader fijo');
  assert.match(body, /bgcolor="#1F1F1F"[^>]*><table[^>]*><tbody><tr><td align="left"><p style="[^"]*color:#FFFFFF/, 'Subheader carbón con texto blanco');
  assert.ok(out.includes('bgcolor="#FFFFFF" style="background-color:#FFFFFF">'), 'Fondo del email blanco');
  assert.equal((out.match(/@font-face/g) || []).length, 0, 'Sin fuentes web');
  assert.ok(/Georgia/.test(body) && /Helvetica/.test(body));
  assert.match(body, /<strong style="[^"]*color:#000000;">there<\/strong>/, 'Negrita negra');
  assert.match(body, /<a href="https:\/\/www\.example\.com"[^>]*color:#000000/, 'Enlace negro');
  assert.ok(!msgs.some(m => /franja/.test(m.msg) && m.level === 'error'), 'La etiqueta izquierda viene fijada por la marca');
  assert.ok(!msgs.some(m => /provisional|header/i.test(m.msg) && m.level !== 'ok'));
  assert.ok(K.BrandKits.defaults('rmf-wc').assets.some(a => a.url.includes('a13a3c67f33046eb8dc29f11262c117f.jpg')), 'Foto WCH disponible en el panel de imágenes');
  // Enlaces de Cvent que generan su propio enlace: nunca dentro de otro enlace.
  st.sections = [{ id: 'x', type: 'intro', d: { text: '[Register here](https://x.com/{[E-RSVP YES LINK]})' } }];
  const bad = K.build(st);
  assert.ok(K.check(st, bad).some(m => m.level === 'error' && /dentro de otro enlace/.test(m.msg)));
  st.sections = [{ id: 'x', type: 'intro', d: { text: 'Register here: {[E-RSVP YES LINK]}' } }];
  const good = K.build(st);
  assert.ok(!K.check(st, good).some(m => /dentro de otro enlace|no reconocido/.test(m.msg)), 'RSVP suelto y reconocido');
  console.log('OK: RMF World Challenge (paleta por roles, subheader fijo, Georgia/Helvetica, banner final y enlaces de Cvent).');
}

// Componentes del kit de WCH como módulos nuevos (válidos para cualquier marca) y marcas ==etiqueta== / ++subrayado++.
{
  const NEW = ['step', 'glance', 'timeline', 'deadlines', 'fotos3', 'cta', 'boton', 'important', 'wallet'];
  // Tres fotos y Botón suelto quedan como bloques antiguos (sustituidos por «Imagen» y «Botón»): fuera de la paleta, pero se pintan.
  NEW.forEach(type => assert.ok((K.MODULE_ORDER.includes(type) || K.LEGACY[type]) && K.MODULES[type], 'Módulo ' + type));
  const letters = K.MODULE_ORDER.map(t => K.MODULES[t].letter); assert.equal(new Set(letters).size, letters.length, 'Letras únicas');
  const photo = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/a13a3c67f33046eb8dc29f11262c117f.jpg?d=650';
  const data = {
    step: { label: 'Step 1', title: 'Profile', deadline: 'Deadline: May 1', text: 'Upload **docs**.', btn: 'Go', url: 'https://www.example.com', btnStyle: 'gold' },
    glance: { title: 'At a glance', l1: 'Dates', v1: 'July', l2: 'Venue', v2: 'Madrid', l3: 'Players', v3: 'U12' },
    timeline: { d1: 'Day 1', h1: 'Arrival', t1: 'Check-in.', d2: 'Day 2', h2: 'Training' },
    deadlines: { l1: 'Payment', d1: 'May 1', l2: 'Travel', d2: 'June 1' },
    fotos3: { src1: photo, alt1: 'a', src2: photo, alt2: 'b', src3: photo, alt3: 'c' },
    cta: { title: 'Register', line: 'Register here: {[E-RSVP YES LINK]}' },
    boton: { btn: 'View', url: 'https://www.example.com', btnStyle: 'dark' },
    important: { label: 'IMPORTANT', text: 'Bring a **passport**. See [guide](https://www.example.com).' },
    wallet: { title: 'Your ticket' }
  };
  const allowed = ['#FFFFFF', '#BEA47A', '#F8F5EF', '#EAE5DA', '#000000', '#1F1F1F', '#2B2B2B', '#6B6B6B', '#9A9A9A'];
  for (const tid of ['rmf-wc', 'surfcup']) {
    const st = K.fromRecipe('blank', tid); st.name = 'Prueba'; st.franjaLeft = 'Prueba';
    st.sections = NEW.map((type, i) => ({ id: 'n' + i, type, d: Object.assign({}, K.MODULES[type].defaults || {}, data[type]) }));
    const out = K.build(st), msgs = K.check(st, out);
    assert.ok(!/%%C:/.test(out), tid + ': sin roles sin resolver');
    assert.ok(!msgs.some(m => m.level === 'error' && !/contacto/i.test(m.msg)), tid + ': sin errores — ' + msgs.filter(m => m.level === 'error').map(m => m.msg).join(' | '));
    assert.ok(out.includes('href="{[C-PASSBOOK_LINK]}"') && out.includes('href="{[C-GOOGLEWALLET_LINK]}"'), tid + ': wallets');
    if (tid === 'rmf-wc') {
      const used = [...new Set((out.match(/#[0-9A-Fa-f]{6}\b/g) || []).map(c => c.toUpperCase()))];
      assert.deepEqual(used.filter(c => !allowed.includes(c)), [], 'WCH: solo colores de su paleta');
      assert.match(out, /background-color:#1F1F1F;[^"]*"><tbody><tr><td[^>]*><table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:0px;[^"]*"><tbody><tr><td bgcolor="#BEA47A"/, 'Important: caja carbón con etiqueta dorada');
      assert.match(out, /<a href="https:\/\/www\.example\.com" target="_blank" style="color:#FFFFFF;/, 'Important: enlace blanco sobre carbón');
      assert.match(out, /border-radius:4px;"><a href="https:\/\/www\.example\.com"/, 'Botón con esquinas de 4 px');
      assert.ok(!/text-transform:uppercase;text-align:center;word-break:break-word;">At a glance/.test(out) && out.includes('>At a glance<'), 'Títulos sin mayúsculas');
    } else {
      assert.ok(out.includes('#6F4ACC') && !out.includes('#BEA47A'), 'Surf Cup usa su color principal');
    }
  }
  // Marcas de texto
  const st = K.fromRecipe('blank', 'rmf-wc'); st.sections = [{ id: 'x', type: 'intro', d: { text: 'Pay before ==May 1==, it is ++mandatory++. See [a==b](https://x.com/?q=a==b).' } }];
  const out = K.build(st);
  assert.match(out, /<span style="background-color:#BEA47A;color:#000000;font-weight:bold;padding:1px 6px;border-radius:3px;">May 1<\/span>/);
  assert.match(out, /<span style="font-weight:bold;color:#000000;border-bottom:2px solid #BEA47A;">mandatory<\/span>/);
  assert.ok(out.includes('href="https://x.com/?q=a==b"'), 'Las marcas no tocan los enlaces');
  console.log('OK: componentes WCH (step, at a glance, timeline, deadlines, tres fotos, CTA, botón, Important, wallets) y marcas de etiqueta/subrayado.');
}

// Editar el kit de una marca: se guarda, se vuelve a abrir con los cambios y se aplica a sus newsletters con el kit automático.
{
  const mem = {}, st2 = { getItem: k => mem[k] || null, setItem: (k, v) => { mem[k] = v; } };
  B.load(st2);
  const NEW_FOOTER = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
  const draft = B.brandDraft('rmf-usa'); assert.equal(draft.base, 'rmf-usa'); assert.ok(draft.footer.url.includes('db9333ea4c694dcd954c90570f8d30f4'));
  draft.footer.url = NEW_FOOTER; draft.footer.name = 'Nuevo footer';
  const saved = B.save(draft, st2);
  assert.equal(saved.id, 'brand-rmf-usa');
  B.save(Object.assign(B.brandDraft('rmf-usa'), { name: 'Otra vez' }), st2);
  assert.equal(B.all().filter(k => k.base === 'rmf-usa').length, 1, 'Un único kit editado por marca');
  assert.equal(B.custom().length, 0, 'No aparece como kit independiente');
  B.load(st2);
  assert.equal(B.brandDraft('rmf-usa').footer.url, NEW_FOOTER, 'Al volver a abrir conserva el footer nuevo');
  const nl = K.fromRecipe('blank', 'rmf-usa'); nl.franjaLeft = 'x';
  const html = K.build(nl);
  assert.ok(html.includes(NEW_FOOTER) && html.includes('alt="Nuevo footer"') && !html.includes('db9333ea4c694dcd954c90570f8d30f4'), 'La newsletter usa el footer editado');
  assert.ok(!K.build(Object.assign(K.fromRecipe('blank', 'rmf-canada'), { franjaLeft: 'x' })).includes(NEW_FOOTER), 'Las demás secciones no cambian');
  // Una copia aplicada a la newsletter manda sobre el kit de la marca.
  const own = Object.assign(K.fromRecipe('blank', 'rmf-usa'), { franjaLeft: 'x', brandKit: B.snapshot(B.defaults('rmf-usa')) });
  assert.ok(!K.build(own).includes(NEW_FOOTER));
  // WCH editado conserva su paleta por roles (títulos negros, fondo blanco).
  const wch = B.brandDraft('rmf-wc'); wch.footer.url = NEW_FOOTER; B.save(wch, st2);
  const w = K.build(Object.assign(K.fromRecipe('blank', 'rmf-wc'), { sections: [{ id: 'a', type: 'titulo', d: { title: 'Hola' } }] }));
  assert.ok(w.includes(NEW_FOOTER) && w.includes('bgcolor="#FFFFFF" style="background-color:#FFFFFF">') && /color:#000000;text-transform:none/.test(w), 'WCH editado mantiene su estilo');
  B.remove('brand-rmf-usa', st2); B.load(st2);
  assert.equal(B.brandKit('rmf-usa'), null); assert.ok(K.build(nl).includes('db9333ea4c694dcd954c90570f8d30f4'), 'Volver al original');
  B.remove('brand-rmf-wc', st2); B.load(st2);
  console.log('OK: kit de cada marca editable, persistente y aplicado a sus newsletters (y restaurable).');
}

// Editar nunca crea kits: solo crear, duplicar o importar añaden uno nuevo.
{
  const mem = {}, st3 = { getItem: k => mem[k] || null, setItem: (k, v) => { mem[k] = v; } };
  B.load(st3);
  const brand = B.brandDraft('surfcup'); brand.footer.name = 'Editado 1'; B.save(brand, st3);
  const again = B.brandDraft('surfcup'); again.footer.name = 'Editado 2'; B.save(again, st3);
  assert.equal(B.custom().length, 0, 'Editar una marca dos veces no crea kits independientes');
  assert.equal(B.brandDraft('surfcup').footer.name, 'Editado 2');
  const created = B.save(Object.assign(B.empty(), { name: 'Mío' }), st3); assert.equal(B.custom().length, 1);
  const edit = B.find(created.id); edit.footer.name = 'Cambio'; B.save(edit, st3);
  assert.equal(B.custom().length, 1, 'Editar un kit independiente lo actualiza, no lo duplica');
  assert.equal(B.find(created.id).footer.name, 'Cambio');
  B.remove(created.id, st3); assert.equal(B.custom().length, 0, 'Eliminar kit independiente');
  B.remove('brand-surfcup', st3);
  console.log('OK: editar un kit (de marca o independiente) nunca crea otro; eliminar kit independiente.');
}
