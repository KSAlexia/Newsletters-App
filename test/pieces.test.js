// Ejecutar: node test/pieces.test.js. Piezas mínimas (Título, Texto, Lista, Botón, Imagen, Tarjetas):
// la misma combinación que hacía un bloque antiguo genera EXACTAMENTE el mismo HTML.
const assert = require('node:assert/strict');
require('../js/head.js'); require('../js/brands.js'); require('../js/modules.js');
const K = globalThis.KSA;
const TOURNAMENTS = K.CLIENT.tournaments.map(t => t.id);
// HTML completo sin los comentarios internos <!-- [n] TIPO --> (no se ven y cambian al agrupar piezas).
const html = (sections, t) => K.build({ tournament: t || 'surfcup', name: 'Prueba', off: {}, franjaLeft: '', sections: sections.map(([type, d]) => ({ type, d: d || {} })) }).replace(/<!-- \[\d+\] [^\n]*-->\n/g, '');
const same = (label, oldSecs, newSecs) => TOURNAMENTS.forEach(t => assert.equal(html(newSecs, t), html(oldSecs, t), label + ' (' + t + ')'));

const TXT = 'Primer párrafo con **negrita** y [enlace](https://example.com).\nSegundo párrafo.';
same('Título centrado = Título + Texto + Botón', [['titulo', { title: 'Join us', text: TXT, btn: 'Register', url: 'https://example.com/r' }]], [['title', { text: 'Join us' }], ['text', { text: TXT }], ['button', { btn: 'Register', url: 'https://example.com/r' }]]);
same('Título centrado solo = Título', [['titulo', { title: 'Solo título' }]], [['title', { text: 'Solo título' }]]);
same('Título centrado con texto = Título + Texto', [['titulo', { title: 'T', text: TXT }]], [['title', { text: 'T' }], ['text', { text: TXT }]]);
same('Título centrado con botón = Título + Botón', [['titulo', { title: 'T', btn: 'Go', url: 'https://example.com' }]], [['title', { text: 'T' }], ['button', { btn: 'Go', url: 'https://example.com' }]]);
same('Título con cifras (fuente de números)', [['titulo', { title: 'Save 20% until May 1' }]], [['title', { text: 'Save 20% until May 1' }]]);
same('Intro con saludo = Título saludo + Texto', [['intro', { greet: 'Dear {[C-FIRST NAME]},', text: TXT }]], [['title', { text: 'Dear {[C-FIRST NAME]},', style: 'saludo' }], ['text', { text: TXT }]]);
same('Intro sin saludo = Texto', [['intro', { text: TXT }]], [['text', { text: TXT }]]);
same('Intro vacío = Texto vacío', [['intro', {}]], [['text', {}]]);
same('Título + lista = Título sección + Lista', [['lista', { title: 'Delivery Details', items: 'Uno\n**Dos**\nTres' }]], [['title', { text: 'Delivery Details', style: 'seccion' }], ['list', { items: 'Uno\n**Dos**\nTres' }]]);
same('Cierre con texto = Título entre líneas + Texto', [['cierre', { title: 'See you soon', text: TXT }]], [['title', { text: 'See you soon', style: 'entre' }], ['text', { text: TXT }]]);
same('Cierre sin texto = Título entre líneas', [['cierre', { title: 'See you soon' }]], [['title', { text: 'See you soon', style: 'entre' }]]);
same('Botón suelto = Botón', [['boton', { btn: 'Buy', url: 'https://example.com', btnStyle: 'gold' }]], [['button', { btn: 'Buy', url: 'https://example.com', btnStyle: 'gold' }]]);
same('Botón suelto oscuro = Botón oscuro', [['boton', { btn: 'Buy', url: 'https://example.com', btnStyle: 'dark' }]], [['button', { btn: 'Buy', url: 'https://example.com', btnStyle: 'dark' }]]);
const IMG = 'https://custom.cvent.com/5A4954AC75CF473B9BB504EB993966CD/pix/f28d166daebf47be89484d1c49deaf1f.png';
same('Imagen a sangre = Imagen (1)', [['imagen', { src: IMG, alt: 'Foto', size: 'full' }]], [['images', { f1_src: IMG, f1_alt: 'Foto', size: 'full' }]]);
same('Imagen con márgenes = Imagen (1, con márgenes)', [['imagen', { src: IMG, alt: 'Foto', size: 'inset' }]], [['images', { f1_src: IMG, f1_alt: 'Foto', size: 'inset' }]]);
same('Imagen placeholder', [['imagen', { src: 'PLACEHOLDER', alt: 'x', size: 'inset' }]], [['images', { f1_src: 'PLACEHOLDER', f1_alt: 'x', size: 'inset' }]]);
same('Tres fotos en fila = Imagen (3)', [['fotos3', { src1: IMG, alt1: 'A', src2: IMG, alt2: 'B', src3: 'PLACEHOLDER', alt3: 'C' }]], [['images', { f1_src: IMG, f1_alt: 'A', f2_src: IMG, f2_alt: 'B', f3_src: 'PLACEHOLDER', f3_alt: 'C' }]]);
same('Dos tarjetas = Tarjetas (2 claras)', [['tarjetas', { a_label: 'Step 1', a_title: 'Register', a_price: '$49', a_text: TXT, a_btn: 'Go', a_url: 'https://a.com', b_title: 'Pay', b_text: 'Otro', b_btn: 'Pay', b_url: 'https://b.com' }]],
  [['cards', { c1_label: 'Step 1', c1_title: 'Register', c1_price: '$49', c1_text: TXT, c1_btn: 'Go', c1_url: 'https://a.com', c2_title: 'Pay', c2_text: 'Otro', c2_btn: 'Pay', c2_url: 'https://b.com' }]]);
