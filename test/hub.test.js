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
  const context = { document, console, Date, setTimeout, clearTimeout, localStorage: { getItem: k => storage[k] || null, setItem: (k,v) => { storage[k] = v; }, removeItem: k => { delete storage[k]; } }, prompt: () => prompts.shift(), confirm: () => true, alert: t => alerts.push(t), addEventListener() {} };
  context.window = context; vm.createContext(context);
  for (const file of ['head','brands','modules','hub','app']) vm.runInContext(fs.readFileSync(__dirname + '/../js/' + file + '.js', 'utf8'), context);
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
ui.change('#new', 'blank');
ui.nodes['#name'].value = 'Nueva newsletter'; ui.nodes['#name'].handlers.input.call(ui.nodes['#name']);
ui.nodes['#back'].click();
let saved = JSON.parse(storage[PROJ]), newProject = Object.values(saved).find(p => p.state.name === 'Nueva newsletter');
let org = JSON.parse(storage[HUB]), nested = Object.values(org.folders).find(f => f.name === 'Noviembre');
assert.equal(newProject.folder, nested.id);
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
