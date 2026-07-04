// Store: gestiona historias entre los "seeds" (data.js) y localStorage
// Filosofía: las historias semilla se pueden editar pero no eliminar (se marcan como ocultas).
// Las historias nuevas viven completas en localStorage.

(function() {
  const STORAGE_KEY = 'blogrdar.stories.v1';
  const META_KEY = 'blogrdar.meta.v1';
  const SAFETY_KEY = 'blogrdar.safety.v1'; // copia de seguridad automática (red de seguridad)
  const SEED_POSTS = window.BLOG_DATA.posts;

  // ¿El overlay tiene algo guardado (ediciones o historias nuevas)?
  function overlayHasContent(overlay) {
    if (!overlay) return false;
    const e = overlay.edited ? Object.keys(overlay.edited).length : 0;
    const c = overlay.created ? overlay.created.length : 0;
    return (e + c) > 0;
  }

  // Devuelve una copia del overlay SIN las imágenes pesadas (data: URLs en base64).
  // Mantiene las imágenes que sean rutas a archivos (cortas). Sirve para que la copia
  // de seguridad automática proteja los textos sin duplicar el peso de las fotos.
  function stripImages(overlay) {
    const clone = JSON.parse(JSON.stringify(overlay || {}));
    const strip = p => {
      if (!p) return;
      if (typeof p.coverImage === 'string' && p.coverImage.indexOf('data:') === 0) p.coverImage = '';
      if (Array.isArray(p.album)) p.album = p.album.filter(s => typeof s === 'string' && s.indexOf('data:') !== 0);
    };
    if (clone.edited) Object.keys(clone.edited).forEach(k => strip(clone.edited[k]));
    if (clone.created) clone.created.forEach(strip);
    return clone;
  }

  // Carga overrides/nuevas de localStorage
  function loadOverlay() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { edited: {}, created: [], deleted: [] };
      const parsed = JSON.parse(raw);
      return {
        edited: parsed.edited || {},
        created: parsed.created || [],
        deleted: parsed.deleted || []
      };
    } catch (e) {
      console.warn('No se pudo leer localStorage', e);
      return { edited: {}, created: [], deleted: [] };
    }
  }

  function saveOverlay(overlay) {
    let ok = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
      localStorage.setItem(META_KEY, JSON.stringify({ lastUpdated: new Date().toISOString() }));
      ok = true;
    } catch (e) {
      console.error('No se pudo guardar', e);
      return false;
    }
    // Copia de seguridad automática (mejor esfuerzo: nunca bloquea el guardado real).
    // Solo se actualiza cuando hay contenido, para no pisar una buena copia con un vacío.
    if (overlayHasContent(overlay)) {
      try {
        localStorage.setItem(SAFETY_KEY, JSON.stringify({ savedAt: new Date().toISOString(), overlay: stripImages(overlay) }));
      } catch (e) {
        console.warn('No se pudo escribir la copia de seguridad automática', e);
      }
    }
    return ok;
  }

  // Deriva el índice de mes (0-11) a partir del campo `date` ("Mayo 2026")
  function deriveMonthIdx(post) {
    if (typeof post.monthIdx === 'number') return post.monthIdx;
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const date = (post.date || '').toLowerCase();
    const found = meses.findIndex(m => date.includes(m));
    return found >= 0 ? found : 0;
  }

  // ----- Orden natural (creado/editado más reciente primero) -----
  // A cada post le corresponden dos fechas internas:
  //   createdAt -> se fija una sola vez, al crearse, y nunca cambia.
  //   updatedAt -> se actualiza cada vez que se guarda (crear o editar).
  // Regla de orden: la historia con el createdAt más alto (la última CREADA)
  // siempre va de primera. El resto se ordena por updatedAt (creada o editada
  // más recientemente primero), sin adelantar nunca a la última creada.

  // Para las historias que todavía no tienen createdAt/updatedAt (las que ya
  // existían antes de este sistema), les damos un punto de partida estable:
  // orden alfabético por título. Se recalcula igual cada vez, así que es
  // consistente entre sesiones y navegadores mientras no se toquen.
  function ensureTimestamps(posts) {
    const missing = posts.filter(p => typeof p.createdAt !== 'number');
    if (missing.length === 0) return;
    const sortedMissing = [...missing].sort((a, b) => (a.title || '').localeCompare(b.title || '', 'es'));
    sortedMissing.forEach((p, i) => {
      const synthetic = sortedMissing.length - i; // el primero alfabéticamente obtiene el valor más alto
      p.createdAt = synthetic;
      p.updatedAt = synthetic;
    });
  }

  function naturalSort(posts) {
    if (!posts.length) return posts;
    let topIdx = 0;
    for (let i = 1; i < posts.length; i++) {
      if ((posts[i].createdAt || 0) > (posts[topIdx].createdAt || 0)) topIdx = i;
    }
    const top = posts[topIdx];
    const rest = posts.filter((_, i) => i !== topIdx);
    rest.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0) || (b.createdAt || 0) - (a.createdAt || 0));
    return [top, ...rest];
  }

  // Construye la lista efectiva de posts mezclando seeds + overrides + created - deleted
  function buildPosts() {
    const overlay = loadOverlay();
    const seeds = SEED_POSTS
      .filter(p => !overlay.deleted.includes(p.id))
      .map(p => overlay.edited[p.id] ? { ...p, ...overlay.edited[p.id] } : p);
    const created = overlay.created || [];
    const all = [...created, ...seeds].map(p => ({ ...p, monthIdx: deriveMonthIdx(p) }));
    ensureTimestamps(all);
    return naturalSort(all);
  }

  // Refresca window.BLOG_DATA.posts (para que las páginas lo lean al renderizar)
  function refresh() {
    window.BLOG_DATA.posts = buildPosts();
  }

  // ----- API pública -----

  // Guarda una historia (nueva o editada)
  function savePost(post) {
    const overlay = loadOverlay();
    const isSeed = SEED_POSTS.some(p => p.id === post.id);

    // Marca de tiempo: si la historia ya existía, conserva su createdAt original
    // (para no perder su lugar como "creada hace tiempo"); si es nueva, nace ahora.
    // updatedAt siempre se actualiza a este mismo instante.
    const existing = (window.BLOG_DATA.posts || []).find(p => p.id === post.id);
    const now = Date.now();
    post.createdAt = (existing && typeof existing.createdAt === 'number') ? existing.createdAt : now;
    post.updatedAt = now;

    if (isSeed) {
      // Edición de una semilla
      overlay.edited[post.id] = post;
    } else {
      // Nueva o edición de una creada
      const idx = overlay.created.findIndex(p => p.id === post.id);
      if (idx >= 0) overlay.created[idx] = post;
      else overlay.created.unshift(post);
    }
    const ok = saveOverlay(overlay);
    refresh();
    return ok;
  }

  function deletePost(id) {
    const overlay = loadOverlay();
    const isSeed = SEED_POSTS.some(p => p.id === id);
    if (isSeed) {
      if (!overlay.deleted.includes(id)) overlay.deleted.push(id);
      delete overlay.edited[id];
    } else {
      overlay.created = overlay.created.filter(p => p.id !== id);
    }
    saveOverlay(overlay);
    refresh();
    return true;
  }

  // Restaura todo a los seeds (borra los cambios locales)
  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(META_KEY);
    refresh();
  }

  // Restaura una historia seed editada o eliminada
  function restorePost(id) {
    const overlay = loadOverlay();
    delete overlay.edited[id];
    overlay.deleted = overlay.deleted.filter(d => d !== id);
    saveOverlay(overlay);
    refresh();
  }

  // Exporta el overlay como JSON (para backup)
  function exportJSON() {
    const overlay = loadOverlay();
    const blob = new Blob([JSON.stringify(overlay, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blogrdar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Importa un backup JSON
  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (!data.edited || !data.created || !data.deleted) {
            throw new Error('Formato inválido');
          }
          saveOverlay(data);
          refresh();
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // ----- Copia de seguridad automática -----

  function getSafety() {
    try {
      const raw = localStorage.getItem(SAFETY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // Devuelve { savedAt, count } si hay una copia recuperable que NO está reflejada
  // en los datos actuales (es decir: los datos están vacíos pero la copia tiene contenido).
  function recoverable() {
    const current = loadOverlay();
    if (overlayHasContent(current)) return null; // ya hay datos en uso, nada que recuperar
    const s = getSafety();
    if (!s || !s.overlay) return null;
    const e = s.overlay.edited ? Object.keys(s.overlay.edited).length : 0;
    const c = s.overlay.created ? s.overlay.created.length : 0;
    if (e + c === 0) return null;
    return { savedAt: s.savedAt, count: e + c };
  }

  // Restaura los datos desde la copia de seguridad automática.
  function restoreFromSafety() {
    const s = getSafety();
    if (!s || !s.overlay) return false;
    const ok = saveOverlay({
      edited: s.overlay.edited || {},
      created: s.overlay.created || [],
      deleted: s.overlay.deleted || []
    });
    refresh();
    return ok;
  }

  function getMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function isSeedPost(id) {
    return SEED_POSTS.some(p => p.id === id);
  }

  function isEdited(id) {
    const overlay = loadOverlay();
    return !!overlay.edited[id];
  }

  // Helpers de creación
  function slugify(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function makeId(title) {
    const base = slugify(title) || `historia-${Date.now()}`;
    const overlay = loadOverlay();
    const taken = new Set([...SEED_POSTS.map(p => p.id), ...overlay.created.map(p => p.id)]);
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
  }

  // Inicialización
  refresh();

  // Si ya hay datos guardados pero todavía no existe copia de seguridad automática,
  // la creamos ahora para proteger el trabajo existente desde el primer momento.
  (function seedSafety() {
    try {
      const current = loadOverlay();
      if (overlayHasContent(current)) {
        // Conserva la fecha de una copia previa si existe; reduce el peso quitando las fotos.
        let savedAt = new Date().toISOString();
        try {
          const prev = JSON.parse(localStorage.getItem(SAFETY_KEY));
          if (prev && prev.savedAt) savedAt = prev.savedAt;
        } catch (e) { /* ignorar */ }
        localStorage.setItem(SAFETY_KEY, JSON.stringify({ savedAt, overlay: stripImages(current) }));
      }
    } catch (e) { /* mejor esfuerzo */ }
  })();

  // --------------------------------------------------------------
  // EXPORTAR PARA PUBLICAR
  // Genera un ZIP con:
  //   - data.js  : todas las historias listas (sin fotos pesadas dentro)
  //   - fotos/   : las fotos nuevas, como archivos .jpg optimizados
  // El usuario sube ese contenido a GitHub y la web publica se actualiza.
  // Las fotos que ya eran rutas ("fotos/...") se dejan tal cual.

  // Carga JSZip bajo demanda (solo cuando se pulsa el boton), para que la
  // pagina publica no dependa de el. Devuelve una promesa.
  function loadJSZip() {
    return new Promise(function(resolve, reject) {
      if (typeof JSZip !== 'undefined') { resolve(); return; }
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
      s.onload = function() { resolve(); };
      s.onerror = function() { reject(new Error('No se pudo cargar el empaquetador. Revisa tu conexion.')); };
      document.head.appendChild(s);
    });
  }

  async function exportForPublish() {
    await loadJSZip();
    const posts = buildPosts(); // historias efectivas: semilla + ediciones + nuevas
    const zip = new JSZip();
    const fotosDir = zip.folder('fotos');
    let imgCount = 0;

    // Convierte una foto incrustada (data:URL) en un archivo dentro de /fotos
    // y devuelve su ruta. Si no es data:URL, devuelve null.
    function fileFromDataUrl(dataUrl, baseName) {
      const m = /^data:(image\/[a-z+]+);base64,(.*)$/i.exec(dataUrl || '');
      if (!m) return null;
      const ext = m[1] === 'image/png' ? 'png' : 'jpg';
      const filename = baseName + '.' + ext;
      fotosDir.file(filename, m[2], { base64: true });
      imgCount++;
      return 'fotos/' + filename;
    }

    const clean = posts.map(p => {
      const post = { ...p };
      if (post.coverImage && post.coverImage.startsWith('data:')) {
        const path = fileFromDataUrl(post.coverImage, post.id + '-cover');
        if (path) post.coverImage = path;
      }
      if (Array.isArray(post.album)) {
        post.album = post.album.map((src, i) => {
          if (src && src.startsWith('data:')) {
            return fileFromDataUrl(src, post.id + '-alb-' + (i + 1)) || src;
          }
          return src;
        });
      }
      return post;
    });

    const fullData = Object.assign({}, window.BLOG_DATA, { posts: clean });
    const dataJs =
      '// Datos del blog - contenido real horneado para publicar.\n' +
      '// (Generado desde el editor. Las fotos estan en la carpeta /fotos.)\n\n' +
      'window.BLOG_DATA = ' + JSON.stringify(fullData, null, 2) + ';\n';
    zip.file('data.js', dataJs);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'publicar-' + new Date().toISOString().slice(0, 10) + '.zip';
    a.click();
    URL.revokeObjectURL(url);
    return { imgCount, postCount: clean.length };
  }

  window.BLOG_STORE = {
    savePost,
    deletePost,
    resetAll,
    restorePost,
    exportJSON,
    importJSON,
    exportForPublish,
    getMeta,
    isSeedPost,
    isEdited,
    makeId,
    slugify,
    recoverable,
    restoreFromSafety,
    getSafety,
  };
})();
