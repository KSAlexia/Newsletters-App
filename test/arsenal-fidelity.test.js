const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={URL,console};c.globalThis=c;vm.createContext(c);
for(const f of ['head','brands','brand-designs','brand-kits','modules'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);
const K=c.KSA, folder='examples/arsenal-payment-reminder/';
const source=JSON.parse(fs.readFileSync(folder+'project.json','utf8'));
const {state,notes}=K.importProject(JSON.stringify(source),'arsenal-exp');assert.deepEqual(Array.from(notes),[]);
assert.equal(state.sections[2].d.density,'editorial');assert.equal(state.sections[4].d.style,'summary');
const html=K.build(state);
// Compare visible content and order against the supplied HTML, including every Cvent field.
function text(h){return h.slice(h.indexOf('<body')).replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&bull;|&#9679;|•/g,' ').replace(/&amp;/g,'&').replace(/&middot;/g,'·').replace(/&rsquo;/g,'’').replace(/\s+/g,' ').trim();}
assert.equal(text(html),text(fs.readFileSync(folder+'reference.html','utf8')));
assert.ok(!html.includes('5e0100c3217d42c8b791a05f37a70bf6'));
assert.ok(html.includes('font-size:17px;line-height:24px'));
assert.ok(html.includes('border-left:4px solid #B4001E'));
assert.ok(!html.includes('undefined')&&!html.includes('%%C:'));
assert.equal((html.match(/class="col2"/g)||[]).length,3);
const prompt=K.importPrompt('arsenal-exp');
for(const instruction of ['FIDELIDAD VISUAL','style":"summary','density":"editorial','sin recuperar textos','solo si el original tiene esa caja'])assert.ok(prompt.includes(instruction),instruction);
// Optional neutral separator survives JSON import, with no primary-colored line.
const sep=K.importProject(JSON.stringify({tournament:'arsenal-exp',sections:[{type:'separador',d:{style:'neutral'}}]})).state;
assert.equal(sep.sections[0].d.style,'neutral');assert.ok(K.build(sep).includes('font-size:0;background-color:#EEEEEE'));
console.log('OK: Arsenal — composición, contenido literal, campos Cvent, importación de opciones y guía de fidelidad.');
// Normalizar la composición de HTML plano, conservando sus palabras y sus datos originales.
for(const id of ['psg-exp','psg-usa','arsenal-exp','arsenal-canada','rmf-exp','rmf-usa','rmf-wc']){
 for(const guide of [K.importPrompt(id),K.scriptPrompt(id,'Contenido')]){
  assert.ok(guide.includes('COMPOSICIÓN OBLIGATORIA DEL KIT'));
  assert.ok(guide.includes('incluso cuando el original los presente como viñetas'));
  assert.ok(guide.includes('promuévela a title principal'));
  assert.ok(guide.includes('No uses box borde para credenciales'));
  assert.ok(guide.includes('REVISIÓN ANTES DE RESPONDER'));
 }
}
const normalized=K.importProject(fs.readFileSync('examples/arsenal-payment-normalized/project.json','utf8'),'arsenal-exp');
assert.equal(normalized.notes.length,0);
assert.equal(normalized.state.sections[1].type,'title');
assert.equal(normalized.state.sections[4].d.style,'summary');
assert.equal(normalized.state.sections[6].d.style,'suave');
const normalizedHtml=K.build(normalized.state);
assert.equal(text(normalizedHtml).replace(/●/g,'').replace(/\s+/g,' '),text(fs.readFileSync('examples/arsenal-payment-normalized/source.html','utf8')).replace(/●/g,'').replace(/\s+/g,' '));
console.log('OK: HTML plano recompuesto sin perder texto, imágenes ni campos; guía compartida en los siete kits.');
