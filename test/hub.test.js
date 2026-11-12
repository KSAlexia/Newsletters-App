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
  constructor(tag) { this.tag = tag; this.children = []; this.handlers = {}; this.value = ''; this.textContent = ''; this.dataset = {}; this.hidden = false; this.classList = { add() {}, remove() {}, toggle() {} }; }
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
function boot(storage) {
  const nodes = {}, html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
  for (const match of html.matchAll(/id="([^"]+)"/g)) nodes['#' + match[1]] = new Element('div');
  nodes['details.more'] = new Element('details');
  const prompts = [], alerts = [];
  const document = { body: new Element('body'), createElement: tag => new Element(tag), querySelector: key => { if (key.startsWith('[data-hub-id=')) return null; if (!nodes[key]) throw Error('Missing node: ' + key); return nodes[key]; }, querySelectorAll: () => [] };
  const context = { document, console, Date, URL, setTimeout, clearTimeout, localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => { storage[k] = v; }, removeItem: k => { delete storage[k]; } }, prompt: () => prompts.shift(), confirm: () => true, alert: t => alerts.push(t), addEventListener() {} };
  context.window = context; vm.createContext(context);
  for (const file of ['head','brands','brand-kits','modules','hub','app']) vm.runInContext(fs.readFileSync(__dirname + '/../js/' + file + '.js', 'utf8'), context);
  const walk = node => [node, ...node.children.flatMap(walk)];
  const clickText = text => { const button = walk(nodes['#folders']).find(n => n.tag === 'button' && walk(n).some(child => child.textContent === text)); assert.ok(button, 'Button: ' + text); button.click(); };
  return { nodes, prompts, alerts, clickText, change(id, value) { const node = nodes[id]; node.value = value; node.handlers.change.call(node); } };
}
const PROJ = 'kaptiva-newsletters-projects-v1', HUB = 'kaptiva-newsletters-hub-v1';
const storage = { [PROJ]: JSON.stringify({ old: { id: 'old', updated: 123, state: { tournament: 'surfcup', name: 'Original', sections: [], off: {}, franjaLeft: '' } } }) };
let ui = boot(storage);
ui.clickText('📁 Surf Cup 2026');
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
ui = boot(storage); ui.clickText('📁 Surf Cup 2026'); ui.clickText('📁 Ventas'); ui.clickText('📁 Noviembre');
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
ui = boot(storage); ui.clickText('📁 Surf Cup 2026'); ui.clickText('Nueva newsletter');
const detail = ui.nodes['#sections'].children[0];
detail.open = false; detail.handlers.toggle(); ui.nodes['#back'].click();
assert.equal(JSON.parse(storage[PROJ])[moved.id].updated, 123);
ui.clickText('Nueva newsletter'); ui.nodes['#name'].value = 'Texto cambiado'; ui.nodes['#name'].handlers.input.call(ui.nodes['#name']); ui.nodes['#back'].click();
assert.ok(JSON.parse(storage[PROJ])[moved.id].updated > 123);
console.log('OK: diálogo de carpetas y fecha exacta de plegado/edición.');

