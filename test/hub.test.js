// Ejecutar: node test/hub.test.js. Sin dependencias externas.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
require('../js/hub.js');
const H = globalThis.KSA.Hub;
const folders = { a: { tournament: 'fit', parent: '' }, b: { tournament: 'fit', parent: 'a' }, c: { tournament: 'fit', parent: 'b' }, d: { tournament: 'mic', parent: '' } };
assert.equal(H.canMove(folders, 'a', 'c'), false);
assert.equal(H.canMove(folders, 'a', 'a'), false);
assert.equal(H.canMove(folders, 'a', 'd'), false);
assert.equal(H.canMove(folders, 'c', 'a'), true);
assert.equal(H.canMove(folders, 'c', ''), true);
const items = [{ id: '1', name: 'Zeta', updated: 1 }, { id: '2', name: 'Álbum', updated: 3 }, { id: '3', name: 'Beta', updated: 2 }];
for (const [mode, expected] of [['az', '231'], ['za', '132'], ['newest', '231'], ['oldest', '132'], ['manual', '312']]) {
  assert.equal(H.sort(items, mode, ['3','1','2']).map(x => x.id).join(''), expected);
}
const date = new Date(2026, 10, 11, 23, 59).getTime();
assert.equal(H.matches({ name: 'Álbum', updated: date }, 'album', '2026-11-11', '2026-11-11'), true);
assert.equal(H.matches({ name: 'Álbum', updated: date }, '', '', '2026-11-10'), false);

