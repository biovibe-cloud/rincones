// Componentes compartidos entre páginas

const { useState } = React;

// Mapa del mundo estilizado con pines (continentes abstractos + grid de puntos)
function WorldMap({ t, pins, height = 'auto', onPinClick, large = false }) {
  return (
    <div className="om-map-wrap" style={{ '--map-h': height === 'auto' ? '0' : height }}>
      <style>{`
        .om-map-wrap { position: relative; width: 100%; aspect-ratio: 16/8; background: ${t.bgAlt}; border-radius: ${t.style === 'scrapbook' ? '4px' : '14px'}; border: 1px solid ${t.line}; overflow: hidden; }
        .om-map-wrap.large { aspect-ratio: 16/9; }
        .om-pin { position:absolute; transform: translate(-50%, -100%); cursor: ${onPinClick ? 'pointer' : 'default'}; z-index: 2; }
        .om-pin-dot { width: 14px; height: 14px; border-radius: 50%; background: ${t.accent2}; border: 3px solid ${t.card}; box-shadow: 0 4px 12px ${t.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}; }
        .om-pin-dot.future { background: ${t.bgAlt}; border-color: ${t.accent2}; border-style: dashed; box-shadow: none; }
        .om-pin-pulse { position:absolute; inset: -5px; border-radius: 50%; border: 2px solid ${t.accent2}; opacity: 0.45; animation: omPulse 2s ease-out infinite; }
        @keyframes omPulse { 0% { transform: scale(1); opacity: 0.55; } 100% { transform: scale(2.2); opacity: 0; } }
        .om-pin-lbl { position:absolute; bottom: 22px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 600; background: ${t.card}; color: ${t.text}; padding: 4px 10px; border-radius: 999px; white-space: nowrap; border: 1px solid ${t.line}; opacity: 0; transition: opacity .15s ease; pointer-events: none; font-family: ${t.fontBody}; }
        .om-pin:hover .om-pin-lbl, .om-pin.always-show .om-pin-lbl { opacity: 1; }
        ${t.style === 'scrapbook' ? `
          .om-pin-lbl { border-radius: 0; font-family: ${t.fontMono}; font-size: 10px; letter-spacing: 0.06em; padding: 3px 8px; }
        ` : ''}
      `}</style>
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: 25 }).map((_, i) => (
          Array.from({ length: 50 }).map((_, j) => (
            <circle key={`${i}-${j}`} cx={j * 2 + 1} cy={i * 2 + 1} r="0.18" fill={t.textMuted} opacity={t.isDark ? '0.22' : '0.28'} />
          ))
        ))}
        <g fill={t.style === 'scrapbook' ? 'none' : (t.isDark ? t.accent3 : 'oklch(0.85 0.04 70)')} stroke={t.style === 'scrapbook' ? t.textMuted : 'none'} strokeWidth={t.style === 'scrapbook' ? '0.25' : '0'} opacity={t.style === 'scrapbook' ? (t.isDark ? 0.5 : 0.4) : (t.isDark ? 0.25 : 0.5)}>
          <path d="M14,18 Q22,12 30,16 Q36,20 34,28 Q28,32 20,30 Q12,26 14,18 Z" />
          <path d="M40,18 Q50,14 56,20 Q60,26 56,30 Q50,32 44,28 Q38,24 40,18 Z" />
          <path d="M58,22 Q70,18 78,26 Q82,34 76,38 Q66,40 60,34 Q56,28 58,22 Z" />
          <path d="M22,42 Q30,40 32,48 Q30,52 24,50 Q18,48 22,42 Z" />
          <path d="M72,46 Q82,44 84,50 Q80,52 74,50 Q70,48 72,46 Z" />
        </g>
      </svg>
      {pins.map((p, i) => (
        <div
          key={i}
          className={`om-pin ${large ? 'always-show' : ''}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          onClick={() => onPinClick && p.id && onPinClick(p.id)}
        >
          {!p.future && <div className="om-pin-pulse"></div>}
          <div className={`om-pin-dot ${p.future ? 'future' : ''}`}></div>
          <div className="om-pin-lbl">{p.label}</div>
        </div>
      ))}
    </div>
  );
}

// Tarjeta de post — estilo varía según tema A (magazine) o C (scrapbook con sello)
function PostCard({ post, t, onClick, variant = 'default' }) {
  const isC = t.style === 'scrapbook';
  const placeholderBg = `repeating-linear-gradient(45deg, ${t.bgAlt} 0 8px, ${t.paper} 8px 16px)`;
  const nFotos = (post.album && post.album.length) || 0; // numero real de fotos del album

  if (variant === 'featured') {
    return (
      <article className="om-pc om-pc-feat" onClick={onClick}>
        <style>{`
          .om-pc-feat { display:grid; grid-template-columns: 1.3fr 1fr; gap: 0; background: ${t.card}; border: 1px solid ${t.line}; border-radius: ${t.radius}; overflow: hidden; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
          .om-pc-feat:hover { transform: translateY(-3px); box-shadow: 0 14px 36px ${t.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}; }
          .om-pc-feat .pic { background: ${placeholderBg}; background-color: ${t.bgAlt}; min-height: 380px; display:flex; align-items:center; justify-content:center; font-family: ${t.fontMono}; font-size: 11px; color: ${t.textMuted}; position: relative; padding: 24px; }
          .om-pc-feat .body { padding: 44px 44px 40px; display:flex; flex-direction:column; justify-content:center; }
          .om-pc-feat .meta { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '11px' : '12px'}; letter-spacing: ${isC ? '0.1em' : '0.16em'}; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 14px; }
          .om-pc-feat h2 { font-family: ${t.fontDisplay}; font-size: 36px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.1; margin: 0 0 14px; color: ${t.text}; }
          .om-pc-feat p { font-size: 15px; line-height: 1.55; color: ${t.textMuted}; margin: 0 0 22px; }
          .om-pc-feat .read { font-size: 13px; font-weight: 600; color: ${t.accent2}; }
          ${isC ? `
            .om-pc-feat .stamp { position: absolute; top: 24px; right: 24px; width: 78px; height: 78px; border: 2px solid ${t.accent1}; border-radius: 50%; display:flex; align-items:center; justify-content:center; flex-direction:column; color: ${t.accent1}; font-family: ${t.fontMono}; font-size: 9px; line-height: 1.2; transform: rotate(-12deg); background: ${t.card}; text-align:center; text-transform: uppercase; letter-spacing: 0.12em; padding: 8px; font-weight: 600; }
          ` : ''}
          @media (max-width: 820px) {
            .om-pc-feat { grid-template-columns: 1fr; }
            .om-pc-feat .pic { min-height: 240px; }
            .om-pc-feat .body { padding: 28px; }
            .om-pc-feat h2 { font-size: 26px; }
          }
        `}</style>
        <div className="pic" style={post.coverImage ? { backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          {!post.coverImage && `[ foto destacada · ${post.id}.jpg ]`}
          {isC && <div className="stamp">VISITADO<br/>{post.dateShort}</div>}
        </div>
        <div className="body">
          <div className="meta">{post.country} · {post.date} · {post.readMin} min</div>
          <h2>{post.title}</h2>
          <p>{post.subtitle}</p>
          <span className="read">Leer historia →</span>
        </div>
      </article>
    );
  }

  return (
    <article className="om-pc" onClick={onClick}>
      <style>{`
        .om-pc { background: ${t.card}; border: 1px solid ${t.line}; border-radius: ${t.radius}; overflow: hidden; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; display: flex; flex-direction: column; }
        .om-pc:hover { transform: translateY(-3px); box-shadow: 0 12px 28px ${t.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}; }
        .om-pc .pic { background: ${placeholderBg}; background-color: ${t.bgAlt}; aspect-ratio: 4/3; display:flex; align-items:center; justify-content:center; font-family: ${t.fontMono}; font-size: 11px; color: ${t.textMuted}; position: relative; }
        .om-pc .photo-count { position: absolute; bottom: 12px; left: 12px; background: ${t.card}; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; color: ${t.text}; border: 1px solid ${t.line}; font-family: ${t.fontBody}; }
        .om-pc .body { padding: 22px 24px 26px; flex: 1; display:flex; flex-direction:column; }
        .om-pc .meta { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '11px' : '12px'}; letter-spacing: ${isC ? '0.1em' : '0.14em'}; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 10px; }
        .om-pc h3 { font-family: ${t.fontDisplay}; font-size: 22px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.2; margin: 0 0 8px; color: ${t.text}; }
        .om-pc p { font-size: 14px; line-height: 1.55; color: ${t.textMuted}; margin: 0; flex: 1; }
        ${isC ? `.om-pc .photo-count { border-radius: 0; }` : ''}
      `}</style>
      <div className="pic" style={post.coverImage ? { backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {!post.coverImage && `[ foto · ${post.id}.jpg ]`}
        {nFotos > 0 && <div className="photo-count">{nFotos} foto{nFotos === 1 ? '' : 's'}</div>}
      </div>
      <div className="body">
        <div className="meta">{post.country} · {post.date}</div>
        <h3>{post.title}</h3>
        <p>{post.subtitle}</p>
      </div>
    </article>
  );
}

// Encabezado de sección con eyebrow + título — estilo varía por tema
function SectionHead({ eyebrow, title, aside, t }) {
  const isC = t.style === 'scrapbook';
  return (
    <div className="om-sh">
      <style>{`
        .om-sh { display:flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 32px; }
        .om-sh .eb { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '11px' : '12px'}; letter-spacing: ${isC ? '0.18em' : '0.18em'}; text-transform: uppercase; color: ${t.accent1}; font-weight: 600; margin-bottom: 10px; }
        .om-sh h2 { font-family: ${t.fontDisplay}; font-size: 42px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.05; margin: 0; color: ${t.text}; }
        .om-sh .as { font-family: ${isC ? t.fontMono : t.fontBody}; font-size: ${isC ? '11px' : '13px'}; letter-spacing: ${isC ? '0.12em' : '0'}; text-transform: ${isC ? 'uppercase' : 'none'}; color: ${t.textMuted}; white-space: nowrap; }
        @media (max-width: 640px) {
          .om-sh { flex-direction: column; align-items: flex-start; gap: 12px; }
          .om-sh h2 { font-size: 30px; }
        }
      `}</style>
      <div>
        {eyebrow && <div className="eb">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {aside && <div className="as">{aside}</div>}
    </div>
  );
}

// Embed de la app de fotos (mockup)
function PhotoMapApp({ t, compact = false }) {
  const isC = t.style === 'scrapbook';
  return (
    <div className="om-app">
      <style>{`
        .om-app { background: ${t.accent1}; color: oklch(0.97 0.005 80); border-radius: ${t.radius}; overflow: hidden; display: grid; grid-template-columns: ${compact ? '1fr 1fr' : '1fr 1.1fr'}; }
        .om-app .text { padding: 44px; display:flex; flex-direction:column; justify-content:center; }
        .om-app .tag { display:inline-flex; align-items:center; gap: 8px; font-family: ${isC ? t.fontMono : t.fontBody}; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.8; align-self: flex-start; margin-bottom: 18px; padding: 6px 12px; background: rgba(255,255,255,0.18); border-radius: ${isC ? '0' : '999px'}; font-weight: 600; }
        .om-app h3 { font-family: ${t.fontDisplay}; font-size: 32px; font-weight: ${t.weights.display}; letter-spacing: ${t.letterspacing}; line-height: 1.1; margin: 0 0 14px; }
        .om-app p { font-size: 15px; line-height: 1.55; opacity: 0.88; margin: 0 0 24px; max-width: 380px; }
        .om-app .btn { display:inline-flex; align-items:center; gap: 8px; padding: 13px 22px; background: ${t.accent2}; color: oklch(0.18 0.02 80); border-radius: ${isC ? '4px' : '999px'}; font-size: 14px; font-weight: 600; align-self: flex-start; cursor: pointer; }
        .om-app .mock { background: oklch(0.18 0.02 240); position: relative; min-height: 360px; }
        @media (max-width: 820px) {
          .om-app { grid-template-columns: 1fr; }
          .om-app .text { padding: 32px; }
          .om-app h3 { font-size: 26px; }
        }
      `}</style>
      <div className="text">
        <span className="tag">{isC ? '∮ app embebida · beta' : '✨ App de fotos · beta'}</span>
        <h3>Cada foto en el lugar exacto donde la tomamos.</h3>
        <p>Nuestra app pequeña: un mapa con todas las fotos del blog ancladas en la coordenada exacta donde se tomaron. Se mueve, se filtra por viaje y se comparte.</p>
        <span className="btn">Abrir mapa de fotos →</span>
      </div>
      <div className="mock">
        <PhotoMapMock t={t} />
      </div>
    </div>
  );
}

function PhotoMapMock({ t }) {
  const isC = t.style === 'scrapbook';
  const pinShape = isC ? 0 : 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg viewBox="0 0 400 380" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {Array.from({ length: 19 }).map((_, i) => (
          Array.from({ length: 20 }).map((_, j) => (
            <circle key={`${i}-${j}`} cx={j * 20 + 5} cy={i * 20 + 5} r="0.6" fill="white" opacity="0.15" />
          ))
        ))}
        <path d="M50,90 Q140,70 200,130 Q260,180 340,140" stroke={t.accent2} strokeWidth="2" fill="none" strokeDasharray="5 5" opacity="0.65" />
      </svg>
      <div style={{ position: 'absolute', top: 18, left: 18, right: 18, background: 'rgba(255,255,255,0.92)', borderRadius: isC ? 0 : 10, padding: '8px 14px', fontFamily: isC ? t.fontMono : t.fontBody, fontSize: 11, fontWeight: 600, color: 'oklch(0.22 0.02 240)', display:'flex', justifyContent:'space-between' }}>
        <span>{isC ? '↦ 44.10°N · 9.74°E' : '📍 Cinque Terre, Italia'}</span>
        <span style={{ color: t.accent2 }}>24 fotos</span>
      </div>
      {[
        { x: 22, y: 32 }, { x: 40, y: 42 }, { x: 58, y: 55 },
        { x: 75, y: 32 }, { x: 32, y: 65 }, { x: 62, y: 78 },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)' }}>
          <div style={{ width: 28, height: 28, background: i % 2 ? t.accent2 : t.accent1, border: '2px solid white', borderRadius: pinShape, boxShadow: '0 4px 10px rgba(0,0,0,0.25)' }}></div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { WorldMap, PostCard, SectionHead, PhotoMapApp });
