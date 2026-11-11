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
  H.sort = function (items, mode, order) {
    order = order || [];
    return items.slice().sort(function (a, b) {
      var alpha = a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }) || a.id.localeCompare(b.id);
      if (mode === 'az') return alpha;
      if (mode === 'za') return -alpha;
      if (mode === 'oldest') return a.updated - b.updated || alpha;
      if (mode === 'manual') {
        var ai = order.indexOf(a.id), bi = order.indexOf(b.id);
        return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) || alpha;
      }
      return b.updated - a.updated || alpha;
    });
  };
  H.matches = function (item, query, from, to) {
    var text = function (s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
    var d = new Date(item.updated), date = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return text(item.name).indexOf(text(query.trim())) >= 0 && (!from || date >= from) && (!to || date <= to);
  };
})(typeof window !== 'undefined' ? window : globalThis);