// Integración del hub con almacenamiento y eventos en un DOM mínimo.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.handlers = {}; this.value = ''; this.textContent = ''; this.dataset = {}; this.style = { setProperty() {} }; this.hidden = false; this.classList = { add() {}, remove() {}, toggle() {} }; }
  set innerHTML(v) { this.children = []; }
  get innerHTML() { return ''; }
  setAttribute(k,v) { this[k] = v; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(k,fn) { this.handlers[k] = fn; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  focus() {}
  select() {}
  setCustomValidity(v) { this.validationMessage = v; }
  reportValidity() {}
  getAttribute(k) { return this[k]; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  click() { if (this.onclick) this.onclick(); if (this.handlers.click) this.handlers.click.call(this, { stopPropagation() {}, preventDefault() {} }); }
}
function boot(storage, session = {}, designCatalog = false) {
  const nodes = {}, html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  for (const match of html.matchAll(/id="([^"]+)"/g)) nodes['#' + match[1]] = new Element('div');
  nodes['details.more'] = new Element('details');
  const prompts = [], alerts = [], windowEvents = {};
  const document = { body: new Element('body'), createElement: tag => new Element(tag), querySelector: key => { if (key.startsWith('[data-hub-id=') || key.startsWith('[data-tree-toggle=')) return null; if (!nodes[key]) throw Error('Missing node: ' + key); return nodes[key]; }, querySelectorAll: () => [] };
  const context = { document, console, Date, URL, setTimeout, clearTimeout, localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => { storage[k] = v; }, removeItem: k => { delete storage[k]; } }, prompt: () => prompts.shift(), confirm: () => true, alert: t => alerts.push(t), sessionStorage: { getItem: k => session[k] || null, setItem: (k,v) => { session[k] = v; } }, addEventListener(k, fn) { windowEvents[k] = fn; } };
  context.window = context; vm.createContext(context);
  for (const file of ['head','brands',...(designCatalog ? ['brand-designs'] : []),'brand-kits','history','modules','block-icons','hub','app']) vm.runInContext(fs.readFileSync(__dirname + '/../js/' + file + '.js', 'utf8'), context);
  const walk = node => [node, ...node.children.flatMap(walk)];
  const clickText = text => { const button = walk(nodes['#folders']).find(n => n.tag === 'button' && walk(n).some(child => child.textContent === text)); assert.ok(button, 'Button: ' + text); button.click(); };
  // Texto del diálogo de avisos de la app (sustituye a los alert del navegador).
  const noticeText = () => nodes['#notice-dialog'].open ? [nodes['#notice-title'].textContent, ...walk(nodes['#notice-body']).map(n => n.textContent || '')].join('\n') : undefined;
  return { nodes, prompts, alerts, noticeText, clickText, fire(type) { windowEvents[type](); }, change(id, value) { const node = nodes[id]; node.value = value; node.handlers.change.call(node); } };
}
const PROJ = 'kaptiva-newsletters-projects-v1', HUB = 'kaptiva-newsletters-hub-v1';
const storage = { [PROJ]: JSON.stringify({ old: { id: 'old', updated: 123, state: { tournament: 'surfcup', name: 'Original', sections: [], off: {}, franjaLeft: '' } } }) };
let ui = boot(storage);
ui.clickText('Surf Cup 2026');
ui.nodes['#new-folder'].click(); ui.nodes['#folder-name'].value = 'Ventas'; ui.nodes['#folder-form'].onsubmit({ preventDefault() {} });
ui.clickText('📁 Ventas');
ui.nodes['#new-folder'].click(); ui.nodes['#folder-name'].value = 'Noviembre'; ui.nodes['#folder-form'].onsubmit({ preventDefault() {} });
ui.clickText('📁 Noviembre');
// Un nombre de solo espacios no crea una carpeta ni cierra el diálogo.
const folderCount = Object.keys(JSON.parse(storage[HUB]).folders).length;
ui.nodes['#new-folder'].click(); ui.nodes['#folder-name'].value = '  ';
ui.nodes['#folder-form'].onsubmit({ preventDefault() {} });
assert.equal(Object.keys(JSON.parse(storage[HUB]).folders).length, folderCount);
assert.ok(ui.nodes['#folder-name'].validationMessage);
assert.equal(ui.nodes['#folder-dialog'].open, true);
ui.nodes['#folder-cancel'].click();
ui.nodes['#new'].click();
ui.nodes['#name'].value = 'Nueva newsletter'; ui.nodes['#name'].handlers.input.call(ui.nodes['#name']);
ui.nodes['#back'].click();
let saved = JSON.parse(storage[PROJ]), newProject = Object.values(saved).find(p => p.state.name === 'Nueva newsletter');
let org = JSON.parse(storage[HUB]), nested = Object.values(org.folders).find(f => f.name === 'Noviembre');
assert.equal(newProject.folder, nested.id);
assert.equal(newProject.state.tournament, 'surfcup');
assert.equal(newProject.state.sections.length, 0);
assert.match(fs.readFileSync(__dirname + '/../index.html', 'utf8'), /<button[^>]*id="new"[^>]*>＋ Nueva newsletter<\/button>/);
assert.equal(saved.old.updated, 123);
ui.change('#hub-sort', 'az');
ui.clickText('Duplicar');
assert.equal(Object.values(JSON.parse(storage[PROJ])).filter(p => p.folder === nested.id).length, 2);
// Reabrir no altera la fecha, y la carpeta sobrevive al guardado del editor.
const before = JSON.parse(storage[PROJ])[newProject.id].updated;
ui.clickText('Nueva newsletter'); ui.nodes['#back'].click();
assert.equal(JSON.parse(storage[PROJ])[newProject.id].updated, before);
assert.equal(JSON.parse(storage[PROJ])[newProject.id].folder, nested.id);
// Recarga: estructura y orden por carpeta permanecen.
ui = boot(storage); ui.clickText('Surf Cup 2026'); ui.clickText('📁 Ventas'); ui.clickText('📁 Noviembre');
assert.equal(ui.nodes['#hub-sort'].value, 'az');
// Mover una newsletter a la raíz.
ui.clickText('Mover'); ui.nodes['#move-destination'].value = ''; ui.nodes['#move-confirm'].click();
assert.equal(Object.values(JSON.parse(storage[PROJ])).filter(p => p.folder === nested.id).length, 1);
// Cambiar de torneo saca el proyecto de una carpeta incompatible.
ui.clickText('Nueva newsletter (copia)'); ui.change('#tournament', 'fit'); ui.nodes['#back'].click();
assert.equal(Object.values(JSON.parse(storage[PROJ])).find(p => p.state.tournament === 'fit').folder, '');
assert.equal(ui.alerts.length, 0);
console.log('OK: ordenación, fechas inclusivas, ciclos, carpetas anidadas, migración, duplicación, movimiento, cambio de torneo y persistencia.');

// Fecha exacta: plegado no cuenta como contenido; editar sí (no solo resolución de minutos de la UI).
let persisted = JSON.parse(storage[PROJ]);
const moved = Object.values(persisted).find(p => p.state.name === 'Nueva newsletter');
moved.updated = 123;
moved.state.sections = [{ id: 'intro-test', type: 'intro', d: { text: 'Texto' }, open: true }];
storage[PROJ] = JSON.stringify(persisted);
ui = boot(storage); ui.clickText('Surf Cup 2026'); ui.clickText('Nueva newsletter');
const detail = ui.nodes['#sections'].children[0];
detail.open = false; detail.handlers.toggle(); ui.nodes['#back'].click();
assert.equal(JSON.parse(storage[PROJ])[moved.id].updated, 123);
ui.clickText('Nueva newsletter'); ui.nodes['#name'].value = 'Texto cambiado'; ui.nodes['#name'].handlers.input.call(ui.nodes['#name']); ui.nodes['#back'].click();
assert.ok(JSON.parse(storage[PROJ])[moved.id].updated > 123);
console.log('OK: diálogo de carpetas y fecha exacta de plegado/edición.');

// Restricciones también a través de los controles del hub.
const guardStorage = { [PROJ]: JSON.stringify({ p: { id: 'p', folder: 'child', updated: 123, state: { tournament: 'surfcup', name: 'Hija', sections: [], off: {} } } }), [HUB]: JSON.stringify({ folders: { parent: { id: 'parent', name: 'Padre', parent: '', tournament: 'surfcup', updated: 123 }, child: { id: 'child', name: 'Hijo', parent: 'parent', tournament: 'surfcup', updated: 123 }, other: { id: 'other', name: 'Otro torneo', parent: '', tournament: 'fit', updated: 123 } }, sorts: {}, orders: {} }) };
ui = boot(guardStorage); ui.clickText('Surf Cup 2026');
ui.clickText('Eliminar');
assert.match(ui.noticeText(), /Solo se pueden eliminar carpetas vacías/);
assert.ok(JSON.parse(guardStorage[HUB]).folders.parent);
ui.clickText('Mover');
assert.deepEqual(ui.nodes['#move-destination'].children.map(n => n.value), ['']);
ui.nodes['#move-cancel'].click();
ui.clickText('Renombrar'); ui.nodes['#folder-name'].value = ' Padre ';
ui.nodes['#folder-form'].onsubmit({ preventDefault() {} });
assert.equal(JSON.parse(guardStorage[HUB]).folders.parent.updated, 123);
ui.clickText('Renombrar'); ui.nodes['#folder-name'].value = 'Padre renombrado';
ui.nodes['#folder-form'].onsubmit({ preventDefault() {} });
assert.ok(JSON.parse(guardStorage[HUB]).folders.parent.updated > 123);
console.log('OK: protección de contenido, destinos sin ciclos/otros torneos y renombrado sin cambios.');

// Arrastrar newsletters: solo arrastres internos, ubicaciones válidas y sin tocar contenido/fecha.
const dragStorage = { [PROJ]: JSON.stringify({ drag: { id: 'drag', folder: '', updated: 123, state: { tournament: 'surfcup', name: 'Arrastrable', sections: [], off: {} } } }), [HUB]: JSON.stringify({ folders: { target: { id: 'target', name: 'Destino', parent: '', tournament: 'surfcup', updated: 123 } }, sorts: {}, orders: {} }) };
const walkDrag = node => [node, ...node.children.flatMap(walkDrag)];
const cardDrag = id => walkDrag(ui.nodes['#folders']).find(n => n['data-hub-id'] === id);
let prevented = false;
const transfer = { effectAllowed: '', dropEffect: '', setData() {} };
const dragEvent = { dataTransfer: transfer, target: { closest() { return null; } }, preventDefault() { prevented = true; }, stopPropagation() {} };
ui = boot(dragStorage); ui.clickText('Surf Cup 2026');
const originalDragState = JSON.stringify(JSON.parse(dragStorage[PROJ]).drag.state);
// Un drop externo no puede mover nada, aunque incluya un ID coincidente.
cardDrag('target').handlers.drop(dragEvent);
assert.equal(JSON.parse(dragStorage[PROJ]).drag.folder, '');
cardDrag('drag').handlers.dragstart(dragEvent);
assert.equal(transfer.effectAllowed, 'move');
cardDrag('target').handlers.dragover(dragEvent);
assert.equal(prevented, true); assert.equal(transfer.dropEffect, 'move');
cardDrag('target').handlers.drop(dragEvent);
assert.equal(JSON.parse(dragStorage[PROJ]).drag.folder, 'target');
assert.equal(JSON.parse(dragStorage[PROJ]).drag.updated, 123);
assert.equal(JSON.stringify(JSON.parse(dragStorage[PROJ]).drag.state), originalDragState);
assert.match(ui.nodes['#hub-feedback'].textContent, /Destino/);
ui = boot(dragStorage); ui.clickText('Surf Cup 2026'); ui.clickText('📁 Destino');
assert.ok(cardDrag('drag'), 'El movimiento persiste tras recargar');
// La carpeta actual no es un movimiento; cancelar el arrastre invalida el drop posterior.
cardDrag('drag').handlers.dragstart(dragEvent); prevented = false;
ui.nodes['#hub-path'].children.find(n => n.textContent === 'Destino').handlers.drop(dragEvent);
assert.equal(prevented, false);
cardDrag('drag').handlers.dragend();
ui.nodes['#hub-path'].children.find(n => n.textContent === 'Surf Cup 2026').handlers.drop(dragEvent);
assert.equal(JSON.parse(dragStorage[PROJ]).drag.folder, 'target');
// Los botones de acciones mantienen su comportamiento y no inician un arrastre.
prevented = false;
cardDrag('drag').handlers.dragstart({ ...dragEvent, target: { closest() { return {}; } } });
assert.equal(prevented, true);
ui.nodes['#hub-path'].children.find(n => n.textContent === 'Surf Cup 2026').handlers.drop(dragEvent);
assert.equal(JSON.parse(dragStorage[PROJ]).drag.folder, 'target');
// Volver a raíz mediante el tramo del torneo.
cardDrag('drag').handlers.dragstart(dragEvent);
ui.nodes['#hub-path'].children.find(n => n.textContent === 'Surf Cup 2026').handlers.drop(dragEvent);
assert.equal(JSON.parse(dragStorage[PROJ]).drag.folder, '');
assert.equal(JSON.parse(dragStorage[PROJ]).drag.updated, 123);
console.log('OK: arrastre a carpeta/ruta, persistencia, cancelación, rechazo externo y conservación de contenido/fechas.');

// Clubs: pantalla inicial con grupos, nivel de club con sus secciones y newsletter nueva en la sección.
{
  const clubStorage = {}, club = boot(clubStorage);
  club.clickText('Arsenal');
  assert.throws(() => club.clickText('Surf Cup 2026'), 'En el nivel de club solo se ven sus secciones');
  club.clickText('USA Camps');
  club.nodes['#new'].click();
  const created = Object.values(JSON.parse(clubStorage[PROJ]));
  assert.equal(created.length, 1); assert.equal(created[0].state.tournament, 'arsenal-usa');
  const bayern = boot({}); bayern.clickText('Bayern FC');
  assert.throws(() => bayern.clickText('USA Camps'), 'Bayern no tiene USA Camps');
  bayern.clickText('Canada Camps');
  const rmf = boot({}); rmf.clickText('Fundación Real Madrid'); rmf.clickText('World Challenge');
  console.log('OK: clubs en la pantalla inicial, secciones por club (Bayern sin USA, RMF con World Challenge) y newsletter nueva en la sección.');
}

// Código editado a mano: se aplica a vista previa/descargas, se guarda con el proyecto y se puede descartar.
{
  const codeStorage = {}, ui2 = boot(codeStorage);
  ui2.clickText('Surf Cup 2026'); ui2.nodes['#new'].click();
  const stored = () => Object.values(JSON.parse(codeStorage[PROJ]))[0].state;
  const generated = ui2.nodes['#code'].value;
  assert.ok(generated.includes('<html'));
  ui2.nodes['#code-edit'].click();
  assert.equal(ui2.nodes['#code'].readOnly, false); assert.equal(ui2.nodes['#code-apply'].hidden, false);
  const edited = generated.replace('</body>', '<!-- editado a mano --></body>');
  ui2.nodes['#code'].value = edited; ui2.nodes['#code-apply'].click();
  assert.equal(stored().customHtml, edited); assert.equal(ui2.nodes['#frame'].srcdoc, edited);
  assert.equal(ui2.nodes['#code'].readOnly, true); assert.equal(ui2.nodes['#code-reset'].hidden, false);
  assert.equal(ui2.nodes['#preview-note'].hidden, false);
  // Cancelar no aplica lo escrito.
  ui2.nodes['#code-edit'].click(); ui2.nodes['#code'].value = 'otra cosa'; ui2.nodes['#code-cancel'].click();
  assert.equal(stored().customHtml, edited); assert.equal(ui2.nodes['#code'].value, edited);
  // Volver al generado elimina la versión manual.
  ui2.nodes['#code-reset'].click();
  assert.equal(stored().customHtml, undefined); assert.equal(ui2.nodes['#code'].value, generated); assert.ok(ui2.nodes['#frame'].srcdoc.includes('data-ksa-empty'), 'La vista previa vuelve a ser la interactiva');
  console.log('OK: editar código, aplicar, cancelar, guardar con el proyecto y volver al código generado.');
}

// Varias pestañas: fusión a tres bandas por id.
{
  const k = JSON.stringify;
  const r = H.merge3({ a: 1, b: 2, n: 5 }, { a: '1', b: '1', c: '1', d: '1' }, { a: 9, b: 3, c: 1, e: 7 }, k);
  assert.deepEqual(r.merged, { a: 9, b: 2, n: 5, e: 7 }, 'gana lo cambiado aquí (b, n), se respeta lo cambiado/creado/borrado fuera (a, e, c) y lo borrado aquí (d)');
  assert.deepEqual(r.conflicts, ['b']); assert.ok(r.changed.includes('a') && r.changed.includes('e'));
}
// Saltar a otra newsletter y comparar al lado sin volver al hub.
{
  const st = {}, ui3 = boot(st), walk = n => [n, ...n.children.flatMap(walk)];
  ui3.clickText('Surf Cup 2026');
  ui3.nodes['#new'].click(); ui3.nodes['#name'].value = 'Primera'; ui3.nodes['#name'].handlers.input.call(ui3.nodes['#name']);
  ui3.nodes['#back'].click(); ui3.nodes['#new'].click(); ui3.nodes['#name'].value = 'Segunda'; ui3.nodes['#name'].handlers.input.call(ui3.nodes['#name']);
  ui3.nodes['#switch'].click();
  assert.equal(ui3.nodes['#switch-dialog'].open, true);
  const item = walk(ui3.nodes['#switch-list']).find(n => n.tag === 'button' && walk(n).some(c => c.textContent === 'Primera'));
  assert.ok(item, 'La otra newsletter aparece en el buscador'); item.click();
  assert.equal(ui3.nodes['#name'].value, 'Primera'); assert.equal(ui3.nodes['#switch-dialog'].open, false);
  const saved = JSON.parse(st[PROJ]), other = Object.keys(saved).find(id => saved[id].state.name === 'Segunda');
  assert.ok(other, 'Cambiar de newsletter guarda la anterior');
  ui3.change('#compare', other);
  assert.equal(ui3.nodes['#compare-col'].hidden, false); assert.equal(ui3.nodes['#compare-name'].textContent, 'Segunda');
  assert.ok(ui3.nodes['#compare-frame'].srcdoc.includes('<html'));
  ui3.nodes['#compare-open'].click();
  assert.equal(ui3.nodes['#name'].value, 'Segunda'); assert.equal(ui3.nodes['#compare-name'].textContent, 'Primera', 'Abrir intercambia: la anterior queda para comparar');
  ui3.nodes['#compare-close'].click(); assert.equal(ui3.nodes['#compare-col'].hidden, true);
  console.log('OK: saltar a otra newsletter desde el editor y comparar al lado (abrir intercambia, cerrar).');
}
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shared = { [PROJ]: JSON.stringify({ old: { id: 'old', updated: 123, state: { tournament: 'surfcup', name: 'Original', sections: [], off: {}, franjaLeft: '' } } }) };
  const A = boot(shared), B = boot(shared); // B arranca con los mismos datos y no ve lo que hace A
  A.nodes['#new'].click();
  B.nodes['#new'].click();
  let saved = JSON.parse(shared[PROJ]);
  assert.equal(Object.keys(saved).length, 3, 'La segunda pestaña no borra la newsletter creada en la primera');
  // A cambia el nombre de su newsletter; B guarda después con datos antiguos de esa newsletter.
  A.nodes['#name'].value = 'Desde A'; A.nodes['#name'].handlers.input.call(A.nodes['#name']); await wait(260);
  B.nodes['#name'].value = 'Desde B'; B.nodes['#name'].handlers.input.call(B.nodes['#name']); await wait(260);
  saved = JSON.parse(shared[PROJ]);
  const names = Object.values(saved).map(p => p.state.name).sort();
  assert.deepEqual(names, ['Desde A', 'Desde B', 'Original'], 'Cada pestaña conserva sus cambios sin pisar la otra');
  console.log('OK: varias pestañas sin sobrescribirse (fusión por newsletter, conflictos detectados).');
})().catch(e => { console.error(e); process.exit(1); });

