import { createContext, useContext, useState, useEffect } from "react";

/* ============================================
   BOARD THEMES
   - classic : matches the MD3 light design (cream + sage green)
   - green   : classic chess.com green
   - others  : additional options
============================================ */
export const BOARD_THEMES = {
  classic: { name: "Classic", light: "#f0e9dc", dark: "#a1b8a1" },
  green: { name: "Green", light: "#eeeed2", dark: "#769656" },
  brown: { name: "Brown", light: "#f0d9b5", dark: "#b58863" },
  blue: { name: "Blue", light: "#dee3e6", dark: "#8ca2ad" },
  gray: { name: "Gray", light: "#e8e8e8", dark: "#6c6c6c" },
  wood: { name: "Wood", light: "#e8c99b", dark: "#a97d54" },
  ice: { name: "Ice", light: "#e6e6fa", dark: "#8f8fbc" },
  walnut: { name: "Walnut", light: "#e2c19d", dark: "#7a4a2a" },
  neo: { name: "Neo", light: "#e8e8e8", dark: "#4a4a4a" },
};

const DEFAULT_THEME = "classic";
const STORAGE_KEY = "boardTheme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && BOARD_THEMES[stored] ? stored : DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeKey);
  }, [themeKey]);

  const theme = BOARD_THEMES[themeKey] || BOARD_THEMES[DEFAULT_THEME];

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useBoardTheme() {
  return useContext(ThemeContext);
}
