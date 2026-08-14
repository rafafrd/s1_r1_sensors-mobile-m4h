// ─────────────────────────────────────────────────────────────────────────────
// ThemeContext.tsx — Provedor global do tema claro/escuro.
//
// O app inicia sempre no tema claro; o botão na HomeScreen alterna para o
// tema escuro "midnight purple" (ver colors.ts). Nenhuma preferência é
// persistida entre execuções do app.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ThemeColors, darkColors, lightColors } from "./colors";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const toggleTheme = useCallback(() => {
    setMode((atual) => (atual === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === "dark",
      colors: mode === "dark" ? darkColors : lightColors,
      toggleTheme,
    }),
    [mode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook de acesso ao tema atual — lança erro se usado fora do ThemeProvider,
// pra pegar o erro de composição cedo em vez de um `colors` undefined silencioso.
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme precisa ser usado dentro de um <ThemeProvider>");
  }
  return context;
}