// Crear desde guion en el hub: la newsletter nace en la sección elegida y avisa de textos que faltan.
{
  const st = {}, ui4 = boot(st);
  ui4.clickText('Arsenal'); ui4.clickText('Experiences');
  ui4.nodes['#from-script'].click();
  assert.equal(ui4.nodes['#script-dlg'].open, true); assert.equal(ui4.nodes['#script-tournament'].value, 'arsenal-exp');
  ui4.nodes['#script-text'].value = 'BANNER 1: Título: Clinic London\nBANNER 2: Texto: Texto que ChatGPT olvidó';
  ui4.nodes['#script-answer'].value = '```json\n{"tournament":"surfcup","name":"Clinic","sections":[{"type":"titulo","d":{"title":"Clinic London"}}]}\n```';
  ui4.nodes['#script-go'].click();
  const created = Object.values(JSON.parse(st[PROJ]));
  assert.equal(created.length, 1); assert.equal(created[0].state.tournament, 'arsenal-exp', 'Manda el torneo elegido');
  const msg = ui4.noticeText();
  assert.ok(/Texto que ChatGPT olvidó/.test(msg) && /se usa el elegido/.test(msg));
  console.log('OK: nueva newsletter desde guion en la sección del hub, con aviso de textos que faltan.');
}

