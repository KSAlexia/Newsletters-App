const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={URL,console};c.globalThis=c;c.window=c;vm.createContext(c);for(const f of ['head','brands','brand-designs','brand-kits','modules'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);const K=c.KSA;
function state(d){let s=K.fromRecipe('blank','arsenal-exp');s.sections=[{id:'wallet',type:'wallet',d}];return s;}
const broken={text:'Apple Wallet\nAdd to Google Wallet Button\n{[C-QRCODE_LINK]}'};
const old=state({...broken});assert.ok(K.build(old).includes('>Apple Wallet</p>'),'Loading legacy data never silently removes content');
assert.ok(K.cleanWallet(broken));assert.equal(broken.text,'');assert.equal(broken.qr,'personal');assert.equal(K.cleanWallet(broken),false,'Cleanup is idempotent');
let html=K.build(state(broken));assert.ok(html.includes('href="{[C-PASSBOOK_LINK]}"'));assert.ok(html.includes('href="{[C-GOOGLEWALLET_LINK]}"'));assert.ok(html.includes('src="{[C-QRCODE_LINK]}"'));assert.ok(!html.includes('>Apple Wallet</p>'));assert.ok(!html.includes('QRCodeType.gif'));
const preview=K.build(state(broken),{preview:true});assert.ok(preview.includes('Se genera para cada destinatario'));assert.ok(!preview.includes('src="{[C-QRCODE_LINK]}"'));
assert.ok(!K.check(state(broken),html).some(x=>x.level==='error'&&/Wallet|enlace/.test(x.msg)));
const imp=K.importProject(JSON.stringify({tournament:'arsenal-exp',sections:[{type:'wallet',d:{text:'Save your ticket.\nApple Wallet\nAdd to Google Wallet Button\n{[C-QRCODE_LINK]}'}}]}));assert.equal(imp.state.sections[0].d.text,'Save your ticket.');assert.equal(imp.state.sections[0].d.qr,'personal');assert.equal(imp.notes.length,1);
let bad={googleUrl:'https://app.cvent.com/Subscribers/Events2/Emails/EmailDesigner?evtstub=test',appleUrl:'javascript:alert(1)',googleImage:'https://example.com/not-cvent.png',qr:'personal',qrUrl:'https://www.cvent.com/g/images/QRCodeType.gif'};
let safe=K.build(state(bad));assert.ok(!safe.includes('EmailDesigner')&&!safe.includes('javascript:')&&!safe.includes('not-cvent.png')&&!safe.includes('QRCodeType.gif'));assert.ok(K.check(state(bad),safe).filter(x=>x.level==='error'&&/^Wallet:/.test(x.msg)).length===4);
let custom={buttons:'google',googleUrl:'https://pay.google.com/gp/v/save/test',googleImage:'https://custom.cvent.com/badge.png',qr:'personal',qrUrl:'https://custom.cvent.com/qr.png'};let out=K.build(state(custom));assert.ok(out.includes('href="https://pay.google.com/gp/v/save/test"'));assert.ok(out.includes('src="https://custom.cvent.com/badge.png"'));assert.ok(out.includes('src="https://custom.cvent.com/qr.png"'));assert.ok(!out.includes('C-PASSBOOK_LINK'));assert.ok(K.check(state(custom),out).some(x=>x.level==='warn'&&/URL fija/.test(x.msg)));
const fields=K.MODULES.wallet.fields;assert.equal(fields.find(f=>f.k==='googleUrl').fallback,'{[C-GOOGLEWALLET_LINK]}');assert.equal(fields.find(f=>f.k==='appleUrl').fallback,'{[C-PASSBOOK_LINK]}');assert.ok(fields.some(f=>f.type==='action'));
for(const prompt of [K.importPrompt('arsenal-exp'),K.scriptPrompt('psg-exp','Hello')])assert.ok(prompt.includes('WALLETS Y QR')&&prompt.includes('EmailDesigner/EmailPreview')&&prompt.includes('qr="personal"'));
console.log('OK: Wallet editable, QR personal como imagen, limpieza idempotente, enlaces de editor rechazados, HTML legacy intacto e instrucciones.');
// Automatic import recognition is independent of brand and of the module the AI chose.
const A='https://www.cvent-assets.com/event-email-editor/assets/images/US-UK_Add_to_Apple_Wallet_RGB_101421__d018a8bb15e6d1b46780.png';
const G='https://www.cvent-assets.com/event-email-editor/assets/images/enUS_add_to_google_wallet_add-wallet-badge__b79d999246ba9434bcd9.png';
function importSections(sections,tournament='arsenal-exp'){return K.importProject(JSON.stringify({tournament,sections}));}
for(const brand of K.CLIENT.tournaments){
 const imported=importSections([{type:'images',d:{f1_src:A,f2_src:G}},{type:'text',d:{text:'{[C-QRCODE_LINK]}'}}],brand.id);
 assert.equal(imported.state.sections.length,1,brand.id);const d=imported.state.sections[0].d;
 assert.equal(d.buttons,'both');assert.equal(d.qr,'personal');assert.equal(d.googleUrl,'{[C-GOOGLEWALLET_LINK]}');
 const h=K.build(imported.state);assert.ok(h.includes('href="{[C-PASSBOOK_LINK]}"')&&h.includes('src="{[C-QRCODE_LINK]}"'));
}
let qrOnly=importSections([{type:'imagen',d:{src:'{[C-QRCODE_LINK]}',alt:'QR Code'}}]).state;
assert.equal(qrOnly.sections[0].d.buttons,'none');assert.ok(!K.build(qrOnly).includes('C-GOOGLEWALLET_LINK'));
let mixed=importSections([{type:'images',d:{f1_src:'https://custom.cvent.com/photo.jpg',f1_alt:'Photo',f2_src:A,f3_src:'https://custom.cvent.com/telegram-qr.png',f3_alt:'Telegram QR'}}]).state;
assert.equal(mixed.sections.length,3);assert.equal(mixed.sections[0].d.f1_src,'https://custom.cvent.com/photo.jpg');assert.equal(mixed.sections[1].d.buttons,'apple');assert.equal(mixed.sections[2].d.f1_src,'https://custom.cvent.com/telegram-qr.png');
let buttons=importSections([{type:'button',d:{btn:'Add to Apple Wallet',url:'{[C-PASSBOOK_LINK]}'}},{type:'boton',d:{btn:'Add to Google Wallet',url:'https://app.cvent.com/Subscribers/Emails/EmailDesigner?test=1'}}]).state;
assert.equal(buttons.sections.length,1);assert.equal(buttons.sections[0].d.buttons,'both');assert.ok(!K.build(buttons).includes('EmailDesigner'));
const md='Keep this pass for check-in.\n| [Add to Apple Wallet](https://www.cvent.com/passbook/pass/apple?) ([image]('+A+')) | [Add to Google Wallet](https://app.cvent.com/Subscribers/Emails/EmailDesigner?test=1) ([image]('+G+')) |\n| --- | --- |\n{[C-QRCODE_LINK]}\nAsk us for help.';
let markdown=importSections([{type:'text',d:{text:md}}]).state;
assert.deepEqual(Array.from(markdown.sections,x=>x.type),['text','wallet','text']);assert.equal(markdown.sections[0].d.text,'Keep this pass for check-in.');assert.equal(markdown.sections[1].d.buttons,'both');assert.equal(markdown.sections[1].d.qr,'personal');assert.equal(markdown.sections[2].d.text,'Ask us for help.');assert.ok(!K.build(markdown).includes('EmailDesigner'));
const ordinary=[{type:'text',d:{text:'The QR can be saved in Apple Wallet or Google Wallet.'}},{type:'images',d:{f1_src:'https://custom.cvent.com/telegram.png',f1_alt:'Join Telegram QR'}}];
assert.deepEqual(Array.from(importSections(ordinary).state.sections,x=>x.type),['text','images']);
const again=importSections(markdown.sections).state;assert.equal(again.sections.length,markdown.sections.length);assert.equal(again.sections.filter(x=>x.type==='wallet').length,1);
console.log('OK: detección automática desde imágenes, enlaces, tokens y tabla Markdown en las 19 secciones; sin duplicar ni confundir Telegram.');
// Regressions found in the review: mixed linked images, configured QR and duplicated badges.
for(const brand of K.CLIENT.tournaments){
 const linked=importSections([{type:'images',d:{size:'inset',scale:'70',f1_src:A,f1_url:'{[C-PASSBOOK_LINK]}',f2_src:'https://custom.cvent.com/telegram.png',f2_alt:'Telegram QR',f2_url:'https://t.me/club',f3_src:'https://custom.cvent.com/photo.jpg',f3_alt:'Photo'}}],brand.id).state;
 const pics=linked.sections.find(x=>x.type==='images').d;
 assert.equal(pics.f1_src,'https://custom.cvent.com/telegram.png');assert.equal(pics.f1_url,'https://t.me/club',brand.id);
 assert.equal(pics.f2_src,'https://custom.cvent.com/photo.jpg');assert.equal(pics.f2_url,undefined,'A photo without a link must not inherit one');
 assert.equal(pics.f3_url,undefined);assert.equal(pics.size,'inset');assert.equal(pics.scale,'70');
 assert.ok(K.build(linked).includes('href="https://t.me/club"'));
 const customQr='https://custom.cvent.com/event-specific-qr.png';
 for(const sections of [
  [{type:'wallet',d:{qr:'personal',qrUrl:customQr}},{type:'text',d:{text:'{[C-QRCODE_LINK]}'}}],
  [{type:'text',d:{text:'{[C-QRCODE_LINK]}'}},{type:'wallet',d:{qr:'personal',qrUrl:customQr}}]
 ]){
  const fixed=importSections(sections,brand.id).state;
  assert.equal(fixed.sections.length,1);assert.equal(fixed.sections[0].d.qrUrl,customQr);assert.ok(K.build(fixed).includes('src="'+customQr+'"'));
 }
 for(const sections of [
  [{type:'images',d:{f1_src:A}},{type:'wallet',d:{buttons:'apple'}}],
  [{type:'wallet',d:{buttons:'apple'}},{type:'images',d:{f1_src:A}}],
  [{type:'wallet',d:{buttons:'apple'}},{type:'wallet',d:{buttons:'apple'}}]
 ]){
  const fixed=importSections(sections,brand.id).state;
  assert.equal(fixed.sections.length,1);assert.equal(fixed.sections[0].d.buttons,'apple');
  assert.equal((K.build(fixed).match(/alt="Add to Apple Wallet"/g)||[]).length,1,brand.id);
 }
}
// Both sides of a mixed row retain their own links after splitting.
const split=importSections([{type:'images',d:{f1_src:'https://custom.cvent.com/photo1.jpg',f1_alt:'Before',f1_url:'https://example.com/before',f2_src:A,f2_url:'{[C-PASSBOOK_LINK]}',f3_src:'https://custom.cvent.com/photo3.jpg',f3_alt:'After',f3_url:'https://example.com/after'}}]).state;
assert.equal(split.sections[0].d.f1_url,'https://example.com/before');assert.equal(split.sections[2].d.f1_url,'https://example.com/after');assert.equal(split.sections[2].d.f2_url,undefined);
// Preserve configured links/badges and human copy when eliminating repeated defaults.
const settings={buttons:'apple',appleUrl:'https://example.com/my-pass',appleImage:'https://custom.cvent.com/my-badge.png',title:'Save your pass',text:'Show this at check-in.'};
for(const sequence of [[{type:'images',d:{f1_src:A}},{type:'wallet',d:settings}],[{type:'wallet',d:settings},{type:'images',d:{f1_src:A}}]]){
 const result=importSections(sequence).state;assert.equal(result.sections.length,1);
 for(const key of Object.keys(settings))assert.equal(result.sections[0].d[key],settings[key]);
 assert.equal(importSections(result.sections).state.sections.length,1,'Reimporting a normalized block does not create duplicates');
}
// Distinct passes and distinct QR images represent different content: keep both, with a notice.
for(const pair of [
 [{buttons:'apple',appleUrl:'https://example.com/pass-a'},{buttons:'apple',appleUrl:'https://example.com/pass-b'}],
 [{buttons:'none',qr:'personal',qrUrl:'https://custom.cvent.com/qr-a.png'},{buttons:'none',qr:'personal',qrUrl:'https://custom.cvent.com/qr-b.png'}],
 [{title:'Player pass'},{title:'Parent pass'}],
 [{text:'Information A'},{text:'Information B'}]
]){
 const result=importSections(pair.map(d=>({type:'wallet',d})));assert.equal(result.state.sections.length,2);assert.ok(result.notes.some(n=>n.includes('se conservan separados')));
}
const separated=importSections([{type:'wallet',d:{buttons:'apple'}},{type:'text',d:{text:'Another part of the email'}},{type:'wallet',d:{buttons:'apple'}}]).state;
assert.equal(separated.sections.length,3,'Do not move badges across intervening content');
console.log('OK: tres regresiones corregidas en las 19 secciones; enlaces, QR configurados, textos y pases distintos conservados.');

const arrayWallet=importSections([{type:'wallet',d:{text:['Human text','Apple Wallet','{[C-QRCODE_LINK]}']}}]).state;assert.equal(arrayWallet.sections[0].d.text,'Human text');assert.equal(arrayWallet.sections[0].d.qr,'personal');
