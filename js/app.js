// ============================================================
// INTERFAZ: editor de módulos, vista previa, revisión y descargas
// ============================================================
(function () {
  var K = window.KSA, $ = function (s) { return document.querySelector(s); };
  var STORE = 'kaptiva-newsletters-v1', PROJ = 'kaptiva-newsletters-projects-v1', state, html = '', checks = [], timer, projects = {}, currentId = null;
  var HUB = 'kaptiva-newsletters-hub-v1', organization = { folders: {}, sorts: {}, orders: {} }, hubTournament = '', hubFolder = '', savedContent = '';

  // ---------- Guardado automático en este navegador ----------
  function load() { try { var s = JSON.parse(localStorage.getItem(STORE)); if (s && s.sections) return s; } catch (e) {} return null; }
  function saveAll() { try { localStorage.setItem(PROJ, JSON.stringify(projects)); localStorage.setItem(HUB, JSON.stringify(organization)); $('#storage-error').hidden = true; return true; } catch (e) { $('#storage-error').hidden = false; return false; } }
  function persist() {
    if (!currentId) return;
    var p = projects[currentId], content = JSON.stringify(state, function (key, value) { return key === 'open' ? undefined : value; });
    if (content !== savedContent) { p.updated = Date.now(); savedContent = content; }
    p.state = state;
    if (p.folder && (!organization.folders[p.folder] || organization.folders[p.folder].tournament !== K.tournament(state.tournament).id)) p.folder = '';
    saveAll();
  }
  function loadAll() {
    try { projects = JSON.parse(localStorage.getItem(PROJ)) || {}; } catch (e) { projects = {}; }
    try { var hub = JSON.parse(localStorage.getItem(HUB)); if (hub && hub.folders && hub.sorts && hub.orders) organization = hub; } catch (e) {}
    Object.keys(projects).forEach(function (id) {
      var p = projects[id], f = organization.folders[p.folder];
      if (!f || f.tournament !== K.tournament(p.state.tournament).id) p.folder = '';
    });
    var old = load(); // proyecto único de la versión anterior
    if (old && !Object.keys(projects).length) { var id = 'p' + Date.now(); projects[id] = { id: id, updated: Date.now(), state: old }; saveAll(); try { localStorage.removeItem(STORE); } catch (e) {} }
  }

  // ---------- Hub: torneos, carpetas y newsletters ----------
  function newId() { return 'p' + Date.now() + Math.floor(Math.random() * 1000000); }
  function openProject(id) {
    currentId = id; state = K.normalize(projects[id].state);
    savedContent = JSON.stringify(state, function (key, value) { return key === 'open' ? undefined : value; });
    document.body.classList.remove('in-lobby'); syncSettings(); renderSections(); refresh(); $('#name').focus();
  }
  function createProject(st) {
    var id = newId(), tournament = K.tournament(st.tournament).id;
    projects[id] = { id: id, updated: Date.now(), folder: tournament === hubTournament ? hubFolder : '', state: K.normalize(st) };
    saveAll(); openProject(id);
  }
  function locationKey() { return K.Hub.location(hubTournament, hubFolder); }
  function navigate(t, f) {
    hubTournament = t || ''; hubFolder = f || '';
    $('#hub-search').value = ''; $('#hub-from').value = ''; $('#hub-to').value = '';
    showLobby();
    var crumbs = $('#hub-path').querySelectorAll('button'); if (crumbs.length) crumbs[crumbs.length - 1].focus();
  }
  function folderName(f) { return f ? organization.folders[f].name : K.tournament(hubTournament).name; }
  function editFolder(f) {
    var dialog = $('#folder-dialog'), input = $('#folder-name');
    $('#folder-title').textContent = f ? 'Renombrar carpeta' : 'Nueva carpeta';
    input.value = f ? f.name : ''; input.setCustomValidity('');
    $('#folder-form').onsubmit = function (event) {
      event.preventDefault();
      var name = input.value.trim();
      if (!name) { input.setCustomValidity('Escribe un nombre para la carpeta.'); input.reportValidity(); return; }
      if (f) { if (f.name !== name) { f.name = name; f.updated = Date.now(); } }
      else { var id = 'f' + newId(); organization.folders[id] = { id: id, name: name, tournament: hubTournament, parent: hubFolder, updated: Date.now() }; }
      saveAll(); dialog.close(); showLobby();
      focusHubItem(f ? f.id : id);
    };
    dialog.showModal(); input.focus(); input.select();
  }
  function focusHubItem(id, label) {
    var card;
    Array.prototype.forEach.call(document.querySelectorAll('[data-hub-id]'), function (node) { if (node.getAttribute('data-hub-id') === id) card = node; });
    if (!card) { $(hubTournament ? '#hub-search' : '#new').focus(); return; }
    var buttons = card.querySelectorAll('button'), target = buttons[0];
    Array.prototype.forEach.call(buttons, function (b) { if (b.getAttribute('aria-label') === label && !b.disabled) target = b; });
    if (target) target.focus();
  }
  function folderPath(id) {
    var names = [], seen = {};
    while (id && organization.folders[id] && !seen[id]) { seen[id] = true; var f = organization.folders[id]; names.unshift(f.name); id = f.parent; }
    return names.join(' / ');
  }
  function moveItem(item) {
    var dialog = $('#move-dialog'), select = $('#move-destination'); select.innerHTML = '';
    select.appendChild(el('option', { value: '', text: K.tournament(hubTournament).name + ' (carpeta principal)' }));
    Object.keys(organization.folders).filter(function (id) {
      var f = organization.folders[id];
      return f.tournament === hubTournament && (item.kind !== 'folder' || K.Hub.canMove(organization.folders, item.id, id));
    }).sort(function (a, b) { return folderPath(a).localeCompare(folderPath(b), 'es'); }).forEach(function (id) {
      select.appendChild(el('option', { value: id, text: folderPath(id) }));
    });
    select.value = hubFolder; $('#move-title').textContent = 'Mover «' + item.name + '»';
    $('#move-confirm').onclick = function () {
      var dest = select.value;
      if (item.kind === 'folder') {
        if (!K.Hub.canMove(organization.folders, item.id, dest)) return;
        organization.folders[item.id].parent = dest;
      } else projects[item.id].folder = dest;
      saveAll(); dialog.close(); showLobby(); focusHubItem(item.id);
    };
    dialog.showModal();
  }
  function currentItems() {
    var items = [];
    Object.keys(organization.folders).forEach(function (id) {
      var f = organization.folders[id];
      if (f.tournament === hubTournament && (f.parent || '') === hubFolder) items.push({ kind: 'folder', id: id, name: f.name, updated: f.updated });
    });
    Object.keys(projects).forEach(function (id) {
      var p = projects[id];
      if (K.tournament(p.state.tournament).id === hubTournament && (p.folder || '') === hubFolder) items.push({ kind: 'project', id: id, name: p.state.name || 'Sin nombre', updated: p.updated });
    });
    return items;
  }
  function showLobby() {
    clearTimeout(timer); if (currentId) persist(); currentId = null;
    document.body.classList.add('in-lobby');
    if (hubFolder && !organization.folders[hubFolder]) hubFolder = '';
    var box = $('#folders'); box.innerHTML = '';
    var crumbs = $('#hub-path'); crumbs.innerHTML = '';
    crumbs.appendChild(el('button', { class: 'crumb', text: 'Todos los torneos', onclick: function () { navigate('', ''); } }));
    $('#hub-controls').hidden = !hubTournament; $('#new-folder').hidden = !hubTournament;
    $('#hub-count').textContent = '';
    if (!hubTournament) {
      var grid = el('div', { class: 'grid' });
      K.CLIENT.tournaments.forEach(function (t) {
        var count = Object.keys(projects).filter(function (id) { return K.tournament(projects[id].state.tournament).id === t.id; }).length;
        grid.appendChild(el('button', { class: 'tournament-card', onclick: function () { navigate(t.id, ''); }, style: 'border-top-color:' + t.principal }, [el('span', { text: '📁 ' + t.name }), el('small', { text: count + (count === 1 ? ' newsletter' : ' newsletters') })]));
      });
      box.appendChild(grid); return;
    }
    crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
    crumbs.appendChild(el('button', { class: 'crumb', text: K.tournament(hubTournament).name, onclick: function () { navigate(hubTournament, ''); } }));
    var path = [], cursor = hubFolder, seen = {};
    while (cursor && organization.folders[cursor] && !seen[cursor]) { seen[cursor] = true; path.unshift(cursor); cursor = organization.folders[cursor].parent; }
    path.forEach(function (id) {
      crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
      crumbs.appendChild(el('button', { class: 'crumb', text: folderName(id), onclick: function () { navigate(hubTournament, id); } }));
    });
    var key = locationKey(), mode = organization.sorts[key] || 'newest'; $('#hub-sort').value = mode;
    var all = K.Hub.sort(currentItems(), mode, organization.orders[key]);
    var query = $('#hub-search').value, from = $('#hub-from').value, to = $('#hub-to').value;
    if (from && to && from > to) { box.appendChild(el('p', { class: 'empty', text: 'La fecha inicial debe ser anterior o igual a la final.' })); return; }
    var visible = all.filter(function (item) { return K.Hub.matches(item, query, from, to); });
    $('#hub-count').textContent = visible.length + ' de ' + all.length + ' elementos en esta carpeta';
    if (!visible.length) { box.appendChild(el('p', { class: 'empty', text: all.length ? 'No hay resultados con estos filtros.' : 'Esta carpeta está vacía. Crea una subcarpeta o una newsletter.' })); return; }
    var grid = el('div', { class: 'grid' });
    visible.forEach(function (item) {
      var isFolder = item.kind === 'folder', p = projects[item.id], t = K.tournament(hubTournament);
      var actions = el('div', { class: 'proj-actions' });
      function action(label, fn) { actions.appendChild(el('button', { text: label, onclick: fn })); }
      action('Mover', function () { moveItem(item); });
      if (isFolder) {
        action('Renombrar', function () { editFolder(organization.folders[item.id]); });
        action('Eliminar', function () {
          var occupied = Object.keys(organization.folders).some(function (id) { return organization.folders[id].parent === item.id; }) || Object.keys(projects).some(function (id) { return projects[id].folder === item.id; });
          if (occupied) { alert('Mueve primero el contenido de esta carpeta. Solo se pueden eliminar carpetas vacías.'); return; }
          if (confirm('¿Eliminar la carpeta «' + item.name + '»?')) { delete organization.folders[item.id]; saveAll(); showLobby(); }
        });
      } else {
        action('Duplicar', function () {
          var copy = JSON.parse(JSON.stringify(p)), id = newId(); copy.id = id; copy.updated = Date.now(); copy.state.name = item.name + ' (copia)'; projects[id] = copy; saveAll(); showLobby(); focusHubItem(id);
        });
        action('Eliminar', function () { if (confirm('¿Eliminar «' + item.name + '»? No se puede deshacer.')) { delete projects[item.id]; saveAll(); showLobby(); } });
      }
      if (mode === 'manual') {
        [-1, 1].forEach(function (dir) {
          var index = all.indexOf(item), b = el('button', { text: dir < 0 ? '↑' : '↓', 'aria-label': (dir < 0 ? 'Subir ' : 'Bajar ') + item.name, onclick: function () {
            var ids = all.map(function (x) { return x.id; }), next = index + dir;
            ids[index] = ids[next]; ids[next] = item.id; organization.orders[key] = ids; saveAll(); showLobby(); focusHubItem(item.id, (dir < 0 ? 'Subir ' : 'Bajar ') + item.name);
          } });
          b.disabled = !!(query || from || to) || index + dir < 0 || index + dir >= all.length; actions.appendChild(b);
        });
      }
      var card = el('div', { class: 'proj hub-card', 'data-hub-id': item.id }, [
        el('span', { class: 'swatch', style: 'background:' + (isFolder ? '#e4e0ee' : t.principal) + ';border-bottom:4px solid ' + t.acento }),
        el('button', { class: 'item-open', title: item.name, text: (isFolder ? '📁 ' : '') + item.name, onclick: function () { if (isFolder) navigate(hubTournament, item.id); else openProject(item.id); } }),
        el('small', { text: isFolder ? 'Carpeta' : (p.state.sections || []).length + ' módulos' }),
        el('small', { text: 'Modificado: ' + new Date(item.updated).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) }), actions
      ]);
      grid.appendChild(card);
    });
    box.appendChild(grid);
  }
  function initHub() {
    $('#new-folder').addEventListener('click', function () { editFolder(null); });
    $('#folder-cancel').addEventListener('click', function () { $('#folder-dialog').close(); });
    $('#folder-name').addEventListener('input', function () { this.setCustomValidity(''); });
    $('#hub-sort').addEventListener('change', function () {
      var key = locationKey();
      if (this.value === 'manual' && !organization.orders[key]) organization.orders[key] = K.Hub.sort(currentItems(), organization.sorts[key] || 'newest', organization.orders[key]).map(function (x) { return x.id; });
      organization.sorts[key] = this.value; saveAll(); showLobby();
    });
    ['hub-search', 'hub-from', 'hub-to'].forEach(function (id) { $('#' + id).addEventListener('input', showLobby); });
    $('#hub-clear').addEventListener('click', function () { navigate(hubTournament, hubFolder); });
    $('#move-cancel').addEventListener('click', function () { $('#move-dialog').close(); });
  }

  function el(tag, props, kids) {
    var n = document.createElement(tag), k;
    for (k in (props || {})) { if (k === 'class') n.className = props[k]; else if (k === 'text') n.textContent = props[k]; else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), props[k]); else n.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // ---------- Ajustes generales ----------
  function fillSettings() {
    $('#tournament').innerHTML = ''; K.CLIENT.tournaments.forEach(function (t) { $('#tournament').appendChild(el('option', { value: t.id, text: t.name })); });
    $('#recipe').innerHTML = ''; $('#recipe').appendChild(el('option', { value: '', text: 'Nueva desde receta…' }));
    K.RECIPES.forEach(function (r) { $('#recipe').appendChild(el('option', { value: r.id, text: r.name })); });
    $('#add').innerHTML = ''; $('#add').appendChild(el('option', { value: '', text: '＋ Añadir módulo…' }));
    K.MODULE_ORDER.forEach(function (id) { $('#add').appendChild(el('option', { value: id, text: K.MODULES[id].letter + ' · ' + K.MODULES[id].name })); });
  }
  function syncSettings() {
    $('#tournament').value = state.tournament; $('#name').value = state.name || ''; $('#desc').value = state.desc || ''; $('#mp').checked = !!state.mediaPackages; $('#franja').value = state.franjaLeft || '';
    ['header', 'franja', 'footer'].forEach(function (k) { $('#on-' + k).checked = !state.off[k]; });
    document.querySelector('details.more').open = ['header', 'franja', 'footer'].some(function (k) { return state.off[k]; });
  }

  // ---------- Editor de módulos ----------
  function snippet(s) {
    var m = K.MODULES[s.type], d = s.d || {}, v = d.title || d.left || d.a_title || d.greet || d.text || d.alt || '';
    v = String(v).split('\n')[0]; return v.length > 46 ? v.slice(0, 46) + '…' : v;
  }
  function renderSections() {
    var box = $('#sections'); box.innerHTML = '';
    state.sections.forEach(function (s, i) {
      var m = K.MODULES[s.type]; if (!m) return;
      var snip = el('span', { class: 'snip', text: snippet(s) });
      var det = el('details', { class: 'card mod' });
      if (s.open) det.open = true;
      det.addEventListener('toggle', function () { s.open = det.open; persist(); });
      function tool(txt, title, fn, dis) { var b = el('button', { class: 'tool', title: title, text: txt, onclick: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }); if (dis) b.disabled = true; return b; }
      det.appendChild(el('summary', {}, [
        el('span', { class: 'letter', text: m.letter }), el('span', { class: 'mname', text: m.name }), snip,
        el('span', { class: 'tools' }, [
          tool('↑', 'Subir', function () { move(i, -1); }, i === 0),
          tool('↓', 'Bajar', function () { move(i, 1); }, i === state.sections.length - 1),
          tool('⧉', 'Duplicar', function () { var c = JSON.parse(JSON.stringify(s)); c.id = 's' + Date.now(); state.sections.splice(i + 1, 0, c); renderSections(); update(); }),
          tool('✕', 'Eliminar', function () { if (confirm('¿Eliminar «' + m.name + '»?')) { state.sections.splice(i, 1); renderSections(); update(); } })
        ])
      ]));
      var body = el('div', { class: 'fields' });
      if (m.note) body.appendChild(el('p', { class: 'note', text: m.note }));
      m.fields.forEach(function (f) {
        if (f.type === 'head') { body.appendChild(el('h4', { text: f.label })); return; }
        var input;
        if (f.type === 'area') input = el('textarea', { rows: 4 });
        else if (f.type === 'select') { input = el('select'); f.opts.forEach(function (o) { input.appendChild(el('option', { value: o[0], text: o[1] })); }); }
        else input = el('input', { type: 'text' });
        if (f.ph) input.setAttribute('placeholder', f.ph);
        if (f.type === 'url') input.setAttribute('placeholder', f.img || f.k === 'img' ? 'https://custom.cvent.com/…' : 'https://…');
        input.value = s.d[f.k] == null ? '' : s.d[f.k];
        var wrap = el('label', { class: f.half ? 'half' : '' }, [el('span', { text: f.label + (f.req ? ' *' : '') }), input, f.hint ? el('small', { text: f.hint }) : null]);
        if (f.showIf && !f.showIf(s.d)) wrap.hidden = true;
        wrap._f = f;
        input.addEventListener(f.type === 'select' ? 'change' : 'input', function () {
          s.d[f.k] = input.value; snip.textContent = snippet(s);
          Array.prototype.forEach.call(body.querySelectorAll('label'), function (l) { if (l._f && l._f.showIf) l.hidden = !l._f.showIf(s.d); });
          update();
        });
        body.appendChild(wrap);
      });
      det.appendChild(body); box.appendChild(det);
    });
  }
  function move(i, dir) { var a = state.sections, x = a.splice(i, 1)[0]; a.splice(i + dir, 0, x); renderSections(); update(); }

  // ---------- Resultado ----------
  function update() { clearTimeout(timer); timer = setTimeout(refresh, 200); }
  function refresh() {
    html = K.build(state); checks = K.check(state, html); persist();
    $('#frame').srcdoc = html; $('#code').value = html;
    $('#filename').textContent = K.fileBase(state) + '_COPIAR_Y_PEGAR.txt';
    var ul = $('#checks'); ul.innerHTML = '';
    var order = { error: 0, warn: 1, ok: 2 }, icon = { error: '✕', warn: '!', ok: '✓' };
    checks.slice().sort(function (a, b) { return order[a.level] - order[b.level]; }).forEach(function (c) {
      ul.appendChild(el('li', { class: c.level }, [el('b', { text: icon[c.level] }), el('span', { text: c.msg })]));
    });
    var e = checks.filter(function (c) { return c.level === 'error'; }).length, w = checks.filter(function (c) { return c.level === 'warn'; }).length;
    var b = $('#badge'); b.textContent = e ? e : (w ? w : '✓'); b.className = e ? 'error' : (w ? 'warn' : 'ok');
  }

  function download(name, text, type) {
    var a = el('a', { href: URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' })), download: name });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function okToExport() {
    refresh();
    var e = checks.filter(function (c) { return c.level === 'error'; });
    return !e.length || confirm('La revisión tiene ' + e.length + ' error(es):\n\n· ' + e.map(function (c) { return c.msg; }).join('\n· ') + '\n\n¿Descargar igualmente?');
  }

  // ---------- Eventos ----------
  function init() {
    fillSettings();
    loadAll(); initHub(); showLobby();
    $('#back').addEventListener('click', function () { var id = currentId; showLobby(); focusHubItem(id); });
    $('#new').addEventListener('click', function () {
      var st = K.fromRecipe('blank', hubTournament || undefined);
      if (hubTournament) { st.tournament = hubTournament; st.headerAlt = ''; }
      createProject(st);
    });
    $('#franja').addEventListener('input', function () { state.franjaLeft = this.value; update(); });
    ['header', 'franja', 'footer'].forEach(function (k) { $('#on-' + k).addEventListener('change', function () { state.off[k] = !this.checked; update(); }); });
    window.addEventListener('beforeunload', function () { if (currentId) persist(); });

    $('#tournament').addEventListener('change', function () { state.tournament = this.value; update(); });
    $('#name').addEventListener('input', function () { state.name = this.value; update(); });
    $('#desc').addEventListener('input', function () { state.desc = this.value; update(); });
    $('#mp').addEventListener('change', function () { state.mediaPackages = this.checked; update(); });

    $('#recipe').addEventListener('change', function () {
      var id = this.value; this.value = ''; if (!id) return;
      if (state.sections.length > 0 && !confirm('Se sustituirá el contenido de este proyecto. ¿Continuar?')) return;
      state = K.fromRecipe(id, state.tournament); persist(); syncSettings(); renderSections(); refresh();
    });
    $('#add').addEventListener('change', function () {
      var id = this.value; this.value = ''; if (!id) return;
      var d = {}, def = K.MODULES[id].defaults || {}, k; for (k in def) d[k] = def[k];
      state.sections.push({ id: 's' + Date.now(), type: id, d: d, open: true }); renderSections(); update();
      var all = document.querySelectorAll('#sections details'); all[all.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    $('#dl-txt').addEventListener('click', function () { if (okToExport()) download(K.fileBase(state) + '_COPIAR_Y_PEGAR.txt', html); });
    $('#dl-html').addEventListener('click', function () { if (okToExport()) download(K.fileBase(state) + '.html', html, 'text/html;charset=utf-8'); });
    $('#save').addEventListener('click', function () { download(K.fileBase(state) + '_PROYECTO.json', JSON.stringify(state, null, 2), 'application/json'); });
    $('#open').addEventListener('click', function () { $('#file').click(); });
    $('#file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return; var r = new FileReader();
      r.onload = function () {
        try { var s = JSON.parse(r.result); if (!s.sections) throw 0; createProject(s); }
        catch (e) { alert('Este archivo no es un proyecto de newsletter válido.'); }
      };
      r.readAsText(f); this.value = '';
    });
    $('#copy').addEventListener('click', function () {
      var b = this; $('#code').select();
      (navigator.clipboard ? navigator.clipboard.writeText(html) : Promise.reject()).catch(function () { document.execCommand('copy'); }).then(function () { b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = 'Copiar código'; }, 1500); });
    });

    // Importar con ChatGPT
    $('#import').addEventListener('click', function () { $('#imp-err').textContent = ''; $('#dlg').showModal(); });
    $('#imp-cancel').addEventListener('click', function () { $('#dlg').close(); });
    $('#imp-copy').addEventListener('click', function () {
      var b = this, t = K.importPrompt();
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).catch(function () {
        var x = el('textarea'); x.value = t; $('#dlg').appendChild(x); x.select(); document.execCommand('copy'); x.remove();
      }).then(function () { b.textContent = 'Copiadas ✓'; setTimeout(function () { b.textContent = 'Copiar instrucciones'; }, 1500); });
    });
    $('#imp-go').addEventListener('click', function () {
      try {
        var r = K.importProject($('#imp-text').value, state.tournament);
        if (state.sections.length > 0 && !confirm('Se sustituirá el contenido de este proyecto. ¿Continuar?')) return;
        state = r.state; persist(); syncSettings(); renderSections(); refresh();
        $('#imp-text').value = ''; $('#dlg').close();
        alert('Importados ' + state.sections.length + ' módulos.' + (r.notes.length ? '\n\nAvisos:\n· ' + r.notes.join('\n· ') : '') + '\n\nRevisa los textos frente al original y mira la pestaña Revisión.');
      } catch (e) { $('#imp-err').textContent = 'No se ha podido importar: ' + (e.message || 'el texto pegado no es válido') + ' Copia la respuesta completa de ChatGPT.'; }
    });

    Array.prototype.forEach.call(document.querySelectorAll('.tabs > button'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll('.tabs > button'), function (x) { x.classList.toggle('on', x === b); });
        ['preview', 'review', 'code'].forEach(function (t) { $('#pane-' + t).hidden = t !== b.dataset.tab; });
        $('#device').style.visibility = b.dataset.tab === 'preview' ? 'visible' : 'hidden';
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#device button'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll('#device button'), function (x) { x.classList.toggle('on', x === b); });
        $('#frame').classList.toggle('mobile', b.dataset.w === 'mobile');
      });
    });
  }
  init();
})();
