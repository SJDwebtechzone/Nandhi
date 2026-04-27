// Temple + Spiritual palette - Saffron / Gold / White
// Two themes: light (default) + dark. See ThemeContext for switching.

export const lightColors = {
  saffron:      '#FF6F00',   // primary - saffron / kumkum
  saffronDark:  '#C43E00',
  gold:         '#D4AF37',
  goldLight:    '#F5D76E',
  white:        '#FFFFFF',
  cream:        '#FFF8E7',
  liveRed:      '#D32F2F',
  text:         '#2B1810',
  textMuted:    '#6B5A4C',
  border:       '#EADFC8',
  bg:           '#F5EAD0',   // warm parchment cream (matches Nandhi TV flyer)
  card:         '#FFFFFF',
  overlay:      'rgba(0,0,0,0.55)',
  statusBar:    '#FF6F00',
  statusBarStyle: 'light-content',
  isDark:       false,
};

export const darkColors = {
  saffron:      '#FF8C3A',   // brighter for contrast on dark bg
  saffronDark:  '#E55A1A',
  gold:         '#E6C35E',
  goldLight:    '#F5D76E',
  white:        '#FFFFFF',
  cream:        '#2A241C',   // "cream" in dark mode = warm dark surface
  liveRed:      '#E53935',
  text:         '#F5E9D3',   // warm off-white
  textMuted:    '#A89984',
  border:       '#2E2822',
  bg:           '#12100E',   // near black, warm tint
  card:         '#1E1A16',
  overlay:      'rgba(0,0,0,0.75)',
  statusBar:    '#12100E',
  statusBarStyle: 'light-content',
  isDark:       true,
};

// Back-compat: default export is the light palette. New components should
// import useTheme() instead of `colors` directly.
export const colors = lightColors;

export const spacing = (n) => n * 4;

export const fonts = {
  heading: 'System',
  body:    'System',
};
