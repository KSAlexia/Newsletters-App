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
    if (draft.base) {
      var t = K.tournament(draft.base), group = K.Designs && K.Designs.forSection(draft.base), saved = !!B.brandKit(draft.base);
      form.appendChild(node('p', 'Kit de la marca ' + (group ? group.name : t.name) + '. Lo que guardes se aplica a sus newsletters nuevas con kit automático en este navegador. Las newsletters anteriores conservan su diseño guardado.' + (saved ? ' Ya está editado.' : ' Ahora mismo muestra el diseño original de la app.'), 'kit-note kit-base-note'));
      if (group && group.sections.length>1) form.appendChild(node('p', 'Compartido por USA y Canada. Los cambios se guardan en un único kit para ambas secciones. Las personalizaciones previas se conservan en copias independientes.', 'kit-note'));
      var tools = node('div', '', 'kit-base-tools');
      tools.appendChild(button('Duplicar como kit independiente', duplicate));
      if (saved) tools.appendChild(button('Volver al diseño original', function () {
        if (pending || !confirm('¿Quitar los cambios del kit de ' + t.name + ' y volver al diseño original de la app?')) return;
        try { B.remove('brand-' + draft.base, localStorage); openDraft(B.brandDraft(draft.base)); changed(); status('Kit de ' + t.name + ' restaurado al diseño original.'); } catch (e) { status(e.message, true); }
      }));
      form.appendChild(tools);
    }
    // Kit independiente ya guardado: duplicar o eliminar (crear solo ocurre con «＋ Kit independiente», «Duplicar» o «Importar»).
    if (!draft.base && draft.id) {
      var own = node('div', '', 'kit-base-tools');
      own.appendChild(button('Duplicar', duplicate));
      own.appendChild(button('Eliminar kit', function () {
        if (pending || !confirm('¿Eliminar el kit «' + draft.name + '»? Las newsletters que ya lo tienen aplicado conservan su copia. No se puede deshacer.')) return;
        try { B.remove(draft.id, localStorage); dirty = false; openDraft(B.custom()[0] || B.brandDraft(K.CLIENT.tournaments[0].id)); changed(); status('Kit eliminado.'); } catch (e) { status(e.message, true); }
      }, 'btn ghost2 danger'));
      form.appendChild(own);
    }
    if (!draft.base && !draft.id) form.appendChild(node('p', 'Kit nuevo: al pulsar «Crear kit» se añade a «Tus kits independientes». Para cambiar el diseño de una marca, elígela en «Kits de cada marca».', 'kit-note kit-base-note'));
    form.appendChild(field('Nombre del brand kit', draft.name, function (v) { draft.name = v; }));
    var label = node('label', draft.base ? 'Secciones del kit' : 'Asociación orientativa'), select = node('select');
    var opt = node('option', 'Marca / proyecto independiente'); opt.value = ''; select.appendChild(opt);
    K.CLIENT.tournaments.forEach(function (t) { var o = node('option', t.name); o.value = t.id; select.appendChild(o); }); select.value = draft.tournament;
    select.addEventListener('change', function () { draft.tournament = select.value; touch(); }); label.appendChild(select);
    if (draft.base && group && group.sections.length>1) { select.innerHTML=''; var shared=node('option',group.sections.map(function(id){return K.tournament(id).name;}).join(' + '));shared.value=draft.base;select.appendChild(shared);select.value=draft.base; }
    if (draft.base) select.disabled = true; // el kit de una marca siempre es de esa marca
    form.appendChild(label);
    form.appendChild(node('h3', 'Instrucciones del brand kit'));
    form.appendChild(node('p', 'Reglas de composición que se consultan en el editor y se incluyen al copiar instrucciones para importar o crear desde un guion. El diseño se aplica automáticamente.', 'kit-note'));
    var instructionsLabel=node('label','Instrucciones de diseño y composición','kit-instructions'), instructions=node('textarea'); instructions.rows=12; instructions.value=draft.instructions||''; instructions.setAttribute('aria-label','Instrucciones de diseño y composición'); instructions.addEventListener('input',function(){draft.instructions=instructions.value;touch();}); instructionsLabel.appendChild(instructions); form.appendChild(instructionsLabel);
    if(draft.designVersion) form.appendChild(node('small','Versión de diseño: '+draft.designVersion,'kit-instructions'));
    form.appendChild(node('h3', 'Colores'));
    [['principal', 'Principal'], ['acento', 'Acento'], ['secundario', 'Secundario (referencia opcional)']].forEach(function (pair) {
      var wrap = field(pair[1], draft.colors[pair[0]], function (v) { draft.colors[pair[0]] = v; if (/^#[a-f\d]{6}$/i.test(v)) color.value = v; });
      var text = wrap.querySelector('input'), color = node('input'); text.setAttribute('aria-label', pair[1]); color.type = 'color'; color.setAttribute('aria-label', 'Elegir color ' + pair[1]); color.value = draft.colors[pair[0]] || '#ffffff';
      color.addEventListener('input', function () { text.value = color.value; draft.colors[pair[0]] = color.value; touch(); }); var row = node('div', '', 'kit-color'); row.appendChild(wrap); row.appendChild(color); form.appendChild(row);
    });
    form.appendChild(node('h3', 'Banners del brand kit'));
    form.appendChild(node('p', 'Header, footer, banner de Media Packages y otros gráficos recurrentes. Los archivos se guardan como referencia en este navegador. Para incluir una imagen en Cvent, añade su custom link. No se sube ningún archivo a Cvent desde aquí.', 'kit-note'));
    [['header', 'Header'], ['footer', 'Footer de imagen'], ['mediaBanner', 'Banner de Media Packages (opcional)']].forEach(function (pair) { form.appendChild(assetEditor(draft[pair[0]], pair[1])); });
    draft.banners = draft.banners || [];
    draft.banners.forEach(function (a, i) { form.appendChild(assetEditor(a, 'Banner ' + (i + 1), function () { draft.banners.splice(i, 1); })); });
    form.appendChild(addButton('＋ Añadir banner', draft.banners, 'banners'));
    form.appendChild(node('h3', 'Fuentes · enlaces de los archivos'));
    form.appendChild(node('p', 'Asigna archivos .otf, .ttf, .woff o .woff2 a los usos del diseño. Un campo vacío usa las fuentes de sistema de respaldo. La compatibilidad depende del cliente de correo.', 'kit-note'));
    B.roles.forEach(function (r) { form.appendChild(field(r[1], draft.fonts[r[0]], function (v) { draft.fonts[r[0]] = v; }, 'url')); });
    form.appendChild(node('h3', 'Imágenes (fotos para los bloques)'));
    draft.assets.forEach(function (a, i) { form.appendChild(assetEditor(a, 'Imagen ' + (i + 1), function () { draft.assets.splice(i, 1); })); });
    form.appendChild(addButton('＋ Añadir imagen', draft.assets, 'imágenes'));
    $('#kit-editor-title').textContent = draft.base ? draft.name : draft.id ? 'Editar kit guardado' : 'Crear un brand kit';
  }
  // Añade un recurso vacío a una lista (banners o fotos) y lleva la vista hasta él.
  function addButton(text, list, what) {
    return button(text, function () {
      if (pending) return; if (list.length >= 30) { status('Cada kit admite hasta 30 ' + what + '.', true); return; }
      var item = { name: '', url: '' }; list.push(item); touch(); renderForm();
      var boxes = $('#kit-fields').querySelectorAll('.kit-asset'), legend = list === draft.banners ? 'Banner ' : 'Imagen ';
      Array.prototype.filter.call(boxes, function (b) { return b.querySelector('legend').textContent === legend + list.length; })[0].scrollIntoView({ block: 'center' });
    });
  }
  // Duplicar = la única forma de crear un kit a partir de otro. Guarda la copia al momento con otro nombre.
  function duplicate() {
    if (pending) return; if (dirty) { status('Guarda o descarta los cambios antes de duplicar.', true); return; }
    var copy = JSON.parse(JSON.stringify(draft)); delete copy.base; copy.id = ''; copy.name = draft.name + ' (copia)'; copy.tournament = draft.tournament || draft.base || '';
    try { var k = B.save(copy, localStorage); openDraft(k); changed(); status('Copia «' + k.name + '» creada en «Tus kits independientes». El original no ha cambiado.'); } catch (e) { status('No se ha duplicado: ' + e.message, true); }
  }
  function firstBrand() { return B.brandDraft(K.CLIENT.tournaments[0].id); }
  function openDraft(kit) {
    draft = JSON.parse(JSON.stringify(kit)); dirty = false; renderForm(); renderList();
    $('#kit-save').textContent = !draft.base && !draft.id ? 'Crear kit' : 'Guardar cambios';
    status(draft.base ? 'Edita y pulsa «Guardar cambios»: se aplica a las newsletters de esta marca que usan su kit automático.' : draft.id ? 'Kit guardado. Sus cambios solo se aplican a newsletters cuando lo vuelvas a elegir.' : 'Punto de partida: edita los campos y guarda tu kit.');
  }
  function renderList() {
    var list = $('#kit-list'); list.innerHTML = '';
    // Kits de cada marca/sección: se editan en su sitio y se aplican a sus newsletters.
    list.appendChild(node('h3', 'Kits de cada marca'));
    B.catalog().forEach(function (t) {
      var edited = !!B.brandKit(t.id), item = button(t.name + (edited ? ' · editado' : ''), function () { if (canLeave()) openDraft(B.brandDraft(t.id)); }, 'kit-list-item');
      if (draft && draft.base === t.id) item.setAttribute('aria-current', 'true'); list.appendChild(item);
    });
    list.appendChild(node('h3', 'Tus kits independientes'));
    if (!B.custom().length) list.appendChild(node('p', 'Todavía no hay kits independientes.', 'kit-note'));
    B.custom().forEach(function (k) { var item = button(k.name, function () { if (canLeave()) openDraft(k); }, 'kit-list-item'); if (draft && !draft.base && k.id === draft.id) item.setAttribute('aria-current', 'true'); list.appendChild(item); });
  }
  function download(name, value) { var a = node('a'), url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000); }
  U.refreshSelect = function (st) {
    var select = $('#brand-kit'); select.innerHTML = ''; var info = st && K.Designs && K.Designs.forSection(st.tournament); var o = node('option', info ? 'Automático · '+info.name : 'Kit automático de la sección'); o.value = ''; select.appendChild(o);
    if (st && st.brandKit) { o = node('option', st.brandKit.name + ' · copia aplicada'); o.value = '@current'; select.appendChild(o); }
    B.custom().forEach(function (k) { var x = node('option', k.name); x.value = k.id; select.appendChild(x); }); select.value = st && st.brandKit ? '@current' : '';
  };
  // Recursos disponibles para una newsletter: primero los del kit aplicado (o el del torneo) y después los de los kits independientes.
  // Los kits editados de otras marcas no se ofrecen: su header/footer no pertenece a esta newsletter.
  // Cada recurso lleva group: 'foto' (apartado Imágenes) o 'banner' (apartado Banners del brand kit).
  U.images = function (st) {
    var current = B.forState(st) || B.defaults(st.tournament), sources = [current].concat(B.custom()), seen = {}, out = [];
    sources.forEach(function (kit) {
      var g = B.groups(kit);
      [['banner', g.banners], ['foto', g.fotos]].forEach(function (pair) {
        pair[1].forEach(function (a) {
          if (!a || (!a.url && !a.reference)) return;
          var key = JSON.stringify([pair[0], a.url || (a.reference && a.reference.data), a.name]); if (seen[key]) return; seen[key] = true;
          out.push({ group: pair[0], url: a.url, name: a.name, kit: kit.name, preview: a.reference ? a.reference.data : a.url, current: kit === current });
        });
      });
    });
    return out;
  };
  U.GROUPS = [['foto', 'Imágenes'], ['banner', 'Banners del brand kit']];
  U.pickImage = function (st, onChoose) {
    var dialog = $('#kit-images-dialog'), list = $('#kit-image-list'), all = U.images(st); list.innerHTML = '';
    U.GROUPS.forEach(function (g) {
      var items = all.filter(function (a) { return a.group === g[0]; }), grid = node('div', '', 'kit-image-grid');
      list.appendChild(node('h3', g[1], 'kit-image-group'));
      items.forEach(function (a) {
        var card = node('div', '', 'kit-image-choice'), image = node('img'); image.alt = a.name || 'Imagen sin nombre'; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer'; image.src = a.preview; card.appendChild(image);
        card.appendChild(node('strong', a.name || 'Imagen sin nombre')); card.appendChild(node('small', a.kit));
        if (a.url) card.appendChild(button('Usar imagen', function () { onChoose({ url: a.url, name: a.name }); dialog.close(); }));
        else card.appendChild(node('p', 'Solo referencia: añade su custom link en Brand kits para usarla.', 'kit-note'));
        grid.appendChild(card);
      });
      if (!items.length) grid.appendChild(node('p', g[0] === 'foto' ? 'Este kit no tiene fotos. Añádelas en «Imágenes» del brand kit.' : 'Este kit no tiene banners.', 'kit-note'));
      list.appendChild(grid);
    });
    dialog.showModal();
  };
  U.init = function (onChanged) {
    changed = onChanged;
    window.addEventListener('beforeunload', function (event) { if (dirty || pending) { event.preventDefault(); event.returnValue = ''; } });
    try { B.load(localStorage); } catch (e) { $('#kit-load-error').textContent = 'No se pudo cargar la biblioteca de marca: ' + e.message; $('#kit-load-error').hidden = false; }
    // Desde el editor se abre el kit de la marca de esa newsletter.
    function open(tid) { renderList(); if (typeof tid === 'string' && tid && !dirty) openDraft(B.brandDraft(tid)); else if (!draft || (!draft.id && !draft.base && !dirty)) openDraft(firstBrand()); $('#kits-dialog').showModal(); }
    U.open = open;
    $('#brand-kits-open').addEventListener('click', function () { open(); });
    $('#brand-kits-editor').addEventListener('click', function () { open(U.currentTournament ? U.currentTournament() : ''); });
    $('#kit-new').addEventListener('click', function () { if (canLeave()) openDraft(B.empty()); });
    $('#kit-discard').addEventListener('click', function () { if (pending) return; openDraft(draft.base ? B.brandDraft(draft.base) : (draft.id && B.find(draft.id)) || firstBrand()); });
    $('#kits-close').addEventListener('click', function () { if (canLeave()) $('#kits-dialog').close(); });
    $('#kits-dialog').addEventListener('cancel', function (event) { if (!canLeave()) event.preventDefault(); });
    $('#kit-images-close').addEventListener('click', function () { $('#kit-images-dialog').close(); });
    $('#kit-form').addEventListener('submit', function (event) {
      event.preventDefault(); if (pending) { status('Espera a que termine la carga.', true); return; }
      try { var saved = B.save(draft, localStorage); openDraft(saved); renderList(); changed(); status(saved.base ? 'Kit de ' + K.tournament(saved.base).name + ' guardado: ya se aplica a sus newsletters con el kit automático.' : 'Kit guardado en este navegador. Ya puedes elegirlo en una newsletter.');
        $('#kit-save').textContent = 'Guardar cambios'; }
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
        var kit = B.normalize(raw.kit, true); kit.id = ''; openDraft(kit); touch(); status(kit.base ? 'Kit de ' + K.tournament(kit.base).name + ' importado. Pulsa «Guardar cambios» para aplicarlo a esa marca.' : 'Kit importado como borrador. Pulsa «Crear kit» para añadirlo.');
      } catch (e) { status('No se pudo importar: ' + e.message, true); }
      finally { pending = false; this.value = ''; }
    });
  };
})();
