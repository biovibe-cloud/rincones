// Editor: modal con lista de historias + formulario para crear/editar.
// Se monta en app.jsx via <StoryEditor open={...} onClose={...} onChange={...} t={...} />

const { useState: edUseState, useEffect: edUseEffect, useRef: edUseRef } = React;

const TAG_OPTIONS = ['Europa', 'Asia', 'África', 'América', 'Oceanía', 'Road trip', 'Ciudad', 'Playa', 'Naturaleza', 'Familia', 'Pueblos'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Reduce y comprime una imagen en el navegador → data URL (JPEG).
// Acepta cualquier resolución/tamaño y la ajusta para que cargue rápido y quepa en localStorage.
function resizeImageFile(file, maxDim = 2000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
          reject(new Error('No se pudo procesar la imagen.'));
        }
      };
      img.onerror = () => reject(new Error('No se pudo abrir la imagen.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

// Campo de foto de portada: arrastrar o hacer clic. La foto se ajusta sola.
function CoverPhotoField({ t, value, onChange }) {
  const [drag, setDrag] = edUseState(false);
  const [busy, setBusy] = edUseState(false);
  const inputRef = edUseRef(null);

  function handleFile(file) {
    if (!file) return;
    setBusy(true);
    resizeImageFile(file)
      .then(dataUrl => { onChange(dataUrl); setBusy(false); })
      .catch(err => { setBusy(false); alert('No se pudo usar esa foto: ' + err.message); });
  }

  return (
    <div className="ed-field">
      <label className="ed-label">Foto de portada</label>
      {value ? (
        <div className="ed-cover-preview">
          <img src={value} alt="Portada" />
          <div className="ed-cover-actions">
            <button className="ed-btn" onClick={() => inputRef.current.click()}>Cambiar</button>
            <button className="ed-btn danger" onClick={() => onChange('')}>Quitar</button>
          </div>
          {busy && <div className="ed-cover-busy">Procesando…</div>}
        </div>
      ) : (
        <div
          className={`ed-cover-drop ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        >
          {busy
            ? <strong>Procesando foto…</strong>
            : (<>
                <strong>Arrastra una foto aquí</strong>
                <span>o haz clic para elegirla · JPG/PNG, se ajusta sola</span>
              </>)}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }}
      />
      <span className="ed-help">Se reduce automáticamente para que cargue rápido. Aparece arriba de la historia, en su tarjeta del feed y, si la destacas, en el inicio.</span>
    </div>
  );
}

// Campo de álbum: añadir varias fotos, reordenarlas y quitarlas. Cada una se ajusta sola.
function AlbumPhotosField({ t, value, onChange }) {
  const [drag, setDrag] = edUseState(false);
  const [busy, setBusy] = edUseState(0);
  const inputRef = edUseRef(null);
  const list = value || [];

  function addFiles(files) {
    const imgs = [...files].filter(f => f.type && f.type.startsWith('image/'));
    if (!imgs.length) return;
    setBusy(b => b + imgs.length);
    Promise.all(imgs.map(f => resizeImageFile(f, 2000, 0.82).catch(() => null)))
      .then(urls => {
        const ok = urls.filter(Boolean);
        onChange([...list, ...ok]);
        setBusy(0);
      });
  }
  function remove(i) { onChange(list.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    const [it] = copy.splice(i, 1);
    copy.splice(j, 0, it);
    onChange(copy);
  }

  return (
    <div className="ed-field">
      <label className="ed-label">Álbum de fotos {list.length > 0 && <span style={{ color: t.textMuted, fontWeight: 400 }}>· {list.length}</span>}</label>
      <div className="ed-album-grid">
        {list.map((src, i) => (
          <div className="ed-album-item" key={i}>
            <img src={src} alt={'foto ' + (i + 1)} />
            <div className="ed-album-tools">
              <button onClick={() => move(i, -1)} disabled={i === 0} title="Mover antes">‹</button>
              <button onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Mover después">›</button>
              <button className="del" onClick={() => remove(i)} title="Quitar">×</button>
            </div>
          </div>
        ))}
        <div
          className={`ed-album-add ${drag ? 'drag' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        >
          {busy > 0 ? `Procesando ${busy}…` : '+ Añadir fotos'}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
      <span className="ed-help">Puedes soltar varias a la vez. Aparecen en una cuadrícula al final de la historia y se abren en grande al pulsarlas. Cuantas más fotos, más espacio ocupan en el navegador.</span>
    </div>
  );
}

function emptyPost() {
  return {
    id: '',
    title: '',
    subtitle: '',
    country: '',
    region: '',
    monthIdx: new Date().getMonth(),
    year: new Date().getFullYear(),
    readMin: 5,
    tags: [],
    travelers: 'Los dos',
    featured: false,
    coords: '',
    coverImage: '',
    bodyIntro: '',
    bodyText: '', // párrafos separados por línea en blanco
    places: [],
    album: [],
  };
}

// Convierte un post almacenado (formato data.js) → estado del formulario
function postToForm(post) {
  const f = emptyPost();
  Object.assign(f, post);
  // Derivar monthIdx desde date "Mayo 2026"
  if (post.date && (!post.monthIdx && post.monthIdx !== 0)) {
    const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const lower = post.date.toLowerCase();
    const found = m.findIndex(x => lower.includes(x));
    if (found >= 0) f.monthIdx = found;
  }
  if (post.bodyParas && post.bodyParas.length) {
    f.bodyText = post.bodyParas.join('\n\n');
  }
  f.places = post.places ? [...post.places] : [];
  f.album = post.album ? [...post.album] : [];
  f.tags = post.tags ? [...post.tags] : [];
  return f;
}

// Convierte estado del formulario → post almacenable
function formToPost(form, existingId) {
  const mesesLargos = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const id = existingId || window.BLOG_STORE.makeId(form.title);
  const date = `${mesesLargos[form.monthIdx]} ${form.year}`;
  const dateShort = `${MESES[form.monthIdx].toUpperCase()} · ${String(form.year).slice(-2)}`;
  const bodyParas = (form.bodyText || '')
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  return {
    id,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    country: form.country.trim(),
    region: form.region.trim(),
    date,
    dateShort,
    year: Number(form.year),
    readMin: Number(form.readMin) || 5,
    tags: form.tags,
    travelers: form.travelers || 'Los dos',
    featured: !!form.featured,
    coords: form.coords.trim(),
    coverImage: form.coverImage || '',
    bodyIntro: form.bodyIntro.trim(),
    bodyParas,
    places: form.places.filter(p => p.name && p.name.trim()),
    album: form.album || [],
    monthIdx: Number(form.monthIdx),
  };
}

function StoryEditor({ t, open, onClose, onChange }) {
  const [selectedId, setSelectedId] = edUseState(null); // null = nueva
  const [form, setForm] = edUseState(emptyPost());
  const [allPosts, setAllPosts] = edUseState(window.BLOG_DATA.posts);
  const [dirty, setDirty] = edUseState(false);
  const [savedFlash, setSavedFlash] = edUseState(false);
  const [confirmDelete, setConfirmDelete] = edUseState(false);
  const [publishing, setPublishing] = edUseState(false);
  const [searchQ, setSearchQ] = edUseState('');
  const [sortMode, setSortMode] = edUseState('natural'); // 'natural' | 'anio'
  const fileInputRef = edUseRef(null);

  edUseEffect(() => {
    if (open) {
      setAllPosts([...window.BLOG_DATA.posts]);
      setSearchQ('');
    }
  }, [open]);

  edUseEffect(() => {
    if (selectedId === null) {
      setForm(emptyPost());
    } else {
      const post = window.BLOG_DATA.posts.find(p => p.id === selectedId);
      if (post) setForm(postToForm(post));
    }
    setDirty(false);
    setConfirmDelete(false);
  }, [selectedId]);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function toggleTag(tag) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(x => x !== tag) : [...prev.tags, tag]
    }));
    setDirty(true);
  }

  function addPlace() {
    setForm(prev => ({
      ...prev,
      places: [...prev.places, { name: '', type: 'Comida', town: '', note: '' }]
    }));
    setDirty(true);
  }

  function updatePlace(idx, key, value) {
    setForm(prev => ({
      ...prev,
      places: prev.places.map((p, i) => i === idx ? { ...p, [key]: value } : p)
    }));
    setDirty(true);
  }

  function removePlace(idx) {
    setForm(prev => ({
      ...prev,
      places: prev.places.filter((_, i) => i !== idx)
    }));
    setDirty(true);
  }

  function handleSave() {
    if (!form.title.trim()) {
      alert('Pon al menos un título a la historia.');
      return;
    }
    const post = formToPost(form, selectedId || form.id || null);
    const ok = window.BLOG_STORE.savePost(post);
    if (!ok) {
      alert('No se pudo guardar: este navegador se quedó sin espacio. Suele pasar con muchas fotos.\n\nPrueba a quitar alguna foto, o haz una copia de seguridad (↓ Backup) y avísame para buscar otra forma de guardar las imágenes.');
      return;
    }
    setSelectedId(post.id);
    setAllPosts([...window.BLOG_DATA.posts]);
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
    if (onChange) onChange();
  }

  function handleDelete() {
    if (!selectedId) return;
    window.BLOG_STORE.deletePost(selectedId);
    setSelectedId(null);
    setAllPosts([...window.BLOG_DATA.posts]);
    setConfirmDelete(false);
    if (onChange) onChange();
  }

  function handleRestore() {
    if (!selectedId) return;
    window.BLOG_STORE.restorePost(selectedId);
    const restored = window.BLOG_DATA.posts.find(p => p.id === selectedId);
    if (restored) setForm(postToForm(restored));
    setAllPosts([...window.BLOG_DATA.posts]);
    setDirty(false);
    if (onChange) onChange();
  }

  async function handlePublish() {
    if (publishing) return;
    setPublishing(true);
    try {
      const res = await window.BLOG_STORE.exportForPublish();
      if (res) {
        alert(
          '¡Listo! Se ha descargado un archivo ZIP.\n\n' +
          'Contiene:\n' +
          '- data.js (tus ' + res.postCount + ' historias)\n' +
          '- carpeta fotos (' + res.imgCount + ' foto(s) nueva(s) optimizada(s))\n\n' +
          'Para publicar:\n' +
          '1. Descomprime el ZIP.\n' +
          '2. Sube su contenido a GitHub: reemplaza el data.js antiguo y mete las fotos en la carpeta fotos.\n' +
          '3. Espera 1-2 min y abre la web con recarga forzada (Ctrl/Cmd + Shift + R).'
        );
      }
    } catch (err) {
      alert('No se pudo exportar: ' + (err && err.message ? err.message : err));
    }
    setPublishing(false);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    window.BLOG_STORE.importJSON(file)
      .then(() => {
        setAllPosts([...window.BLOG_DATA.posts]);
        setSelectedId(null);
        if (onChange) onChange();
        alert('Backup importado.');
      })
      .catch(err => alert('Error importando: ' + err.message));
    e.target.value = '';
  }

  if (!open) return null;

  const isExisting = !!selectedId;
  const isSeed = isExisting && window.BLOG_STORE.isSeedPost(selectedId);
  const isEdited = isExisting && window.BLOG_STORE.isEdited(selectedId);

  return (
    <div className="ed-root">
      <style>{`
        .ed-root { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; padding: 24px; font-family: ${t.fontBody}; backdrop-filter: blur(4px); }
        .ed-modal { background: ${t.bg}; ${t.bgImage ? `background-image: ${t.bgImage}; background-size: ${t.bgSize};` : ''} border: 1px solid ${t.line}; border-radius: 16px; width: 100%; max-width: 1100px; height: 100%; max-height: 760px; display:grid; grid-template-columns: 320px 1fr; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.4); color: ${t.text}; }

        /* Sidebar */
        .ed-side { background: ${t.paper}; border-right: 1px solid ${t.line}; display:flex; flex-direction: column; min-height: 0; }
        .ed-side-head { padding: 18px 20px; border-bottom: 1px solid ${t.line}; display:flex; align-items:center; justify-content: space-between; }
        .ed-side-head h3 { margin: 0; font-family: ${t.fontDisplay}; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
        .ed-x { width: 30px; height: 30px; border-radius: 8px; background: ${t.bgAlt}; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size: 18px; color: ${t.text}; line-height: 1; border: none; }
        .ed-x:hover { background: ${t.line}; }
        .ed-new-btn { margin: 14px 16px; padding: 12px 16px; background: ${t.accent2}; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; display:flex; align-items:center; gap: 8px; justify-content: center; }
        .ed-new-btn:hover { filter: brightness(1.05); }
        .ed-sort-toggle { display:flex; gap: 6px; margin: 0 16px 10px; background: ${t.bgAlt}; padding: 3px; border-radius: 9px; }
        .ed-sort-toggle button { flex:1; padding: 6px 8px; border:none; background: transparent; border-radius: 7px; font-size: 12px; font-weight: 600; color: ${t.textMuted}; cursor: pointer; font-family: inherit; }
        .ed-sort-toggle button.on { background: ${t.card}; color: ${t.text}; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
        .ed-search-wrap { position: relative; margin: 0 16px 10px; }
        .ed-search-icon { position:absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; opacity: .5; pointer-events: none; }
        .ed-search-input { width: 100%; padding: 9px 12px 9px 30px; border-radius: 9px; border: 1px solid ${t.line}; background: ${t.card}; font-size: 13px; font-family: inherit; color: ${t.text}; box-sizing: border-box; }
        .ed-search-input:focus { outline: none; border-color: ${t.accent1}; }
        .ed-search-empty { padding: 24px 16px; text-align:center; font-size: 12px; color: ${t.textMuted}; }
        .ed-list { flex: 1; overflow-y: auto; padding: 4px 8px 16px; min-height: 0; }
        .ed-list-item { padding: 12px 14px; border-radius: 10px; cursor: pointer; margin-bottom: 2px; display:flex; flex-direction: column; gap: 3px; border: 1px solid transparent; }
        .ed-list-item:hover { background: ${t.bgAlt}; }
        .ed-list-item.active { background: ${t.bgAlt}; border-color: ${t.line}; }
        .ed-list-title { font-size: 14px; font-weight: 600; color: ${t.text}; line-height: 1.3; }
        .ed-list-sub { font-size: 11px; color: ${t.textMuted}; display:flex; gap: 8px; align-items:center; }
        .ed-badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.06em; font-weight: 700; text-transform: uppercase; }
        .ed-badge.new { background: ${t.accent2}; color: white; }
        .ed-badge.edited { background: ${t.accent1}; color: white; }
        .ed-badge.seed { background: ${t.bgAlt}; color: ${t.textMuted}; }
        .ed-side-foot { border-top: 1px solid ${t.line}; padding: 12px 14px; display:flex; flex-direction: column; gap: 8px; font-size: 11px; }
        .ed-side-foot-row { display:flex; gap: 8px; }
        .ed-publish-btn { width: 100%; padding: 11px 12px; background: ${t.accent2}; border: 1px solid ${t.accent2}; border-radius: 9px; cursor: pointer; color: #fff; font-family: inherit; font-size: 13px; font-weight: 700; letter-spacing: .2px; transition: filter .15s ease; }
        .ed-publish-btn:hover { filter: brightness(1.06); }
        .ed-publish-btn:disabled { opacity: .6; cursor: default; }
        .ed-mini-btn { flex: 1; padding: 8px 10px; background: ${t.bgAlt}; border: 1px solid ${t.line}; border-radius: 8px; cursor: pointer; color: ${t.text}; font-family: inherit; font-size: 11px; font-weight: 500; }
        .ed-mini-btn:hover { background: ${t.line}; }

        /* Main panel */
        .ed-main { display:flex; flex-direction: column; overflow: hidden; }
        .ed-main-head { padding: 18px 28px; border-bottom: 1px solid ${t.line}; display:flex; align-items:center; justify-content: space-between; gap: 16px; background: ${t.paper}; }
        .ed-main-head h2 { margin: 0; font-family: ${t.fontDisplay}; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .ed-main-head .sub { font-size: 12px; color: ${t.textMuted}; margin-top: 2px; }
        .ed-actions { display:flex; gap: 8px; align-items:center; }
        .ed-actions .flash { font-size: 12px; color: ${t.accent1}; font-weight: 600; opacity: ${savedFlash ? 1 : 0}; transition: opacity .3s ease; }
        .ed-btn { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid ${t.line}; background: ${t.card}; color: ${t.text}; font-family: inherit; }
        .ed-btn:hover { background: ${t.bgAlt}; }
        .ed-btn.primary { background: ${t.text}; color: ${t.bg}; border-color: ${t.text}; }
        .ed-btn.primary:hover { filter: brightness(0.92); }
        .ed-btn.danger { color: oklch(0.55 0.18 25); border-color: oklch(0.55 0.18 25); }
        .ed-btn.danger:hover { background: oklch(0.96 0.04 25); }
        .ed-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .ed-form { flex: 1; overflow-y: auto; padding: 28px 32px 40px; }
        .ed-row { display:grid; gap: 16px; margin-bottom: 18px; }
        .ed-row.cols2 { grid-template-columns: 1fr 1fr; }
        .ed-row.cols3 { grid-template-columns: 1fr 1fr 1fr; }
        .ed-row.cols4 { grid-template-columns: 1fr 1fr 1fr 1fr; }

        .ed-field { display:flex; flex-direction: column; gap: 6px; }
        .ed-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: ${t.textMuted}; font-weight: 600; }
        .ed-input, .ed-textarea, .ed-select { background: ${t.card}; border: 1px solid ${t.line}; border-radius: 8px; padding: 10px 12px; font-size: 14px; color: ${t.text}; font-family: inherit; width: 100%; }
        .ed-input:focus, .ed-textarea:focus, .ed-select:focus { outline: 2px solid ${t.accent1}; outline-offset: -1px; border-color: transparent; }
        .ed-textarea { resize: vertical; min-height: 80px; line-height: 1.5; font-family: inherit; }
        .ed-textarea.tall { min-height: 220px; }
        .ed-help { font-size: 11px; color: ${t.textMuted}; margin-top: 2px; }

        .ed-chips { display:flex; flex-wrap: wrap; gap: 6px; }
        .ed-chip { padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid ${t.line}; background: ${t.card}; color: ${t.text}; }
        .ed-chip.on { background: ${t.text}; color: ${t.bg}; border-color: ${t.text}; }

        .ed-toggle { display:flex; align-items:center; gap: 10px; cursor:pointer; user-select: none; padding: 8px 0; }
        .ed-toggle-box { width: 36px; height: 22px; border-radius: 999px; background: ${t.bgAlt}; border: 1px solid ${t.line}; position: relative; transition: background .2s ease; }
        .ed-toggle.on .ed-toggle-box { background: ${t.accent1}; border-color: ${t.accent1}; }
        .ed-toggle-dot { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left .2s ease; }
        .ed-toggle.on .ed-toggle-dot { left: 16px; }
        .ed-toggle-lbl { font-size: 14px; color: ${t.text}; }

        .ed-places-list { display:flex; flex-direction: column; gap: 10px; }
        .ed-place { display:grid; grid-template-columns: 1.5fr 1fr 1fr 2fr 32px; gap: 8px; align-items: center; }
        .ed-place-del { width: 32px; height: 32px; border-radius: 8px; background: ${t.bgAlt}; border: 1px solid ${t.line}; cursor: pointer; color: ${t.textMuted}; font-size: 14px; display:flex; align-items:center; justify-content:center; line-height: 1; }
        .ed-place-del:hover { color: oklch(0.55 0.18 25); background: oklch(0.96 0.04 25); }
        .ed-add-place { margin-top: 8px; padding: 10px; background: ${t.bgAlt}; border: 1px dashed ${t.line}; border-radius: 8px; cursor: pointer; font-size: 13px; color: ${t.textMuted}; font-weight: 500; }
        .ed-add-place:hover { color: ${t.text}; background: ${t.line}; }

        .ed-cover-drop { border: 1.5px dashed ${t.line}; border-radius: 10px; background: ${t.bgAlt}; padding: 28px; min-height: 130px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: 5px; cursor: pointer; text-align:center; color: ${t.textMuted}; transition: border-color .15s ease, background .15s ease; }
        .ed-cover-drop:hover { border-color: ${t.accent1}; }
        .ed-cover-drop.drag { border-color: ${t.accent1}; background: ${t.card}; }
        .ed-cover-drop strong { color: ${t.text}; font-size: 15px; font-weight: 600; }
        .ed-cover-drop span { font-size: 12px; }
        .ed-cover-preview { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid ${t.line}; background: ${t.bgAlt}; }
        .ed-cover-preview img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
        .ed-cover-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; }
        .ed-cover-actions .ed-btn { box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
        .ed-cover-busy { position: absolute; inset: 0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); color: #fff; font-size: 14px; font-weight: 600; }

        .ed-album-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .ed-album-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid ${t.line}; background: ${t.bgAlt}; }
        .ed-album-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ed-album-tools { position: absolute; top: 4px; left: 4px; right: 4px; display: flex; gap: 3px; justify-content: flex-end; opacity: 0; transition: opacity .15s ease; }
        .ed-album-item:hover .ed-album-tools { opacity: 1; }
        .ed-album-tools button { width: 24px; height: 24px; border-radius: 6px; border: none; cursor: pointer; background: rgba(0,0,0,0.6); color: #fff; font-size: 14px; line-height: 1; display:flex; align-items:center; justify-content:center; }
        .ed-album-tools button:hover { background: rgba(0,0,0,0.85); }
        .ed-album-tools button:disabled { opacity: 0.35; cursor: default; }
        .ed-album-tools button.del { background: rgba(190,40,40,0.85); }
        .ed-album-add { aspect-ratio: 1; border: 1.5px dashed ${t.line}; border-radius: 8px; display:flex; align-items:center; justify-content:center; cursor: pointer; color: ${t.textMuted}; font-size: 12px; font-weight: 600; text-align: center; background: ${t.bgAlt}; transition: border-color .15s ease, background .15s ease; padding: 8px; }
        .ed-album-add:hover, .ed-album-add.drag { border-color: ${t.accent1}; color: ${t.text}; }

        .ed-section-title { font-family: ${t.fontDisplay}; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: ${t.text}; margin: 28px 0 14px; padding-top: 18px; border-top: 1px solid ${t.line}; }
        .ed-section-title:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }

        .ed-empty { flex: 1; display:flex; align-items:center; justify-content:center; flex-direction: column; gap: 14px; color: ${t.textMuted}; text-align: center; padding: 40px; }
        .ed-empty h3 { font-family: ${t.fontDisplay}; font-size: 22px; font-weight: 700; color: ${t.text}; margin: 0; }
        .ed-empty p { font-size: 14px; margin: 0; max-width: 320px; }

        .ed-confirm { background: oklch(0.96 0.04 25); border: 1px solid oklch(0.55 0.18 25); color: oklch(0.35 0.18 25); padding: 12px 14px; border-radius: 8px; margin-bottom: 16px; display:flex; align-items:center; gap: 12px; font-size: 13px; }
        .ed-confirm strong { font-weight: 700; }

        @media (max-width: 820px) {
          .ed-modal { grid-template-columns: 1fr; max-height: 100%; height: 100%; border-radius: 0; }
          .ed-side { display: none; }
          .ed-place { grid-template-columns: 1fr 1fr; }
          .ed-row.cols3, .ed-row.cols4 { grid-template-columns: 1fr 1fr; }
          .ed-album-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <div className="ed-modal" onClick={e => e.stopPropagation()}>
        {/* Sidebar */}
        <div className="ed-side">
          <div className="ed-side-head">
            <h3>✏️ Historias</h3>
            <button className="ed-x" onClick={onClose}>×</button>
          </div>
          <button className="ed-new-btn" onClick={() => setSelectedId(null)}>+ Nueva historia</button>
          <div className="ed-sort-toggle">
            <button className={sortMode === 'natural' ? 'on' : ''} onClick={() => setSortMode('natural')}>Recientes</button>
            <button className={sortMode === 'anio' ? 'on' : ''} onClick={() => setSortMode('anio')}>Por año</button>
          </div>
          <div className="ed-search-wrap">
            <span className="ed-search-icon">🔍</span>
            <input
              className="ed-search-input"
              placeholder="Buscar por título, país o año…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
          <div className="ed-list">
            <div
              className={`ed-list-item ${selectedId === null ? 'active' : ''}`}
              onClick={() => setSelectedId(null)}
              style={{ marginBottom: 6 }}
            >
              <div className="ed-list-title">+ Crear nueva</div>
              <div className="ed-list-sub">Empezar de cero</div>
            </div>
            {allPosts
              .slice()
              .sort((a, b) => {
                if (sortMode !== 'anio') return 0; // 'natural' ya viene en el orden correcto desde el store
                const ya = a.year || 0, yb = b.year || 0;
                if (yb !== ya) return yb - ya;
                return (b.monthIdx || 0) - (a.monthIdx || 0);
              })
              .filter(p => {
                const q = searchQ.trim().toLowerCase();
                if (!q) return true;
                return (p.title || '').toLowerCase().includes(q) ||
                       (p.country || '').toLowerCase().includes(q) ||
                       (p.date || '').toLowerCase().includes(q) ||
                       String(p.year || '').includes(q);
              })
              .map(p => {
              const isSeedPost = window.BLOG_STORE.isSeedPost(p.id);
              const wasEdited = window.BLOG_STORE.isEdited(p.id);
              return (
                <div
                  key={p.id}
                  className={`ed-list-item ${selectedId === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="ed-list-title">{p.title || '(sin título)'}</div>
                  <div className="ed-list-sub">
                    <span>{p.country} · {p.date}</span>
                    {!isSeedPost && <span className="ed-badge new">Nueva</span>}
                    {isSeedPost && wasEdited && <span className="ed-badge edited">Editada</span>}
                  </div>
                </div>
              );
            })}
            {searchQ.trim() && allPosts.filter(p => {
              const q = searchQ.trim().toLowerCase();
              return (p.title || '').toLowerCase().includes(q) ||
                     (p.country || '').toLowerCase().includes(q) ||
                     (p.date || '').toLowerCase().includes(q) ||
                     String(p.year || '').includes(q);
            }).length === 0 && (
              <div className="ed-search-empty">Sin resultados para “{searchQ}”.</div>
            )}
          </div>
          <div className="ed-side-foot">
            <button className="ed-publish-btn" onClick={handlePublish} disabled={publishing} title="Genera el archivo listo para subir a GitHub">
              {publishing ? 'Preparando...' : 'Exportar para publicar'}
            </button>
            <div className="ed-side-foot-row">
              <button className="ed-mini-btn" onClick={() => window.BLOG_STORE.exportJSON()} title="Descarga un JSON con todos tus cambios">↓ Backup</button>
              <button className="ed-mini-btn" onClick={() => fileInputRef.current.click()} title="Carga un backup">↑ Importar</button>
              <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="ed-main">
          <div className="ed-main-head">
            <div>
              <h2>{isExisting ? (form.title || '(sin título)') : 'Nueva historia'}</h2>
              <div className="sub">
                {!isExisting && 'Va a guardarse en este navegador'}
                {isExisting && isSeed && !isEdited && 'Historia de ejemplo · al editar quedará guardada localmente'}
                {isExisting && isSeed && isEdited && 'Historia de ejemplo editada · guardada en este navegador'}
                {isExisting && !isSeed && 'Historia guardada en este navegador'}
              </div>
            </div>
            <div className="ed-actions">
              <span className="flash">✓ guardado</span>
              {isExisting && isSeed && isEdited && (
                <button className="ed-btn" onClick={handleRestore}>↺ Restaurar</button>
              )}
              {isExisting && !confirmDelete && (
                <button className="ed-btn danger" onClick={() => setConfirmDelete(true)}>Eliminar</button>
              )}
              <button className="ed-btn primary" onClick={handleSave} disabled={!dirty && isExisting}>
                {isExisting ? 'Guardar cambios' : 'Crear historia'}
              </button>
            </div>
          </div>

          <div className="ed-form">
            {confirmDelete && (
              <div className="ed-confirm">
                <strong>¿Seguro?</strong>
                <span>{isSeed ? 'Esta historia de ejemplo desaparecerá del blog.' : 'Esta historia se borrará para siempre de este navegador.'}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="ed-btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                  <button className="ed-btn danger" onClick={handleDelete}>Sí, eliminar</button>
                </div>
              </div>
            )}

            <div className="ed-section-title">Básico</div>
            <div className="ed-field">
              <label className="ed-label">Título</label>
              <input className="ed-input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ej: Cinco pueblos, cinco colores…" />
            </div>
            <div className="ed-field" style={{ marginTop: 14 }}>
              <label className="ed-label">Subtítulo</label>
              <input className="ed-input" value={form.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="Una frase corta que resuma el viaje" />
            </div>
            <div className="ed-row cols2" style={{ marginTop: 14 }}>
              <div className="ed-field">
                <label className="ed-label">País</label>
                <input className="ed-input" value={form.country} onChange={e => update('country', e.target.value)} placeholder="Italia" />
              </div>
              <div className="ed-field">
                <label className="ed-label">Región / zona</label>
                <input className="ed-input" value={form.region} onChange={e => update('region', e.target.value)} placeholder="Liguria" />
              </div>
            </div>
            <div className="ed-row cols4">
              <div className="ed-field">
                <label className="ed-label">Mes</label>
                <select className="ed-select" value={form.monthIdx} onChange={e => update('monthIdx', Number(e.target.value))}>
                  {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="ed-field">
                <label className="ed-label">Año</label>
                <input className="ed-input" type="number" value={form.year} onChange={e => update('year', e.target.value)} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Min. lectura</label>
                <input className="ed-input" type="number" value={form.readMin} onChange={e => update('readMin', e.target.value)} />
              </div>
              <div className="ed-field">
                <label className="ed-label">Quiénes</label>
                <select className="ed-select" value={form.travelers} onChange={e => update('travelers', e.target.value)}>
                  {['Dora', 'Ruben', 'Los dos', 'Los cuatro', 'Familia y Amigos'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="ed-row cols2">
              <div className="ed-field">
                <label className="ed-label">Coordenadas (opcional)</label>
                <input className="ed-input" value={form.coords} onChange={e => update('coords', e.target.value)} placeholder="44.10° N, 9.74° E" />
              </div>
              <div className="ed-field" style={{ justifyContent: 'flex-end' }}>
                <label className="ed-label">Destacar en portada</label>
                <div className={`ed-toggle ${form.featured ? 'on' : ''}`} onClick={() => update('featured', !form.featured)}>
                  <div className="ed-toggle-box"><div className="ed-toggle-dot"></div></div>
                  <span className="ed-toggle-lbl">{form.featured ? 'Sí, aparece grande arriba' : 'No, va al feed normal'}</span>
                </div>
              </div>
            </div>

            <div className="ed-field" style={{ marginTop: 14 }}>
              <label className="ed-label">Etiquetas</label>
              <div className="ed-chips">
                {TAG_OPTIONS.map(tag => (
                  <span key={tag} className={`ed-chip ${form.tags.includes(tag) ? 'on' : ''}`} onClick={() => toggleTag(tag)}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="ed-section-title">Foto de portada</div>
            <CoverPhotoField t={t} value={form.coverImage} onChange={v => update('coverImage', v)} />

            <div className="ed-section-title">Álbum de fotos</div>
            <AlbumPhotosField t={t} value={form.album} onChange={v => update('album', v)} />

            <div className="ed-section-title">Texto</div>
            <div className="ed-field">
              <label className="ed-label">Intro / entradilla</label>
              <textarea className="ed-textarea" value={form.bodyIntro} onChange={e => update('bodyIntro', e.target.value)} placeholder="El primer párrafo, el que aparece destacado con un borde…" />
              <span className="ed-help">Aparece resaltado al inicio de la historia.</span>
            </div>
            <div className="ed-field" style={{ marginTop: 14 }}>
              <label className="ed-label">Cuerpo</label>
              <textarea className="ed-textarea tall" value={form.bodyText} onChange={e => update('bodyText', e.target.value)} placeholder="El resto de la historia. Separa los párrafos dejando una línea en blanco." />
              <span className="ed-help">Separa los párrafos con una línea en blanco.</span>
            </div>

            <div className="ed-section-title">Sitios que recordamos</div>
            <span className="ed-help" style={{ display: 'block', marginTop: -8, marginBottom: 12 }}>Restaurantes, miradores, hoteles… lo que quieras dejar anotado.</span>
            <div className="ed-places-list">
              {form.places.map((p, i) => (
                <div key={i} className="ed-place">
                  <input className="ed-input" placeholder="Nombre" value={p.name} onChange={e => updatePlace(i, 'name', e.target.value)} />
                  <select className="ed-select" value={p.type} onChange={e => updatePlace(i, 'type', e.target.value)}>
                    {['Comida','Cena','Aperitivo','Café','Mirador','Caminata','Museo','S. Religioso','Población','Hotel','Tienda','Otro'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <input className="ed-input" placeholder="Pueblo/zona" value={p.town} onChange={e => updatePlace(i, 'town', e.target.value)} />
                  <input className="ed-input" placeholder="Nota breve" value={p.note} onChange={e => updatePlace(i, 'note', e.target.value)} />
                  <button className="ed-place-del" onClick={() => removePlace(i)} title="Eliminar">×</button>
                </div>
              ))}
            </div>
            <div className="ed-add-place" onClick={addPlace}>+ Añadir sitio</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.StoryEditor = StoryEditor;