// Paleta de bloques: añadir un bloque con sus textos obligatorios como PENDIENTE (error en revisión hasta cambiarlos).
(async () => {
  const st = {}, ui5 = boot(st), walk = n => [n, ...n.children.flatMap(walk)];
  ui5.clickText('Surf Cup 2026'); ui5.nodes['#new'].click();
  assert.equal(ui5.nodes['#palette'].hidden, false, 'Una newsletter vacía abre la paleta');
  const card = walk(ui5.nodes['#palette-list']).find(n => n.tag === 'button' && walk(n).some(c => c.textContent === 'Título'));
  card.click(); await new Promise(r => setTimeout(r, 260));
  const saved = Object.values(JSON.parse(st[PROJ]))[0].state;
  assert.equal(saved.sections.length, 1); assert.equal(saved.sections[0].type, 'title');
  assert.equal(saved.sections[0].d.text, 'PENDIENTE: Título'); assert.equal(saved.sections[0].d.style, 'principal'); assert.equal(ui5.nodes['#palette'].hidden, true);
  ui5.nodes['#add-toggle'].click();
  assert.ok(!walk(ui5.nodes['#palette-list']).some(n => n.textContent === 'Dos tarjetas (antiguo)'), 'El bloque antiguo de dos tarjetas ya no sale en la paleta');
  walk(ui5.nodes['#palette-list']).find(n => n.tag === 'button' && walk(n).some(c => c.textContent === 'Tarjetas')).click();
  await new Promise(r => setTimeout(r, 260));
  const added = Object.values(JSON.parse(st[PROJ]))[0].state.sections[1];
  assert.equal(added.type, 'cards');
  assert.equal(added.d.c1_title, 'PENDIENTE: Título 1'); assert.equal(added.d.c2_title, undefined, 'Un bloque Tarjetas nuevo empieza con una sola tarjeta');
  console.log('OK: paleta de bloques (añadir con textos PENDIENTE y cerrar).');
})().catch(e => { console.error(e); process.exit(1); });