// Una newsletter completa hecha con piezas = la misma hecha con bloques antiguos.
same('Newsletter completa', [['intro', { greet: 'Dear Coach,', text: TXT }], ['titulo', { title: 'Big news', text: TXT, btn: 'Read', url: 'https://example.com' }], ['lista', { title: 'Details', items: 'A\nB' }], ['imagen', { src: IMG, alt: 'x' }], ['cierre', { title: 'Bye', text: 'Thanks' }], ['boton', { btn: 'Go', url: 'https://example.com' }]],
  [['title', { text: 'Dear Coach,', style: 'saludo' }], ['text', { text: TXT }], ['title', { text: 'Big news' }], ['text', { text: TXT }], ['button', { btn: 'Read', url: 'https://example.com' }], ['title', { text: 'Details', style: 'seccion' }], ['list', { items: 'A\nB' }], ['images', { f1_src: IMG, f1_alt: 'x' }], ['title', { text: 'Bye', style: 'entre' }], ['text', { text: 'Thanks' }], ['button', { btn: 'Go', url: 'https://example.com' }]]);
// Fase 3: Caja.
same('Banda informativa = Caja suave', [['info', { text: TXT }]], [['box', { text: TXT }]]);
same('Banda informativa vacía = Caja vacía', [['info', {}]], [['box', {}]]);
same('Banda informativa con título = Título sección + Caja suave', [['info', { title: 'Before you travel', text: TXT }]], [['title', { text: 'Before you travel', style: 'seccion' }], ['box', { text: TXT }]]);
same('Step = Caja suave con etiqueta, título, fecha y botón', [['step', { label: 'Step 1', title: 'Profile', deadline: 'Deadline: May 1', text: TXT, btn: 'Go', url: 'https://example.com', btnStyle: 'gold' }]],
  [['box', { style: 'suave', label: 'Step 1', title: 'Profile', deadline: 'Deadline: May 1', text: TXT, btn: 'Go', url: 'https://example.com', btnStyle: 'gold' }]]);
same('Step solo con título', [['step', { title: 'Profile', btnStyle: 'dark' }]], [['box', { title: 'Profile', btnStyle: 'dark' }]]);
same('Llamada a la acción = Caja con borde', [['cta', { title: 'Register', text: TXT, line: 'Register here: {[E-RSVP YES LINK]}', btn: 'Go', url: 'https://example.com', btnStyle: 'dark' }]],
  [['box', { style: 'borde', title: 'Register', text: TXT, line: 'Register here: {[E-RSVP YES LINK]}', btn: 'Go', url: 'https://example.com', btnStyle: 'dark' }]]);
same('Important = Caja oscura', [['important', { label: 'IMPORTANT', text: TXT }]], [['box', { style: 'oscura', label: 'IMPORTANT', text: TXT }]]);
same('Important con otra etiqueta', [['important', { label: 'Heads up', text: 'x' }]], [['box', { style: 'oscura', label: 'Heads up', text: 'x' }]]);
same('Newsletter con cajas', [['intro', { text: TXT }], ['info', { title: 'Info', text: TXT }], ['step', { label: 'Step 2', title: 'Pay' }], ['cta', { title: 'Join' }], ['important', { text: 'Careful' }], ['lista', { title: 'L', items: 'a' }]],
  [['text', { text: TXT }], ['title', { text: 'Info', style: 'seccion' }], ['box', { text: TXT }], ['box', { label: 'Step 2', title: 'Pay' }], ['box', { style: 'borde', title: 'Join' }], ['box', { style: 'oscura', text: 'Careful' }], ['title', { text: 'L', style: 'seccion' }], ['list', { items: 'a' }]]);
console.log('OK: las piezas nuevas generan el mismo HTML que los bloques antiguos equivalentes, en los ' + TOURNAMENTS.length + ' torneos y secciones.');

