// Deshacer/rehacer (en memoria, por newsletter abierta) e historial de versiones (en este navegador, por newsletter).
(function (root) {
  var K = root.KSA = root.KSA || {}, H = K.History = {};

  // ---------- Deshacer / rehacer ----------
  // Cada paso guarda el contenido serializado de la newsletter ANTES del cambio.
  // Los cambios seguidos (escribir) se agrupan en un solo paso si llegan a menos de `gap` ms;
  // `boundary()` fuerza que el siguiente cambio sea un paso propio (mover, añadir, borrar…).
  H.undoStack = function (opts) {
    opts = opts || {};
    // cut: el siguiente cambio empieza paso (tras deshacer/rehacer). discrete: el siguiente cambio es una acción y además cierra su paso.
    var limit = opts.limit || 100, gap = opts.gap || 700, past = [], future = [], lastAt = 0, cut = true, discrete = false;
    return {
      record: function (before, now) {
        if (cut || discrete || !past.length || now - lastAt > gap) { past.push(before); if (past.length > limit) past.shift(); }
        lastAt = discrete ? -Infinity : now; cut = false; discrete = false; future = [];
      },
      boundary: function () { discrete = true; },
      undo: function (current) { if (!past.length) return null; future.push(current); cut = true; return past.pop(); },
      redo: function (current) { if (!future.length) return null; past.push(current); cut = true; return future.pop(); },
      canUndo: function () { return past.length > 0; },
      canRedo: function () { return future.length > 0; },
      clear: function () { past = []; future = []; cut = true; discrete = false; }
    };
  };

  // ---------- Historial de versiones ----------
  // localStorage[KEY] = { version: 1, items: { <idNewsletter>: [ { id, at, label, auto, content } ] } } (más reciente al final).
  // content es el JSON de la newsletter (sin el estado plegado/abierto de los bloques).
  H.KEY = 'kaptiva-newsletters-versions-v1';
  H.MAX_AUTO = 20; H.MAX_MANUAL = 30; H.AUTO_EVERY = 10 * 60 * 1000;
  function read(storage) {
    try { var x = JSON.parse(storage.getItem(H.KEY)); if (x && x.version === 1 && x.items && typeof x.items === 'object') return x; } catch (e) {}
    return { version: 1, items: {} };
  }
  // Guarda; si no cabe, elimina versiones automáticas antiguas (nunca las guardadas a mano) y lo vuelve a intentar.
  function write(storage, data) {
    for (var tries = 0; tries < 200; tries++) {
      try { storage.setItem(H.KEY, JSON.stringify(data)); return; } catch (e) {
        var oldest = null;
        Object.keys(data.items).forEach(function (pid) {
          data.items[pid].forEach(function (v, i) { if (v.auto && (!oldest || v.at < oldest.v.at)) oldest = { pid: pid, i: i, v: v }; });
        });
        if (!oldest) throw Error('No hay espacio en este navegador para guardar más versiones. Elimina versiones antiguas o newsletters que no uses.');
        data.items[oldest.pid].splice(oldest.i, 1);
      }
    }
    throw Error('No se ha podido guardar la versión.');
  }
  H.list = function (storage, pid) { return (read(storage).items[pid] || []).slice(); };
  H.add = function (storage, pid, content, label, auto, now) {
    var data = read(storage), list = data.items[pid] = data.items[pid] || [], last = list[list.length - 1];
    // Una automática idéntica a la última versión no aporta nada.
    if (auto && last && last.content === content) return null;
    var v = { id: 'v' + now + Math.floor(Math.random() * 100000), at: now, label: String(label || '').trim().slice(0, 120) || (auto ? 'Automática' : 'Versión guardada'), auto: !!auto, content: content };
    list.push(v);
    var autos = list.filter(function (x) { return x.auto; }), manual = list.filter(function (x) { return !x.auto; });
    if (autos.length > H.MAX_AUTO) list.splice(list.indexOf(autos[0]), 1);
    if (manual.length > H.MAX_MANUAL) throw Error('Cada newsletter admite hasta ' + H.MAX_MANUAL + ' versiones guardadas a mano. Elimina alguna antes de guardar otra.');
    write(storage, data); return v;
  };
  // Versión automática si ha pasado AUTO_EVERY desde la última (o no hay ninguna).
  H.autoDue = function (storage, pid, now) { var list = H.list(storage, pid), last = list[list.length - 1]; return !last || now - last.at >= H.AUTO_EVERY; };
  H.find = function (storage, pid, vid) { return H.list(storage, pid).filter(function (v) { return v.id === vid; })[0] || null; };
  H.remove = function (storage, pid, vid) {
    var data = read(storage); if (!data.items[pid]) return;
    data.items[pid] = data.items[pid].filter(function (v) { return v.id !== vid; });
    if (!data.items[pid].length) delete data.items[pid];
    write(storage, data);
  };
  H.removeAll = function (storage, pid) { var data = read(storage); if (!data.items[pid]) return; delete data.items[pid]; write(storage, data); };
})(typeof window !== 'undefined' ? window : globalThis);
