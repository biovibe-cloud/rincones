// Temas (A · Mediterráneo, C · Diario) y presets de fondo

// Fondos: 5 opciones que funcionan con ambos temas. Cada uno define bg, text, etc.
window.BG_PRESETS = {
  blanco: {
    label: 'Blanco',
    swatch: 'oklch(1 0 0)',
    light: {
      bg: 'oklch(1 0 0)',
      bgAlt: 'oklch(0.96 0.005 80)',
      text: 'oklch(0.18 0.012 80)',
      textMuted: 'oklch(0.5 0.012 80)',
      line: 'oklch(0.9 0.005 80)',
      card: 'oklch(1 0 0)',
      paper: 'oklch(0.985 0.005 80)',
    }
  },
  crema: {
    label: 'Crema',
    swatch: 'oklch(0.96 0.018 80)',
    light: {
      bg: 'oklch(0.97 0.014 85)',
      bgAlt: 'oklch(0.93 0.022 80)',
      text: 'oklch(0.22 0.025 245)',
      textMuted: 'oklch(0.48 0.02 245)',
      line: 'oklch(0.88 0.018 80)',
      card: 'oklch(0.99 0.008 85)',
      paper: 'oklch(0.985 0.012 80)',
    }
  },
  cielo: {
    label: 'Cielo',
    swatch: 'oklch(0.93 0.025 215)',
    light: {
      bg: 'oklch(0.97 0.018 215)',
      bgAlt: 'oklch(0.93 0.028 215)',
      text: 'oklch(0.2 0.04 245)',
      textMuted: 'oklch(0.5 0.025 240)',
      line: 'oklch(0.88 0.02 215)',
      card: 'oklch(0.99 0.012 215)',
      paper: 'oklch(0.985 0.015 215)',
    }
  },
  salvia: {
    label: 'Salvia',
    swatch: 'oklch(0.93 0.028 145)',
    light: {
      bg: 'oklch(0.965 0.02 145)',
      bgAlt: 'oklch(0.92 0.028 145)',
      text: 'oklch(0.22 0.035 145)',
      textMuted: 'oklch(0.5 0.025 145)',
      line: 'oklch(0.87 0.022 145)',
      card: 'oklch(0.99 0.014 145)',
      paper: 'oklch(0.98 0.018 145)',
    }
  },
  cuaderno: {
    label: 'Cuaderno',
    swatch: 'oklch(0.93 0.018 80)',
    swatchStyle: {
      background: 'oklch(0.93 0.018 80)',
      backgroundImage: 'linear-gradient(to right, oklch(0.82 0.024 80) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.82 0.024 80) 1px, transparent 1px)',
      backgroundSize: '6px 6px',
    },
    light: {
      bg: 'oklch(0.93 0.018 80)',
      bgAlt: 'oklch(0.89 0.024 80)',
      text: 'oklch(0.22 0.025 245)',
      textMuted: 'oklch(0.48 0.02 245)',
      line: 'oklch(0.82 0.024 80)',
      card: 'oklch(0.97 0.012 80)',
      paper: 'oklch(0.95 0.018 80)',
      bgImage: 'linear-gradient(to right, oklch(0.85 0.022 80) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.85 0.022 80) 1px, transparent 1px)',
      bgSize: '28px 28px',
    }
  },
  noche: {
    label: 'Noche',
    swatch: 'oklch(0.2 0.03 245)',
    light: {
      bg: 'oklch(0.16 0.025 245)',
      bgAlt: 'oklch(0.21 0.03 245)',
      text: 'oklch(0.95 0.012 85)',
      textMuted: 'oklch(0.72 0.02 80)',
      line: 'oklch(0.28 0.03 245)',
      card: 'oklch(0.21 0.03 245)',
      paper: 'oklch(0.19 0.028 245)',
    },
    isDark: true,
  }
};

// Temas: definen tipografía, acentos y "personalidad" de layout
window.THEMES = {
  A: {
    id: 'A',
    label: 'A · Mediterráneo',
    blurb: 'Limpio, magazine, generoso espacio',
    fontBody: "'Manrope', system-ui, sans-serif",
    fontDisplay: "'Manrope', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    weights: { body: 400, medium: 500, bold: 700, display: 700 },
    radius: '14px',
    radiusSm: '10px',
    accent1: 'oklch(0.5 0.13 240)',   // sea blue
    accent1Soft: 'oklch(0.92 0.04 240)',
    accent2: 'oklch(0.68 0.17 45)',   // sunset orange
    accent2Soft: 'oklch(0.94 0.05 50)',
    accent3: 'oklch(0.85 0.05 70)',   // sand
    letterspacing: '-0.025em',
    style: 'magazine',
    accentForDark: { accent1: 'oklch(0.7 0.14 235)', accent2: 'oklch(0.78 0.16 50)' }
  },
  C: {
    id: 'C',
    label: 'C · Diario de Ruta',
    blurb: 'Scrapbook moderno, mucho meta-dato',
    fontBody: "'DM Sans', system-ui, sans-serif",
    fontDisplay: "'DM Sans', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    weights: { body: 400, medium: 500, bold: 600, display: 600 },
    radius: '4px',
    radiusSm: '3px',
    accent1: 'oklch(0.55 0.13 35)',   // terracota
    accent1Soft: 'oklch(0.92 0.04 35)',
    accent2: 'oklch(0.7 0.13 80)',    // mostaza
    accent2Soft: 'oklch(0.94 0.05 85)',
    accent3: 'oklch(0.45 0.08 140)',  // bosque
    letterspacing: '-0.03em',
    style: 'scrapbook',
    accentForDark: { accent1: 'oklch(0.7 0.13 35)', accent2: 'oklch(0.78 0.13 80)', accent3: 'oklch(0.62 0.09 140)' }
  }
};

// Combina tema + bg preset en un objeto tokens
window.buildTokens = function(themeId, bgKey) {
  const theme = window.THEMES[themeId];
  const preset = window.BG_PRESETS[bgKey];
  const isDark = !!preset.isDark;
  const tokens = {
    ...theme,
    ...preset.light,
    bgKey,
    isDark,
  };
  if (isDark && theme.accentForDark) {
    Object.assign(tokens, theme.accentForDark);
  }
  return tokens;
};
