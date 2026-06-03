// Páginas del blog. Cada una recibe { t (tokens), nav, postId? }.

const { WorldMap: WM, PostCard: PC, SectionHead: SH, PhotoMapApp: PMA } = window;
const DATA = window.BLOG_DATA;
const { useState, useEffect } = React;

// ============= INICIO =============
function HomePage({ t, nav }) {
  const isC = t.style === 'scrapbook';
  // Featured = la más reciente marcada como destacada, o si no, la más reciente sin más.
  // Las demás (incluidas otras destacadas) siempre aparecen en el feed.
  const sorted = DATA.posts; // ya viene ordenado por año desc
  const featured = sorted.find(p => p.featured) || sorted[0];
  const others = sorted.filter(p => p.id !== featured.id).slice(0, 3);

  return (
    <div className="om-home">
      <style>{`
        .om-home { display:flex; flex-direction: column; }
        .om-hero { padding: 64px 0 56px; display: grid; grid-template-columns: ${isC ? '1.4fr 1fr' : '1.1fr 1fr'}; gap: 56px; align-items: ${isC ? 'start' : 'end'}; }
        .om-hero .eyebrow { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '12px' : '13px'}; letter-spacing: ${isC ? '0.1em' : '0.18em'}; text-transform: uppercase; color: ${t.accent2}; font-weight: 600; margin-bottom: 22px; display:flex; gap: 14px; }
        .om-hero .eyebrow .live { display:inline-flex; align-items:center; gap: 7px; color: ${t.accent1}; }
        .om-hero .eyebrow .live::before { content:''; width: 7px; height: 7px; border-radius: 50%; background: ${t.accent1}; animation: omBlink 1.5s ease-in-out infinite; }
        @keyframes omBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .om-hero h1 { font-family: ${t.fontDisplay}; font-size: clamp(48px, 8vw, 92px); line-height: 0.95; letter-spacing: ${t.letterspacing}; margin: 0 0 26px; font-weight: ${t.weights.display}; color: ${t.text}; text-wrap: pretty; }
        .om-hero h1 em { font-style: ${isC ? 'normal' : 'italic'}; font-weight: ${isC ? t.weights.display : 400}; color: ${t.accent1}; ${isC ? 'border-bottom: 4px solid currentColor; padding-bottom: 0;' : ''} }
        .om-hero p { font-size: 17px; line-height: 1.6; color: ${t.textMuted}; margin: 0; max-width: 540px; }
        .om-hero-side { ${isC ? '' : 'padding-bottom: 8px;'} display:flex; flex-direction: column; gap: 22px; }
        .om-stat-big { font-family: ${t.fontDisplay}; font-size: 56px; line-height: 1; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; color: ${t.text}; }
        .om-stat-lbl { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.textMuted}; margin-top: 6px; font-weight: 600; }
        .om-meta-table { border-top: 1px solid ${t.line}; }
        .om-meta-row { display:flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${t.line}; font-size: 13px; }
        .om-meta-row .k { color: ${t.textMuted}; font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
        .om-meta-row .v { font-weight: 500; color: ${t.text}; }
        ${isC ? `
          .om-stamp-hero { width: 140px; height: 140px; border: 2px dashed ${t.accent1}; border-radius: 50%; display:flex; align-items:center; justify-content:center; flex-direction:column; transform: rotate(-6deg); color: ${t.accent1}; font-family: ${t.fontMono}; text-align:center; padding: 12px; align-self: flex-end; }
          .om-stamp-hero .big { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; }
          .om-stamp-hero .sm { font-size: 9px; letter-spacing: 0.2em; margin-top: 6px; text-transform: uppercase; }
        ` : ''}

        .om-block { padding: 56px 0; border-top: 1px solid ${t.line}; }
        .om-feed-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .om-map-cta { margin-top: 24px; display:flex; align-items:center; gap: 14px; font-size: 14px; color: ${t.accent2}; font-weight: 600; cursor: pointer; }
        .om-quick { display:grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .om-quick-card { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 40px; cursor: pointer; transition: background .2s ease; display:flex; flex-direction:column; min-height: 256px; }
        .om-quick-card:hover { background: ${t.bgAlt}; }
        .om-quick-card .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 12px; }
        .om-quick-card h3 { font-family: ${t.fontDisplay}; font-size: 22px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; margin: 0 0 8px; color: ${t.text}; line-height: 1.2; }
        .om-quick-card p { font-size: 14px; color: ${t.textMuted}; line-height: 1.55; margin: 0; }
        .om-quick-card .arrow { font-size: 13px; color: ${t.accent2}; margin-top: auto; padding-top: 16px; font-weight: 600; }
        .om-quick-card.qc-blue { background: ${t.accent1}; border-color: ${t.accent1}; }        .om-quick-card .eb { font-family: ${t.fontDisplay}; font-size: 30px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; text-transform: none; margin-bottom: 12px; }
        .om-quick-card h3 { font-size: 16px; font-weight: 600; line-height: 1.45; }
        .om-quick-card.qc-blue .eb, .om-quick-card.qc-blue .arrow { color: ${t.accent2}; }
        .om-quick-card.qc-blue h3 { color: #fff; }
        .om-quick-card.qc-blue p { color: rgba(255,255,255,0.9); }
        .om-quick-card.qc-orange { background: ${t.accent2}; border-color: ${t.accent2}; }
        .om-quick-card.qc-orange .eb, .om-quick-card.qc-orange .arrow { color: ${t.accent1}; }
        .om-quick-card.qc-orange h3 { color: oklch(0.25 0.06 45); }
        .om-quick-card.qc-orange p { color: oklch(0.32 0.06 45); }

        @media (max-width: 820px) {
          .om-hero { grid-template-columns: 1fr; gap: 32px; padding: 32px 0; align-items: start; }
          .om-hero-side { ${isC ? '' : ''} }
          .om-feed-grid { grid-template-columns: 1fr; }
          .om-quick { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO */}
      <section className="om-hero">
        <div>
          <div className="om-eyebrow eyebrow">
            <span>Diario abierto · {DATA.family.name}</span>
          </div>
          <h1>
            {isC
              ? <>Las rutas largas <em>se cuentan</em>, no se planean.</>
              : <>Lugares que <em>cambiaron</em> la forma de mirar.</>
            }
          </h1>
          <p>
            {isC
              ? 'Diario abierto de los viajes que vamos haciendo en familia. Texto, mapas, fotos y la lista de bares con buena tortilla. Nada más, nada menos.'
              : 'Una colección de historias, mapas dibujados con los pies y fotografías que no quisimos perder. Pasa, hay café.'
            }
          </p>
        </div>
        <div className="om-hero-side">
          {isC && (
            <div className="om-stamp-hero">
              <div className="big">MAY · 26</div>
              <div className="sm">última entrada</div>
            </div>
          )}
          {!isC && (
            <div>
              <div className="om-stat-big">{DATA.family.stats.paises}</div>
              <div className="om-stat-lbl">Países visitados</div>
            </div>
          )}
          <div className="om-meta-table">
            <div className="om-meta-row"><span className="k">Países</span><span className="v">{DATA.family.stats.paises}</span></div>
            <div className="om-meta-row"><span className="k">Historias</span><span className="v">{DATA.family.stats.historias}</span></div>
            <div className="om-meta-row"><span className="k">Fotos</span><span className="v">{DATA.family.stats.fotos.toLocaleString('es')}</span></div>
          </div>
        </div>
      </section>

      {/* HISTORIA DESTACADA */}
      <section className="om-block">
        <SH eyebrow="Última historia" title="Lo más fresco del diario." aside="Publicada hace 3 días" t={t} />
        <PC post={featured} t={t} variant="featured" onClick={() => nav('post', featured.id)} />
      </section>

      {/* FEED */}
      <section className="om-block">
        <SH eyebrow="Más historias" title="Para empezar a leer." aside={<span style={{ cursor: 'pointer', color: t.accent2, fontWeight: 600 }} onClick={() => nav('historias')}>Ver todas →</span>} t={t} />
        <div className="om-feed-grid">
          {others.map(p => <PC key={p.id} post={p} t={t} onClick={() => nav('post', p.id)} />)}
        </div>
      </section>

      {/* MAPA RESUMEN */}
      <section className="om-block">
        <SH eyebrow="Atlas" title="El mapa que dibujamos juntos." aside={<span style={{ cursor: 'pointer', color: t.accent2, fontWeight: 600 }} onClick={() => nav('mapa')}>Abrir mapa →</span>} t={t} />
        <WM t={t} pins={DATA.worldPins} onPinClick={(id) => nav('post', id)} />
      </section>

      {/* ENLACES RÁPIDOS */}
      <section className="om-block">
        <div className="om-quick">
          <div className="om-quick-card qc-blue" onClick={() => nav('nosotros')}>
            <div className="eb">El diario</div>
            <h3>Quiénes somos y por qué viajamos.</h3>
            <p>Ruben y Dora (y a veces los cuatro), contándonos los viajes para no olvidarlos.</p>
            <div className="arrow">Conócenos →</div>
          </div>
          <div className="om-quick-card qc-orange" onClick={() => nav('nosotros', null, '.om-wish')}>
            <div className="eb">Lista de deseos</div>
            <h3>Los viajes que aún soñamos.</h3>
            <p>Egipto, Marruecos, un safari en África… lo que queremos tachar algún día.</p>
            <div className="arrow">Ver la lista →</div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============= HISTORIAS (feed completo con filtros) =============
function HistoriasPage({ t, nav }) {
  const isC = t.style === 'scrapbook';
  const [filter, setFilter] = useState('todos');
  const tags = ['todos', 'Europa', 'Asia', 'África', 'Road trip', 'Familia', 'Playa', 'Ciudad'];
  const filtered = filter === 'todos' ? DATA.posts : DATA.posts.filter(p => p.tags && p.tags.includes(filter));

  return (
    <div className="om-historias">
      <style>{`
        .om-historias { padding: 56px 0; }
        .om-h-head { margin-bottom: 40px; }
        .om-h-head .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 14px; }
        .om-h-head h1 { font-family: ${t.fontDisplay}; font-size: clamp(38px, 6vw, 64px); font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.05; margin: 0 0 16px; color: ${t.text}; text-wrap: pretty; max-width: 800px; }
        .om-h-head p { font-size: 17px; color: ${t.textMuted}; max-width: 600px; line-height: 1.5; margin: 0; }
        .om-filters { display:flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; padding: 18px 0; border-top: 1px solid ${t.line}; border-bottom: 1px solid ${t.line}; }
        .om-chip { padding: 8px 16px; border-radius: ${isC ? '4px' : '999px'}; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid ${t.line}; background: ${t.card}; color: ${t.text}; transition: all .15s ease; font-family: ${t.fontBody}; }
        .om-chip.active { background: ${t.text}; color: ${t.bg}; border-color: ${t.text}; }
        .om-chip:hover:not(.active) { background: ${t.bgAlt}; }
        .om-h-count { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.textMuted}; margin-left: auto; align-self: center; }
        .om-h-feat { margin-bottom: 32px; }
        .om-h-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 1100px) { .om-h-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 700px) { .om-h-grid { grid-template-columns: 1fr; } .om-h-count { margin-left: 0; margin-top: 4px; } }
      `}</style>

      <div className="om-h-head">
        <div className="eb">Archivo · {DATA.posts.length} {DATA.posts.length === 1 ? 'entrada' : 'entradas'}</div>
        <h1>Cada viaje, contado dos veces: en voz alta y por escrito.</h1>
        <p>Todas nuestras historias, ordenadas por fecha. Filtra por continente, tipo de viaje o ambiente. Cada una incluye mapa, lista de sitios y fotos.</p>
      </div>

      <div className="om-filters">
        {tags.map(tag => (
          <span key={tag} className={`om-chip ${filter === tag ? 'active' : ''}`} onClick={() => setFilter(tag)}>
            {tag === 'todos' ? 'Todas' : tag}
          </span>
        ))}
        <span className="om-h-count">{filtered.length} historia{filtered.length === 1 ? '' : 's'}</span>
      </div>

      {filter === 'todos' && filtered[0] && (
        <div className="om-h-feat">
          <PC post={filtered[0]} t={t} variant="featured" onClick={() => nav('post', filtered[0].id)} />
        </div>
      )}

      <div className="om-h-grid">
        {(filter === 'todos' ? filtered.slice(1) : filtered).map(p => (
          <PC key={p.id} post={p} t={t} onClick={() => nav('post', p.id)} />
        ))}
      </div>
    </div>
  );
}

// ============= HISTORIA INDIVIDUAL =============
function PostPage({ t, nav, postId }) {
  const isC = t.style === 'scrapbook';
  const post = DATA.posts.find(p => p.id === postId) || DATA.posts[0];
  const places = post.places || [];
  const route = post.route || [];
  const album = post.album && post.album.length ? post.album : null;
  const [lb, setLb] = useState(null); // índice de foto abierta en grande, o null

  useEffect(() => {
    if (lb === null || !album) return;
    const onKey = e => {
      if (e.key === 'Escape') setLb(null);
      else if (e.key === 'ArrowRight') setLb(i => (i + 1) % album.length);
      else if (e.key === 'ArrowLeft') setLb(i => (i - 1 + album.length) % album.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lb, album]);

  return (
    <div className="om-post">
      <style>{`
        .om-post { padding: 32px 0 56px; }
        .om-post-back { display:inline-flex; align-items:center; gap: 8px; font-size: 13px; color: ${t.textMuted}; cursor: pointer; padding: 8px 0; margin-bottom: 32px; font-family: ${t.fontBody}; }
        .om-post-back:hover { color: ${t.text}; }
        .om-post-meta { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 18px; display:flex; gap: 14px; flex-wrap: wrap; }
        .om-post-meta .sep { color: ${t.line}; }
        .om-post h1 { font-family: ${t.fontDisplay}; font-size: clamp(40px, 6vw, 72px); line-height: 1; letter-spacing: ${t.letterspacing}; margin: 0 0 22px; font-weight: ${t.weights.display}; color: ${t.text}; text-wrap: balance; max-width: 1000px; }
        .om-post .subtitle { font-size: 21px; line-height: 1.45; color: ${t.textMuted}; margin: 0 0 40px; max-width: 720px; }
        .om-post-coords { font-family: ${t.fontMono}; font-size: 11px; color: ${t.textMuted}; letter-spacing: 0.1em; }
        .om-post-hero { aspect-ratio: 16/9; background-image: repeating-linear-gradient(45deg, ${t.bgAlt} 0 8px, ${t.paper} 8px 16px); background-color: ${t.bgAlt}; border-radius: ${t.radius}; display:flex; align-items:center; justify-content:center; font-family: ${t.fontMono}; font-size: 12px; color: ${t.textMuted}; margin-bottom: 56px; border: 1px solid ${t.line}; position: relative; }
        ${isC ? `.om-post-hero::after { content:'VISITADO · ${post.dateShort}'; position: absolute; top: 24px; right: 24px; padding: 8px 14px; border: 2px dashed ${t.accent1}; color: ${t.accent1}; font-family: ${t.fontMono}; font-size: 10px; letter-spacing: 0.18em; transform: rotate(-4deg); background: ${t.card}; }` : ''}

        .om-post-grid { display:grid; grid-template-columns: 1fr 360px; gap: 56px; align-items: start; }
        .om-post-body p { font-size: 18px; line-height: 1.7; color: ${t.text}; margin: 0 0 26px; max-width: 680px; }
        .om-post-body p.lede { font-size: 21px; line-height: 1.55; color: ${t.text}; margin-bottom: 36px; padding-left: 22px; border-left: 3px solid ${t.accent2}; max-width: 680px; }

        .om-aside { position: sticky; top: 24px; display:flex; flex-direction: column; gap: 24px; }
        .om-aside-card { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 24px; }
        .om-aside-card h4 { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin: 0 0 16px; }
        .om-place { padding: 12px 0; border-bottom: 1px dashed ${t.line}; }
        .om-place:last-child { border-bottom: none; }
        .om-place .name { font-size: 15px; font-weight: 600; color: ${t.text}; }
        .om-place .who { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: ${t.accent2}; margin-top: 3px; font-weight: 600; }
        .om-place .note { font-size: 13px; color: ${t.textMuted}; margin-top: 4px; }

        .om-route { margin-top: 56px; }
        .om-route-wrap { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 32px; }
        .om-route-map { position: relative; aspect-ratio: 16/6; background: ${t.bgAlt}; border-radius: ${t.radiusSm}; overflow: hidden; }
        .om-route-line { position: absolute; inset: 0; pointer-events: none; }
        .om-route-pin { position: absolute; transform: translate(-50%, -50%); }
        .om-route-pin .dot { width: 18px; height: 18px; border-radius: 50%; background: ${t.accent2}; border: 3px solid ${t.card}; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .om-route-pin .lbl { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; color: ${t.text}; white-space: nowrap; background: ${t.card}; padding: 3px 10px; border-radius: ${isC ? '0' : '999px'}; border: 1px solid ${t.line}; font-family: ${isC ? t.fontMono : t.fontBody}; }

        .om-photos { margin-top: 56px; }
        .om-photos-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .om-photo { aspect-ratio: 1; background-image: repeating-linear-gradient(45deg, ${t.bgAlt} 0 6px, ${t.paper} 6px 12px); background-color: ${t.bgAlt}; border-radius: ${t.radiusSm}; display:flex; align-items:center; justify-content:center; font-family: ${t.fontMono}; font-size: 10px; color: ${t.textMuted}; border: 1px solid ${t.line}; }
        .om-photo.wide { grid-column: span 2; aspect-ratio: 2/1; }

        @media (max-width: 1000px) {
          .om-post-grid { grid-template-columns: 1fr; }
          .om-aside { position: static; }
          .om-photos-grid { grid-template-columns: repeat(2, 1fr); }
          .om-photo.wide { grid-column: span 2; }
        }
      `}</style>

      <div className="om-post-back" onClick={() => nav('historias')}>← Volver a historias</div>

      <div className="om-post-meta">
        <span>{post.country}</span><span className="sep">·</span>
        <span>{post.region}</span><span className="sep">·</span>
        <span>{post.date}</span><span className="sep">·</span>
        <span>{post.readMin} min lectura</span><span className="sep">·</span>
        <span className="om-post-coords">{post.coords}</span>
      </div>
      <h1>{post.title}</h1>
      <div className="subtitle">{post.subtitle}</div>

      <div className="om-post-hero" style={post.coverImage ? { backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {!post.coverImage && `[ foto de cabecera · ${post.id}-cover.jpg ]`}
      </div>

      <div className="om-post-grid">
        <article className="om-post-body">
          {post.bodyIntro && <p className="lede">{post.bodyIntro}</p>}
          {(post.bodyParas || ['Aquí va el resto de la historia. Edita este post desde el panel de administración para añadir más texto, fotos intercaladas y lo que necesites.']).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>
        <aside className="om-aside">
          <div className="om-aside-card">
            <h4>Datos del viaje</h4>
            <div className="om-place"><div className="name">Cuándo</div><div className="note">{post.date}</div></div>
            <div className="om-place"><div className="name">Dónde</div><div className="note">{post.region}, {post.country}</div></div>
            <div className="om-place"><div className="name">Quiénes</div><div className="note">Los cuatro</div></div>
            <div className="om-place"><div className="name">Fotos</div><div className="note">{album ? album.length : post.photoCount} en el álbum</div></div>
          </div>
          {places.length > 0 && (
            <div className="om-aside-card">
              <h4>Sitios que recordamos</h4>
              {places.map((pl, i) => (
                <div key={i} className="om-place">
                  <div className="name">{pl.name}</div>
                  <div className="who">{pl.type}{pl.town && pl.town !== '—' ? ` · ${pl.town}` : ''}</div>
                  <div className="note">{pl.note}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {route.length > 0 && (
        <section className="om-route">
          <SH eyebrow="Ruta" title="Por dónde pasamos." t={t} />
          <div className="om-route-wrap">
            <div className="om-route-map">
              <svg className="om-route-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                {route.length > 1 && (
                  <polyline
                    points={route.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={t.accent2}
                    strokeWidth="0.6"
                    strokeDasharray="2 1.5"
                  />
                )}
              </svg>
              {route.map((p, i) => (
                <div key={i} className="om-route-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  <div className="dot"></div>
                  <div className="lbl">{p.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="om-photos">
        <SH eyebrow="Álbum" title={album ? `${album.length} ${album.length === 1 ? 'foto' : 'fotos'} del álbum` : `${post.photoCount} fotos del viaje`} aside={album ? null : 'Abrir en la app →'} t={t} />
        <div className="om-photos-grid">
          {album
            ? album.map((src, i) => (
                <div
                  key={i}
                  className={`om-photo ${i % 5 === 0 ? 'wide' : ''}`}
                  style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'zoom-in' }}
                  onClick={() => setLb(i)}
                ></div>
              ))
            : [1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className={`om-photo ${n === 1 || n === 6 ? 'wide' : ''}`}>[ {post.id}-{String(n).padStart(2, '0')}.jpg ]</div>
              ))}
        </div>
      </section>

      {album && lb !== null && (
        <div className="om-lightbox" onClick={() => setLb(null)}>
          <style>{`
            .om-lightbox { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,0.92); display:flex; align-items:center; justify-content:center; padding: 40px; }
            .om-lb-img { max-width: 92vw; max-height: 86vh; object-fit: contain; border-radius: 6px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
            .om-lb-btn { position: fixed; top: 50%; transform: translateY(-50%); width: 52px; height: 52px; border-radius: 50%; border: none; background: rgba(255,255,255,0.14); color: #fff; font-size: 28px; cursor: pointer; display:flex; align-items:center; justify-content:center; transition: background .15s ease; }
            .om-lb-btn:hover { background: rgba(255,255,255,0.28); }
            .om-lb-prev { left: 24px; }
            .om-lb-next { right: 24px; }
            .om-lb-close { position: fixed; top: 24px; right: 24px; width: 44px; height: 44px; border-radius: 50%; border: none; background: rgba(255,255,255,0.14); color: #fff; font-size: 24px; cursor: pointer; }
            .om-lb-close:hover { background: rgba(255,255,255,0.28); }
            .om-lb-count { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.82); font-family: ${t.fontMono}; font-size: 13px; letter-spacing: 0.1em; }
          `}</style>
          <button className="om-lb-close" onClick={e => { e.stopPropagation(); setLb(null); }}>×</button>
          {album.length > 1 && <button className="om-lb-btn om-lb-prev" onClick={e => { e.stopPropagation(); setLb((lb - 1 + album.length) % album.length); }}>‹</button>}
          <img className="om-lb-img" src={album[lb]} alt={`Foto ${lb + 1}`} onClick={e => e.stopPropagation()} />
          {album.length > 1 && <button className="om-lb-btn om-lb-next" onClick={e => { e.stopPropagation(); setLb((lb + 1) % album.length); }}>›</button>}
          <div className="om-lb-count">{lb + 1} / {album.length}</div>
        </div>
      )}
    </div>
  );
}

// ============= MAPA =============
function MapaPage({ t, nav }) {
  const isC = t.style === 'scrapbook';
  return (
    <div className="om-mapa">
      <style>{`
        .om-mapa { padding: 56px 0; }
        .om-m-head { margin-bottom: 36px; display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; }
        .om-m-head .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 14px; }
        .om-m-head h1 { font-family: ${t.fontDisplay}; font-size: clamp(38px, 6vw, 64px); font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.05; margin: 0; color: ${t.text}; text-wrap: pretty; }
        .om-m-stats { display:flex; gap: 32px; }
        .om-m-stats .num { font-family: ${t.fontDisplay}; font-size: 36px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; color: ${t.text}; line-height: 1; }
        .om-m-stats .lbl { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.textMuted}; margin-top: 4px; font-weight: 600; }
        .om-m-grid { display:grid; grid-template-columns: 1fr 320px; gap: 32px; align-items: start; }
        .om-m-side h4 { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin: 0 0 16px; }
        .om-m-side-card { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 24px; }
        .om-m-pin-list { display:flex; flex-direction: column; gap: 4px; }
        .om-m-pin-item { display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid ${t.line}; font-size: 14px; cursor: pointer; }
        .om-m-pin-item:last-child { border-bottom: none; }
        .om-m-pin-item:hover { color: ${t.accent2}; }
        .om-m-pin-item .when { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; color: ${t.textMuted}; letter-spacing: 0.06em; }
        .om-m-pin-item.future { color: ${t.textMuted}; font-style: italic; }
        @media (max-width: 900px) { .om-m-grid { grid-template-columns: 1fr; } .om-m-head { grid-template-columns: 1fr; } }
      `}</style>

      <div className="om-m-head">
        <div>
          <div className="eb">Atlas · todos los pines</div>
          <h1>El mapa que dibujamos juntos.</h1>
        </div>
        <div className="om-m-stats">
          <div><div className="num">{DATA.family.stats.paises}</div><div className="lbl">países</div></div>
          <div><div className="num">{DATA.worldPins.length}</div><div className="lbl">marcas</div></div>
          <div><div className="num">3</div><div className="lbl">continentes</div></div>
        </div>
      </div>

      <div className="om-m-grid">
        <div>
          <WM t={t} pins={DATA.worldPins} large onPinClick={(id) => nav('post', id)} />
        </div>
        <div className="om-m-side">
          <div className="om-m-side-card">
            <h4>Lugares en el mapa</h4>
            <div className="om-m-pin-list">
              {DATA.worldPins.map((p, i) => (
                <div
                  key={i}
                  className={`om-m-pin-item ${p.future ? 'future' : ''}`}
                  onClick={() => p.id && nav('post', p.id)}
                >
                  <span>{p.label}</span>
                  <span className="when">{p.future ? 'prox.' : '✓'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= NOSOTROS =============
function NosotrosPage({ t, nav }) {
  const isC = t.style === 'scrapbook';
  const memberColors = [t.accent1, t.accent2, t.accent3 || t.accent1, 'oklch(0.6 0.12 280)'];
  const wishTagStyle = (tag) => {
    if (tag === 'pronto') return { bg: t.accent1, color: 'oklch(0.97 0.005 80)' };
    if (tag === 'plan') return { bg: t.accent2Soft, color: t.text };
    return { bg: t.bgAlt, color: t.textMuted };
  };

  return (
    <div className="om-nos">
      <style>{`
        .om-nos { padding: 56px 0; }
        .om-nos-hero { display:grid; grid-template-columns: 1.3fr 1fr; gap: 56px; margin-bottom: 64px; align-items: start; }
        .om-nos-hero .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 18px; }
        .om-nos-hero h1 { font-family: ${t.fontDisplay}; font-size: clamp(38px, 6vw, 64px); line-height: 1.05; letter-spacing: ${t.letterspacing}; margin: 0 0 24px; font-weight: ${t.weights.display}; color: ${t.text}; text-wrap: pretty; }
        .om-nos-hero p { font-size: 17px; line-height: 1.65; color: ${t.text}; margin: 0 0 18px; max-width: 580px; }
        .om-nos-hero p.dim { color: ${t.textMuted}; font-size: 16px; }
        .om-nos-card { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 32px; }
        .om-nos-card h4 { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin: 0 0 18px; }
        .om-nos-stats { display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .om-nos-stats .num { font-family: ${t.fontDisplay}; font-size: 36px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; color: ${t.text}; line-height: 1; }
        .om-nos-stats .lbl { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${t.textMuted}; margin-top: 6px; font-weight: 600; }

        .om-members { margin-bottom: 64px; }
        .om-members-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .om-member { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 28px; text-align: center; }
        .om-member-avatar { width: 80px; height: 80px; border-radius: 50%; display:inline-flex; align-items:center; justify-content:center; font-family: ${t.fontDisplay}; font-size: 32px; font-weight: ${t.weights.display}; color: ${t.bg}; margin: 0 auto 16px; }
        .om-member .name { font-family: ${t.fontDisplay}; font-size: 20px; font-weight: ${t.weights.display}; color: ${t.text}; }
        .om-member .note { font-size: 13px; color: ${t.textMuted}; margin-top: 4px; }

        .om-wish { }
        .om-wish-list { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: ${t.radius}; padding: 32px; }
        .om-wish-item { display:grid; grid-template-columns: 40px 1fr auto; gap: 16px; padding: 18px 0; border-bottom: 1px dashed ${t.line}; align-items: center; }
        .om-wish-item:last-child { border-bottom: none; }
        .om-wish-num { font-family: ${t.fontMono}; font-size: 11px; color: ${t.textMuted}; letter-spacing: 0.06em; }
        .om-wish-name { font-size: 16px; font-weight: 600; color: ${t.text}; }
        .om-wish-name .sub { display:block; font-size: 12px; color: ${t.textMuted}; margin-top: 3px; font-weight: 400; font-family: ${isC ? t.fontMono : t.fontBody}; letter-spacing: ${isC ? '0.05em' : '0'}; }
        .om-wish-tag { padding: 5px 12px; border-radius: ${isC ? '0' : '999px'}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; font-family: ${t.fontBody}; }

        @media (max-width: 900px) {
          .om-nos-hero { grid-template-columns: 1fr; gap: 32px; }
          .om-members-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .om-members-grid { grid-template-columns: 1fr; }
          .om-nos-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <section className="om-nos-hero">
        <div>
          <div className="eb">Sobre nosotros</div>
          <h1>Viajamos juntos, y lo contamos aquí.</h1>
          <p>{DATA.family.intro}</p>
          <p className="dim">Esta es nuestra caja de recuerdos: historias, mapas y fotografías que no quisimos perder.</p>
        </div>
        <div className="om-nos-card">
          <h4>Diario en números</h4>
          <div className="om-nos-stats">
            <div><div className="num">{DATA.family.stats.paises}</div><div className="lbl">países</div></div>
            <div><div className="num">{DATA.family.stats.historias}</div><div className="lbl">historias</div></div>
            <div><div className="num">{DATA.family.stats.fotos.toLocaleString('es')}</div><div className="lbl">fotos</div></div>
          </div>
        </div>
      </section>

      {DATA.family.members.length > 0 && (
      <section className="om-members">
        <SH eyebrow="La tripulación" title="Las cuatro maletas." t={t} />
        <div className="om-members-grid">
          {DATA.family.members.map((m, i) => (
            <div key={i} className="om-member">
              <div className="om-member-avatar" style={{ background: memberColors[i] }}>{m.initial}</div>
              <div className="name">{m.name}</div>
              <div className="note">{m.note}</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {DATA.wishlist.length > 0 && (
      <section className="om-wish">
        <SH eyebrow="Próximos viajes" title="Lo que está en el calendario (o en la cabeza)." aside="actualizada hoy" t={t} />
        <div className="om-wish-list">
          {DATA.wishlist.map((w, i) => {
            const st = wishTagStyle(w.tag);
            return (
              <div key={i} className="om-wish-item">
                <span className="om-wish-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="om-wish-name">{w.name}<span className="sub">{w.sub}</span></span>
                <span className="om-wish-tag" style={{ background: st.bg, color: st.color }}>{w.when}</span>
              </div>
            );
          })}
        </div>
      </section>
      )}
    </div>
  );
}

// ============= MAPA DE FOTOS (app interactiva embebida) =============
// ─────────────────────────────────────────────────────────────────────────
// AJUSTES DEL MAPA DE FOTOS
// Cambia estos dos valores por los tuyos:
//   API_KEY  → tu clave de la API de Flickr (la que te dieron como "apiKey").
//   ALBUM_ID → el id del álbum de Flickr que quieres mostrar.
const MAPA_API_KEY = '8c7bd436cdbb43d21dccd254c4f13a8d';
const MAPA_ALBUM_ID = '72157699212454140';
// ─────────────────────────────────────────────────────────────────────────
const MAPA_BASE = 'https://biovibe-cloud.github.io/mapaFlickr-Codex/';

function MapaFotosPage({ t, nav }) {
  const isC = t.style === 'scrapbook';
  // URL embebida (sin adornos, para iframe) y URL para abrir a pantalla completa.
  const params = `albumId=${MAPA_ALBUM_ID}&apiKey=${MAPA_API_KEY}`;
  const EMBED_URL = `${MAPA_BASE}?embed=1&${params}`;
  const MAP_URL = `${MAPA_BASE}?${params}`;
  const frameRef = React.useRef(null);

  // El mapa embebido (tipo Leaflet) mide su contenedor al arrancar. Cuando se
  // monta al cambiar de página, ese instante puede ocurrir antes de que el
  // recuadro tenga su altura final, y el mapa se queda en gris. Aquí le damos
  // un pequeño "empujón" de tamaño tras cargar, lo que dispara el resize
  // interno del mapa y hace que se recalcule y se pinte. En pantalla completa
  // no hace falta porque el tamaño ya es correcto desde el inicio.
  function nudge() {
    const el = frameRef.current;
    if (!el) return;
    el.style.height = 'calc(100% - 1px)';
    setTimeout(() => {
      if (frameRef.current) frameRef.current.style.height = '100%';
    }, 80);
  }
  React.useEffect(() => {
    const timers = [120, 500, 1200, 2500].map((ms) => setTimeout(nudge, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="om-mapaf">
      <style>{`
        .om-mapaf { padding: 56px 0; }
        .om-mapaf-head { display:grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; margin-bottom: 28px; }
        .om-mapaf-head .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 14px; }
        .om-mapaf-head h1 { font-family: ${t.fontDisplay}; font-size: clamp(38px, 6vw, 64px); font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.05; margin: 0 0 12px; color: ${t.text}; text-wrap: pretty; }
        .om-mapaf-head p { font-size: 16px; line-height: 1.6; color: ${t.textMuted}; margin: 0; max-width: 620px; }
        .om-mapaf-open { font-size: 14px; font-weight: 600; color: ${t.accent2}; white-space: nowrap; text-decoration: none; }
        .om-mapaf-open:hover { text-decoration: underline; }
        .om-mapaf-frame { width: 100%; height: clamp(540px, 78vh, 860px); border: 1px solid ${t.line}; border-radius: ${t.radius}; overflow: hidden; background: ${t.bgAlt}; }
        .om-mapaf-frame iframe { width: 100%; height: 100%; border: 0; display: block; }
        .om-mapaf-note { margin-top: 16px; font-size: 13px; color: ${t.textMuted}; }
        @media (max-width: 700px) { .om-mapaf-head { grid-template-columns: 1fr; } .om-mapaf-frame { height: clamp(440px, 70vh, 620px); } }
      `}</style>

      <div className="om-mapaf-head">
        <div>
          <div className="eb">Mapa de fotos</div>
          <h1>Cada foto, en el lugar donde la tomamos.</h1>
          <p>Nuestro mapa interactivo: explora las fotos geolocalizadas, muévete por el mundo y acércate a cada viaje.</p>
        </div>
        <a className="om-mapaf-open" href={MAP_URL} target="_blank" rel="noopener noreferrer">Abrir en pantalla completa →</a>
      </div>

      <div className="om-mapaf-frame">
        <iframe ref={frameRef} src={EMBED_URL} title="Mapa de fotos — mapaFlickr" onLoad={nudge} referrerPolicy="no-referrer-when-downgrade" allowFullScreen></iframe>
      </div>
      <div className="om-mapaf-note">Si el mapa tarda en cargar, espera unos segundos o ábrelo en pantalla completa.</div>
    </div>
  );
}

Object.assign(window, { HomePage, HistoriasPage, PostPage, MapaPage, MapaFotosPage, NosotrosPage });
