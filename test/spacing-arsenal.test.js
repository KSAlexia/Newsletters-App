const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={URL,console};c.globalThis=c;vm.createContext(c);for(const f of ['head','brands','brand-designs','brand-kits','modules'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);
const K=c.KSA,D=K.Designs;
// Huecos en px: [arriba del primer bloque, entre cada par…, abajo del último]. Cuenta el padding de la celda exterior blanca y las filas blancas de hueco.
function blockGaps(html){
 const b=html.split(/<!-- \[\d+\] /).slice(1).filter(x=>!/^(HEADER|BANNER|FRANJA|IMAGEN FOOTER|OPT-OUT)/.test(x)).map(x=>{
  const w=[...x.matchAll(/style="background-color:([^;]+);width:650px;" class="wrapper"><tbody><tr><td([^>]*)>/g)].map(m=>{const h=m[2].match(/height="(\d+)"/);if(h)return{gap:+h[1]};const p=m[2].match(/padding:([^;"]+)/)[1].split(/\s+/).map(v=>parseInt(v)||0);return{white:m[1]==='#FFFFFF',t:p[0],b:p[2]??p[0]};});
  const f=w[0],l=w[w.length-1];return{t:f.gap!=null?f.gap:f.white?f.t:0,b:l.gap!=null?l.gap:l.white?l.b:0};});
 return b.length?[b[0].t,...b.slice(1).map((x,i)=>b[i].b+x.t),b[b.length-1].b]:[];
}
for(const tid of ['arsenal-exp','arsenal-usa','arsenal-canada','psg-exp','rmf-exp','rmf-wc']){
 const st=K.fromRecipe('blank',tid);st.sections=[{type:'title',d:{style:'principal',text:'Payment reminder'}},{type:'text',d:{text:'An introduction',size:'intro'}},{type:'box',d:{style:'suave',density:'editorial',title:'Registration',text:'Confirmation: {[C-CONFIRMATION NUM]}'}},{type:'datos',d:{style:'summary',l1:'Paid',v1:'{[C-AMOUNT PAID]}'}},{type:'images',d:{f1_src:'https://custom.cvent.com/image.png'}}];
 const html=K.build(st),theme=K.BrandKits.effectiveTournament(st).theme;
 if(tid.startsWith('arsenal')){
  const band=html.split('FRANJA -->')[1].split('<!-- [')[0];assert.ok(band.includes('padding:12px 40px;'));assert.ok(!band.includes('height="4"'));
  assert.equal(theme.franjaBg,'#B4001E');assert.equal(theme.franjaTracking,'1px');
  assert.ok(html.includes('font-size:10px;line-height:14px;color:#FFFFFF;letter-spacing:1px;'));
  assert.ok(html.includes('letter-spacing:-0.5px;'));
 }else{assert.equal(theme.franjaTracking||null,null);assert.equal(html.includes('letter-spacing:-0.5px;'),tid==='rmf-wc',tid+': -0.5 px solo en Arsenal y WCH (sus ejemplos)');}
 for(const block of html.split(/<!-- \[\d+\] /).slice(1)){
  if(!/^(TÍTULO|TITULO|TEXTO|CAJA|BANDA DE DATOS|IMAGEN)/.test(block)||block.startsWith('IMAGEN FOOTER'))continue;
  const pad=block.match(/class="wrapper"><tbody><tr><td[^>]*style="padding:([^;]+)/);assert.ok(pad);
  const v=pad[1].split(/\s+/);assert.ok(parseInt(v[2]||v[0],10)>=20,tid+' '+pad[0]);
 }
 // Separación común (referencias de cada club): 36 px antes del primer bloque, 28 px entre bloques y 36 px tras el último.
 assert.equal(blockGaps(html).join(),tid==='rmf-wc'?'36,28,28,28,28,36':'36,28,28,28,36',tid); // WCH añade su contacto fijo
 const prompt=K.importPrompt(tid);assert.ok(!prompt.includes('INTERPRETAR DATOS'));assert.ok(prompt.includes('úsalas SOLO si el original ya muestra esos datos'));assert.ok(prompt.includes('no deduzcas un año ausente'));
}
const example=JSON.parse(fs.readFileSync('examples/arsenal-payment-cards/project.json','utf8'));
const {state}=K.importProject(JSON.stringify(example));const html=K.build(state);
assert.equal(state.sections[3].type,'glance');assert.equal(state.sections[3].d.v3,'September 1st');assert.ok(!state.sections[3].d.v3.includes('2026'));assert.ok(html.includes('$1500'));assert.ok(html.includes('{[C-BALANCE DUE]}'));
// A newly created non-profile project also gets spacing; legacy unversioned HTML stays untouched.
const modern=K.fromRecipe('blank','surfcup');modern.sections=[{type:'box',d:{style:'suave',density:'editorial',text:'Body'}}];assert.ok(K.build(modern).includes('padding:36px 40px 36px 40px'));
const legacy={...modern};delete legacy.designVersion;assert.ok(K.build(legacy).includes('padding:24px 40px 0 40px'));
// Los siete ejemplos de prueba-cvent (respuestas de ChatGPT importadas): siempre 28 px entre bloques; un título solo queda a 14 px
// del bloque que encabeza (WCH: título de sección pegado a su bloque, como en sus ejemplos).
for(const f of fs.readdirSync('examples/prueba-cvent').filter(f=>f.endsWith('.json'))){
 const s=K.importProject(fs.readFileSync('examples/prueba-cvent/'+f,'utf8')).state;s.designVersion=D.version;
 const g=blockGaps(K.build(s)),inner=g.slice(1,-1);
 assert.equal(g[0],36,f);assert.equal(g[g.length-1],36,f);
 assert.ok(inner.every(x=>[28,14,12,20,22].includes(x)||(f.startsWith('rmf-world')&&x===0)),f+': '+inner.join()); // 12: cajas seguidas; 20/22: encima y debajo de un separador
 assert.ok(inner.filter(x=>x===28||x===20||x===22).length>=inner.length/2,f);
}
// Bandas de color: el hueco va en filas blancas aparte, no dentro de la banda.
{const s=K.fromRecipe('blank','psg-exp');s.sections=[{type:'text',d:{text:'A'}},{type:'datos',d:{style:'banda',l1:'Paid',v1:'X'}},{type:'text',d:{text:'B'}}];const h=K.build(s);
 const band=h.split(/<!-- \[\d+\] /).find(x=>x.startsWith('BANDA'));if(band){assert.ok(band.includes('height="28"'),'fila blanca de 28 px tras la banda');}
 assert.equal(blockGaps(h).join(),'36,28,28,36');}
console.log('OK: franja y tracking solo Arsenal, separación común y extracción de tres datos sin inventar año.');

assert.equal(D.theme(D.forSection('arsenal-exp'),{colors:{principal:'#123456',acento:'#654321'}}).franjaBg,'#B4001E');
