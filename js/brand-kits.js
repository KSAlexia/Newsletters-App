// Biblioteca local de marca y copias de los ajustes aplicados a cada newsletter.
(function (root) {
  var K = root.KSA = root.KSA || {}, B = K.BrandKits = {};
  B.KEY = 'kaptiva-newsletters-brand-kits-v1';
  B.roles = [['Extenda60', 'Titulares principales'], ['Extenda40', 'Titulares secundarios'], ['DinProBlack', 'Cifras y títulos con números'], ['DinProBold', 'Texto en negrita'], ['DinProLight', 'Texto ligero'], ['DinProMedium', 'Etiquetas'], ['DinProRegular', 'Texto de párrafo']];
  var kits = [], loaded = false;
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
    var out = { id: str(raw.id), name: str(raw.name), tournament: str(raw.tournament), colors: {}, fonts: {}, assets: [] };
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
    if (raw.assets && !Array.isArray(raw.assets)) throw Error('La biblioteca de imágenes no es válida.');
    if ((raw.assets || []).length > 30) throw Error('Cada kit admite hasta 30 imágenes.');
    (raw.assets || []).forEach(function (a) { out.assets.push(image(a, refs)); });
    if (refs && JSON.stringify(out).length > 2300000) throw Error('El kit supera el tamaño local permitido. Reduce las referencias o usa custom links.');
    return out;
  };
  B.snapshot = function (kit) { return B.normalize(kit, false); };
  B.forState = function (st) { try { return st.brandKit ? B.snapshot(st.brandKit) : null; } catch (e) { return null; } };
  B.defaults = function (id) {
    var t = K.tournament(id), fonts = {};
    B.roles.forEach(function (r) {
      var face = (K.HEAD.match(/@font-face\s*\{[^}]*\}/g) || []).filter(function (x) { return x.indexOf("font-family: '" + r[0] + "'") >= 0; })[0] || '';
      var url = face.match(/src: url\('([^']+)'\)/); fonts[r[0]] = url ? url[1] : '';
    });
    return { id: '', name: t.name, tournament: t.id, colors: { principal: t.principal, acento: t.acento, secundario: t.secundario || '' }, header: { name: K.CLIENT.name + ' · ' + t.name, url: t.header || '' }, footer: { name: t.footerAlt || '', url: t.footer || '' }, mediaBanner: { name: 'Media Packages', url: K.CLIENT.mediaBanner }, fonts: fonts, assets: [] };
  };
  B.empty = function () { var k = B.defaults(); k.name = 'Nuevo brand kit'; k.tournament = ''; ['header', 'footer', 'mediaBanner'].forEach(function (x) { k[x] = { name: '', url: '' }; }); B.roles.forEach(function (r) { k.fonts[r[0]] = ''; }); return k; };
  B.load = function (storage) {
    loaded = false;
    var text = storage.getItem(B.KEY), raw = text ? JSON.parse(text) : { version: 1, kits: [] };
    if (raw.version !== 1 || !Array.isArray(raw.kits)) throw Error('Formato de biblioteca de marca no compatible.');
    var ids = {};
    var list = raw.kits.map(function (k) { var n = B.normalize(k, true); if (!n.id || ids[n.id]) throw Error('Identificador de kit inválido o repetido.'); ids[n.id] = true; return n; });
    kits = list; loaded = true; return B.all();
  };
  B.all = function () { return copy(kits); };
  B.find = function (id) { return B.all().filter(function (k) { return k.id === id; })[0]; };
  B.save = function (raw, storage) {
    if (!loaded) throw Error('La biblioteca no se ha cargado correctamente. No se sobrescribirán los datos.');
    var kit = B.normalize(raw, true);
    if (!kit.id) kit.id = 'kit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    var list = B.all(), index = list.findIndex(function (k) { return k.id === kit.id; });
    if (index < 0) list.push(kit); else list[index] = kit;
    // La memoria solo cambia después de guardar correctamente.
    storage.setItem(B.KEY, JSON.stringify({ version: 1, kits: list })); kits = list; return copy(kit);
  };
  B.effectiveTournament = function (st) {
    var t = K.tournament(st.tournament), kit = B.forState(st);
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