// Accesos rápidos del hub: panel de ubicaciones, recientes en el inicio y búsqueda en todas las newsletters.
{
  const walk = n => [n, ...n.children.flatMap(walk)], texts = n => walk(n).map(c => c.textContent);
  const st = {
    [PROJ]: JSON.stringify({
      a: { id: 'a', updated: 300, folder: 'fv', state: { tournament: 'surfcup', name: 'Early bird Surf', sections: [], off: {}, franjaLeft: '' } },
      b: { id: 'b', updated: 200, state: { tournament: 'arsenal-usa', name: 'Early bird Arsenal', sections: [], off: {}, franjaLeft: '' } },
      c: { id: 'c', updated: 100, state: { tournament: 'fit', name: 'Otra', sections: [], off: {}, franjaLeft: '' } }
    }),
    [HUB]: JSON.stringify({ folders: { fv: { id: 'fv', name: 'Ventas', tournament: 'surfcup', parent: '', updated: 1 } }, sorts: {}, orders: {} })
  };
  const q = boot(st);
  assert.ok(texts(q.nodes['#folders']).includes('Recientes (abiertas o editadas)'));
  assert.ok(texts(q.nodes['#folders']).includes('Surf Cup 2026 › Ventas'), 'Las recientes muestran su ubicación');
  assert.ok(texts(q.nodes['#hub-tree']).includes('Arsenal'), 'El panel lista los clubs');
  q.nodes['#hub-search'].value = 'early'; q.nodes['#hub-search'].handlers.input();
  assert.match(q.nodes['#hub-count'].textContent, /^2 resultados/);
  assert.ok(texts(q.nodes['#folders']).includes('Arsenal › USA Camps'), 'La búsqueda del inicio recorre todos los torneos y clubs');
  // Dentro de una sección, «En esta carpeta» mantiene el filtro local y «En todas» busca en todo.
  q.nodes['#hub-search'].value = ''; q.nodes['#hub-search'].handlers.input(); q.clickText('Surf Cup 2026');
  assert.ok(texts(q.nodes['#hub-tree']).includes('📁 Ventas'), 'El panel despliega las carpetas de la sección abierta');
  assert.ok(texts(q.nodes['#folders']).includes('Carpeta · 1 newsletter'));
  q.nodes['#hub-search'].value = 'arsenal'; q.nodes['#hub-search'].handlers.input();
  assert.match(q.nodes['#hub-count'].textContent, /^0 de 1/);
  q.change('#hub-scope', 'all');
  assert.match(q.nodes['#hub-count'].textContent, /^1 resultado en todas/);
  console.log('OK: panel de ubicaciones, recientes con ubicación y búsqueda en todas las newsletters.');
}

