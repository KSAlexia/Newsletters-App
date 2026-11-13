const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={URL,console};c.globalThis=c;vm.createContext(c);for(const f of ['head','brands','brand-designs','brand-kits','modules'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);
const K=c.KSA,D=K.Designs;
for(const tid of ['arsenal-exp','arsenal-usa','arsenal-canada','psg-exp','rmf-exp','rmf-wc']){
 const st=K.fromRecipe('blank',tid);st.sections=[{type:'title',d:{style:'principal',text:'Payment reminder'}},{type:'text',d:{text:'An introduction',size:'intro'}},{type:'box',d:{style:'suave',density:'editorial',title:'Registration',text:'Confirmation: {[C-CONFIRMATION NUM]}'}},{type:'datos',d:{style:'summary',l1:'Paid',v1:'{[C-AMOUNT PAID]}'}},{type:'images',d:{f1_src:'https://custom.cvent.com/image.png'}}];
 const html=K.build(st),theme=K.BrandKits.effectiveTournament(st).theme;
 if(tid.startsWith('arsenal')){
  const band=html.split('FRANJA -->')[1].split('<!-- [')[0];assert.ok(band.includes('padding:12px 40px;'));assert.ok(!band.includes('height="4"'));
  assert.equal(theme.franjaBg,'#B4001E');assert.equal(theme.franjaTracking,'1px');
  assert.ok(html.includes('font-size:10px;line-height:14px;color:#FFFFFF;letter-spacing:1px;'));
  assert.ok(html.includes('letter-spacing:-0.5px;'));
 }else{assert.equal(theme.franjaTracking||null,null);assert.ok(!html.includes('letter-spacing:-0.5px;'));}
 for(const block of html.split(/<!-- \[\d+\] /).slice(1)){
  if(!/^(TÍTULO|TITULO|TEXTO|CAJA|BANDA DE DATOS|IMAGEN)/.test(block)||block.startsWith('IMAGEN FOOTER'))continue;
  const pad=block.match(/class="wrapper"><tbody><tr><td[^>]*style="padding:([^;]+)/);assert.ok(pad);
  const v=pad[1].split(/\s+/);assert.ok(parseInt(v[2]||v[0],10)>=20,tid+' '+pad[0]);
 }
 assert.equal((html.match(/class="wrapper"><tbody><tr><td[^>]*padding:24px 40px 20px 40px/g)||[]).length,2);
 const prompt=K.importPrompt(tid);assert.ok(prompt.includes('INTERPRETAR DATOS'));assert.ok(prompt.includes('aunque no tengan etiquetas explícitas'));assert.ok(prompt.includes('no deduzcas un año ausente'));
}
const example=JSON.parse(fs.readFileSync('examples/arsenal-payment-cards/project.json','utf8'));
const {state}=K.importProject(JSON.stringify(example));const html=K.build(state);
assert.equal(state.sections[3].type,'glance');assert.equal(state.sections[3].d.v3,'September 1st');assert.ok(!state.sections[3].d.v3.includes('2026'));assert.ok(html.includes('$1500'));assert.ok(html.includes('{[C-BALANCE DUE]}'));
// A newly created non-profile project also gets spacing; legacy unversioned HTML stays untouched.
const modern=K.fromRecipe('blank','surfcup');modern.sections=[{type:'box',d:{style:'suave',density:'editorial',text:'Body'}}];assert.ok(K.build(modern).includes('padding:24px 40px 20px 40px'));
const legacy={...modern};delete legacy.designVersion;assert.ok(K.build(legacy).includes('padding:24px 40px 0 40px'));
console.log('OK: franja y tracking solo Arsenal, separación común y extracción de tres datos sin inventar año.');

assert.equal(D.theme(D.forSection('arsenal-exp'),{colors:{principal:'#123456',acento:'#654321'}}).franjaBg,'#B4001E');