// Reglas de encadenado.
{
  const g = secs => K.flowGroups(secs.map(([type, d]) => ({ type, d: d || {} }))).map(x => x.align ? (x.end - x.start + 1) + x.align[0] : '1');
  assert.deepEqual(g([['title'], ['text'], ['button']]), ['3c'], 'Título + Texto + Botón en una celda');
  assert.deepEqual(g([['title'], ['text', { align: 'left' }]]), ['1c', '1l'], 'Un texto con otra alineación va aparte');
  assert.deepEqual(g([['text'], ['title'], ['text']]), ['1l', '2c'], 'Un título empieza celda nueva');
  assert.deepEqual(g([['title'], ['button'], ['text']]), ['2c', '1l'], 'Tras un botón, celda nueva (el texto suelto va a la izquierda)');
  assert.deepEqual(g([['title', { style: 'seccion' }], ['list'], ['text']]), ['3l'], 'Lista y texto a la izquierda siguen juntos');
  assert.deepEqual(g([['title', { style: 'entre' }], ['text'], ['button']]), ['2c', '1c'], 'Tras un cierre, el botón va suelto');
  assert.deepEqual(g([['text'], ['button']]), ['1l', '1c'], 'Tras un texto sin título principal, el botón va suelto');
  assert.deepEqual(g([['title'], ['list']]), ['1c', '1l'], 'Una lista no entra en una celda centrada');
  assert.deepEqual(g([['title'], ['cards'], ['text']]), ['1c', '1', '1l'], 'Un bloque que no es pieza corta la celda');
  assert.deepEqual(g([['title', { style: 'seccion' }], ['box', { text: 'x' }], ['text']]), ['2l', '1l'], 'Título de sección + caja suave juntos; tras la caja, celda nueva');
  assert.deepEqual(g([['title', { style: 'seccion' }], ['box', { title: 'Step' }]]), ['1l', '1'], 'Una caja con título no se une al título de encima');
  assert.deepEqual(g([['title'], ['box', { text: 'x' }]]), ['1c', '1'], 'Tras un título principal, la caja va aparte');
  console.log('OK: reglas de encadenado (título abre celda, botón la cierra, alineación y bloques normales la cortan).');
}

// Imagen de 1 a 3, editor y vista previa.
{
  const two = html([['images', { f1_src: IMG, f1_alt: 'A', f2_src: IMG, f2_alt: 'B' }]]);
  assert.equal((two.match(/class="col2" width="279"/g) || []).length, 2, 'Dos imágenes en fila (se apilan en móvil)');
  assert.equal(K.imagesCount({}), 1); assert.equal(K.MODULES.images.fields.filter(f => f.type === 'opt').length, 3, 'Máximo 3 imágenes');
  // En la vista previa, cada pieza de una celda se puede seleccionar por separado.
  const pv = K.build({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: '', sections: [{ type: 'title', d: { text: 'T' } }, { type: 'text', d: { text: 'P' } }] }, { preview: true });
  assert.ok(pv.includes('<div data-ksa-section="0">') && pv.includes('<div data-ksa-section="1">'));
  // El «Bloque nuevo» entre dos piezas las separa solo en la vista previa.
  const pend = K.build({ tournament: 'surfcup', name: 'x', off: {}, franjaLeft: '', sections: [{ type: 'title', d: { text: 'T' } }, { type: 'text', d: { text: 'P' } }] }, { preview: true, pendingAt: 1 });
  assert.ok(pend.includes('data-ksa-pending'));
  console.log('OK: Imagen de 1 a 3, piezas seleccionables en la vista previa y bloque nuevo entre piezas.');
}

// Paleta e instrucciones de ChatGPT: piezas nuevas sí, bloques antiguos no (pero se siguen aceptando).
{
  ['title', 'text', 'list', 'images', 'button', 'cards', 'box'].forEach(t => assert.ok(K.MODULE_ORDER.includes(t), t + ' en la paleta'));
  Object.keys(K.LEGACY).forEach(t => { assert.ok(!K.MODULE_ORDER.includes(t), t + ' fuera de la paleta'); assert.ok(K.MODULES[t], t + ' se sigue pintando'); });
  const r = K.importProject(JSON.stringify({ tournament: 'surfcup', sections: [{ type: 'titulo', d: { title: 'Old' } }, { type: 'title', d: { text: 'New', style: 'saludo' } }] }), 'surfcup');
  assert.deepEqual(r.state.sections.map(s => s.type), ['titulo', 'title']);
  console.log('OK: paleta con las piezas nuevas; los bloques antiguos se siguen pintando e importando.');
}

// Caja vacía: en la vista previa sale con un texto guía gris (sola o tras un Título de sección); nunca en el email ni en los datos.
{
  const K = globalThis.KSA;
  const st = { tournament: 'surfcup', name: 'x', off: {}, franjaLeft: 'X', sections: [{ type: 'box', d: { style: 'suave' } }, { type: 'title', d: { text: 'T', style: 'seccion' } }, { type: 'box', d: {} }] };
  const p = K.build(st, { preview: true }), e = K.build(st);
  assert.equal((p.match(/Caja vacía · escribe su texto/g) || []).length, 2);
  assert.ok(!/Caja vacía|KSA_CAJA/.test(e), 'El email no lleva el texto guía');
  assert.deepEqual(st.sections[0].d, { style: 'suave' }, 'No se rellena el bloque');
  assert.ok(!K.build({ ...st, sections: [{ type: 'box', d: { text: 'Hola' } }] }, { preview: true }).includes('Caja vacía'));
  console.log('OK: Caja vacía visible en la vista previa con texto guía, sin tocar el email ni los datos.');
}
