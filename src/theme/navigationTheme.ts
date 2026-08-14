// ─────────────────────────────────────────────────────────────────────────────
// navigationTheme.ts — Adapta as cores do app para o `theme` do React Navigation.
//
// Isso garante que o header nativo das telas (Posição GPS, Lanterna, Redes
// Wi-Fi, Acelerômetro) e a cor de fundo durante a transição entre telas
// também sigam o tema claro/escuro, e não só o conteúdo de cada tela.
// ─────────────────────────────────────────────────────────────────────────────

import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { darkColors, lightColors } from "./colors";

export function getNavigationTheme(isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  const colors = isDark ? darkColors : lightColors;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.cardBorder,
    },
  };
}
