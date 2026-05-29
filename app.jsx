// App principal: shell, barra de control, navegación

const { useState: appUseState, useEffect: appUseEffect } = React;

// Texto amable para "cuándo" se hizo la copia de seguridad
function fmtWhen(iso) {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 90) return 'hace un momento';
    if (diff < 3600) return 'hace ' + Math.round(diff / 60) + ' min';
    if (diff < 86400) return 'hace ' + Math.round(diff / 3600) + ' h';
    return 'el ' + d.toLocaleDateString('es', { day: 'numeric', month: 'long' });
  } catch (e) { return ''; }
}

function App() {
  const styleId = 'A'; // Fijado: Mediterráneo
  const [bgKey, setBgKey] = appUseState('crema');
  const [page, setPage] = appUseState('inicio'); // inicio, historias, post, mapa, nosotros
  const [postId, setPostId] = appUseState('cinque-terre');
  const [mobileNavOpen, setMobileNavOpen] = appUseState(false);
  const [controlsOpen, setControlsOpen] = appUseState(true);
  const [editorOpen, setEditorOpen] = appUseState(false);
  const [recovery, setRecovery] = appUseState(null); // copia de seguridad recuperable
  const [, setDataVersion] = appUseState(0); // bump para forzar re-render tras editar

  appUseEffect(() => {
    if (window.BLOG_STORE && window.BLOG_STORE.recoverable) {
      setRecovery(window.BLOG_STORE.recoverable());
    }
  }, []);

  const t = window.buildTokens(styleId, bgKey);
  const isC = t.style === 'scrapbook';

  appUseEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.backgroundImage = t.bgImage || 'none';
    document.body.style.backgroundSize = t.bgSize || 'auto';
    document.body.style.color = t.text;
  }, [t.bg, t.bgImage, t.bgSize, t.text]);

  function nav(p, id, anchor) {
    setPage(p);
    if (id) setPostId(id);
    setMobileNavOpen(false);
    if (anchor) {
      setTimeout(() => {
        const el = document.querySelector(anchor);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'historias', label: 'Historias' },
    { id: 'mapa', label: 'Mapa' },
    { id: 'mapafotos', label: 'Mapa de fotos' },
    { id: 'nosotros', label: 'Nosotros' },
  ];

  return (
    <div className="app-root">
      <style>{`
        .app-root { min-height: 100vh; background: ${t.bg}; ${t.bgImage ? `background-image: ${t.bgImage}; background-size: ${t.bgSize};` : ''} color: ${t.text}; font-family: ${t.fontBody}; transition: background-color .3s ease, color .3s ease; }
        .site-nav { background: ${t.bg}${t.bgImage ? '' : ''}; }
        .app-root *, .app-root *::before, .app-root *::after { box-sizing: border-box; }

        /* ========== AVISO DE RECUPERACIÓN ========== */
        .recovery-bar { display:flex; align-items:center; justify-content:center; gap: 18px; flex-wrap: wrap; padding: 13px 24px; background: ${t.accent1}; color: #fff; font-family: ${t.fontBody}; font-size: 14px; }
        .recovery-txt { font-weight: 500; max-width: 760px; }
        .recovery-actions { display:flex; gap: 8px; }
        .recovery-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; font-family: inherit; }
        .recovery-btn.primary { background: #fff; color: ${t.accent1}; }
        .recovery-btn.ghost { background: transparent; color: #fff; border-color: rgba(255,255,255,0.55); }
        .recovery-btn:hover { filter: brightness(0.96); }

        /* ========== BARRA DE CONTROL (visible en preview) ========== */
        .ctrl { position: fixed; bottom: 16px; right: 16px; z-index: 1000; background: ${t.card}; border: 1px solid ${t.line}; border-radius: 14px; padding: 14px; box-shadow: 0 12px 32px rgba(0,0,0,0.18); font-family: 'Manrope', system-ui, sans-serif; width: ${controlsOpen ? '280px' : 'auto'}; transition: width .25s ease; }
        .ctrl-head { display:flex; align-items:center; justify-content: space-between; gap: 12px; }
        .ctrl-title { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.textMuted}; font-weight: 700; }
        .ctrl-toggle { width: 24px; height: 24px; border-radius: 6px; background: ${t.bgAlt}; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size: 14px; color: ${t.text}; line-height: 1; }
        .ctrl-section { margin-top: 14px; }
        .ctrl-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.textMuted}; font-weight: 600; margin-bottom: 7px; }
        .ctrl-edit-btn { width: 100%; padding: 10px 14px; background: ${t.text}; color: ${t.bg}; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; display:flex; align-items:center; justify-content:center; gap: 8px; }
        .ctrl-edit-btn:hover { filter: brightness(1.15); }
        .ctrl-styles { display:flex; gap: 6px; }
        .ctrl-style { flex: 1; padding: 8px 10px; background: ${t.bgAlt}; border: 1px solid ${t.line}; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; color: ${t.text}; text-align: left; line-height: 1.2; }
        .ctrl-style.active { background: ${t.text}; color: ${t.bg}; border-color: ${t.text}; }
        .ctrl-style .sub { display:block; font-size: 10px; opacity: 0.7; margin-top: 2px; font-weight: 400; }
        .ctrl-bgs { display:flex; gap: 6px; flex-wrap: wrap; }
        .ctrl-bg { width: 38px; height: 38px; border-radius: 50%; cursor: pointer; border: 2px solid ${t.line}; position: relative; transition: transform .15s ease; }
        .ctrl-bg:hover { transform: scale(1.08); }
        .ctrl-bg.active { border-color: ${t.text}; box-shadow: 0 0 0 2px ${t.bg}; }
        .ctrl-bg-lbl { position:absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; font-size: 10px; color: ${t.text}; background: ${t.card}; padding: 3px 8px; border-radius: 6px; border: 1px solid ${t.line}; white-space: nowrap; opacity: 0; transition: opacity .15s ease; pointer-events: none; font-weight: 600; }
        .ctrl-bg:hover .ctrl-bg-lbl { opacity: 1; }

        /* ========== TOP NAV ========== */
        .site-nav { padding: ${isC ? '18px 32px' : '22px 40px'}; border-bottom: 1px solid ${t.line}; background: ${t.bg}; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); display:grid; grid-template-columns: ${isC ? '1fr auto 1fr' : 'auto 1fr auto'}; align-items: center; gap: 32px; }
        .site-nav-tag { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.textMuted}; font-weight: 600; }
        .site-nav-brand { display:flex; align-items:center; gap: 12px; cursor: pointer; ${isC ? 'justify-content: center;' : ''} }
        .site-nav-mark { width: ${isC ? '36px' : '32px'}; height: ${isC ? '36px' : '32px'}; border-radius: ${isC ? '50%' : '50%'}; background: ${isC ? t.accent1 : `linear-gradient(135deg, ${t.accent1} 0%, ${t.accent2} 100%)`}; display:flex; align-items:center; justify-content:center; color: ${t.bg}; font-weight: ${t.weights.display}; font-size: ${isC ? '15px' : '14px'}; letter-spacing: -0.02em; position: relative; }
        ${!isC ? `.site-nav-mark::after { content:''; position:absolute; inset: 9px; border-radius: 50%; background: ${t.bg}; }` : ''}
        .site-nav-brand-name { font-family: ${t.fontDisplay}; font-size: ${isC ? '21px' : '19px'}; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; color: ${t.text}; }
        .site-nav-links { display:flex; gap: 4px; ${isC ? 'justify-content: flex-end;' : ''} align-items: center; }
        .site-nav-link { padding: 8px 14px; font-size: 14px; font-weight: 500; color: ${t.textMuted}; cursor: pointer; border-radius: ${isC ? '4px' : '999px'}; font-family: ${t.fontBody}; transition: all .15s ease; }
        .site-nav-link:hover { color: ${t.text}; background: ${t.bgAlt}; }
        .site-nav-link.active { color: ${t.bg}; background: ${t.text}; }
        .site-nav-burger { display: none; width: 38px; height: 38px; border-radius: 8px; background: ${t.bgAlt}; align-items:center; justify-content:center; cursor:pointer; }
        .site-nav-burger-icon { width: 18px; height: 2px; background: ${t.text}; position: relative; }
        .site-nav-burger-icon::before, .site-nav-burger-icon::after { content:''; position:absolute; left: 0; right: 0; height: 2px; background: ${t.text}; }
        .site-nav-burger-icon::before { top: -6px; }
        .site-nav-burger-icon::after { top: 6px; }

        /* ========== MAIN ========== */
        .site-main { max-width: 1240px; margin: 0 auto; padding: 0 40px; }
        .site-foot { padding: 48px 40px; border-top: 1px solid ${t.line}; display:flex; justify-content:space-between; gap: 24px; font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '11px' : '13px'}; letter-spacing: ${isC ? '0.06em' : '0'}; text-transform: ${isC ? 'uppercase' : 'none'}; color: ${t.textMuted}; max-width: 1240px; margin: 56px auto 0; }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 900px) {
          .site-nav { grid-template-columns: auto 1fr auto; gap: 16px; padding: 16px 24px; }
          .site-nav-tag { display: none; }
          .site-nav-brand { justify-content: flex-start; }
          .site-nav-links { display: ${mobileNavOpen ? 'flex' : 'none'}; position: absolute; top: 100%; left: 0; right: 0; background: ${t.card}; border-bottom: 1px solid ${t.line}; flex-direction: column; align-items: stretch; padding: 12px; gap: 4px; }
          .site-nav-link { padding: 14px 16px; font-size: 15px; }
          .site-nav-burger { display: inline-flex; justify-self: end; }
          .site-main { padding: 0 24px; }
          .site-foot { flex-direction: column; padding: 32px 24px; }
        }
        @media (max-width: 640px) {
          .ctrl { width: ${controlsOpen ? '240px' : 'auto'}; bottom: 12px; right: 12px; padding: 12px; }
        }
      `}</style>

      {recovery && (
        <div className="recovery-bar">
          <span className="recovery-txt">
            🛟 Encontramos una copia de seguridad de tu última edición ({fmtWhen(recovery.savedAt)}, {recovery.count} {recovery.count === 1 ? 'historia' : 'historias'}). ¿Quieres restaurarla?
          </span>
          <div className="recovery-actions">
            <button className="recovery-btn ghost" onClick={() => setRecovery(null)}>Ahora no</button>
            <button
              className="recovery-btn primary"
              onClick={() => {
                const ok = window.BLOG_STORE.restoreFromSafety();
                if (ok) { setDataVersion(v => v + 1); setRecovery(null); }
                else alert('No se pudo restaurar automáticamente. Si tienes un archivo de copia de seguridad, ábrelo con ✏️ Editar historias → ↑ Importar.');
              }}
            >Restaurar</button>
          </div>
        </div>
      )}

      {/* Barra de control flotante */}
      <div className="ctrl">
        <div className="ctrl-head">
          <div className="ctrl-title">{controlsOpen ? '⚙ Apariencia' : '⚙'}</div>
          <div className="ctrl-toggle" onClick={() => setControlsOpen(!controlsOpen)}>{controlsOpen ? '–' : '+'}</div>
        </div>
        {controlsOpen && (
          <>
          <div className="ctrl-section">
            <button className="ctrl-edit-btn" onClick={() => setEditorOpen(true)}>
              ✏️ Editar historias
            </button>
          </div>
          <div className="ctrl-section">
            <div className="ctrl-label">Color de fondo</div>
            <div className="ctrl-bgs">
              {Object.entries(window.BG_PRESETS).map(([key, preset]) => (
                <div
                  key={key}
                  className={`ctrl-bg ${bgKey === key ? 'active' : ''}`}
                  style={preset.swatchStyle || { background: preset.swatch }}
                  onClick={() => setBgKey(key)}
                  title={preset.label}
                >
                  <span className="ctrl-bg-lbl">{preset.label}</span>
                </div>
              ))}
            </div>
          </div>
          </>
        )}
      </div>

      {/* Site navigation */}
      <header className="site-nav">
        {isC && <div className="site-nav-tag">EST. 2018 · 37 países</div>}
        <div className="site-nav-brand" onClick={() => nav('inicio')}>
          <div className="site-nav-mark">{isC ? 'D' : ''}</div>
          <div className="site-nav-brand-name">{isC ? 'Diario de Ruta' : 'Rincones'}</div>
        </div>
        <nav className="site-nav-links">
          {navItems.map(item => (
            <span
              key={item.id}
              className={`site-nav-link ${page === item.id || (page === 'post' && item.id === 'historias') ? 'active' : ''}`}
              onClick={() => nav(item.id)}
            >
              {item.label}
            </span>
          ))}
        </nav>
        <div className="site-nav-burger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          <div className="site-nav-burger-icon"></div>
        </div>
      </header>

      {/* Main */}
      <main className="site-main">
        {page === 'inicio' && <window.HomePage t={t} nav={nav} />}
        {page === 'historias' && <window.HistoriasPage t={t} nav={nav} />}
        {page === 'post' && <window.PostPage t={t} nav={nav} postId={postId} />}
        {page === 'mapa' && <window.MapaPage t={t} nav={nav} />}
        {page === 'mapafotos' && <window.MapaFotosPage t={t} nav={nav} />}
        {page === 'nosotros' && <window.NosotrosPage t={t} nav={nav} />}
      </main>

      {window.StoryEditor && (
        <window.StoryEditor
          t={t}
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          onChange={() => setDataVersion(v => v + 1)}
        />
      )}

      <footer className="site-foot">
        <span>{isC ? '© 2026 · DIARIO DE RUTA · FAMILIA LÓPEZ' : '© 2026 Rincones — un diario familiar'}</span>
        <span>{isC ? 'HECHO CON CAFÉ Y PAPEL CUADRICULADO' : 'Hecho con café y mucha paciencia.'}</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
