// ============================================================
// INTERFAZ: editor de módulos, vista previa, revisión y descargas
// ============================================================
(function () {
  var K = window.KSA, $ = function (s) { return document.querySelector(s); };
  var STORE = 'kaptiva-newsletters-v1', PROJ = 'kaptiva-newsletters-projects-v1', state, html = '', checks = [], timer, projects = {}, currentId = null;
  var HUB = 'kaptiva-newsletters-hub-v1', organization = { folders: {}, sorts: {}, orders: {} }, hubTournament = '', hubFolder = '', hubClub = '', editingCode = false, savedContent = '', draggedProject = '';

  // ---------- Guardado automático en este navegador ----------
  function load() { try { var s = JSON.parse(localStorage.getItem(STORE)); if (s && s.sections) return s; } catch (e) {} return null; }
  // Varias pestañas: antes de escribir se fusiona con lo que haya guardado otra pestaña (K.Hub.merge3),
  // así una pestaña con datos antiguos no borra newsletters, carpetas ni cambios de las demás.
  var synced = { projects: {}, folders: {}, sorts: {}, orders: {} }, noteTimer;
  function keyOf(v) { return JSON.stringify(v, function (k, x) { return k === 'open' ? undefined : x; }); }
  function texts(map) { var o = {}; Object.keys(map || {}).forEach(function (id) { o[id] = keyOf(map[id]); }); return o; }
  function rememberSynced() { synced = { projects: texts(projects), folders: texts(organization.folders), sorts: texts(organization.sorts), orders: texts(organization.orders) }; }
  function readStored() {
    var rawP = localStorage.getItem(PROJ), rawH = localStorage.getItem(HUB), p = {}, h = { folders: {}, sorts: {}, orders: {} };
    try { p = JSON.parse(rawP) || {}; } catch (e) {}
    try { var x = JSON.parse(rawH); if (x && x.folders && x.sorts && x.orders) h = x; } catch (e) {}
    return { rawP: rawP, rawH: rawH, projects: p, hub: h };
  }
  function syncNote(text) {
    var n = $('#sync-note'); n.textContent = text; n.hidden = false;
    clearTimeout(noteTimer); noteTimer = setTimeout(function () { n.hidden = true; }, 10000);
  }
  function saveAll() {
    try {
      var stored = readStored(), H = K.Hub;
      var p = H.merge3(projects, synced.projects, stored.projects, keyOf);
      var f = H.merge3(organization.folders, synced.folders, stored.hub.folders, keyOf);
      var s = H.merge3(organization.sorts, synced.sorts, stored.hub.sorts, keyOf);
      var o = H.merge3(organization.orders, synced.orders, stored.hub.orders, keyOf);
      var mineCurrent = currentId && projects[currentId];
      if (mineCurrent && !p.merged[currentId]) { p.merged[currentId] = mineCurrent; syncNote('Esta newsletter se eliminó en otra pestaña. Se conserva porque la tienes abierta.'); }
      projects = p.merged; organization = { folders: f.merged, sorts: s.merged, orders: o.merged };
      var pj = JSON.stringify(projects), hj = JSON.stringify(organization);
      if (pj !== stored.rawP) localStorage.setItem(PROJ, pj);
      if (hj !== stored.rawH) localStorage.setItem(HUB, hj);
      rememberSynced(); $('#storage-error').hidden = true;
      if (currentId && p.conflicts.indexOf(currentId) >= 0) syncNote('Esta newsletter también se modificó en otra pestaña. Se ha guardado la versión de esta pestaña.');
      else if (currentId && p.changed.indexOf(currentId) >= 0) {
        // Otra pestaña la cambió y aquí no había cambios: se carga su versión.
        state = K.normalize(projects[currentId].state); savedContent = JSON.stringify(state, function (key, value) { return key === 'open' ? undefined : value; });
        setTimeout(function () { if (!currentId) return; syncSettings(); renderSections(); refresh(); syncNote('Esta newsletter se ha actualizado con los cambios hechos en otra pestaña.'); }, 0);
      }
      return true;
    } catch (e) { $('#storage-error').hidden = false; return false; }
  }
  function persist() {
    if (!currentId) return;
    var p = projects[currentId], content = JSON.stringify(state, function (key, value) { return key === 'open' ? undefined : value; });
    if (content !== savedContent) { p.updated = Date.now(); savedContent = content; }
    p.state = state;
    if (p.folder && (!organization.folders[p.folder] || organization.folders[p.folder].tournament !== K.tournament(state.tournament).id)) p.folder = '';
    saveAll();
  }
  function loadAll() {
    var stored = readStored(); projects = stored.projects; organization = stored.hub; rememberSynced();
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
  // hubClub solo se usa en el nivel de club (lista de secciones); dentro de una sección el club sale de la propia sección.
  function navigate(t, f, club) {
    hubTournament = t || ''; hubFolder = f || ''; hubClub = t ? '' : (club || '');
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
  // Solo se aceptan arrastres iniciados en esta misma instancia del hub.
  function clearDrag() {
    draggedProject = '';
    Array.prototype.forEach.call(document.querySelectorAll('.drop-ready, .dragging'), function (node) { node.classList.remove('drop-ready', 'dragging'); });
  }
  function dropDestination(node, destination) {
    function allowed() {
      var p = projects[draggedProject], folder = organization.folders[destination];
      return !!p && K.tournament(p.state.tournament).id === hubTournament &&
        (!destination || (folder && folder.tournament === hubTournament)) && (p.folder || '') !== destination;
    }
    function over(event) {
      if (!allowed()) return;
      event.preventDefault(); event.dataTransfer.dropEffect = 'move'; node.classList.add('drop-ready');
    }
    node.addEventListener('dragenter', over);
    node.addEventListener('dragover', over);
    node.addEventListener('dragleave', function (event) {
      if (!event.relatedTarget || !node.contains(event.relatedTarget)) node.classList.remove('drop-ready');
    });
    node.addEventListener('drop', function (event) {
      if (!allowed()) return;
      event.preventDefault(); event.stopPropagation();
      var p = projects[draggedProject], name = p.state.name || 'Sin nombre';
      p.folder = destination; clearDrag(); saveAll(); showLobby();
      $('#hub-feedback').textContent = '«' + name + '» movida a «' + (destination ? folderPath(destination) : K.tournament(hubTournament).name) + '».';
    });
    return node;
  }
  function dragNewsletter(card, id) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', function (event) {
      if (event.target.closest('.proj-actions')) { event.preventDefault(); return; }
      draggedProject = id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-kaptiva-newsletter', id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', clearDrag);
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
    $('#hub-feedback').textContent = '';
    var box = $('#folders'); box.innerHTML = '';
    var crumbs = $('#hub-path'); crumbs.innerHTML = '';
    crumbs.appendChild(el('button', { class: 'crumb', text: 'Inicio', onclick: function () { navigate('', ''); } }));
    $('#hub-controls').hidden = !hubTournament; $('#new-folder').hidden = !hubTournament;
    $('#hub-count').textContent = '';
    function countFor(ids) { var n = Object.keys(projects).filter(function (id) { return ids.indexOf(K.tournament(projects[id].state.tournament).id) >= 0; }).length; return n + (n === 1 ? ' newsletter' : ' newsletters'); }
    function card(label, color, ids, fn) { return el('button', { class: 'tournament-card', onclick: fn, style: 'border-top-color:' + color }, [el('span', { text: '📁 ' + label }), el('small', { text: countFor(ids) })]); }
    var club = hubTournament ? K.club(K.tournament(hubTournament).club) : K.club(hubClub);
    if (club) {
      crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
      crumbs.appendChild(el('button', { class: 'crumb', text: club.name, onclick: function () { navigate('', '', club.id); } }));
    }
    if (!hubTournament) {
      if (club) {
        var sections = el('div', { class: 'grid' });
        K.CLIENT.tournaments.filter(function (t) { return t.club === club.id; }).forEach(function (t) { sections.appendChild(card(t.section, t.principal, [t.id], function () { navigate(t.id, ''); })); });
        box.appendChild(sections); return;
      }
      var ksa = el('div', { class: 'grid' }), clubs = el('div', { class: 'grid' });
      K.CLIENT.tournaments.filter(function (t) { return !t.club; }).forEach(function (t) { ksa.appendChild(card(t.name, t.principal, [t.id], function () { navigate(t.id, ''); })); });
      K.CLIENT.clubs.forEach(function (c) {
        var ids = K.CLIENT.tournaments.filter(function (t) { return t.club === c.id; }).map(function (t) { return t.id; });
        clubs.appendChild(card(c.name, c.base.principal, ids, function () { navigate('', '', c.id); }));
      });
      box.appendChild(el('h2', { class: 'hub-group', text: K.CLIENT.name })); box.appendChild(ksa);
      box.appendChild(el('h2', { class: 'hub-group', text: 'Clubs' })); box.appendChild(clubs);
      return;
    }
    crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
    crumbs.appendChild(dropDestination(el('button', { class: 'crumb', text: K.tournament(hubTournament).section || K.tournament(hubTournament).name, onclick: function () { navigate(hubTournament, ''); } }), ''));
    var path = [], cursor = hubFolder, seen = {};
    while (cursor && organization.folders[cursor] && !seen[cursor]) { seen[cursor] = true; path.unshift(cursor); cursor = organization.folders[cursor].parent; }
    path.forEach(function (id) {
      crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
      crumbs.appendChild(dropDestination(el('button', { class: 'crumb', text: folderName(id), onclick: function () { navigate(hubTournament, id); } }), id));
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
      if (isFolder) dropDestination(card, item.id); else dragNewsletter(card, item.id);
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
    $('#tournament').innerHTML = '';
    var ksa = el('optgroup', { label: K.CLIENT.name }); $('#tournament').appendChild(ksa);
    K.CLIENT.tournaments.filter(function (t) { return !t.club; }).forEach(function (t) { ksa.appendChild(el('option', { value: t.id, text: t.name })); });
    K.CLIENT.clubs.forEach(function (c) {
      var g = el('optgroup', { label: c.name }); $('#tournament').appendChild(g);
      K.CLIENT.tournaments.filter(function (t) { return t.club === c.id; }).forEach(function (t) { g.appendChild(el('option', { value: t.id, text: t.name })); });
    });
    $('#recipe').innerHTML = ''; $('#recipe').appendChild(el('option', { value: '', text: 'Nueva desde receta…' }));
    K.RECIPES.forEach(function (r) { $('#recipe').appendChild(el('option', { value: r.id, text: r.name })); });
    $('#add').innerHTML = ''; $('#add').appendChild(el('option', { value: '', text: '＋ Añadir módulo…' }));
    K.MODULE_ORDER.forEach(function (id) { $('#add').appendChild(el('option', { value: id, text: K.MODULES[id].letter + ' · ' + K.MODULES[id].name })); });
  }
  function syncSettings() {
    if (K.BrandKitsUI) K.BrandKitsUI.refreshSelect(state);
    editingCode = false; renderImagePanel(); renderCompareSelect(); renderCompare();
    $('#tournament').value = state.tournament; $('#name').value = state.name || ''; $('#desc').value = state.desc || ''; $('#mp').checked = !!state.mediaPackages; $('#franja').value = state.franjaLeft || '';
    ['header', 'franja', 'footer'].forEach(function (k) { $('#on-' + k).checked = !state.off[k]; });
    document.querySelector('details.more').open = ['header', 'franja', 'footer'].some(function (k) { return state.off[k]; });
  }

  // ---------- Otras newsletters: saltar entre ellas y comparar al lado ----------
  var compareId = '', comparing = false, previewMobile = false, GROUPS = ['Misma carpeta', 'Mismo torneo o sección', 'Otras newsletters'];
  function norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function projectLabel(id) {
    var p = projects[id], t = K.tournament(p.state.tournament), f = p.folder && organization.folders[p.folder] ? folderPath(p.folder) : '';
    return { name: p.state.name || 'Sin nombre', where: t.name + (f ? ' › ' + f : '') };
  }
  function otherProjects() {
    if (!currentId || !projects[currentId]) return [];
    var cur = projects[currentId], tid = K.tournament(cur.state.tournament).id;
    return Object.keys(projects).filter(function (id) { return id !== currentId; }).map(function (id) {
      var p = projects[id], same = K.tournament(p.state.tournament).id === tid;
      return { id: id, group: same && (p.folder || '') === (cur.folder || '') ? 0 : (same ? 1 : 2), updated: p.updated || 0 };
    }).sort(function (a, b) { return a.group - b.group || b.updated - a.updated; });
  }
  function canLeaveCode() { return !(editingCode && $('#code').value !== html) || confirm('Tienes cambios en el código sin aplicar. ¿Salir sin aplicarlos?'); }
  function goTo(id, keepCompare) {
    if (!projects[id] || !canLeaveCode()) return false;
    if ($('#switch-dialog').open) $('#switch-dialog').close();
    var previous = currentId; persist(); editingCode = false;
    compareId = keepCompare ? previous : (compareId === id ? '' : compareId);
    openProject(id); return true;
  }
  function renderSwitch() {
    var q = norm($('#switch-search').value.trim()), list = $('#switch-list'), last = -1, count = 0; list.innerHTML = '';
    otherProjects().forEach(function (item) {
      var l = projectLabel(item.id);
      if (q && norm(l.name + ' ' + l.where).indexOf(q) < 0) return;
      if (item.group !== last) { list.appendChild(el('h3', { class: 'switch-group', text: GROUPS[item.group] })); last = item.group; }
      list.appendChild(el('button', { type: 'button', class: 'switch-item', 'data-id': item.id, onclick: function () { goTo(item.id); } }, [
        el('strong', { text: l.name }), el('small', { text: l.where + ' · ' + new Date(item.updated).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) })
      ]));
      count++;
    });
    if (!count) list.appendChild(el('p', { class: 'empty', text: q ? 'Ninguna newsletter coincide con la búsqueda.' : 'No hay otras newsletters todavía.' }));
  }
  function openSwitch() { if (!currentId) return; $('#switch-search').value = ''; renderSwitch(); $('#switch-dialog').showModal(); $('#switch-search').focus(); }
  function renderCompareSelect() {
    var sel = $('#compare'), groups = {}; sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: 'Comparar con…' }));
    otherProjects().forEach(function (item) {
      var g = groups[item.group] || (groups[item.group] = sel.appendChild(el('optgroup', { label: GROUPS[item.group] }))), l = projectLabel(item.id);
      g.appendChild(el('option', { value: item.id, text: l.name + ' · ' + l.where }));
    });
    if (compareId && (!projects[compareId] || compareId === currentId)) compareId = '';
    sel.value = compareId;
  }
  function renderCompare() {
    comparing = !!(compareId && projects[compareId] && compareId !== currentId);
    if (!comparing) compareId = '';
    $('#compare-col').hidden = !comparing; $('#current-head').hidden = !comparing;
    $('#pane-preview').classList.toggle('comparing', comparing);
    if (comparing) {
      var l = projectLabel(compareId), st = K.normalize(JSON.parse(JSON.stringify(projects[compareId].state)));
      $('#compare-name').textContent = l.name; $('#compare-where').textContent = l.where;
      $('#compare-frame').srcdoc = typeof st.customHtml === 'string' ? st.customHtml : K.build(st);
    } else $('#compare-frame').srcdoc = '';
    fitFrames();
  }
  // Al comparar en escritorio, cada email (650 px) se reduce para caber en su columna sin pasar al diseño móvil.
  function fitFrames() {
    ['#frame', '#compare-frame'].forEach(function (sel) {
      var f = $(sel); if (!f.style) return;
      f.style.zoom = ''; f.style.width = ''; f.style.height = ''; f.style.flex = '';
      if (!comparing || previewMobile || !f.getBoundingClientRect) return;
      var col = f.parentNode, w = col.clientWidth, z = Math.min(1, w / 700);
      if (!w || z >= 1) return;
      var avail = col.getBoundingClientRect().bottom - f.getBoundingClientRect().top;
      f.style.flex = 'none'; f.style.zoom = z; f.style.width = (w / z) + 'px'; f.style.height = (avail / z) + 'px';
    });
  }

  // ---------- Imágenes: panel del brand kit, arrastrar, intercambiar y placeholders ----------
  // dragImage: { kind: 'kit', url, name } | { kind: 'ph' } | { kind: 'field', s, k }
  var dragImage = null;
  function filled(v) { return !!(v && String(v).trim()); }
  function isImageField(f) { return !!(f.img || f.k === 'img'); }
  function imageFieldOf(m) { return m.fields.filter(isImageField)[0]; }
  function hasAlt(s) { return K.MODULES[s.type].fields.some(function (f) { return f.k === 'alt'; }); }
  function setImage(s, k, drag) {
    if (!drag) return;
    if (drag.kind === 'kit') {
      // La descripción se actualiza si estaba vacía o era el nombre de la imagen anterior del kit; un texto escrito a mano se conserva.
      var prev = K.BrandKitsUI ? K.BrandKitsUI.images(state).filter(function (a) { return a.url && a.url === String(s.d[k] || '').trim(); })[0] : null;
      var autoAlt = !filled(s.d.alt) || (prev && prev.name === String(s.d.alt).trim());
      s.d[k] = drag.url; if (autoAlt && drag.name && hasAlt(s)) s.d.alt = drag.name;
    }
    else if (drag.kind === 'ph') s.d[k] = K.IMG_PH;
    else if (drag.kind === 'field') {
      if (drag.s === s && drag.k === k) return;
      // Intercambio: la imagen y su descripción viajan juntas.
      var a = drag.s.d, b = s.d, tmp = a[drag.k]; a[drag.k] = b[k]; b[k] = tmp;
      if (hasAlt(drag.s) && hasAlt(s)) { tmp = a.alt; a.alt = b.alt; b.alt = tmp; }
      if (!filled(a[drag.k])) delete a[drag.k];
    } else return;
    renderSections(); update();
  }
  function clearDragImage() {
    dragImage = null;
    Array.prototype.forEach.call(document.querySelectorAll('.drop-ready, .dragging'), function (n) { n.classList.remove('drop-ready', 'dragging'); });
  }
  function dragSource(node, payload, label) {
    node.setAttribute('draggable', 'true');
    node.addEventListener('dragstart', function (event) {
      dragImage = payload(); node.classList.add('dragging');
      event.dataTransfer.effectAllowed = dragImage.kind === 'field' ? 'move' : 'copy';
      event.dataTransfer.setData('text/plain', label());
    });
    node.addEventListener('dragend', clearDragImage);
    return node;
  }
  function dropTarget(node, onDrop) {
    function over(event) { if (!dragImage) return; event.preventDefault(); event.dataTransfer.dropEffect = dragImage.kind === 'field' ? 'move' : 'copy'; node.classList.add('drop-ready'); }
    node.addEventListener('dragenter', over);
    node.addEventListener('dragover', over);
    node.addEventListener('dragleave', function (event) { if (!event.relatedTarget || !node.contains(event.relatedTarget)) node.classList.remove('drop-ready'); });
    node.addEventListener('drop', function (event) {
      if (!dragImage) return; event.preventDefault(); event.stopPropagation();
      var drag = dragImage; clearDragImage(); onDrop(drag);
    });
    return node;
  }
  function thumb(value) {
    var box = el('div', { class: 'img-thumb' });
    if (K.isImagePlaceholder(value)) { box.classList.add('is-ph'); box.textContent = 'Placeholder · imagen pendiente'; }
    else if (/^https:\/\//i.test(String(value || '').trim())) { var img = el('img', { alt: '', loading: 'lazy' }); img.referrerPolicy = 'no-referrer'; img.src = String(value).trim(); box.appendChild(img); }
    else { box.classList.add('is-empty'); box.textContent = filled(value) ? 'Enlace no válido' : 'Suelta aquí una imagen'; }
    return box;
  }
  function renderImagePanel() {
    var list = $('#image-panel-list'); list.innerHTML = '';
    if (!state) return;
    var ph = dragSource(el('div', { class: 'panel-img is-ph', title: 'Arrástralo a un bloque para dejar un hueco de imagen pendiente' }, [el('div', { class: 'img-thumb is-ph', text: 'Imagen pendiente' }), el('strong', { text: 'Placeholder' })]),
      function () { return { kind: 'ph' }; }, function () { return 'Placeholder'; });
    list.appendChild(ph);
    var images = K.BrandKitsUI ? K.BrandKitsUI.images(state) : [];
    images.forEach(function (a) {
      var img = el('img', { alt: '', loading: 'lazy' }); img.referrerPolicy = 'no-referrer'; img.src = a.preview;
      var card = el('div', { class: 'panel-img' + (a.url ? '' : ' is-ref'), title: (a.name || 'Imagen sin nombre') + ' · ' + a.kit + (a.url ? '' : ' · solo referencia, sin custom link') }, [
        el('div', { class: 'img-thumb' }, [img]), el('strong', { text: a.name || 'Imagen sin nombre' }), el('small', { text: a.kit })
      ]);
      if (a.url) dragSource(card, function () { return { kind: 'kit', url: a.url, name: a.name }; }, function () { return a.url; });
      list.appendChild(card);
    });
    $('#image-panel-empty').hidden = images.some(function (a) { return a.url; });
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
      var summary = det.appendChild(el('summary', {}, [
        el('span', { class: 'letter', text: m.letter }), el('span', { class: 'mname', text: m.name }), snip,
        el('span', { class: 'tools' }, [
          tool('↑', 'Subir', function () { move(i, -1); }, i === 0),
          tool('↓', 'Bajar', function () { move(i, 1); }, i === state.sections.length - 1),
          tool('⧉', 'Duplicar', function () { var c = JSON.parse(JSON.stringify(s)); c.id = 's' + Date.now(); state.sections.splice(i + 1, 0, c); renderSections(); update(); }),
          tool('✕', 'Eliminar', function () { if (confirm('¿Eliminar «' + m.name + '»?')) { state.sections.splice(i, 1); renderSections(); update(); } })
        ])
      ]));
      var imgField = imageFieldOf(m);
      if (imgField) dropTarget(summary, function (drag) { s.open = true; setImage(s, imgField.k, drag); });
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
        if (isImageField(f)) {
          var value = s.d[f.k], tools = el('div', { class: 'img-tools' });
          if (K.BrandKitsUI) tools.appendChild(el('button', { type: 'button', class: 'kit-pick', text: 'Elegir del brand kit', onclick: function () {
            K.BrandKitsUI.pickImage(state, function (asset) { setImage(s, f.k, { kind: 'kit', url: asset.url, name: asset.name }); });
          } }));
          tools.appendChild(el('button', { type: 'button', class: 'kit-pick', text: 'Usar placeholder', onclick: function () { setImage(s, f.k, { kind: 'ph' }); } }));
          if (filled(value)) tools.appendChild(el('button', { type: 'button', class: 'kit-pick', text: 'Quitar imagen', onclick: function () { delete s.d[f.k]; renderSections(); update(); } }));
          var preview = thumb(value);
          if (filled(value)) {
            preview.setAttribute('title', 'Arrastra a otro bloque para intercambiar las imágenes');
            dragSource(preview, function () { return { kind: 'field', s: s, k: f.k }; }, function () { return String(value); });
          }
          var slot = el('div', { class: 'img-slot' + (f.half ? ' half' : '') }, [preview, el('div', { class: 'img-slot-main' }, [wrap, tools])]);
          dropTarget(slot, function (drag) { setImage(s, f.k, drag); });
          body.appendChild(slot);
        } else body.appendChild(wrap);
      });
      det.appendChild(body); box.appendChild(det);
    });
  }
  function move(i, dir) { var a = state.sections, x = a.splice(i, 1)[0]; a.splice(i + dir, 0, x); renderSections(); update(); }

  // ---------- Resultado ----------
  function update() { clearTimeout(timer); timer = setTimeout(refresh, 200); }
  // Código editado a mano: state.customHtml sustituye al HTML generado en vista previa, copia y descargas.
  // state.customBase guarda el HTML generado en el momento de aplicar, para avisar si después cambian módulos o ajustes.
  function hasCustomCode() { return !!state && typeof state.customHtml === 'string'; }
  function codeUI(generated) {
    var custom = hasCustomCode(), stale = custom && generated !== state.customBase, note = '';
    $('#code').readOnly = !editingCode;
    $('#copy').hidden = editingCode; $('#code-edit').hidden = editingCode;
    $('#code-apply').hidden = !editingCode; $('#code-cancel').hidden = !editingCode;
    $('#code-reset').hidden = editingCode || !custom;
    $('#code-edit').textContent = custom ? 'Seguir editando' : 'Editar código';
    var customMsg = custom ? 'Esta newsletter usa código editado a mano: los cambios en los módulos y ajustes no se aplican al email.' + (stale ? ' Has cambiado módulos o ajustes desde la última edición; para incorporarlos, vuelve al código generado.' : '') : '';
    note = editingCode ? 'Estás editando el código. Pulsa «Aplicar cambios» para usarlo en la vista previa, la copia y las descargas.' : customMsg;
    $('#code-note').textContent = note; $('#code-note').hidden = !note;
    $('#preview-note').textContent = customMsg; $('#preview-note').hidden = !customMsg;
  }
  function refresh() {
    var generated = K.build(state), custom = hasCustomCode();
    html = custom ? state.customHtml : generated; checks = K.check(state, html);
    if (custom) checks.unshift({ level: 'warn', msg: 'Código editado a mano: la revisión de módulos se basa en sus campos y puede no reflejar lo cambiado en el código.' + (generated !== state.customBase ? ' Hay cambios en módulos o ajustes que no están en el código editado.' : '') });
    persist();
    $('#frame').srcdoc = html; if (!editingCode) $('#code').value = html;
    codeUI(generated);
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
    if (K.BrandKitsUI) K.BrandKitsUI.init(function () { K.BrandKitsUI.refreshSelect(state); renderImagePanel(); });
    fillSettings();
    loadAll(); initHub(); showLobby();
    $('#back').addEventListener('click', function () {
      if (!canLeaveCode()) return;
      editingCode = false; var id = currentId; showLobby(); focusHubItem(id);
    });
    $('#code-edit').addEventListener('click', function () { editingCode = true; codeUI(K.build(state)); $('#code').focus(); });
    $('#code-cancel').addEventListener('click', function () { editingCode = false; $('#code').value = html; codeUI(K.build(state)); });
    $('#code-apply').addEventListener('click', function () {
      var value = $('#code').value, generated = K.build(state);
      if (!value.trim()) { alert('El código está vacío. Escribe o pega el HTML, o pulsa Cancelar.'); return; }
      editingCode = false;
      if (value === generated) { delete state.customHtml; delete state.customBase; }
      else if (value !== html) { state.customHtml = value; state.customBase = generated; }
      refresh();
    });
    $('#code-reset').addEventListener('click', function () {
      if (!confirm('Se descartará el código editado a mano y se volverá a generar desde los módulos. ¿Continuar?')) return;
      delete state.customHtml; delete state.customBase; refresh();
    });
    $('#new').addEventListener('click', function () {
      var target = hubTournament || (hubClub ? K.CLIENT.tournaments.filter(function (t) { return t.club === hubClub; })[0].id : '');
      var st = K.fromRecipe('blank', target || undefined);
      if (target) { st.tournament = target; st.headerAlt = ''; }
      createProject(st);
    });
    $('#franja').addEventListener('input', function () { state.franjaLeft = this.value; update(); });
    ['header', 'franja', 'footer'].forEach(function (k) { $('#on-' + k).addEventListener('change', function () { state.off[k] = !this.checked; update(); }); });
    window.addEventListener('beforeunload', function () { if (currentId) persist(); });
    // Otra pestaña ha guardado: fusionar y refrescar lo que se ve.
    window.addEventListener('storage', function (event) {
      if (event.key !== PROJ && event.key !== HUB) return;
      saveAll(); if (!currentId) showLobby(); else { renderCompareSelect(); renderCompare(); }
    });
    $('#switch').addEventListener('click', openSwitch);
    $('#switch-close').addEventListener('click', function () { $('#switch-dialog').close(); });
    $('#switch-search').addEventListener('input', renderSwitch);
    $('#switch-search').addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return; event.preventDefault();
      var first = $('#switch-list').querySelector('.switch-item'); if (first) goTo(first.getAttribute('data-id'));
    });
    window.addEventListener('keydown', function (event) {
      if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K') && currentId) { event.preventDefault(); openSwitch(); }
    });
    $('#compare').addEventListener('change', function () { compareId = this.value; renderCompare(); });
    $('#compare-close').addEventListener('click', function () { compareId = ''; $('#compare').value = ''; renderCompare(); });
    $('#compare-open').addEventListener('click', function () { goTo(compareId, true); });
    window.addEventListener('resize', fitFrames);

    $('#brand-kit').addEventListener('change', function () {
      if (this.value === '@current' || !K.BrandKits) return;
      var kit = K.BrandKits.find(this.value);
      if (kit) state.brandKit = K.BrandKits.snapshot(kit); else delete state.brandKit;
      update(); K.BrandKitsUI.refreshSelect(state); renderImagePanel();
    });
    $('#tournament').addEventListener('change', function () { state.tournament = this.value; update(); renderImagePanel(); });
    $('#name').addEventListener('input', function () { state.name = this.value; update(); });
    $('#desc').addEventListener('input', function () { state.desc = this.value; update(); });
    $('#mp').addEventListener('change', function () { state.mediaPackages = this.checked; update(); });

    $('#recipe').addEventListener('change', function () {
      var id = this.value; this.value = ''; if (!id) return;
      if (state.sections.length > 0 && !confirm('Se sustituirá el contenido de este proyecto. ¿Continuar?')) return;
      var appliedKit = state.brandKit; state = K.fromRecipe(id, state.tournament); if (appliedKit) state.brandKit = appliedKit; persist(); syncSettings(); renderSections(); refresh();
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
        $('#compare').style.visibility = b.dataset.tab === 'preview' ? 'visible' : 'hidden';
        if (b.dataset.tab === 'preview') fitFrames();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('#device button'), function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(document.querySelectorAll('#device button'), function (x) { x.classList.toggle('on', x === b); });
        previewMobile = b.dataset.w === 'mobile';
        $('#frame').classList.toggle('mobile', previewMobile); $('#compare-frame').classList.toggle('mobile', previewMobile); fitFrames();
      });
    });
  }
  init();
})();
