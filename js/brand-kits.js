// Biblioteca local de marca y copias de los ajustes aplicados a cada newsletter.
(function (root) {
  var K = root.KSA = root.KSA || {}, B = K.BrandKits = {};
  B.KEY = 'kaptiva-newsletters-brand-kits-v1';
  B.roles = [['Extenda60', 'Titulares principales'], ['Extenda40', 'Titulares secundarios'], ['DinProBlack', 'Cifras y títulos con números'], ['DinProBold', 'Texto en negrita'], ['DinProLight', 'Texto ligero'], ['DinProMedium', 'Etiquetas'], ['DinProRegular', 'Texto de párrafo']];
  var kits = [], legacyKits = [], loaded = false;
  function profile(tid) { return K.Designs && K.Designs.forSection(tid); }
  B.canonical = function (tid) { return K.Designs ? K.Designs.canonical(tid) : tid; };
  B.catalog = function () { var seen = {}; return K.CLIENT.tournaments.filter(function (t) { var id = B.canonical(t.id); if (seen[id]) return false; seen[id] = true; return true; }).map(function (t) { var p = profile(t.id); return { id: B.canonical(t.id), name: p ? p.name : t.name }; }); };
  function str(v) { return typeof v === 'string' ? v.trim() : ''; }
  function copy(v) { return JSON.parse(JSON.stringify(v)); }
  B.url = function (value, image) {
    value = str(value); if (!value) return '';
    if (!/^https:\/\//i.test(value) || /[\s<>"'()\\]/.test(value)) throw Error('Usa una URL HTTPS completa, sin espacios ni comillas.');
    var u; try { u = new URL(value); } catch (e) { throw Error('La URL no es válida.'); }
    if (u.username || u.password || (image && u.hostname !== 'custom.cvent.com')) throw Error('Las imágenes necesitan el custom link HTTPS de custom.cvent.com.');
    return value;
  };
  function image(raw, refs) {
    raw = raw || {}; var out = { name: str(raw.name), url: B.url(raw.url, true) };
    if (refs && raw.reference) {
      var data = str(raw.reference.data);
      var payload = data.match(/^data:image\/(?:png|jpeg|webp|gif);base64,([a-zA-Z0-9+/]+={0,2})$/);
      if (!payload || payload[1].length % 4 || (payload[1].length * 3 / 4 - (payload[1].match(/=+$/) || [''])[0].length) > 700 * 1024) throw Error('La referencia debe ser PNG, JPG, WebP o GIF de hasta 700 KB.');
      out.reference = { name: str(raw.reference.name), data: data };
    }
    return out;
  }
  B.normalize = function (raw, refs) {
    if (!raw || typeof raw !== 'object') throw Error('El archivo no contiene un brand kit válido.');
    var out = { id: str(raw.id), name: str(raw.name), tournament: str(raw.tournament), colors: {}, fonts: {}, banners: [], assets: [] };
    // base: este kit sustituye al diseño de esa marca/sección para sus newsletters con «Kit automático del torneo».
    var base = str(raw.base);
    if (base) { if (!K.CLIENT.tournaments.some(function (t) { return t.id === base; })) throw Error('El kit de marca apunta a una sección que no existe.'); out.base = base; out.tournament = base; }
    ['designId','designVersion','instructions','legacyBase','legacyName'].forEach(function (key) { if (typeof raw[key] === 'string') out[key] = raw[key]; });
    if (out.instructions && out.instructions.length > 40000) throw Error('Las instrucciones admiten hasta 40000 caracteres.');
    if (out.designId && (!K.Designs || !K.Designs.get(out.designId))) throw Error('Perfil de diseño desconocido.');
    if (!out.name) throw Error('Escribe un nombre para el kit.');
    if (out.name.length > 150) throw Error('El nombre del kit admite hasta 150 caracteres.');
    ['principal', 'acento', 'secundario'].forEach(function (key) {
      var v = str((raw.colors || {})[key]);
      if (!v && key === 'secundario') { out.colors[key] = ''; return; }
      if (!/^#[\da-f]{6}$/i.test(v)) throw Error('Los colores deben tener formato #RRGGBB.');
      out.colors[key] = v;
    });
    ['header', 'footer', 'mediaBanner'].forEach(function (key) { out[key] = image(raw[key], refs); });
    B.roles.forEach(function (role) { out.fonts[role[0]] = B.url((raw.fonts || {})[role[0]], false); });
    // banners: gráficos recurrentes extra (además de header, footer y banner de media). assets: fotos para los bloques.
    if (raw.banners && !Array.isArray(raw.banners)) throw Error('La lista de banners no es válida.');
    if ((raw.banners || []).length > 30) throw Error('Cada kit admite hasta 30 banners.');
    (raw.banners || []).forEach(function (a) { out.banners.push(image(a, refs)); });
    if (raw.assets && !Array.isArray(raw.assets)) throw Error('La biblioteca de imágenes no es válida.');
    if ((raw.assets || []).length > 30) throw Error('Cada kit admite hasta 30 imágenes.');
    (raw.assets || []).forEach(function (a) { out.assets.push(image(a, refs)); });
    if (refs && JSON.stringify(out).length > 2300000) throw Error('El kit supera el tamaño local permitido. Reduce las referencias o usa custom links.');
    return out;
  };
  B.snapshot = function (kit) { return B.normalize(kit, false); };
  // Kit que usa una newsletter: el que se le aplicó (copia guardada con ella) o, si no tiene, el kit de su marca editado en este navegador.
  B.forState = function (st) {
    try {
      if (st.brandKit) return B.snapshot(st.brandKit);
      var tid = K.tournament(st.tournament).id;
      if (K.Designs && K.Designs.active(st)) return B.snapshot(B.brandKit(tid) || B.defaults(tid));
      var original = legacyKits.filter(function(k){return k.base===tid;})[0];
      if(original) return B.snapshot(original);
      var legacy = kits.filter(function (k) { return k.legacyBase === tid; })[0];
      if (legacy) { var frozen = B.snapshot(legacy); frozen.base = tid; frozen.name = legacy.legacyName || frozen.name; return frozen; }
      var own = kits.filter(function (k) { return k.base === tid && !k.designId; })[0]; return own ? B.snapshot(own) : null;
    } catch (e) { return null; }
  };
  B.brandKit = function (tid) { return copy(kits.filter(function (k) { return k.base === B.canonical(tid); })[0] || null); };
  B.custom = function () { return B.all().filter(function (k) { return !k.base; }); };
  // Borrador para editar el kit de una marca: el guardado si existe; si no, el diseño de la app.
  B.brandDraft = function (tid) { tid = B.canonical(tid); var own = B.brandKit(tid); if (own) return own; var d = B.defaults(tid); d.base = tid; return d; };
  B.defaults = function (id) {
    var t = K.tournament(id), fonts = {};
    B.roles.forEach(function (r) {
      if (t.fonts) { fonts[r[0]] = t.fonts[r[0]] || ''; return; }
      var face = (K.HEAD.match(/@font-face\s*\{[^}]*\}/g) || []).filter(function (x) { return x.indexOf("font-family: '" + r[0] + "'") >= 0; })[0] || '';
      var url = face.match(/src: url\('([^']+)'\)/); fonts[r[0]] = url ? url[1] : '';
    });
    return { id: '', name: t.name, tournament: t.id, colors: { principal: t.principal, acento: t.acento, secundario: t.secundario || '' }, header: { name: t.club ? t.brand : K.CLIENT.name + ' · ' + t.name, url: t.header || '' }, footer: { name: t.footerAlt || '', url: t.footer || '' }, mediaBanner: { name: 'Media Packages', url: t.club ? (t.mediaBanner || '') : K.CLIENT.mediaBanner }, fonts: fonts, banners: (t.banners || []).map(function (a) { return { name: a.name, url: a.url }; }), assets: (t.assets || []).map(function (a) { return { name: a.name, url: a.url }; }) };
  };
  var originalDefaults = B.defaults;
  B.defaults = function (tid) {
    var out = originalDefaults(tid), p = profile(tid);
    if (!p) return out;
    out.name = p.name; out.tournament = B.canonical(tid);
    if (p.id.indexOf('psg')!==0) B.roles.forEach(function(r){out.fonts[r[0]]='';});
    out.designId = p.id; out.designVersion = p.version; out.instructions = p.instructions;
    out.colors = { principal:p.principal, acento:p.acento, secundario:p.secundario };
    out.header = { name:p.name, url:p.header }; out.footer = { name:p.id==='rmf-wch'?'See You in Madrid':p.name, url:p.footer };
    out.banners = copy(p.banners); out.assets = copy(p.assets); return out;
  };
  B.instructionsFor = function (st) {
    var k=B.forState(st), p=profile(st.tournament), text=k&&k.instructions||p&&p.instructions||'Diseño original de esta marca. Todavía no tiene instrucciones específicas.';
    if(K.Designs && (K.Designs.active(st)||st.designVersion===K.Designs.version)) {
      text+='\nRegla común vigente: mínimo 20 px de separación inferior por bloque visual. Se permite extraer hechos de párrafos y redactar etiquetas breves para recuadros, sin inventar cifras, fechas ni años.';
      if((k&&k.designId||p&&p.id||'').indexOf('arsenal')===0) text+='\nRegla Arsenal vigente (prevalece sobre indicaciones anteriores): franja roja #B4001E; texto blanco Helvetica/Arial 10/14 px, negrita y espaciado 1 px; titulares Georgia 32/40 px, espaciado -0.5 px.';
    }
    return {name:k?k.name:p?p.name:K.tournament(st.tournament).name,text:text,version:k&&k.designVersion||p&&p.version||'',preserved:!!(p&&!K.Designs.active(st))};
  };
  // Se conserva la biblioteca anterior íntegra y una copia visible de cada personalización.
  function migrate(list) {
    var result = list.filter(function (k) { return !k.base || !profile(k.base); });
    K.Designs.profiles.forEach(function (p) {
      var old = list.filter(function (k) { return k.base && p.sections.indexOf(k.base)>=0; }).sort(function(a,b){return p.sections.indexOf(a.base)-p.sections.indexOf(b.base);});
      if (!old.length) return;
      var merged = B.defaults(p.sections[0]); merged.base=p.sections[0]; merged.id='brand-'+merged.base;
      old.forEach(function (k,index) {
        var archive=copy(k); archive.legacyBase=k.base; archive.legacyName=k.name; delete archive.base;
        archive.id='archive-profiles-'+k.id; archive.name=k.name+' · anterior a la unificación'; result.push(archive);
        var defaults=originalDefaults(k.base);
        if (!index) {
          ['colors','fonts','header','footer','mediaBanner'].forEach(function(field) {
            Object.keys(k[field]||{}).forEach(function(key) { if(JSON.stringify(k[field][key])!==JSON.stringify((defaults[field]||{})[key])) merged[field][key]=copy(k[field][key]); });
          });
          if(k.name!==defaults.name) merged.name=k.name;
          if(k.instructions) merged.instructions=k.instructions;
        }
        ['banners','assets'].forEach(function(field){
          (k[field]||[]).forEach(function(a){ if(!merged[field].some(function(b){return JSON.stringify(a)===JSON.stringify(b);}) && merged[field].length<30) merged[field].push(copy(a)); });
        });
      });
      result.push(merged);
    });
    return result;
  }
  // Recursos de un kit por apartado: «banners» (header, footer, banner de media y gráficos recurrentes) y «fotos».
  B.groups = function (kit) {
    return { banners: [kit.header, kit.footer, kit.mediaBanner].concat(kit.banners || []), fotos: (kit.assets || []).slice() };
  };
  B.empty = function () { var k = B.defaults(); k.name = 'Nuevo brand kit'; k.tournament = ''; ['header', 'footer', 'mediaBanner'].forEach(function (x) { k[x] = { name: '', url: '' }; }); B.roles.forEach(function (r) { k.fonts[r[0]] = ''; }); return k; };
  B.load = function (storage) {
    loaded = false;
    var text = storage.getItem(B.KEY), raw = text ? JSON.parse(text) : { version: 1, kits: [] };
    if (raw.version !== 1 || !Array.isArray(raw.kits)) throw Error('Formato de biblioteca de marca no compatible.');
    var ids = {};
    var list = raw.kits.map(function (k) { var n = B.normalize(k, true); if (!n.id || ids[n.id]) throw Error('Identificador de kit inválido o repetido.'); ids[n.id] = true; return n; });
    if (K.Designs && raw.profilesVersion !== 1) {
      var migrated = migrate(list);
      if (JSON.stringify(migrated)!==JSON.stringify(list)) {
        if (!storage.getItem(B.KEY+'-before-profiles-v1')) storage.setItem(B.KEY+'-before-profiles-v1', text);
        storage.setItem(B.KEY, JSON.stringify({version:1, profilesVersion:1, kits:migrated}));
      }
      list = migrated;
    }
    legacyKits = [];
    if(K.Designs){var backupText=storage.getItem(B.KEY+'-before-profiles-v1'); if(backupText){var backup=JSON.parse(backupText);legacyKits=(backup.kits||[]).map(function(k){return B.normalize(k,true);});}}
    kits = list; loaded = true; return B.all();
  };
  B.all = function () { return copy(kits); };
  B.find = function (id) { var direct = B.all().filter(function (k) { return k.id === id; })[0]; if(direct) return direct; if (typeof id==='string' && id.indexOf('brand-')===0) return B.brandKit(id.slice(6)); };
  B.save = function (raw, storage) {
    if (!loaded) throw Error('La biblioteca no se ha cargado correctamente. No se sobrescribirán los datos.');
    var kit = B.normalize(raw, true);
    if (kit.base) { kit.base = B.canonical(kit.base); kit.tournament = kit.base; }
    if (kit.base) kit.id = 'brand-' + kit.base; // un único kit editado por marca/sección
    if (!kit.id) kit.id = 'kit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    var list = B.all(), index = list.findIndex(function (k) { return k.id === kit.id; });
    if (index < 0) list.push(kit); else list[index] = kit;
    // La memoria solo cambia después de guardar correctamente.
    storage.setItem(B.KEY, JSON.stringify({ version: 1, profilesVersion: K.Designs ? 1 : undefined, kits: list })); kits = list; return copy(kit);
  };
  B.remove = function (id, storage) {
    if (!loaded) throw Error('La biblioteca no se ha cargado correctamente. No se sobrescribirán los datos.');
    var list = B.all().filter(function (k) { return k.id !== id; });
    storage.setItem(B.KEY, JSON.stringify({ version: 1, profilesVersion: K.Designs ? 1 : undefined, kits: list })); kits = list;
  };
  B.effectiveTournament = function (st) {
    var t = K.tournament(st.tournament), kit = B.forState(st);
    var p = K.Designs && K.Designs.active(st) ? (kit && kit.designId ? K.Designs.get(kit.designId) : profile(t.id)) : null;
    if (p) {
      var serif = "Georgia, 'Times New Roman', Times, serif", sans = 'Helvetica, Arial, sans-serif';
      t = Object.assign({}, t, { theme:K.Designs.theme(p, kit), families:p.id.indexOf('psg')===0?null:{Extenda60:serif,Extenda40:serif,DinProBlack:serif,DinProBold:sans,DinProRegular:sans,DinProLight:sans,DinProMedium:sans} });
      if(/camps$/.test(p.id)) t.franjaRight=p.id==='psg-camps'?'PSG SUMMER CAMPS':p.id==='arsenal-camps'?'ARSENAL SUMMER CAMP':'SUMMER CAMPS';
      if(p.id==='rmf-wch') { t.franjaLeft='WORLD CHALLENGE 2027';t.franjaRight='FUNDACIÓN REAL MADRID'; }
    }
    if (typeof st.contactEmail==='string' && st.contactEmail.trim()) t=Object.assign({},t,{contact:st.contactEmail.trim()});
    return kit ? Object.assign({}, t, { principal: kit.colors.principal, acento: kit.colors.acento, secundario: kit.colors.secundario || null, header: kit.header.url, footer: kit.footer.url, footerAlt: kit.footer.name }) : t;
  };
  B.fontHtml = function (html, kit) {
    if (!kit) return html;
    return html.replace(/@font-face\s*\{[^}]*\}/g, function (face) {
      var role = B.roles.filter(function (r) { return face.indexOf("font-family: '" + r[0] + "'") >= 0; })[0];
      if (!role) return face;
      var url = kit.fonts[role[0]]; if (!url) return '';
      var path = new URL(url).pathname.toLowerCase(), format = /\.woff2$/.test(path) ? 'woff2' : /\.woff$/.test(path) ? 'woff' : /\.ttf$/.test(path) ? 'truetype' : 'opentype';
      return face.replace(/src:\s*url\('[^']*'\)\s*format\('[^']*'\)/, function () { return "src: url('" + url + "') format('" + format + "')"; });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
