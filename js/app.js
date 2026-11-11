// ============================================================
// INTERFAZ: editor de módulos, vista previa, revisión y descargas
// ============================================================
(function () {
  var K = window.KSA, $ = function (s) { return document.querySelector(s); };
  var STORE = 'kaptiva-newsletters-v1', state, html = '', checks = [], timer;

  // ---------- Guardado automático en este navegador ----------
  function load() { try { var s = JSON.parse(localStorage.getItem(STORE)); if (s && s.sections) return s; } catch (e) {} return null; }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

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
    $('#tournament').value = state.tournament; $('#name').value = state.name || ''; $('#desc').value = state.desc || ''; $('#mp').checked = !!state.mediaPackages;
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
    state = load() || K.fromRecipe('blank');
    syncSettings(); renderSections(); refresh();

    $('#tournament').addEventListener('change', function () { state.tournament = this.value; update(); });
    $('#name').addEventListener('input', function () { state.name = this.value; update(); });
    $('#desc').addEventListener('input', function () { state.desc = this.value; update(); });
    $('#mp').addEventListener('change', function () { state.mediaPackages = this.checked; update(); });

    $('#recipe').addEventListener('change', function () {
      var id = this.value; this.value = ''; if (!id) return;
      if (state.sections.length > 1 && !confirm('Se sustituirá la newsletter actual. ¿Continuar?')) return;
      state = K.fromRecipe(id, state.tournament); syncSettings(); renderSections(); refresh();
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
        try { var s = JSON.parse(r.result); if (!s.sections) throw 0; state = s; syncSettings(); renderSections(); refresh(); }
        catch (e) { alert('Este archivo no es un proyecto de newsletter válido.'); }
      };
      r.readAsText(f); this.value = '';
    });
    $('#copy').addEventListener('click', function () {
      var b = this; $('#code').select();
      (navigator.clipboard ? navigator.clipboard.writeText(html) : Promise.reject()).catch(function () { document.execCommand('copy'); }).then(function () { b.textContent = 'Copiado ✓'; setTimeout(function () { b.textContent = 'Copiar código'; }, 1500); });
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