// Grupos del inicio (Kaptiva Global Stage, Clubs, Kaptiva Sports Academy), interruptores de vista, apertura y filtro por tipo.
{
  const walk = n => [n, ...n.children.flatMap(walk)], texts = n => walk(n).map(c => c.textContent);
  const st = {
    [PROJ]: JSON.stringify({
      a: { id: 'a', updated: 300, state: { tournament: 'surfcup', name: 'Alfa', sections: [], off: {}, franjaLeft: '' } },
      b: { id: 'b', updated: 200, state: { tournament: 'surfcup', name: 'Beta', sections: [], off: {}, franjaLeft: '' } }
    }),
    [HUB]: JSON.stringify({ folders: { fx: { id: 'fx', name: 'Carpeta X', tournament: 'surfcup', parent: '', updated: 1 } }, sorts: {}, orders: {} })
  };
  const g = boot(st), home = () => texts(g.nodes['#folders']);
  for (const name of ['Kaptiva Global Stage', 'Clubs', 'Kaptiva Sports Academy', 'Short Sessions', 'Residential Camps']) assert.ok(home().includes(name), 'Inicio: ' + name);
  assert.ok(!home().includes('KSA Global Stage'));
  const chip = name => walk(g.nodes['#hub-show']).find(n => n.tag === 'button' && walk(n).some(c => c.textContent.endsWith(name)));
  chip('Clubs').click();
  assert.ok(!home().includes('Clubs') && !home().includes('Arsenal'), 'Ocultar Clubs en el inicio');
  assert.equal(JSON.parse(st['kaptiva-newsletters-hub-view-v1']).hide.clubs, true, 'La preferencia se guarda');
  chip('Recientes').click(); assert.ok(!home().includes('Recientes (abiertas o editadas)'));
  assert.ok(boot(st) && !texts(boot(st).nodes['#folders']).includes('Arsenal'), 'La preferencia sobrevive a recargar');
  chip('Clubs').click(); assert.ok(home().includes('Arsenal'));
  // Academy: sección con su nombre de marca y diseño pendiente; abrir Beta registra la apertura sin tocar la modificación.
  g.clickText('Short Sessions'); assert.match(g.nodes['#hub-count'].textContent, /^0 de 0/);
  g.nodes['#hub-path'].children[0].click(); g.clickText('Surf Cup 2026');
  g.clickText('Beta'); g.nodes['#back'].click();
  const beta = JSON.parse(st[PROJ]).b; assert.ok(beta.opened > 0); assert.equal(beta.updated, 200);
  g.change('#hub-sort', 'opened');
  const names = walk(g.nodes['#folders']).filter(n => n.className === 'item-open').map(n => n.textContent);
  assert.deepEqual(names, ['Beta', 'Alfa', '📁 Carpeta X'], 'Orden por apertura: abierta primero, sin abrir después');
  g.change('#hub-kind', 'folder'); assert.match(g.nodes['#hub-count'].textContent, /^1 de 3/);
  g.change('#hub-kind', 'project'); g.change('#hub-date-field', 'opened');
  const today = new Date(), day = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  g.nodes['#hub-from'].value = day; g.nodes['#hub-from'].handlers.input();
  assert.match(g.nodes['#hub-count'].textContent, /^1 de 3/, 'Filtro por fecha de apertura: solo la abierta hoy');
  console.log('OK: grupos Kaptiva Global Stage / Clubs / Academy, mostrar u ocultar bloques, orden y filtro por apertura y por tipo.');
}

