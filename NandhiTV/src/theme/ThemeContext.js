import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

/**
 * Theme mode:
 *   'system' → follow OS setting (default)
 *   'light'  → force light
 *   'dark'   → force dark
 */
const ThemeContext = createContext({
  mode: 'system',
  setMode: () => {},
  colors: lightColors,
  isDark: false,
  toggle: () => {},
});

export function ThemeProvider({ children, initialMode = 'system' }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState(initialMode);

  // Resolve effective theme
  const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = resolved === 'dark' ? darkColors : lightColors;

  const value = useMemo(() => ({
    mode,
    setMode,
    colors,
    isDark: resolved === 'dark',
    /** Cycle: system → light → dark → system */
    toggle: () => {
      setMode((m) => {
        if (m === 'system') return resolved === 'dark' ? 'light' : 'dark';
        if (m === 'light')  return 'dark';
        if (m === 'dark')   return 'system';
        return 'system';
      });
    },
  }), [mode, colors, resolved]);

  // Re-render when system scheme flips while on 'system' mode
  useEffect(() => {}, [system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
