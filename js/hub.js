// Organización local del hub. Independiente del contenido exportado a Cvent.
(function (root) {
  var K = root.KSA = root.KSA || {};
  var H = K.Hub = {};
  H.location = function (tournament, folder) { return tournament + '/' + (folder || ''); };
  H.contains = function (folders, ancestor, id) {
    var seen = {};
    while (id && folders[id] && !seen[id]) {
      if (id === ancestor) return true;
      seen[id] = true; id = folders[id].parent;
    }
    return false;
  };
  H.canMove = function (folders, id, destination) {
    var f = folders[id], d = folders[destination];
    return !!f && (!destination || (!!d && d.tournament === f.tournament && !H.contains(folders, id, destination)));
  };
  // Fusión a tres bandas por id entre esta pestaña (mine), lo último sincronizado (base, como texto) y lo guardado por otra pestaña (theirs).
  // Lo que cambió esta pestaña gana; lo demás se toma de lo guardado. conflicts: ids cambiados en ambos lados.
  H.merge3 = function (mine, base, theirs, key) {
    var out = {}, changed = [], conflicts = [], ids = {}, add = function (o) { Object.keys(o || {}).forEach(function (id) { ids[id] = true; }); };
    add(mine); add(base); add(theirs);
    Object.keys(ids).forEach(function (id) {
      var m = mine[id], t = (theirs || {})[id];
      var ms = m === undefined ? null : key(m), ts = t === undefined ? null : key(t), bs = Object.prototype.hasOwnProperty.call(base || {}, id) ? base[id] : null;
      if (ms !== bs) { if (ts !== bs && ts !== ms) conflicts.push(id); if (m !== undefined) out[id] = m; }
      else { if (t !== undefined) out[id] = t; if (ts !== ms) changed.push(id); }
    });
    return { merged: out, changed: changed, conflicts: conflicts };
  };
  H.sort = function (items, mode, order) {
    order = order || [];
    return items.slice().sort(function (a, b) {
      var alpha = a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }) || a.id.localeCompare(b.id);
      if (mode === 'az') return alpha;
      if (mode === 'za') return -alpha;
      if (mode === 'oldest') return a.updated - b.updated || alpha;
      // Abiertas recientemente: lo nunca abierto (y las carpetas) va al final, por modificación.
      if (mode === 'opened') return (b.opened || 0) - (a.opened || 0) || b.updated - a.updated || alpha;
      if (mode === 'manual') {
        var ai = order.indexOf(a.id), bi = order.indexOf(b.id);
        return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) || alpha;
      }
      return b.updated - a.updated || alpha;
    });
  };
  // field: 'updated' (modificación, por defecto) u 'opened' (última apertura). Sin fecha no pasa un filtro de fechas.
  H.matches = function (item, query, from, to, field) {
    var text = function (s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
    var stamp = item[field || 'updated'];
    if (!stamp) return text(item.name).indexOf(text(query.trim())) >= 0 && !from && !to;
    var d = new Date(stamp), date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return text(item.name).indexOf(text(query.trim())) >= 0 && (!from || date >= from) && (!to || date <= to);
  };
})(typeof window !== 'undefined' ? window : globalThis);
