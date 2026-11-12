require('../js/head.js');require('../js/brands.js');require('../js/modules.js');
const K=globalThis.KSA, fs=require('fs');
const st=K.fromRecipe('ref1'); const html=K.build(st);
// La BASE es un email real enviado como «KSA Global Stage»; desde el 12/11/2026 la marca se llama «Kaptiva Global Stage».
const ref=fs.readFileSync(__dirname+'/BASE-KSAGS-GLOBAL-STAGE.txt','utf8').replace(/KSA Global Stage/g,'Kaptiva Global Stage');
const norm=s=>s.replace(/<!-- \[\d+\][^>]*-->/g,'').replace(/\s+/g,' ').replace(/> </g,'><').trim();
const a=norm(html), b=norm(ref);
console.log('igual:',a===b, a.length,b.length);
if(a!==b){let i=0;while(a[i]===b[i])i++;console.log('APP:',a.slice(i-80,i+200));console.log('REF:',b.slice(i-80,i+200));}
console.log(K.check(st,html));
// todos los módulos, otro torneo
const all=K.fromRecipe('productos','fit'); all.sections.push(...K.fromRecipe('anuncio').sections);
const h2=K.build(all); console.log('fit restos:',(h2.match(/#6F4ACC|#91FAFB/g)||[]).length, h2.length);