// Restricciones también a través de los controles del hub.
const guardStorage = { [PROJ]: JSON.stringify({ p: { id: 'p', folder: 'child', updated: 123, state: { tournament: 'surfcup', name: 'Hija', sections: [], off: {} } } }), [HUB]: JSON.stringify({ folders: { parent: { id: 'parent', name: 'Padre', parent: '', tournament: 'surfcup', updated: 123 }, child: { id: 'child', name: 'Hijo', parent: 'parent', tournament: 'surfcup', updated: 123 }, other: { id: 'other', name: 'Otro torneo', parent: '', tournament: 'fit', updated: 123 } }, sorts: {}, orders: {} }) };
ui = boot(guardStorage); ui.clickText('📁 Surf Cup 2026');
ui.clickText('Eliminar');
assert.match(ui.alerts[0], /Solo se pueden eliminar carpetas vacías/);
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
ui = boot(dragStorage); ui.clickText('📁 Surf Cup 2026');
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
ui = boot(dragStorage); ui.clickText('📁 Surf Cup 2026'); ui.clickText('📁 Destino');
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
  club.clickText('📁 Arsenal');
  assert.throws(() => club.clickText('📁 Surf Cup 2026'), 'En el nivel de club solo se ven sus secciones');
  club.clickText('📁 USA CAMPS');
  club.nodes['#new'].click();
  const created = Object.values(JSON.parse(clubStorage[PROJ]));
  assert.equal(created.length, 1); assert.equal(created[0].state.tournament, 'arsenal-usa');
  const bayern = boot({}); bayern.clickText('📁 Bayern FC');
  assert.throws(() => bayern.clickText('📁 USA CAMPS'), 'Bayern no tiene USA CAMPS');
  bayern.clickText('📁 CANADA CAMPS');
  const rmf = boot({}); rmf.clickText('📁 Fundación Real Madrid'); rmf.clickText('📁 RMF WORLD CHALLENGE');
  console.log('OK: clubs en la pantalla inicial, secciones por club (Bayern sin USA, RMF con World Challenge) y newsletter nueva en la sección.');
}

// Código editado a mano: se aplica a vista previa/descargas, se guarda con el proyecto y se puede descartar.
{
  const codeStorage = {}, ui2 = boot(codeStorage);
  ui2.clickText('📁 Surf Cup 2026'); ui2.nodes['#new'].click();
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
  ui3.clickText('📁 Surf Cup 2026');
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
  ui4.clickText('📁 Arsenal'); ui4.clickText('📁 EXPERIENCES');
  ui4.nodes['#from-script'].click();
  assert.equal(ui4.nodes['#script-dlg'].open, true); assert.equal(ui4.nodes['#script-tournament'].value, 'arsenal-exp');
  ui4.nodes['#script-text'].value = 'BANNER 1: Título: Clinic London\nBANNER 2: Texto: Texto que ChatGPT olvidó';
  ui4.nodes['#script-answer'].value = '```json\n{"tournament":"surfcup","name":"Clinic","sections":[{"type":"titulo","d":{"title":"Clinic London"}}]}\n```';
  ui4.nodes['#script-go'].click();
  const created = Object.values(JSON.parse(st[PROJ]));
  assert.equal(created.length, 1); assert.equal(created[0].state.tournament, 'arsenal-exp', 'Manda el torneo elegido');
  const msg = ui4.alerts.pop();
  assert.ok(/Texto que ChatGPT olvidó/.test(msg) && /se usa el elegido/.test(msg));
  console.log('OK: nueva newsletter desde guion en la sección del hub, con aviso de textos que faltan.');
}

// Paleta de bloques: añadir un bloque con sus textos obligatorios como PENDIENTE (error en revisión hasta cambiarlos).
(async () => {
  const st = {}, ui5 = boot(st), walk = n => [n, ...n.children.flatMap(walk)];
  ui5.clickText('📁 Surf Cup 2026'); ui5.nodes['#new'].click();
  assert.equal(ui5.nodes['#palette'].hidden, false, 'Una newsletter vacía abre la paleta');
  const card = walk(ui5.nodes['#palette-list']).find(n => n.tag === 'button' && walk(n).some(c => c.textContent === 'Título centrado con barra'));
  card.click(); await new Promise(r => setTimeout(r, 260));
  const saved = Object.values(JSON.parse(st[PROJ]))[0].state;
  assert.equal(saved.sections.length, 1); assert.equal(saved.sections[0].type, 'titulo');
  assert.equal(saved.sections[0].d.title, 'PENDIENTE: Título'); assert.equal(ui5.nodes['#palette'].hidden, true);
  console.log('OK: paleta de bloques (añadir con textos PENDIENTE y cerrar).');
})().catch(e => { console.error(e); process.exit(1); });
