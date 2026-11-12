// Comparar el HTML que genera js/modules.js con una copia anterior (regla: lo antiguo no cambia).
// Uso:
//   cp js/modules.js /tmp/modules.antes.js      # antes de tocar nada
//   …cambios…
//   node test/compare-modules.js /tmp/modules.antes.js
// Compara todas las recetas en los 19 torneos y secciones, con estilo clásico y automático, y la newsletter de referencia
// de club si existe en las dos versiones. Ignora los comentarios <!-- [n] … --> (numeración de bloques). Sale con código 1 si hay diferencias.
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
if (!process.argv[2]) { console.error('Uso: node test/compare-modules.js /ruta/a/modules.antes.js'); process.exit(2); }
function load(modules) {
  const ctx = { console, URL }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['head', 'brands', 'brand-kits']) vm.runInContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(modules, 'utf8'), ctx);
  return ctx.KSA;
}
const A = load(path.resolve(process.argv[2])), B = load(path.join(root, 'js/modules.js'));
const strip = h => h.replace(/<!-- \[\d+\] [^\n]*-->\n/g, '');
let n = 0, diffs = 0;
function same(label, a, b) { n++; if (strip(a) !== strip(b)) { diffs++; if (diffs <= 20) console.log('DIFERENTE:', label); } }
for (const r of A.RECIPES) for (const t of A.CLIENT.tournaments) for (const look of ['classic', 'auto']) {
  const sa = Object.assign(A.fromRecipe(r.id, t.id), { look }), sb = Object.assign(B.fromRecipe(r.id, t.id), { look });
  same(r.id + ' · ' + t.id + ' · ' + look, A.build(sa), B.build(sb));
}
if (A.REFERENCE_CLUB && B.REFERENCE_CLUB) for (const look of ['classic', 'auto']) {
  const imp = K => Object.assign(K.importProject(JSON.stringify(A.REFERENCE_CLUB), 'surfcup').state, { look });
  same('referencia de club · ' + look, A.build(imp(A)), B.build(imp(B)));
}
console.log(n + ' casos comparados, ' + diffs + ' diferentes.');
process.exit(diffs ? 1 : 0);
