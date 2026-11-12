(function () {
  var K = window.KSA, B = K.BrandKits, U = K.BrandKitsUI = {}, $ = function (s) { return document.querySelector(s); };
  var draft, dirty = false, pending = false, changed = function () {};
  function node(tag, text, cls) { var n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, fn, cls) { var b = node('button', text, cls || 'btn ghost2'); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function status(text, error) { $('#kit-status').textContent = text; $('#kit-status').className = error ? 'kit-status error' : 'kit-status'; }
  function touch() { dirty = true; status('Cambios sin guardar.'); }
  function canLeave() { if (pending) { status('Espera a que termine la carga del archivo.', true); return false; } if (dirty) { status('Guarda el kit o pulsa «Descartar cambios» antes de salir o cambiar de kit.', true); return false; } return true; }
  function field(label, value, update, type) {
    var wrap = node('label'), span = node('span', label), input = node('input');
    input.type = type || 'text'; input.value = value || ''; wrap.appendChild(span); wrap.appendChild(input);
    input.addEventListener('input', function () { update(input.value); touch(); }); return wrap;
  }
  function readImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 700 * 1024) { reject(Error('Elige una imagen PNG, JPG, WebP o GIF de hasta 700 KB.')); return; }
      var r = new FileReader(); r.onerror = function () { reject(Error('No se pudo leer la imagen.')); };
      r.onload = function () { resolve({ name: file.name, data: r.result }); }; r.readAsDataURL(file);
    });
  }
  function assetEditor(asset, label, remove) {
    var box = node('fieldset', '', 'kit-asset'), legend = node('legend', label); box.appendChild(legend);
    var preview = node('img'); preview.alt = asset.name || label; preview.loading = 'lazy'; preview.referrerPolicy = 'no-referrer';
    function showImage() {
      var src = asset.reference ? asset.reference.data : asset.url;
      try { if (!asset.reference) src = B.url(src, true); } catch (e) { src = ''; }
      preview.hidden = !src; if (src) preview.src = src; else preview.removeAttribute('src');
    }
    preview.addEventListener('error', function () { preview.hidden = true; }); showImage(); box.appendChild(preview);
    box.appendChild(field('Nombre / texto alternativo', asset.name, function (v) { asset.name = v; preview.alt = v; }));
    box.appendChild(field('Custom link de Cvent para usar en el email', asset.url, function (v) { asset.url = v; showImage(); }, 'url'));
    var upload = node('label', 'Subir referencia · PNG, JPG, WebP o GIF (máx. 700 KB)'), file = node('input'); file.type = 'file'; file.accept = 'image/png,image/jpeg,image/webp,image/gif'; upload.appendChild(file); box.appendChild(upload);
    if (asset.reference) { box.appendChild(node('small', asset.reference.name)); box.appendChild(button('Quitar referencia', function () { if (pending) return; delete asset.reference; touch(); renderForm(); })); }
    file.addEventListener('change', async function () {
      if (!file.files[0]) return;
      pending = true; status('Cargando referencia…');
      try { asset.reference = await readImage(file.files[0]); if (!asset.name) asset.name = file.files[0].name; touch(); renderForm(); }
      catch (e) { status(e.message, true); }
      finally { pending = false; file.value = ''; }
    });
    if (remove) box.appendChild(button('Quitar imagen del kit', function () { if (pending) return; remove(); touch(); renderForm(); }));
    return box;
  }
  function renderForm() {
    var form = $('#kit-fields'); form.innerHTML = '';
    form.appendChild(field('Nombre del brand kit', draft.name, function (v) { draft.name = v; }));
    var label = node('label', 'Asociación orientativa'), select = node('select');
    var opt = node('option', 'Marca / proyecto independiente'); opt.value = ''; select.appendChild(opt);
    K.CLIENT.tournaments.forEach(function (t) { var o = node('option', t.name); o.value = t.id; select.appendChild(o); }); select.value = draft.tournament;
    select.addEventListener('change', function () { draft.tournament = select.value; touch(); }); label.appendChild(select); form.appendChild(label);
    form.appendChild(node('h3', 'Colores'));
    [['principal', 'Principal'], ['acento', 'Acento'], ['secundario', 'Secundario (referencia opcional)']].forEach(function (pair) {
      var wrap = field(pair[1], draft.colors[pair[0]], function (v) { draft.colors[pair[0]] = v; if (/^#[a-f\d]{6}$/i.test(v)) color.value = v; });
      var text = wrap.querySelector('input'), color = node('input'); text.setAttribute('aria-label', pair[1]); color.type = 'color'; color.setAttribute('aria-label', 'Elegir color ' + pair[1]); color.value = draft.colors[pair[0]] || '#ffffff';
      color.addEventListener('input', function () { text.value = color.value; draft.colors[pair[0]] = color.value; touch(); }); var row = node('div', '', 'kit-color'); row.appendChild(wrap); row.appendChild(color); form.appendChild(row);
    });
    form.appendChild(node('h3', 'Header, footer y banner'));
    form.appendChild(node('p', 'Los archivos se guardan como referencia en este navegador. Para incluir una imagen en Cvent, añade su custom link. No se sube ningún archivo a Cvent desde aquí.', 'kit-note'));
    [['header', 'Header'], ['footer', 'Footer de imagen'], ['mediaBanner', 'Banner de Media Packages (opcional)']].forEach(function (pair) { form.appendChild(assetEditor(draft[pair[0]], pair[1])); });
    form.appendChild(node('h3', 'Fuentes · enlaces de los archivos'));
    form.appendChild(node('p', 'Asigna archivos .otf, .ttf, .woff o .woff2 a los usos del diseño. Un campo vacío usa las fuentes de sistema de respaldo. La compatibilidad depende del cliente de correo.', 'kit-note'));
    B.roles.forEach(function (r) { form.appendChild(field(r[1], draft.fonts[r[0]], function (v) { draft.fonts[r[0]] = v; }, 'url')); });
    form.appendChild(node('h3', 'Biblioteca de imágenes para bloques'));
    draft.assets.forEach(function (a, i) { form.appendChild(assetEditor(a, 'Imagen ' + (i + 1), function () { draft.assets.splice(i, 1); })); });
    form.appendChild(button('＋ Añadir imagen', function () {
      if (pending) return; if (draft.assets.length >= 30) { status('Cada kit admite hasta 30 imágenes.', true); return; }
      draft.assets.push({ name: '', url: '' }); touch(); renderForm();
      var assets = form.querySelectorAll('.kit-asset'); assets[assets.length - 1].scrollIntoView({ block: 'center' });
    }));
    $('#kit-editor-title').textContent = draft.id ? 'Editar kit guardado' : 'Crear un brand kit';
  }
  function openDraft(kit) { draft = JSON.parse(JSON.stringify(kit)); dirty = false; renderForm(); renderList(); status(draft.id ? 'Kit guardado. Sus cambios solo se aplican a newsletters cuando lo vuelvas a elegir.' : 'Punto de partida: edita los campos y guarda tu kit.'); }
  function renderList() {
    var list = $('#kit-list'); list.innerHTML = ''; list.appendChild(node('h3', 'Tus kits'));
    if (!B.all().length) list.appendChild(node('p', 'Todavía no hay kits guardados.', 'kit-note'));
    B.all().forEach(function (k) { var item = button(k.name, function () { if (canLeave()) openDraft(k); }, 'kit-list-item'); if (draft && k.id === draft.id) item.setAttribute('aria-current', 'true'); list.appendChild(item); });
    list.appendChild(node('h3', 'Copiar un kit de torneo'));
    K.CLIENT.tournaments.forEach(function (t) { list.appendChild(button(t.name, function () { if (canLeave()) openDraft(B.defaults(t.id)); }, 'kit-list-item')); });
  }
  function download(name, value) { var a = node('a'), url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000); }
  U.refreshSelect = function (st) {
    var select = $('#brand-kit'); select.innerHTML = ''; var o = node('option', 'Kit automático del torneo'); o.value = ''; select.appendChild(o);
    if (st && st.brandKit) { o = node('option', st.brandKit.name + ' · copia aplicada'); o.value = '@current'; select.appendChild(o); }
    B.all().forEach(function (k) { var x = node('option', k.name); x.value = k.id; select.appendChild(x); }); select.value = st && st.brandKit ? '@current' : '';
  };
  // Imágenes disponibles para una newsletter: primero las del kit aplicado (o el del torneo) y después las de la biblioteca.
  U.images = function (st) {
    var current = B.forState(st) || B.defaults(st.tournament), sources = [current].concat(B.all()), seen = {}, out = [];
    sources.forEach(function (kit) {
      [kit.header, kit.footer, kit.mediaBanner].concat(kit.assets).forEach(function (a) {
        if (!a || (!a.url && !a.reference)) return;
        var key = JSON.stringify([a.url || (a.reference && a.reference.data), a.name]); if (seen[key]) return; seen[key] = true;
        out.push({ url: a.url, name: a.name, kit: kit.name, preview: a.reference ? a.reference.data : a.url, current: kit === current });
      });
    });
    return out;
  };
  U.pickImage = function (st, onChoose) {
    var dialog = $('#kit-images-dialog'), list = $('#kit-image-list'); list.innerHTML = '';
    U.images(st).forEach(function (a) {
      var card = node('div', '', 'kit-image-choice'), image = node('img'); image.alt = a.name || 'Imagen sin nombre'; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer'; image.src = a.preview; card.appendChild(image);
      card.appendChild(node('strong', a.name || 'Imagen sin nombre')); card.appendChild(node('small', a.kit));
      if (a.url) card.appendChild(button('Usar imagen', function () { onChoose({ url: a.url, name: a.name }); dialog.close(); }));
      else card.appendChild(node('p', 'Solo referencia: añade su custom link en Brand kits para usarla.', 'kit-note'));
      list.appendChild(card);
    });
    if (!list.children.length) list.appendChild(node('p', 'Añade imágenes y sus custom links en Brand kits.'));
    dialog.showModal();
  };
  U.init = function (onChanged) {
    changed = onChanged;
    window.addEventListener('beforeunload', function (event) { if (dirty || pending) { event.preventDefault(); event.returnValue = ''; } });
    try { B.load(localStorage); } catch (e) { $('#kit-load-error').textContent = 'No se pudo cargar la biblioteca de marca: ' + e.message; $('#kit-load-error').hidden = false; }
    function open() { renderList(); if (!draft) openDraft(B.all()[0] || B.empty()); $('#kits-dialog').showModal(); }
    $('#brand-kits-open').addEventListener('click', open); $('#brand-kits-editor').addEventListener('click', open);
    $('#kit-new').addEventListener('click', function () { if (canLeave()) openDraft(B.empty()); });
    $('#kit-discard').addEventListener('click', function () { if (pending) return; openDraft((draft.id && B.find(draft.id)) || B.empty()); });
    $('#kits-close').addEventListener('click', function () { if (canLeave()) $('#kits-dialog').close(); });
    $('#kits-dialog').addEventListener('cancel', function (event) { if (!canLeave()) event.preventDefault(); });
    $('#kit-images-close').addEventListener('click', function () { $('#kit-images-dialog').close(); });
    $('#kit-form').addEventListener('submit', function (event) {
      event.preventDefault(); if (pending) { status('Espera a que termine la carga.', true); return; }
      try { var saved = B.save(draft, localStorage); openDraft(saved); renderList(); changed(); status('Kit guardado en este navegador. Ya puedes elegirlo en una newsletter.'); }
      catch (e) { status('No se ha guardado el kit: ' + e.message, true); }
    });
    $('#kit-export').addEventListener('click', function () {
      if (pending) return;
      try { download('brand-kit.json', { version: 1, kit: B.normalize(draft, true) }); status('Kit exportado, incluidos los ajustes sin guardar.'); } catch (e) { status(e.message, true); }
    });
    $('#kit-import').addEventListener('click', function () { if (canLeave()) $('#kit-file').click(); });
    $('#kit-file').addEventListener('change', async function () {
      var file = this.files[0]; if (!file) return; pending = true;
      try {
        if (file.size > 3 * 1024 * 1024) throw Error('El archivo de kit supera los 3 MB.');
        var raw = JSON.parse(await file.text()); if (raw.version !== 1 || !raw.kit) throw Error('Elige un archivo de brand kit exportado por esta app.');
        var kit = B.normalize(raw.kit, true); kit.id = ''; openDraft(kit); touch(); status('Kit importado como borrador. Pulsa Guardar kit para añadirlo.');
      } catch (e) { status('No se pudo importar: ' + e.message, true); }
      finally { pending = false; this.value = ''; }
    });
  };
})();