// Menú en árbol: desplegar secciones y carpetas dentro de carpetas sin salir de la ubicación actual.
{
  const walk = n => [n, ...n.children.flatMap(walk)], texts = n => walk(n).map(c => c.textContent);
  const st = {
    [PROJ]: JSON.stringify({ a: { id: 'a', updated: 1, folder: 'f3', state: { tournament: 'surfcup', name: 'Honda', sections: [], off: {}, franjaLeft: '' } } }),
    [HUB]: JSON.stringify({ folders: {
      f1: { id: 'f1', name: 'Nivel 1', tournament: 'surfcup', parent: '', updated: 1 },
      f2: { id: 'f2', name: 'Nivel 2', tournament: 'surfcup', parent: 'f1', updated: 1 },
      f3: { id: 'f3', name: 'Nivel 3', tournament: 'surfcup', parent: 'f2', updated: 1 },
      g1: { id: 'g1', name: 'Arsenal docs', tournament: 'arsenal-usa', parent: '', updated: 1 }
    }, sorts: {}, orders: {} })
  };
  const t = boot(st), tree = () => texts(t.nodes['#hub-tree']);
  const toggle = key => walk(t.nodes['#hub-tree']).find(n => n['data-tree-toggle'] === key);
  assert.ok(!tree().includes('📁 Nivel 1'), 'Plegado al empezar');
  toggle('t:surfcup').click(); assert.ok(tree().includes('📁 Nivel 1'));
  toggle('f:f1').click(); toggle('f:f2').click();
  assert.ok(tree().includes('📁 Nivel 3'), 'Carpetas dentro de carpetas');
  assert.equal(toggle('f:f3'), undefined, 'Sin subcarpetas no hay flecha');
  toggle('c:arsenal').click(); toggle('t:arsenal-usa').click();
  assert.ok(tree().includes('📁 Arsenal docs') && tree().includes('📁 Nivel 3'), 'Varias ramas abiertas a la vez');
  // Entrar en una sección no pliega el resto, y lo desplegado se recuerda al recargar.
  t.clickText('Surf Cup 2026');
  assert.ok(tree().includes('📁 Arsenal docs') && tree().includes('📁 Nivel 3'));
  const again = boot(st); assert.ok(texts(again.nodes['#hub-tree']).includes('📁 Nivel 3'));
  // Al entrar en una carpeta profunda desde la búsqueda se despliega su camino.
  const fresh = boot({ [PROJ]: st[PROJ], [HUB]: st[HUB] });
  fresh.nodes['#hub-search'].value = 'nivel 3'; fresh.nodes['#hub-search'].handlers.input();
  walk(fresh.nodes['#folders']).find(n => n.className === 'item-open').click();
  assert.ok(texts(fresh.nodes['#hub-tree']).includes('📁 Nivel 3'));
  console.log('OK: menú en árbol con secciones y carpetas anidadas, varias ramas abiertas y recordadas.');
}

// Menú también en el editor: marca la ubicación de la newsletter abierta, se puede plegar y lleva de vuelta al hub.
{
  const walk = n => [n, ...n.children.flatMap(walk)], texts = n => walk(n).map(c => c.textContent);
  const st = {
    [PROJ]: JSON.stringify({ a: { id: 'a', updated: 5, folder: 'f2', state: { tournament: 'surfcup', name: 'Profunda', sections: [], off: {}, franjaLeft: '' } } }),
    [HUB]: JSON.stringify({ folders: {
      f1: { id: 'f1', name: 'Uno', tournament: 'surfcup', parent: '', updated: 1 },
      f2: { id: 'f2', name: 'Dos', tournament: 'surfcup', parent: 'f1', updated: 1 }
    }, sorts: {}, orders: {} })
  };
  const e = boot(st);
  walk(e.nodes['#folders']).find(n => n.className === 'item-open' && n.textContent === 'Profunda').click();
  const current = walk(e.nodes['#hub-tree']).find(n => n.className === 'tree-item current');
  assert.ok(current && texts(current).includes('📁 Dos'), 'En el editor se marca la carpeta de la newsletter abierta');
  e.nodes['#tree-collapse'].click();
  assert.equal(JSON.parse(st['kaptiva-newsletters-hub-view-v1']).collapsed, true);
  assert.equal(e.nodes['#tree-collapse'].textContent, '»');
  assert.equal(boot(st).nodes['#tree-collapse'].textContent, '»', 'El plegado se recuerda');
  e.nodes['#tree-collapse'].click(); assert.equal(e.nodes['#tree-collapse'].textContent, '«');
  e.nodes['#name'].value = 'Profunda editada'; e.nodes['#name'].handlers.input.call(e.nodes['#name']);
  walk(e.nodes['#hub-tree']).find(n => n.tag === 'button' && texts(n).includes('📁 Uno')).click();
  assert.equal(JSON.parse(st[PROJ]).a.state.name, 'Profunda editada', 'Salir por el menú guarda la newsletter');
  assert.ok(texts(e.nodes['#folders']).includes('📁 Dos'), 'Y abre esa carpeta en el hub');
  console.log('OK: menú en el editor (ubicación marcada, plegable a columna estrecha y navegación que guarda).');
}

