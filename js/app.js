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
    $('#hub-search').value = ''; $('#hub-from').value = ''; $('#hub-to').value = ''; $('#hub-scope').value = 'here';
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
  // ---------- Accesos rápidos: panel de ubicaciones, recientes y búsqueda en todo ----------
  function tournamentLabel(tid) { var t = K.tournament(tid), c = t.club && K.club(t.club); return c ? c.name + ' › ' + t.section : t.name; }
  function inFolder(folder, fid) { return !!folder && K.Hub.contains(organization.folders, fid, folder); }
  function countIn(fid) { return Object.keys(projects).filter(function (id) { return inFolder(projects[id].folder, fid); }).length; }
  function plural(n) { return n + (n === 1 ? ' newsletter' : ' newsletters'); }
  function itemLocation(item) {
    var tid = item.kind === 'folder' ? organization.folders[item.id].tournament : K.tournament(projects[item.id].state.tournament).id;
    var folder = item.kind === 'folder' ? organization.folders[item.id].parent : projects[item.id].folder;
    var path = folder && organization.folders[folder] ? folderPath(folder).split(' / ').join(' › ') : '';
    return { tid: tid, folder: folder || '', text: tournamentLabel(tid) + (path ? ' › ' + path : '') };
  }
  // Tarjeta sin acciones de organización: abre la newsletter (o entra en la carpeta) y muestra dónde está.
  function quickCard(item) {
    var isFolder = item.kind === 'folder', where = itemLocation(item), t = K.tournament(where.tid);
    return el('div', { class: 'proj hub-card quick', 'data-hub-id': item.id }, [
      el('span', { class: 'swatch', style: 'background:' + (isFolder ? '#e4e0ee' : t.principal) + ';border-bottom:4px solid ' + t.acento }),
      el('button', { class: 'item-open', title: item.name, text: (isFolder ? '📁 ' : '') + item.name, onclick: function () { if (isFolder) navigate(where.tid, item.id); else openProject(item.id); } }),
      el('button', { class: 'where', title: 'Ir a ' + where.text, text: where.text, onclick: function () { navigate(where.tid, where.folder); } }),
      el('small', { text: isFolder ? 'Carpeta · ' + plural(countIn(item.id)) : 'Modificado: ' + new Date(item.updated).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) })
    ]);
  }
  function allItems() {
    var items = Object.keys(organization.folders).map(function (id) { var f = organization.folders[id]; return { kind: 'folder', id: id, name: f.name, updated: f.updated }; });
    return items.concat(Object.keys(projects).map(function (id) { return { kind: 'project', id: id, name: projects[id].state.name || 'Sin nombre', updated: projects[id].updated }; }));
  }
  var treeOpen = {};
  function renderTree() {
    var tree = $('#hub-tree'); tree.innerHTML = '';
    var activeClub = hubTournament ? K.tournament(hubTournament).club : hubClub;
    function count(ids) { return Object.keys(projects).filter(function (id) { return ids.indexOf(K.tournament(projects[id].state.tournament).id) >= 0; }).length; }
    function item(label, n, color, current, fn, title) {
      var b = el('button', { type: 'button', class: 'tree-item' + (current ? ' current' : ''), title: title || label, onclick: fn }, [
        color ? el('span', { class: 'tree-dot', style: 'background:' + color, 'aria-hidden': 'true' }) : null,
        el('span', { class: 'tree-label', text: label }), n === null ? null : el('span', { class: 'tree-count', text: String(n), 'aria-label': plural(n) })
      ]);
      if (current) b.setAttribute('aria-current', 'page');
      return b;
    }
    function folders(tid, parent, depth) {
      var ids = Object.keys(organization.folders).filter(function (id) { var f = organization.folders[id]; return f.tournament === tid && (f.parent || '') === parent; })
        .sort(function (a, b) { return organization.folders[a].name.localeCompare(organization.folders[b].name, 'es', { numeric: true }); });
      if (!ids.length) return null;
      var list = el('ul', { class: 'tree-list' });
      ids.forEach(function (id) {
        var li = el('li', { style: '--depth:' + depth }, [dropDestination(item('📁 ' + organization.folders[id].name, countIn(id), '', hubFolder === id, function () { navigate(tid, id); }), id)]);
        // Solo se despliegan las subcarpetas del camino abierto para no alargar el panel.
        if (hubFolder && inFolder(hubFolder, id)) li.appendChild(folders(tid, id, depth + 1));
        list.appendChild(li);
      });
      return list;
    }
    function tournamentNode(t, label, depth) {
      var current = hubTournament === t.id, node = item(label, count([t.id]), t.principal, current && !hubFolder, function () { navigate(t.id, ''); }, tournamentLabel(t.id));
      var li = el('li', { style: '--depth:' + depth }, [current ? dropDestination(node, '') : node]);
      if (current) li.appendChild(folders(t.id, '', depth + 1));
      return li;
    }
    var home = el('ul', { class: 'tree-list' }, [el('li', {}, [item('Inicio', null, '', !hubTournament && !hubClub, function () { navigate('', ''); })])]);
    tree.appendChild(home);
    tree.appendChild(el('p', { class: 'tree-group', text: K.CLIENT.name }));
    var ksa = el('ul', { class: 'tree-list' });
    K.CLIENT.tournaments.filter(function (t) { return !t.club; }).forEach(function (t) { ksa.appendChild(tournamentNode(t, t.name, 0)); });
    tree.appendChild(ksa);
    tree.appendChild(el('p', { class: 'tree-group', text: 'Clubs' }));
    var clubs = el('ul', { class: 'tree-list' });
    K.CLIENT.clubs.forEach(function (c) {
      var sections = K.CLIENT.tournaments.filter(function (t) { return t.club === c.id; }), open = activeClub === c.id || !!treeOpen[c.id];
      var toggle = el('button', { type: 'button', class: 'tree-toggle', 'aria-expanded': String(open), 'aria-label': (open ? 'Plegar ' : 'Desplegar ') + c.name, text: open ? '▾' : '▸', onclick: function () { treeOpen[c.id] = !open; renderTree(); var again = document.querySelector('[data-tree-toggle="' + c.id + '"]'); if (again) again.focus(); }, 'data-tree-toggle': c.id });
      var row = el('div', { class: 'tree-row' }, [toggle, item(c.name, count(sections.map(function (t) { return t.id; })), c.base.principal, !hubTournament && hubClub === c.id, function () { treeOpen[c.id] = true; navigate('', '', c.id); })]);
      var li = el('li', {}, [row]);
      if (open) { var sub = el('ul', { class: 'tree-list' }); sections.forEach(function (t) { sub.appendChild(tournamentNode(t, t.section, 1)); }); li.appendChild(sub); }
      clubs.appendChild(li);
    });
    tree.appendChild(clubs);
  }
  function showResults(box, query) {
    var found = K.Hub.sort(allItems().filter(function (item) { return K.Hub.matches(item, query, '', ''); }), 'newest');
    $('#hub-controls').hidden = true;
    $('#hub-count').textContent = found.length + (found.length === 1 ? ' resultado' : ' resultados') + ' en todas las newsletters';
    if (!found.length) { box.appendChild(el('p', { class: 'empty', text: 'No hay newsletters ni carpetas con ese nombre.' })); return; }
    var grid = el('div', { class: 'grid' }); found.forEach(function (item) { grid.appendChild(quickCard(item)); }); box.appendChild(grid);
  }
  function showLobby() {
    clearTimeout(timer); if (currentId) persist(); currentId = null;
    document.body.classList.add('in-lobby');
    if (hubFolder && !organization.folders[hubFolder]) hubFolder = '';
    $('#hub-feedback').textContent = '';
    renderTree();
    var box = $('#folders'); box.innerHTML = '';
    var crumbs = $('#hub-path'); crumbs.innerHTML = '';
    crumbs.appendChild(el('button', { class: 'crumb', text: 'Inicio', onclick: function () { navigate('', ''); } }));
    $('#hub-controls').hidden = !hubTournament; $('#new-folder').hidden = !hubTournament;
    $('#hub-count').textContent = '';
    // Fuera de una sección (inicio o club) la búsqueda recorre todo; dentro se puede elegir.
    $('#hub-scope').hidden = !hubTournament;
    $('#hub-search').placeholder = hubTournament && $('#hub-scope').value !== 'all' ? 'Buscar en esta carpeta…' : 'Buscar en todas las newsletters y carpetas…';
    var globalQuery = $('#hub-search').value.trim() && (!hubTournament || $('#hub-scope').value === 'all') ? $('#hub-search').value : '';
    function countFor(ids) { var n = Object.keys(projects).filter(function (id) { return ids.indexOf(K.tournament(projects[id].state.tournament).id) >= 0; }).length; return n + (n === 1 ? ' newsletter' : ' newsletters'); }
    function card(label, color, ids, fn) { return el('button', { class: 'tournament-card', onclick: fn, style: 'border-top-color:' + color }, [el('span', { text: '📁 ' + label }), el('small', { text: countFor(ids) })]); }
    var club = hubTournament ? K.club(K.tournament(hubTournament).club) : K.club(hubClub);
    if (club) {
      crumbs.appendChild(el('span', { text: '›', 'aria-hidden': 'true' }));
      crumbs.appendChild(el('button', { class: 'crumb', text: club.name, onclick: function () { navigate('', '', club.id); } }));
    }
    if (!hubTournament) {
      if (globalQuery) { showResults(box, globalQuery); return; }
      if (club) {
        var sections = el('div', { class: 'grid' });
        K.CLIENT.tournaments.filter(function (t) { return t.club === club.id; }).forEach(function (t) { sections.appendChild(card(t.section, t.principal, [t.id], function () { navigate(t.id, ''); })); });
        box.appendChild(sections); return;
      }
      var recent = K.Hub.sort(allItems().filter(function (item) { return item.kind === 'project'; }), 'newest').slice(0, 6);
      if (recent.length) {
        var recentGrid = el('div', { class: 'grid' }); recent.forEach(function (item) { recentGrid.appendChild(quickCard(item)); });
        box.appendChild(el('h2', { class: 'hub-group', text: 'Editadas recientemente' })); box.appendChild(recentGrid);
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
    if (globalQuery) { showResults(box, globalQuery); return; }
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
        el('small', { text: isFolder ? 'Carpeta · ' + plural(countIn(item.id)) : (p.state.sections || []).length + ' módulos' }),
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
    $('#hub-scope').addEventListener('change', function () { showLobby(); $('#hub-search').focus(); });
    // En pantallas estrechas el panel de ubicaciones empieza plegado; en escritorio siempre está abierto.
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 801px)'), fit = function () { $('#hub-tree-box').open = wide.matches; };
      fit(); if (wide.addEventListener) wide.addEventListener('change', fit);
    }
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
  function fillTournaments(select) {
    select.innerHTML = '';
    var ksa = el('optgroup', { label: K.CLIENT.name }); select.appendChild(ksa);
    K.CLIENT.tournaments.filter(function (t) { return !t.club; }).forEach(function (t) { ksa.appendChild(el('option', { value: t.id, text: t.name })); });
    K.CLIENT.clubs.forEach(function (c) {
      var g = el('optgroup', { label: c.name }); select.appendChild(g);
      K.CLIENT.tournaments.filter(function (t) { return t.club === c.id; }).forEach(function (t) { g.appendChild(el('option', { value: t.id, text: t.name })); });
    });
  }
  function fillSettings() {
    fillTournaments($('#tournament')); fillTournaments($('#script-tournament'));
    $('#recipe').innerHTML = ''; $('#recipe').appendChild(el('option', { value: '', text: 'Nueva desde receta…' }));
    K.RECIPES.forEach(function (r) { $('#recipe').appendChild(el('option', { value: r.id, text: r.name })); });
    renderPalette();
  }
  function syncSettings() {
    if (K.BrandKitsUI) K.BrandKitsUI.refreshSelect(state);
    editingCode = false; renderImagePanel(); renderCompareSelect(); renderCompare();
    selectedSection = -1; previewScroll = 0; pendingInsert = null; if (state.sections.length) closePalette(); else openPalette(null);
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

  // ---------- Montar por bloques: paleta, arrastrar y editar en la vista previa ----------
  var BLOCK_INFO = {
    intro: 'Saludo y párrafos de texto.', titulo: 'Título grande centrado, con texto y botón opcionales.',
    lista: 'Título con una lista de puntos.', datos: 'Banda de color con fecha, hora, lugar…',
    tarjetas: 'Dos opciones lado a lado, con botón.', info: 'Aviso o instrucciones sobre fondo suave.',
    producto: 'Servicio con precio, imagen y opciones.', separador: 'Línea fina entre dos productos.',
    imagen: 'Imagen a sangre o con márgenes.', cierre: 'Frase de cierre entre dos líneas.',
    compra: 'Caja de registro con los campos de Cvent.', contacto: 'Caja «Get in Touch» con el contacto.'
  };
  // dragBlock: { kind: 'move', from } (bloque existente) | { kind: 'new', type } (desde la paleta)
  var dragBlock = null, selectedSection = -1, insertAt = null, pendingInsert = null, previewDoc = null, previewScroll = 0, inlineEditing = false;
  function blockName(i) { var s = state.sections[i]; return s && K.MODULES[s.type] ? K.MODULES[s.type].name : ''; }
  // Un bloque nuevo trae sus textos obligatorios como «PENDIENTE: …» para poder pulsarlos y escribir en la vista previa.
  // La revisión los marca como error hasta que se sustituyan.
  function newSection(type) {
    var m = K.MODULES[type], d = {}, def = m.defaults || {}, k; for (k in def) d[k] = def[k];
    var head = '';
    m.fields.forEach(function (f) {
      if (f.type === 'head') { head = f.label; return; }
      if (f.req && (f.type === 'text' || f.type === 'area') && !d[f.k]) d[f.k] = 'PENDIENTE: ' + f.label + (head ? ' (' + head + ')' : '');
    });
    return { id: 's' + Date.now() + Math.floor(Math.random() * 1000), type: type, d: d, open: true };
  }
  // «＋» en la vista previa: aparece un «Bloque nuevo» en esa posición y se elige su tipo en la paleta.
  function startPending(at) {
    if (at == null || at > state.sections.length) at = state.sections.length;
    pendingInsert = at; selectedSection = -1; openPalette(at); refresh();
  }
  function insertBlock(type, at) {
    pendingInsert = null;
    if (at == null || at > state.sections.length) at = state.sections.length;
    state.sections.splice(at, 0, newSection(type)); closePalette();
    selectSection(at); update();
  }
  function moveTo(from, to) {
    if (to > from) to--; if (to === from) return;
    var x = state.sections.splice(from, 1)[0]; state.sections.splice(to, 0, x);
    selectedSection = to; renderSections(); update();
  }
  function removeBlock(i) {
    if (!confirm('¿Eliminar «' + blockName(i) + '»?')) return;
    state.sections.splice(i, 1); selectedSection = -1; renderSections(); update();
  }
  function duplicateBlock(i) {
    var c = JSON.parse(JSON.stringify(state.sections[i])); c.id = 's' + Date.now(); state.sections.splice(i + 1, 0, c);
    selectedSection = i + 1; renderSections(); update();
  }
  // Selecciona un bloque: lo abre y lo muestra en el panel, y lo marca en la vista previa.
  function selectSection(i, scrollPreview) {
    selectedSection = i; if (state.sections[i]) state.sections[i].open = true;
    renderSections();
    var cards = $('#sections').querySelectorAll ? $('#sections').querySelectorAll('details') : [];
    if (cards[i] && cards[i].scrollIntoView) cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    markPreview(scrollPreview);
  }
  function renderPalette() {
    var box = $('#palette-list'); box.innerHTML = '';
    K.MODULE_ORDER.forEach(function (id) {
      var m = K.MODULES[id], card = el('button', { type: 'button', class: 'palette-card', draggable: 'true', title: 'Pulsa para añadirlo o arrástralo a la vista previa', onclick: function () { insertBlock(id, pendingInsert != null ? pendingInsert : insertAt); } }, [
        el('span', { class: 'letter', text: m.letter }), el('span', { class: 'palette-text' }, [el('strong', { text: m.name }), el('small', { text: BLOCK_INFO[id] || '' })])
      ]);
      card.addEventListener('dragstart', function (event) { dragBlock = { kind: 'new', type: id }; event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('text/plain', m.name); });
      card.addEventListener('dragend', endBlockDrag);
      box.appendChild(card);
    });
  }
  function openPalette(at) {
    insertAt = at == null ? null : at;
    $('#palette-target').textContent = pendingInsert != null ? 'Elige el tipo del bloque nuevo marcado en la vista previa.' : (insertAt == null || insertAt >= state.sections.length ? 'Se añade al final. También puedes arrastrarlo a la vista previa o entre los bloques.' : 'Se añade debajo de «' + blockName(insertAt - 1) + '».');
    $('#palette').hidden = false; $('#add-toggle').setAttribute('aria-expanded', 'true');
    if ($('#palette').scrollIntoView) $('#palette').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function closePalette() {
    insertAt = null; $('#palette').hidden = true; $('#add-toggle').setAttribute('aria-expanded', 'false');
    if (pendingInsert != null) { pendingInsert = null; refresh(); }
  }
  function endBlockDrag() {
    dragBlock = null; hideDropLine();
    Array.prototype.forEach.call(document.querySelectorAll('.drop-before, .drop-after'), function (n) { n.classList.remove('drop-before', 'drop-after'); });
  }
  // Arrastrar tarjetas del panel para reordenar (o soltar un bloque nuevo entre ellas).
  function cardDrop(det, summary, i) {
    summary.setAttribute('draggable', 'true');
    summary.addEventListener('dragstart', function (event) { if (dragImage) return; dragBlock = { kind: 'move', from: i }; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', blockName(i)); });
    summary.addEventListener('dragend', endBlockDrag);
    function where(event) { var r = det.getBoundingClientRect(); return event.clientY < r.top + Math.min(r.height, 60) / 2 ? i : i + 1; }
    det.addEventListener('dragover', function (event) {
      if (!dragBlock) return; event.preventDefault();
      var at = where(event); det.classList.toggle('drop-before', at === i); det.classList.toggle('drop-after', at !== i);
    });
    det.addEventListener('dragleave', function (event) { if (!event.relatedTarget || !det.contains(event.relatedTarget)) det.classList.remove('drop-before', 'drop-after'); });
    det.addEventListener('drop', function (event) {
      if (!dragBlock) return; event.preventDefault();
      var drag = dragBlock, at = where(event); endBlockDrag();
      if (drag.kind === 'move') moveTo(drag.from, at); else insertBlock(drag.type, at);
    });
  }

  // Vista previa interactiva: solo con el HTML generado (no con código editado a mano).
  var PREVIEW_CSS = '[data-ksa-section],[data-ksa-empty]{cursor:pointer}' +
    '.ksa-box{position:absolute;z-index:8;pointer-events:none;border-radius:3px}' +
    '.ksa-hover{border:2px dashed rgba(111,74,204,.6)}.ksa-sel{border:2px solid #6F4ACC;box-shadow:0 0 0 3px rgba(111,74,204,.18)}' +
    '.ksa-bar{position:absolute;z-index:10;display:flex;gap:2px;background:#1b1630;border-radius:8px;padding:3px;box-shadow:0 4px 14px rgba(0,0,0,.3);font:12px/1.2 -apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.ksa-bar button{border:0;background:none;color:#fff;cursor:pointer;padding:5px 7px;border-radius:5px;font:inherit;white-space:nowrap}' +
    '.ksa-bar button:hover{background:#6F4ACC}.ksa-bar .ksa-handle{cursor:grab}' +
    '.ksa-line{position:absolute;z-index:9;height:4px;margin-top:-2px;background:#6F4ACC;border-radius:2px;pointer-events:none;box-shadow:0 0 0 2px #fff}' +
    '.ksa-drop{border:3px solid #91FAFB;background:rgba(145,250,251,.12)}' +
    '[contenteditable=true]{outline:2px solid #6F4ACC !important;outline-offset:3px;cursor:text;background:rgba(145,250,251,.18)}' +
    '.ksa-fmt{position:absolute;z-index:12;display:flex;gap:2px;background:#fff;border:1px solid #d9d3ea;border-radius:8px;padding:3px;box-shadow:0 6px 18px rgba(27,22,48,.25);font:13px/1.2 -apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.ksa-fmt button{border:0;background:none;color:#1b1630;cursor:pointer;padding:5px 9px;border-radius:5px;font:inherit;white-space:nowrap}.ksa-fmt button:hover{background:#F7F4FC;color:#6F4ACC}' +
    '.ksa-plus{position:absolute;z-index:9;width:26px;height:26px;border-radius:50%;border:2px solid #fff;background:#6F4ACC;color:#fff;font:700 17px/20px -apple-system,"Segoe UI",sans-serif;cursor:pointer;opacity:.45;box-shadow:0 2px 8px rgba(27,22,48,.35);padding:0}' +
    '.ksa-plus:hover{opacity:1;transform:scale(1.12)}[data-ksa-pending]{cursor:pointer}' +
    '.ksa-pop{position:absolute;z-index:13;gap:2px;min-width:220px;max-width:300px;background:#fff;border:1px solid #d9d3ea;border-radius:10px;padding:8px;box-shadow:0 8px 24px rgba(27,22,48,.28);font:13px/1.3 -apple-system,"Segoe UI",Roboto,sans-serif;color:#1b1630}' +
    '.ksa-pop strong{font-size:12px;color:#6f6a85;padding:2px 6px 6px}.ksa-pop p{margin:0;padding:4px 6px;color:#6f6a85}' +
    '.ksa-pop button{border:0;background:none;text-align:left;padding:7px 8px;border-radius:6px;cursor:pointer;font:inherit;color:#1b1630}.ksa-pop button:hover{background:#F7F4FC;color:#6F4ACC}' +
    '.ksa-tip{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:11;background:#1b1630;color:#fff;font:12px -apple-system,"Segoe UI",sans-serif;padding:6px 10px;border-radius:7px;pointer-events:none}';
  function setPreview(markup) {
    var f = $('#frame');
    try { if (f.contentWindow && f.contentDocument && f.contentDocument.body) previewScroll = f.contentWindow.scrollY; } catch (e) {}
    f.srcdoc = markup;
  }
  function overlay(doc, cls) { var n = doc.querySelector('.' + cls); if (!n) { n = doc.createElement('div'); n.className = 'ksa-box ' + cls; doc.body.appendChild(n); } return n; }
  function placeBox(doc, node, target) {
    if (!target) { node.style.display = 'none'; return; }
    var r = target.getBoundingClientRect(), w = doc.defaultView;
    node.style.display = 'block'; node.style.left = (r.left + w.scrollX) + 'px'; node.style.top = (r.top + w.scrollY) + 'px';
    node.style.width = r.width + 'px'; node.style.height = r.height + 'px';
  }
  function sectionNode(doc, i) { return doc.querySelector('[data-ksa-section="' + i + '"]'); }
  function markPreview(scroll) {
    var doc = previewDoc; if (!doc || !doc.body) return;
    var node = selectedSection >= 0 ? sectionNode(doc, selectedSection) : null;
    placeBox(doc, overlay(doc, 'ksa-sel'), node);
    if (node && scroll) node.getBoundingClientRect && doc.defaultView.scrollTo({ top: Math.max(0, node.getBoundingClientRect().top + doc.defaultView.scrollY - 40), behavior: 'smooth' });
  }
  function hideDropLine() { if (previewDoc && previewDoc.body) { var l = previewDoc.querySelector('.ksa-line'); if (l) l.style.display = 'none'; Array.prototype.forEach.call(previewDoc.querySelectorAll('.ksa-drop'), function (n) { n.remove(); }); } }
  function cleanLine(s) { return String(s || '').replace(/\*/g, '').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1').replace(/\s+/g, ' ').trim(); }
  function nodeText(n) { return String(n.textContent || '').replace(/\s+/g, ' ').trim(); }
  // Busca el campo de texto (y la línea) que muestra el elemento pulsado.
  function findEditable(target, sec, s) {
    var lines = [];
    K.MODULES[s.type].fields.forEach(function (f) {
      if (f.type !== 'text' && f.type !== 'area') return;
      String(s.d[f.k] || '').split('\n').forEach(function (line, j) { var c = cleanLine(line); if (c) lines.push({ k: f.k, j: j, c: c }); });
    });
    // El elemento más grande con el mismo texto, para no perder negritas o enlaces que lo envuelven.
    function widest(n, t) { while (n.parentNode && n.parentNode !== sec && n.parentNode.nodeType === 1 && nodeText(n.parentNode) === t && !/^(TD|TR|TABLE|TBODY)$/.test(n.parentNode.tagName)) n = n.parentNode; return n; }
    for (var n = target; n && n !== sec; n = n.parentNode) {
      if (n.nodeType !== 1) continue;
      var t = nodeText(n), hits = lines.filter(function (l) { return l.c === t; });
      if (hits.length) {
        n = widest(n, t);
        if (hits.length === 1) return { el: n, hit: hits[0] };
        // Mismo texto en varios campos (p. ej. las dos tarjetas): se pinta el bloque con cada campo
        // sustituido por una marca y se mira en qué posición exacta aparece. Así no influyen los campos
        // que no se ven (un botón sin enlace) ni la copia escritorio/móvil del bloque.
        var hit = probeHit(sec, s, hits, n);
        return { el: n, hit: hit || hits[0] };
      }
      if (t.length > 3000) break;
    }
    return null;
  }
  function pathOf(node, root) {
    var p = [];
    while (node && node !== root) { var i = 0, c = node; while ((c = c.previousElementSibling)) i++; p.unshift(i); node = node.parentElement; }
    return node === root ? p : null;
  }
  function related(a, b) { var n = Math.min(a.length, b.length); for (var i = 0; i < n; i++) if (a[i] !== b[i]) return false; return true; }
  function probeHit(sec, s, hits, clicked) {
    var doc = sec.ownerDocument, m = K.MODULES[s.type], target = pathOf(clicked, sec), MARK = 'KSAPROBE7Q';
    var t = K.BrandKits ? K.BrandKits.effectiveTournament(state) : K.tournament(state.tournament);
    if (!target) return null;
    for (var h = 0; h < hits.length; h++) {
      var d = JSON.parse(JSON.stringify(s.d)), lines = String(d[hits[h].k] || '').split('\n');
      lines[hits[h].j] = MARK; d[hits[h].k] = lines.join('\n');
      var box = doc.createElement('tbody'); box.innerHTML = m.build(d, t);
      var found = Array.prototype.filter.call(box.querySelectorAll('*'), function (e) {
        return e.textContent.indexOf(MARK) >= 0 && !Array.prototype.some.call(e.children, function (c) { return c.textContent.indexOf(MARK) >= 0; });
      });
      for (var f = 0; f < found.length; f++) { var p = pathOf(found[f], box); if (p && related(p, target)) return hits[h]; }
    }
    return null;
  }
  function toMarkdown(node) {
    var out = '';
    Array.prototype.forEach.call(node.childNodes, function (c) {
      if (c.nodeType === 3) { out += c.nodeValue; return; }
      if (c.nodeType !== 1) return;
      var tag = c.tagName.toLowerCase(), inner = toMarkdown(c);
      if ((tag === 'strong' || tag === 'b') && inner.trim()) out += '**' + inner + '**';
      else if ((tag === 'em' || tag === 'i') && inner.trim()) out += '*' + inner + '*';
      else if (tag === 'a' && c.getAttribute('href')) out += '[' + inner + '](' + c.getAttribute('href') + ')';
      else if (tag === 'br') out += ' ';
      else out += inner;
    });
    return out;
  }
  // Edición en línea con barra de formato (negrita, cursiva, enlace, quitar formato).
  // Solo los campos de párrafo (area) admiten formato en el email; los de una línea son texto plano.
  function startEdit(doc, found, s) {
    var node = found.el, original = node.innerHTML, cancelled = false, busy = false, hit = found.hit;
    var field = K.MODULES[s.type].fields.filter(function (f) { return f.k === hit.k; })[0], rich = !!field && field.type === 'area';
    inlineEditing = true; node.setAttribute('contenteditable', 'true'); node.focus();
    Array.prototype.forEach.call(doc.querySelectorAll('.ksa-bar, .ksa-hover'), function (n) { n.style.display = 'none'; });
    // Texto pendiente: se selecciona entero para escribir encima.
    if (/^\s*PENDIENTE:/i.test(String(s.d[hit.k] || '').split('\n')[hit.j] || '')) {
      var range = doc.createRange(), sel0 = doc.defaultView.getSelection(); range.selectNodeContents(node); sel0.removeAllRanges(); sel0.addRange(range);
    }
    var tip = doc.createElement('div'); tip.className = 'ksa-tip'; doc.body.appendChild(tip);
    tip.textContent = rich ? 'Selecciona texto para darle formato · Enter guarda · Esc cancela' : 'Este texto no admite formato · Enter guarda · Esc cancela';
    var fmt = doc.createElement('div'); fmt.className = 'ksa-fmt';
    function selRange() { var sel = doc.defaultView.getSelection(); if (!sel.rangeCount) return null; var r = sel.getRangeAt(0); return node.contains(r.commonAncestorContainer) ? r : null; }
    function ancestor(n, tags) { for (; n && n !== node; n = n.parentNode) if (n.nodeType === 1 && tags.indexOf(n.tagName) >= 0) return n; return null; }
    function unwrap(el) { while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el); el.remove(); }
    function selectNode(el) { var r = doc.createRange(), sel = doc.defaultView.getSelection(); r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r); }
    function toggle(tags, make) {
      var r = selRange(); if (!r) return;
      var anc = ancestor(r.commonAncestorContainer, tags);
      if (anc) { unwrap(anc); return; }
      if (r.collapsed) return;
      var w = doc.createElement(make); w.appendChild(r.extractContents()); r.insertNode(w); selectNode(w);
    }
    function link() {
      var r = selRange(); if (!r) return;
      var anc = ancestor(r.commonAncestorContainer, ['A']);
      if (!anc && r.collapsed) { alert('Selecciona primero el texto que quieres enlazar.'); return; }
      busy = true; var saved = r.cloneRange();
      var url = prompt(anc ? 'Enlace (déjalo vacío para quitarlo):' : 'Enlace (https://… o mailto:…):', anc ? anc.getAttribute('href') : 'https://');
      node.focus(); var sel = doc.defaultView.getSelection(); sel.removeAllRanges(); sel.addRange(saved); busy = false;
      if (url === null) return;
      url = url.trim();
      if (!url || url === 'https://') { if (anc) unwrap(anc); return; }
      if (K.linkLevel(url) === 'error') { alert('El enlace no es válido. Usa https://… o mailto:…'); return; }
      if (anc) { anc.setAttribute('href', url); return; }
      var a = doc.createElement('a'); a.setAttribute('href', url); a.appendChild(saved.extractContents()); saved.insertNode(a); selectNode(a);
    }
    function clear() { node.textContent = node.textContent; }
    function fbtn(label, title, fn, style) {
      var b = doc.createElement('button'); b.type = 'button'; b.innerHTML = label; b.title = title; if (style) b.setAttribute('style', style);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); }); // no quitar el foco ni la selección
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
      fmt.appendChild(b);
    }
    if (rich) {
      fbtn('<b>B</b>', 'Negrita (Ctrl/⌘ + B)', function () { toggle(['STRONG', 'B'], 'strong'); });
      fbtn('<i>I</i>', 'Cursiva (Ctrl/⌘ + I)', function () { toggle(['EM', 'I'], 'em'); });
      fbtn('🔗 Enlace', 'Enlazar la selección (Ctrl/⌘ + K)', link);
      fbtn('Quitar formato', 'Quitar negritas, cursivas y enlaces de este texto', clear);
      doc.body.appendChild(fmt);
      var rect = node.getBoundingClientRect(), w = doc.defaultView;
      fmt.style.top = Math.max(2, rect.top + w.scrollY - fmt.offsetHeight - 8) + 'px';
      fmt.style.left = Math.max(4, Math.min(rect.left + w.scrollX, w.scrollX + w.innerWidth - fmt.offsetWidth - 6)) + 'px';
    }
    function key(event) {
      var mod = event.metaKey || event.ctrlKey, k = String(event.key || '').toLowerCase();
      if (event.key === 'Enter') { event.preventDefault(); done(); return; }
      if (event.key === 'Escape') { event.preventDefault(); cancelled = true; node.innerHTML = original; done(); return; }
      if (mod && (k === 'b' || k === 'i' || k === 'k')) {
        event.preventDefault();
        if (!rich) return;
        if (k === 'b') toggle(['STRONG', 'B'], 'strong'); else if (k === 'i') toggle(['EM', 'I'], 'em'); else link();
      }
    }
    // Pegar siempre como texto sin formato (evita estilos de Word o de otros emails).
    function paste(event) { event.preventDefault(); doc.execCommand('insertText', false, (event.clipboardData ? event.clipboardData.getData('text/plain') : '').replace(/\s+/g, ' ')); }
    node.addEventListener('keydown', key); node.addEventListener('paste', paste);
    var finished = false;
    node.addEventListener('blur', done);
    function done() {
      if (busy || finished) return; finished = true;
      node.removeEventListener('blur', done); node.removeEventListener('keydown', key); node.removeEventListener('paste', paste);
      node.removeAttribute('contenteditable'); tip.remove(); fmt.remove(); inlineEditing = false;
      if (cancelled) { refresh(); return; }
      var md = (rich ? toMarkdown(node) : node.textContent).replace(/\s+/g, ' ').trim(), lines = String(s.d[hit.k] || '').split('\n');
      if (md === lines[hit.j].trim()) { refresh(); return; }
      lines[hit.j] = md; s.d[hit.k] = lines.join('\n');
      renderSections(); refresh();
    }
  }
  function enhancePreview(doc) {
    previewDoc = doc; if (!doc || !doc.body) return;
    var style = doc.createElement('style'); style.textContent = PREVIEW_CSS; doc.head.appendChild(style);
    var bar = doc.createElement('div'), barFor = -1, line = doc.createElement('div'); bar.className = 'ksa-bar'; bar.style.display = 'none'; line.className = 'ksa-line'; line.style.display = 'none';
    doc.body.appendChild(bar); doc.body.appendChild(line);
    function btn(label, title, fn, cls) { var b = doc.createElement('button'); b.type = 'button'; b.textContent = label; b.title = title; if (cls) b.className = cls; b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(barFor); }); bar.appendChild(b); return b; }
    var handle = btn('⠿ Mover', 'Arrastra para mover el bloque', function () {}, 'ksa-handle'); handle.draggable = true;
    btn('↑', 'Subir', function (i) { if (i > 0) { selectedSection = i - 1; move(i, -1); } });
    btn('↓', 'Bajar', function (i) { if (i < state.sections.length - 1) { selectedSection = i + 1; move(i, 1); } });
    btn('＋', 'Añadir un bloque debajo', function (i) { startPending(i + 1); });
    btn('⧉', 'Duplicar', duplicateBlock);
    btn('＋ Texto/botón', 'Añadir textos o botones opcionales a este bloque', function (i) { openPop(i); });
    btn('✕', 'Eliminar', removeBlock);
    // Menú de textos y botones opcionales del bloque.
    var pop = doc.createElement('div'); pop.className = 'ksa-pop'; pop.style.display = 'none'; doc.body.appendChild(pop);
    function closePop() { pop.style.display = 'none'; pop.innerHTML = ''; }
    function openPop(i) {
      var s = state.sections[i]; if (!s) return;
      pop.innerHTML = ''; var title = doc.createElement('strong'); title.textContent = 'Añadir a «' + blockName(i) + '»'; pop.appendChild(title);
      var items = optionalItems(s);
      if (!items.length) { var none = doc.createElement('p'); none.textContent = 'Este bloque no tiene más textos ni botones opcionales.'; pop.appendChild(none); }
      items.forEach(function (item) {
        var b = doc.createElement('button'); b.type = 'button'; b.textContent = item.label;
        b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); closePop(); applyOptional(i, item); });
        pop.appendChild(b);
      });
      var w = doc.defaultView, r = bar.getBoundingClientRect();
      pop.style.display = 'grid'; pop.style.top = (r.bottom + w.scrollY + 4) + 'px';
      pop.style.left = Math.max(4, Math.min(r.right + w.scrollX - pop.offsetWidth, w.scrollX + w.innerWidth - pop.offsetWidth - 6)) + 'px';
    }
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
    handle.addEventListener('dragstart', function (event) { dragBlock = { kind: 'move', from: barFor }; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', blockName(barFor)); bar.style.display = 'none'; });
    handle.addEventListener('dragend', endBlockDrag);
    var hover = overlay(doc, 'ksa-hover');
    function secAt(target) { return target && target.closest ? target.closest('[data-ksa-section]') : null; }
    function showBar(sec) {
      barFor = +sec.getAttribute('data-ksa-section');
      var r = sec.getBoundingClientRect(), w = doc.defaultView;
      bar.style.display = 'flex'; bar.style.top = (r.top + w.scrollY + 6) + 'px';
      bar.style.left = Math.max(4, Math.min(r.right, w.innerWidth) + w.scrollX - bar.offsetWidth - 6) + 'px';
    }
    doc.addEventListener('mousemove', function (event) {
      if (dragBlock || inlineEditing) return;
      if (bar.contains(event.target)) return;
      var sec = secAt(event.target);
      placeBox(doc, hover, sec); if (sec) showBar(sec); else bar.style.display = 'none';
    });
    doc.addEventListener('mouseleave', function () { if (!dragBlock) { hover.style.display = 'none'; bar.style.display = 'none'; } });
    doc.addEventListener('click', function (event) {
      if (pop.contains(event.target)) return;
      if (pop.style.display !== 'none') { closePop(); if (!bar.contains(event.target)) return; }
      if (bar.contains(event.target) || (event.target.closest && event.target.closest('[contenteditable]'))) return;
      if (event.target.closest && event.target.closest('a')) event.preventDefault();
      if (event.target.closest && event.target.closest('[data-ksa-empty]')) { startPending(0); return; }
      if (event.target.closest && event.target.closest('[data-ksa-pending]')) { openPalette(pendingInsert); return; }
      var sec = secAt(event.target); if (!sec) return;
      var i = +sec.getAttribute('data-ksa-section'), s = state.sections[i]; if (!s) return;
      var found = findEditable(event.target, sec, s);
      selectSection(i);
      if (found) startEdit(doc, found, s);
    });
    // Soltar: bloques (mover o nuevos) entre bloques; imágenes del brand kit sobre un bloque con imagen.
    function dropIndex(event) {
      var secs = doc.querySelectorAll('[data-ksa-section]'), sec = secAt(doc.elementFromPoint(event.clientX, event.clientY));
      if (!secs.length) return { at: 0, node: doc.querySelector('[data-ksa-empty]'), before: true };
      if (!sec) {
        var first = secs[0].getBoundingClientRect(), last = secs[secs.length - 1];
        return event.clientY < first.top ? { at: 0, node: secs[0], before: true } : { at: state.sections.length, node: last, before: false };
      }
      var r = sec.getBoundingClientRect(), before = event.clientY < r.top + r.height / 2, i = +sec.getAttribute('data-ksa-section');
      return { at: before ? i : i + 1, node: sec, before: before };
    }
    doc.addEventListener('dragover', function (event) {
      if (dragImage) {
        var target = secAt(doc.elementFromPoint(event.clientX, event.clientY)), s = target && state.sections[+target.getAttribute('data-ksa-section')];
        hideDropLine();
        if (!s || !imageFieldOf(K.MODULES[s.type])) return;
        event.preventDefault(); event.dataTransfer.dropEffect = 'copy';
        var box = doc.createElement('div'); box.className = 'ksa-box ksa-drop'; doc.body.appendChild(box); placeBox(doc, box, target);
        return;
      }
      if (!dragBlock) return;
      event.preventDefault(); event.dataTransfer.dropEffect = dragBlock.kind === 'move' ? 'move' : 'copy';
      var d = dropIndex(event), w = doc.defaultView;
      if (!d.node) { line.style.display = 'none'; return; }
      var r = d.node.getBoundingClientRect();
      line.style.display = 'block'; line.style.left = (r.left + w.scrollX) + 'px'; line.style.width = r.width + 'px';
      line.style.top = ((d.before ? r.top : r.bottom) + w.scrollY) + 'px';
    });
    doc.addEventListener('dragleave', function (event) { if (!event.relatedTarget) hideDropLine(); });
    doc.addEventListener('drop', function (event) {
      if (dragImage) {
        var target = secAt(doc.elementFromPoint(event.clientX, event.clientY)), i = target ? +target.getAttribute('data-ksa-section') : -1, s = state.sections[i], f = s && imageFieldOf(K.MODULES[s.type]);
        var drag = dragImage; clearDragImage(); hideDropLine();
        if (!f) return; event.preventDefault(); selectedSection = i; s.open = true; setImage(s, f.k, drag); return;
      }
      if (!dragBlock) return; event.preventDefault();
      var dragged = dragBlock, at = dropIndex(event).at; endBlockDrag();
      if (dragged.kind === 'move') moveTo(dragged.from, at); else insertBlock(dragged.type, at);
    });
    // «＋» en cada separación entre bloques (y antes del primero / después del último).
    var plus = [];
    function placePlus() {
      plus.forEach(function (p) { p.remove(); }); plus = [];
      var secs = doc.querySelectorAll('[data-ksa-section]'), w = doc.defaultView;
      if (!secs.length || pendingInsert != null) return;
      for (var k = 0; k <= secs.length; k++) {
        var r = secs[Math.min(k, secs.length - 1)].getBoundingClientRect(), y = k < secs.length ? r.top : r.bottom;
        var cx = Math.min(r.left + r.width / 2, w.innerWidth / 2), b = doc.createElement('button');
        b.type = 'button'; b.className = 'ksa-plus'; b.textContent = '+'; b.title = k === secs.length ? 'Añadir un bloque al final' : (k ? 'Añadir un bloque aquí' : 'Añadir un bloque al principio');
        b.style.top = (y + w.scrollY - 13) + 'px'; b.style.left = (cx + w.scrollX - 13) + 'px';
        (function (at) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); startPending(at); }); })(k);
        doc.body.appendChild(b); plus.push(b);
      }
    }
    placePlus();
    if (doc.defaultView.ResizeObserver) new doc.defaultView.ResizeObserver(function () { placePlus(); markPreview(false); }).observe(doc.body);
    doc.defaultView.addEventListener('resize', function () { markPreview(false); placePlus(); });
    var pendingNode = doc.querySelector('[data-ksa-pending]');
    if (pendingNode) doc.defaultView.scrollTo({ top: Math.max(0, pendingNode.getBoundingClientRect().top + doc.defaultView.scrollY - 120) });
    markPreview(false);
  }

  // Textos y botones opcionales que le faltan a un bloque, para añadirlos desde la vista previa.
  function optionalItems(s) {
    var m = K.MODULES[s.type], head = '', items = [];
    m.fields.forEach(function (f) {
      if (f.type === 'head') { head = f.label; return; }
      if (!f.k || f.req || isImageField(f) || f.k === 'alt' || f.type === 'select' || f.type === 'url') return;
      if (f.showIf && !f.showIf(s.d)) return;
      var where = head ? ' (' + head + ')' : '';
      if (/(^|_)btn$/.test(f.k)) {
        var urlKey = f.k.replace(/btn$/, 'url');
        if (!filled(s.d[f.k])) items.push({ label: '＋ Botón' + where, kind: 'btn', k: f.k, url: urlKey });
        else items.push({ label: (filled(s.d[urlKey]) ? 'Cambiar enlace del botón' : '＋ Enlace del botón') + where, kind: 'url', k: f.k, url: urlKey }, { label: 'Quitar botón' + where, kind: 'rm', k: f.k, url: urlKey });
        return;
      }
      if (!filled(s.d[f.k])) items.push({ label: '＋ ' + f.label.replace(/\s*\(opcional\)/i, '') + where, name: f.label.replace(/\s*\(opcional\)/i, '') + where, kind: 'text', k: f.k });
    });
    return items;
  }
  // Devuelve null si se cancela, '' si se deja vacío (el botón se añade igual y la revisión avisa).
  function askUrl(current) {
    var url = prompt('Enlace del botón (https://… o mailto:…). Puedes dejarlo vacío y añadirlo después:', current || 'https://');
    if (url === null) return null;
    url = url.trim(); if (url === 'https://') url = '';
    if (url && K.linkLevel(url) === 'error') { alert('El enlace no es válido. Usa https://… o mailto:…'); return null; }
    return url;
  }
  function applyOptional(i, item) {
    var s = state.sections[i]; if (!s) return;
    if (item.kind === 'text') {
      var value = 'PENDIENTE: ' + item.name; s.d[item.k] = value;
      if (K.build(state).indexOf(value.replace(/&/g, '&amp;')) < 0) alert('Este texto solo aparece en el email junto con otros datos del bloque. Complétalo en el panel de la derecha.');
    } else if (item.kind === 'btn') {
      var url = askUrl(s.d[item.url]); if (url === null) return;
      if (url) s.d[item.url] = url; else delete s.d[item.url];
      if (!filled(s.d[item.k])) s.d[item.k] = 'PENDIENTE: Texto del botón';
    } else if (item.kind === 'url') {
      var next = askUrl(s.d[item.url]); if (next === null) return; if (next) s.d[item.url] = next; else delete s.d[item.url];
    } else if (item.kind === 'rm') { delete s.d[item.k]; delete s.d[item.url]; }
    selectedSection = i; s.open = true; renderSections(); refresh();
  }

  // ---------- Editor de módulos ----------
  function snippet(s) {
    var m = K.MODULES[s.type], d = s.d || {}, v = d.title || d.left || d.a_title || d.greet || d.text || d.alt || '';
    v = String(v).split('\n')[0]; return v.length > 46 ? v.slice(0, 46) + '…' : v;
  }
  function renderSections() {
    var box = $('#sections'); box.innerHTML = '';
    if (!state.sections.length) box.appendChild(el('p', { class: 'blocks-empty', text: 'Todavía no hay bloques. Elige uno en «＋ Añadir bloque» o arrástralo a la vista previa.' }));
    state.sections.forEach(function (s, i) {
      var m = K.MODULES[s.type]; if (!m) return;
      var snip = el('span', { class: 'snip', text: snippet(s) });
      var det = el('details', { class: 'card mod' + (i === selectedSection ? ' is-selected' : '') });
      if (s.open) det.open = true;
      det.addEventListener('toggle', function () { s.open = det.open; persist(); });
      function tool(txt, title, fn, dis) { var b = el('button', { class: 'tool', title: title, text: txt, onclick: function (e) { e.preventDefault(); e.stopPropagation(); fn(); } }); if (dis) b.disabled = true; return b; }
      var summary = det.appendChild(el('summary', {}, [
        el('span', { class: 'letter', text: m.letter }), el('span', { class: 'mname', text: m.name }), snip,
        el('span', { class: 'tools' }, [
          tool('↑', 'Subir', function () { move(i, -1); }, i === 0),
          tool('↓', 'Bajar', function () { move(i, 1); }, i === state.sections.length - 1),
          tool('⧉', 'Duplicar', function () { duplicateBlock(i); }),
          tool('✕', 'Eliminar', function () { removeBlock(i); })
        ])
      ]));
      summary.setAttribute('title', 'Arrastra para mover el bloque');
      cardDrop(det, summary, i);
      summary.addEventListener('click', function () {
        if (det.open) return; // se está cerrando
        selectedSection = i;
        Array.prototype.forEach.call(box.querySelectorAll('details'), function (d, j) { d.classList.toggle('is-selected', j === i); });
        markPreview(true);
      });
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
    if (!inlineEditing) setPreview(custom ? html : K.build(state, { preview: true, pendingAt: pendingInsert }));
    if (!editingCode) $('#code').value = html;
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
    function hubTarget() { return hubTournament || (hubClub ? K.CLIENT.tournaments.filter(function (t) { return t.club === hubClub; })[0].id : ''); }
    // Nueva newsletter desde un guion: instrucciones + guion para ChatGPT y creación con su respuesta.
    $('#from-script').addEventListener('click', function () {
      $('#script-tournament').value = hubTarget() || K.CLIENT.tournaments[0].id; $('#script-err').textContent = '';
      $('#script-dlg').showModal(); $('#script-text').focus();
    });
    $('#script-cancel').addEventListener('click', function () { $('#script-dlg').close(); });
    $('#script-copy').addEventListener('click', function () {
      var b = this, t = K.scriptPrompt($('#script-tournament').value, $('#script-text').value);
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).catch(function () {
        var x = el('textarea'); x.value = t; $('#script-dlg').appendChild(x); x.select(); document.execCommand('copy'); x.remove();
      }).then(function () { b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = 'Copiar instrucciones y guion'; }, 1500); });
    });
    $('#script-go').addEventListener('click', function () {
      var tid = $('#script-tournament').value, script = $('#script-text').value, r;
      try { r = K.importProject($('#script-answer').value, tid); }
      catch (e) { $('#script-err').textContent = 'No se ha podido crear: ' + (e.message || 'el texto pegado no es válido') + ' Copia la respuesta completa de ChatGPT.'; return; }
      if (r.state.tournament !== tid) r.notes.push('ChatGPT indicó «' + K.tournament(r.state.tournament).name + '»; se usa el elegido: ' + K.tournament(tid).name + '.');
      r.state.tournament = tid;
      var missing = script.trim() ? K.scriptCoverage(script, r.state) : [];
      $('#script-dlg').close(); $('#script-text').value = ''; $('#script-answer').value = '';
      createProject(r.state);
      alert('Newsletter creada con ' + r.state.sections.length + ' módulos.' +
        (r.notes.length ? '\n\nAvisos:\n· ' + r.notes.join('\n· ') : '') +
        (missing.length ? '\n\nTextos del guion que no encuentro tal cual (revísalos):\n· ' + missing.join('\n· ') : (script.trim() ? '\n\nTodos los textos del guion aparecen en la newsletter.' : '')) +
        '\n\nRevisa los textos y mira la pestaña Revisión (placeholders y contenido PENDIENTE).');
    });
    $('#new').addEventListener('click', function () {
      var target = hubTarget();
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
    $('#add-toggle').addEventListener('click', function () { if ($('#palette').hidden) startPending(state.sections.length); else closePalette(); });
    $('#palette-close').addEventListener('click', closePalette);
    // Vista previa interactiva: se prepara cada vez que se carga y conserva la posición de scroll.
    $('#frame').addEventListener('load', function () {
      var doc = null; previewDoc = null;
      try { doc = this.contentDocument; } catch (e) {}
      if (!doc || !doc.body) return;
      try { this.contentWindow.scrollTo(0, previewScroll); } catch (e) {}
      if (!hasCustomCode()) enhancePreview(doc);
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
