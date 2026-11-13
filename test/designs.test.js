const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function boot(oldModules){const c={URL,console};c.globalThis=c;c.window=c;vm.createContext(c);for(const f of ['head','brands','brand-designs','brand-kits'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);vm.runInContext(fs.readFileSync(oldModules||'js/modules.js','utf8'),c);return c.KSA;}
const K=boot(),B=K.BrandKits,D=K.Designs, crypto=require('node:crypto');
const golden=JSON.parse(fs.readFileSync(__dirname+'/fixtures/legacy-design-html.json','utf8')), hash=h=>crypto.createHash('sha256').update(h).digest('hex');
const memory=()=>({data:{},getItem(k){return this.data[k]||null},setItem(k,v){this.data[k]=v}});
let storage=memory();B.load(storage);
assert.equal(D.profiles.length,7);assert.equal(B.catalog().length,K.CLIENT.tournaments.length-3);
for(const p of D.profiles){
 const st=K.fromRecipe('blank',p.sections[0]);st.sections=[{type:'title',d:{text:'Your visit 2027',style:'principal'}},{type:'text',d:{text:'Keep **this** and {[C-FIRST NAME:TC]}.'}},{type:'box',d:{style:'oscura',title:'Important',text:'Please read.'}},{type:'timeline',d:{d1:'22 Nov',t1:'Arrival',n:'1'}}];
 const html=K.build(st);assert.ok(html.includes(p.header));assert.ok(html.includes(p.footer));assert.ok(!/%%C:/.test(html));assert.ok(!/#6F4ACC|#91FAFB/i.test(html));assert.ok(html.includes(p.principal));assert.ok(html.includes('{[C-FIRST NAME:TC]}'));
 assert.ok(K.scriptPrompt(st.tournament,'BANNER 1: Hello').includes(p.instructions));
 assert.ok(K.importPrompt(st.tournament).includes(p.instructions));
 assert.ok(!K.importPrompt(st.tournament).includes('EJEMPLO DE REFERENCIA'));
 assert.equal(B.normalize(B.defaults(st.tournament),true).instructions,p.instructions);
 assert.equal(B.snapshot(B.defaults(st.tournament)).designId,p.id);
 if(!p.id.startsWith('psg')){assert.ok(html.includes('font-family:Georgia'));assert.ok(!/@font-face/.test(html));}
 if(p.id==='rmf-wch'){
  assert.ok(html.includes('WORLD CHALLENGE 2027'));assert.ok(html.includes('FUNDACIÓN REAL MADRID'));
  assert.ok(html.indexOf('Get in Touch')<html.indexOf(p.footer));
  assert.ok(html.includes('{[P-FIRST NAME]} {[P-LAST NAME]}'));assert.ok(html.includes('32px;line-height:40px'));
  const all=K.build({...st,off:{header:true,franja:true,footer:true}});assert.ok(all.includes(p.header)&&all.includes(p.footer));
 }
 if(p.sections.length===2){
  let edit=B.brandDraft(p.sections[0]);edit.instructions+='\nRegla compartida';edit.colors.principal='#112233';B.save(edit,storage);
  assert.equal(B.brandKit(p.sections[1]).instructions,edit.instructions);
  assert.equal(B.find('brand-'+p.sections[1]).id,B.brandKit(p.sections[0]).id);
  assert.equal(B.normalize(JSON.parse(JSON.stringify(B.snapshot(edit))),false).instructions,edit.instructions);
  assert.ok(K.build(K.fromRecipe('blank',p.sections[1])).includes('#112233'));
  assert.equal(B.all().filter(x=>x.base&&p.sections.includes(x.base)).length,1);
  assert.ok(K.scriptPrompt(p.sections[1],'Hello').includes('Regla compartida'));
 }
}
// Simular biblioteca anterior real, dos países personalizados: conservar HTML y cada recurso.
const [legacyUs,legacyCa]=golden.library;
const oldStorage=memory();oldStorage.setItem(B.KEY,JSON.stringify({version:1,kits:[legacyUs,legacyCa]}));
const legacy={tournament:'psg-canada',look:'auto',sections:[{type:'title',d:{text:'Original',style:'principal'}}],off:{},franjaLeft:'Camp'};
B.load(oldStorage);assert.equal(hash(K.build(legacy)),golden.canadaHash);
assert.ok(oldStorage.getItem(B.KEY+'-before-profiles-v1'));
assert.equal(B.custom().filter(x=>x.legacyBase).length,2);
assert.ok(B.brandKit('psg-canada').assets.some(a=>a.name==='Foto Canada exclusiva'));
let archived=B.custom().find(k=>k.legacyBase==='psg-canada');archived.colors.principal='#991122';B.save(archived,oldStorage);assert.equal(hash(K.build(legacy)),golden.canadaHash,'Editar una copia recuperada no modifica newsletters anteriores');
const count=B.all().length;B.load(oldStorage);assert.equal(B.all().length,count,'Migración idempotente');
assert.equal(B.brandKit('psg-usa').colors.principal,'#445566','Prioridad USA y copias previas recuperables');
// Falla al guardar la migración: no borrar biblioteca ni declarar que está cargada.
const failing=memory();failing.setItem(B.KEY,JSON.stringify({version:1,kits:[legacyUs,legacyCa]}));const raw=failing.getItem(B.KEY);failing.setItem=()=>{throw Error('sin espacio')};assert.throws(()=>B.load(failing),/sin espacio/);assert.equal(failing.getItem(B.KEY),raw);
// El HTML antiguo sigue idéntico con catálogo cargado y sin migrar contenido.
B.load(memory());
for(const t of K.CLIENT.tournaments)for(const look of ['classic','auto']){const st={tournament:t.id,look,name:'Conservada',franjaLeft:'Camp',off:{},sections:[{type:'title',d:{text:'Hello 2027',style:'principal'}},{type:'contacto',d:{}}]};assert.equal(hash(K.build(st)),golden.cases[t.id+'/'+look],t.id+' '+look);}
console.log('OK: siete kits, instrucciones, render automático, Camps compartidos, migración recuperable/idempotente/fallo de espacio y HTML anterior conservado.');

const wch=K.fromRecipe('blank','rmf-wc');wch.contactEmail='event@example.com';
assert.ok(K.build(wch).includes('mailto:event@example.com'));
assert.ok(!K.check(wch,K.build(wch)).some(x=>/Contacto WCH pendiente/.test(x.msg)));
assert.ok(!K.build(K.fromRecipe('blank','rmf-usa')).includes('event@example.com'),'El contacto no se comparte entre eventos');