// Ajuste del menú con teclado: límites, persistencia y restablecimiento.
{
  const st = {}, e = boot(st), handle = e.nodes['#tree-resize'];
  const key = value => handle.handlers.keydown({ key: value, preventDefault() {} });
  key('Home'); assert.equal(handle['aria-valuenow'], '240');
  key('ArrowLeft'); assert.equal(handle['aria-valuenow'], '240');
  key('ArrowRight'); assert.equal(handle['aria-valuenow'], '256');
  assert.equal(boot(st).nodes['#tree-resize']['aria-valuenow'], '256');
  key('End'); assert.equal(handle['aria-valuenow'], '520');
  key('ArrowRight'); assert.equal(handle['aria-valuenow'], '520');
  handle.handlers.dblclick(); assert.equal(handle['aria-valuenow'], '320');
  assert.equal(boot(st).nodes['#tree-resize']['aria-valuenow'], '320');
}
console.log('OK: ancho del menú con teclado, límites, persistencia y restablecimiento.');

// Panel derecho: el separador sigue la dirección del borde y recuerda su ancho.
{
  const st = {}, e = boot(st), handle = e.nodes['#editor-resize'];
  const key = value => handle.handlers.keydown({ key: value, preventDefault() {} });
  key('Home'); assert.equal(handle['aria-valuenow'], '300');
  key('ArrowRight'); assert.equal(handle['aria-valuenow'], '300');
  key('ArrowLeft'); assert.equal(handle['aria-valuenow'], '316');
  assert.equal(boot(st).nodes['#editor-resize']['aria-valuenow'], '316');
  e.nodes['#editor-layout'].clientWidth = 900;
  key('End'); assert.equal(handle['aria-valuenow'], '540');
  key('ArrowLeft'); assert.equal(handle['aria-valuenow'], '540');
  handle.handlers.dblclick(); assert.equal(handle['aria-valuenow'], '470');
  assert.equal(boot(st).nodes['#editor-resize']['aria-valuenow'], '470');
  assert.equal(boot(st).nodes['#tree-resize']['aria-valuenow'], '320', 'Los anchos son independientes');
}
console.log('OK: panel derecho ajustable, límites según espacio disponible, persistencia y ancho independiente.');


// Recargar restaura la ubicación de cada pestaña y conserva cambios aún sin refrescar.
{
  const session = {}, key = 'kaptiva-newsletters-session-v1';
  const st = { [PROJ]: JSON.stringify({ old: { id: 'old', updated: 123, state: { tournament: 'surfcup', name: 'Original', sections: [], off: {} } } }) };
  let e = boot(st, session); e.clickText('Original');
  e.nodes['#name'].value = 'Cambio justo antes de recargar'; e.nodes['#name'].handlers.input.call(e.nodes['#name']);
  e.nodes['#editor-panel'].scrollTop = 345;
  e.fire('beforeunload');
  const updated = JSON.parse(st[PROJ]).old.updated;
  e = boot(st, session);
  assert.equal(e.nodes['#name'].value, 'Cambio justo antes de recargar');
  assert.equal(e.nodes['#editor-panel'].scrollTop, 345);
  assert.equal(JSON.parse(st[PROJ]).old.updated, updated, 'Restaurar no modifica la newsletter');
  e.fire('beforeunload'); assert.equal(JSON.parse(session[key]).project, 'old');
  const other = {}; boot(st, other).fire('beforeunload');
  assert.equal(JSON.parse(other[key]).project, null, 'Otra pestaña tiene su propia ubicación');
  e.nodes['#back'].click(); e.clickText('Surf Cup 2026');
  e.nodes['#new-folder'].click(); e.nodes['#folder-name'].value = 'Carpeta refresh'; e.nodes['#folder-form'].onsubmit({preventDefault() {}});
  e.clickText('📁 Carpeta refresh'); e.nodes['#hub-search'].value = 'consulta'; e.fire('beforeunload');
  const route = JSON.parse(session[key]); assert.ok(route.folder);
  e = boot(st, session); assert.equal(e.nodes['#hub-search'].value, 'consulta');
  e.fire('beforeunload'); assert.equal(JSON.parse(session[key]).folder, route.folder);
  session[key] = JSON.stringify({ project: 'eliminado', tournament: 'inexistente', folder: 'eliminada', club: 'inexistente' });
  e = boot(st, session); e.fire('beforeunload');
  assert.equal(JSON.parse(session[key]).project, null); assert.equal(JSON.parse(session[key]).tournament, '');
  session[key] = '{roto'; assert.doesNotThrow(() => boot(st, session));
}
console.log('OK: recarga en newsletter/carpeta, scroll, filtros, cambios pendientes, sesión por pestaña y destinos eliminados.');


// El editor aplica el perfil por sección y no vuelve a ofrecer Club/Clásico.
{
  const e=boot({}, {}, true);
  e.clickText('Fundación Real Madrid'); e.clickText('World Challenge'); e.nodes['#new'].click();
  assert.equal(e.nodes['#franja'].disabled,true);
  assert.equal(e.nodes['#franja'].value,'WORLD CHALLENGE 2027');
  assert.ok(e.nodes['#kit-guidelines-text'].textContent.includes('Nunca rojo'));
  assert.equal(e.nodes['#look'],undefined);
  e.change('#tournament','psg-canada');
  assert.equal(e.nodes['#franja'].disabled,false);
  assert.ok(e.nodes['#kit-guidelines-text'].textContent.includes('USA/Canada'));
  assert.notEqual(e.nodes['#franja'].value,'WORLD CHALLENGE 2027');
}
console.log('OK: editor WCH automático, instrucciones, cambio a Camps Canada y selector de modelos eliminado.');
